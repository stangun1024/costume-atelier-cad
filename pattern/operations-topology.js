import { Path } from '../core/geometry.js';
import { Transform } from '../core/transforms.js';
import { flattenPath } from '../core/path-tools.js';
import { inside } from './validation.js';
import { remapSewing, partitionNotches, sewingSides } from './sewing.js';
import { edgeChanges } from './reference-events.js';
import { edgeOperationReason, slitRelationReason, assertOperationAvailable } from './capabilities.js';
import { finite, linePath, splitPath, mapPath, uniqueId, updatePiece, replacePiece, assertInteriorCut } from './operation-tools.js';

function openCut(piece, edge) {
  const reason = edgeOperationReason('SLASH_SPREAD', piece, edge);
  if (reason) throw new RangeError(reason);
}

export function rotatedAnnotations(piece, movingPaths, map, { allowGrainCrossing = false } = {}) {
  const region = new Path(movingPaths.flatMap(p => p.segments)).close();
  const polygon = flattenPath(region);
  const vertices = movingPaths.flatMap(path => path.segments.flatMap(s => [s.start, s.end]));
  const moved = p => vertices.some(v => v.equals(p)) || inside(p, polygon);
  const grainSamples = Array.from({ length: 21 }, (_, i) => moved(piece.grainline.segments[0].pointAt(i / 20)));
  const crossesGrain = grainSamples.some(Boolean) && !grainSamples.every(Boolean);
  if (crossesGrain && !allowGrainCrossing) throw new RangeError('切開線が地の目線を横切ります。初版では地の目が一方の領域に収まる必要があります');
  return {
    // Across a dart pivot, use the fixed side's original direction. The caller
    // relocates this annotation within the resulting outline if necessary.
    grainline: !crossesGrain && grainSamples[0] ? mapPath(piece.grainline, map) : piece.grainline,
    landmarks: Object.fromEntries(Object.entries(piece.landmarks).map(([key, p]) => [key, moved(p) ? map(p) : p])),
    // Drafting construction guides cease to describe the edited topology.
    guides: [],
    features: piece.features.map(f => ({ ...f, ...(f.pivot ? { pivot: moved(f.pivot) ? map(f.pivot) : f.pivot } : {}),
      ...(f.cutPoint ? { cutPoint: moved(f.cutPoint) ? map(f.cutPoint) : f.cutPoint } : {}) })),
    darts: piece.darts.map(d => ({ ...d, apex: moved(d.apex) ? map(d.apex) : d.apex,
      ...(d.pivot ? { pivot: moved(d.pivot) ? map(d.pivot) : d.pivot } : {}),
      ...(d.sewingTip ? { sewingTip: moved(d.sewingTip) ? map(d.sewingTip) : d.sewingTip } : {}) })),
  };
}

/** One slash per operation, repeatable: pivot on the boundary, cut inside an open edge.
 * The forward boundary chain rotates rigidly; a new open edge fills the wedge.
 */
export function slashSpread(pattern, piece, op) {
  finite(op.angleDeg, 'angleDeg', -60, 60);
  if (Math.abs(op.angleDeg) < 0.01) throw new RangeError('展開角度の絶対値は0.01度以上にしてください');
  assertOperationAvailable('SLASH_SPREAD', pattern, piece);
  if (op.pivotDistanceMm !== undefined) finite(op.pivotDistanceMm, 'pivotDistanceMm', 0, piece.edge(op.pivotEdge).path.length(0.0001));
  if (op.pivotDistanceMm > 0) {
    const edge = piece.edge(op.pivotEdge);
    if (piece.features.some(f => f.id === edge.id)) throw new RangeError('展開口の途中は支点にできません');
    const [a, b] = splitPath(edge.path, op.pivotDistanceMm);
    const id = `${uniqueId(piece, 'pivot-point')}-remainder`;
    const replacements = new Map([[edge.id, [{ piece: piece.id, edge: edge.id, path: a, startMm: 0 },
      { piece: piece.id, edge: id, path: b, startMm: op.pivotDistanceMm }]]]);
    const edges = piece.edges.flatMap(e => e.id === edge.id ? [{ ...e, path: a }, { ...e, id, path: b }] : [e]);
    const edited = updatePiece(piece, { edges, notches: partitionNotches(piece, replacements, piece.id, edges) });
    const pieces = pattern.pieces.map(p => p.id === piece.id ? edited : p);
    const next = { ...pattern, ...remapSewing(pattern, piece, replacements, pieces) };
    return slashSpread(next, edited, { ...op, pivotEdge: id, pivotDistanceMm: 0 });
  }
  const pivotIndex = piece.edges.findIndex(e => e.id === op.pivotEdge);
  if (pivotIndex < 0) throw new RangeError('未知の支点辺です');
  const ordered = [...piece.edges.slice(pivotIndex), ...piece.edges.slice(0, pivotIndex)];
  const cutIndex = ordered.findIndex(e => e.id === op.cutEdge);
  if (cutIndex < 1) throw new RangeError('切開辺は支点辺と異なる辺を指定してください');
  const cut = ordered[cutIndex];
  openCut(piece, cut);
  const [a, b] = splitPath(cut.path, op.distanceMm);
  const pivot = ordered[0].path.start;
  const cutPoint = a.end;
  const polygon = flattenPath(piece.boundary);
  assertInteriorCut(piece, pivot, cutPoint);
  const area = polygon.slice(1).reduce((sum, q, i) => sum + polygon[i].x * q.y - q.x * polygon[i].y, 0);
  if (area * op.angleDeg >= 0) throw new RangeError('展開は外向きに開く角度を指定してください');
  const transform = Transform.rotation(op.angleDeg * Math.PI / 180, pivot);
  const map = p => p.equals(pivot) ? pivot : transform.apply(p);
  const moving = [...ordered.slice(0, cutIndex), { ...cut, path: a }];
  const id = uniqueId(piece, 'spread');
  const moved = moving.map(e => ({ ...e, path: mapPath(e.path, map) }));
  const edges = [...moved, { id, role: 'open', path: linePath(map(cutPoint), cutPoint) },
    { ...cut, id: `${id}-remainder`, path: b }, ...ordered.slice(cutIndex + 1)];
  const annotations = rotatedAnnotations(piece, moving.map(e => e.path), map);
  return replacePiece(pattern, updatePiece(piece, { edges,
    ...annotations,
    features: [...annotations.features, { type: 'slash-spread', id, pivot, cutPoint, angleDeg: op.angleDeg,
      openingMm: map(cutPoint).distanceTo(cutPoint), sourceEdge: cut.id, remainderEdge: `${id}-remainder` }],
  }), { topologyChanges: edgeChanges(pattern, piece, new Map([[cut.id, [
    { piece: piece.id, edge: cut.id, path: a, startMm: 0 },
    { piece: piece.id, edge: `${id}-remainder`, path: b, startMm: op.distanceMm },
  ]]])) });
}

/** Sleeve convenience operation: exact chord opening at the midpoint of the cuff. */
export function addFlare(pattern, piece, op) {
  assertOperationAvailable('ADD_FLARE', pattern, piece);
  finite(op.amountMm, 'amountMm', 0.1, 300);
  const cuff = piece.edge('cuff').path;
  const distanceMm = cuff.length(0.0001) / 2;
  const [a] = splitPath(cuff, distanceMm);
  const pivot = piece.edge('cap-front').path.start;
  const radius = pivot.distanceTo(a.end);
  const angleDeg = -2 * Math.asin(op.amountMm / (2 * radius)) * 180 / Math.PI;
  return slashSpread(pattern, piece, { pivotEdge: 'cap-front', cutEdge: 'cuff', distanceMm, angleDeg });
}

/** Open matching straight seam ends. Sewing edges retain their ids, openings get new ids. */
export function addSlit(pattern, piece, op) {
  finite(op.lengthMm, 'lengthMm', 0.1, 300);
  if (!['start', 'end'].includes(op.from)) throw new RangeError('fromはstartまたはendです');
  const relation = sewingSides(pattern, pattern.relations.find(r => r.id === op.relation));
  const reason = slitRelationReason(relation, piece, pattern);
  if (reason) throw new RangeError(reason);
  assertOperationAvailable('ADD_SLIT', pattern, piece);
  const ids = [relation.a.edge, relation.b.edge];
  const opensFromStart = side => side === 0 || relation.direction === 'same' ? op.from === 'start' : op.from !== 'start';
  for (const id of ids) {
    const edge = piece.edge(id);
    if (edge.path.length() <= op.lengthMm + 1) throw new RangeError('開きの後に縫合長を1 mmより長く残してください');
  }
  const id = uniqueId(piece, 'slit');
  const edges = piece.edges.flatMap(edge => {
    const side = ids.indexOf(edge.id);
    if (side < 0) return [edge];
    const fromStart = opensFromStart(side);
    const distance = fromStart ? op.lengthMm : edge.path.length() - op.lengthMm;
    const [a, b] = splitPath(edge.path, distance);
    const opening = { id: `${id}-${side}`, role: 'open', path: fromStart ? a : b };
    const sewn = { ...edge, path: fromStart ? b : a };
    return fromStart ? [opening, sewn] : [sewn, opening];
  });
  const replacements = new Map(ids.map((edgeId, side) => {
    const fromStart = opensFromStart(side);
    const order = fromStart ? [`${id}-${side}`, edgeId] : [edgeId, `${id}-${side}`];
    let startMm = 0;
    return [edgeId, order.map(edge => { const path = edges.find(e => e.id === edge).path;
      const part = { piece: piece.id, edge, path, startMm }; startMm += path.length(); return part; })];
  }));
  return replacePiece(pattern, updatePiece(piece, { edges, features: [...piece.features,
    { type: 'slit', id, relation: relation.id, lengthMm: op.lengthMm, from: op.from, edges: [`${id}-0`, `${id}-1`] }] }),
  { topologyChanges: edgeChanges(pattern, piece, replacements) });
}
