import { Vector, Path } from '../core/geometry.js';
import { Transform } from '../core/transforms.js';
import { flattenPath } from '../core/path-tools.js';
import { rotatedAnnotations } from './operations-topology.js';
import { finite, splitPath, linePath, mapPath, uniqueId, updatePiece, replacePiece, assertInteriorCut } from './operation-tools.js';
import { remapSewing, partitionNotches } from './sewing.js';
import { fitGrainline } from './grainline.js';
import { edgeChanges } from './reference-events.js';
import { edgeOperationReason } from './capabilities.js';

/** Add an equal-legged dart to an open straight or curved edge. */
export function addDart(pattern, piece, op) {
  finite(op.widthMm, 'widthMm', 0.1, 100);
  finite(op.depthMm, 'depthMm', 1, 300);
  finite(op.distanceMm, 'distanceMm');
  const edge = piece.edge(op.edge);
  const reason = edgeOperationReason('ADD_DART', piece, edge);
  if (reason) throw new RangeError(reason);
  const [before, tail] = splitPath(edge.path, op.distanceMm - op.widthMm / 2);
  const [mouth, after] = splitPath(tail, op.widthMm);
  const a = mouth.start, b = mouth.end;
  const polygon = flattenPath(piece.boundary);
  const area = polygon.slice(1).reduce((sum, q, i) => sum + polygon[i].x * q.y - q.x * polygon[i].y, 0);
  const tangent = a.vectorTo(b).normalized();
  const normal = new Vector(-tangent.y, tangent.x).scale(Math.sign(area));
  const apex = a.lerp(b, 0.5).translate(normal.scale(op.depthMm));
  assertInteriorCut(piece, a, apex);
  assertInteriorCut(piece, b, apex);
  const id = uniqueId(piece, 'dart');
  const legA = `${id}-in`, legB = `${id}-out`;
  const relationId = `${piece.id}-${id}`;
  if (pattern.relations.some(r => r.id === relationId)) throw new RangeError('ダーツの縫合IDが重複しています');
  const edges = piece.edges.flatMap(e => e.id !== edge.id ? [e] : [
    { ...e, path: before }, { id: legA, role: 'sew', path: linePath(a, apex) },
    { id: legB, role: 'sew', path: linePath(apex, b) }, { ...e, id: `${id}-remainder`, path: after },
  ]);
  const dart = { id, apex, legA, legB, relation: relationId, intakeAngleRad: 2 * Math.atan(a.distanceTo(b) / (2 * op.depthMm)) };
  const boundary = new Path(edges.flatMap(e => e.path.segments), { closed: true });
  return replacePiece(pattern, updatePiece(piece, { edges, guides: [], darts: [...piece.darts, dart],
    grainline: fitGrainline(boundary, piece.grainline) }), {
    topologyChanges: edgeChanges(pattern, piece, new Map([[edge.id, [
      { piece: piece.id, edge: edge.id, path: before, startMm: 0 },
      { piece: piece.id, edge: `${id}-remainder`, path: after, startMm: op.distanceMm + op.widthMm / 2 },
    ]]])),
    relations: [...pattern.relations, { id: relationId, kind: 'sew', direction: 'opposite', a: { piece: piece.id, edge: legA },
      b: { piece: piece.id, edge: legB }, ease: { min: 0, max: 0 }, note: 'ダーツの脚' }],
  });
}

/** Explicitly replace the angular dart constraint with an ordinary equal-length seam. */
export function convertDart(pattern, piece, op) {
  const dart = piece.darts.find(d => d.id === op.dart);
  if (!dart) throw new RangeError('変換するダーツを指定してください');
  return replacePiece(pattern, updatePiece(piece, { darts: piece.darts.filter(d => d.id !== dart.id) }), {
    relations: pattern.relations.map(r => r.id === dart.relation ? { ...r, note: 'ダーツから変換した通常の縫合', convertedFromDart: dart.entityId ?? dart.id } : r),
  });
}

/** Close the source dart rigidly about its apex and open the same angular intake elsewhere. */
export function pivotDart(pattern, piece, op) {
  const ratio = op.ratio ?? 1;
  finite(ratio, 'ratio', 0.001, 1);
  const dart = piece.darts.find(d => d.id === op.dart);
  if (!dart) throw new RangeError('移動するダーツを指定してください');
  const legA = piece.edge(dart.legA), legB = piece.edge(dart.legB);
  const start = piece.edges.findIndex(e => e.id === dart.legB);
  const ordered = [...piece.edges.slice(start), ...piece.edges.slice(0, start)];
  if (ordered.at(-1).id !== dart.legA) throw new RangeError('ダーツの脚が隣接していません');
  const cutIndex = ordered.findIndex(e => e.id === op.targetEdge);
  const target = ordered[cutIndex];
  if (!target) throw new RangeError('移動先の辺を指定してください');
  const reason = edgeOperationReason('PIVOT_DART', piece, target);
  if (reason) throw new RangeError(reason);
  const [a, b] = splitPath(target.path, op.distanceMm);
  assertInteriorCut(piece, dart.apex, a.end);
  const vA = dart.apex.vectorTo(legA.path.start), vB = dart.apex.vectorTo(legB.path.end);
  const angle = Math.atan2(vB.x * vA.y - vB.y * vA.x, vB.x * vA.x + vB.y * vA.y);
  const rotation = Transform.rotation(angle * ratio, dart.apex);
  const map = p => p.equals(dart.apex) ? dart.apex : ratio === 1 && p.equals(legB.path.end) ? legA.path.start : rotation.apply(p);
  const moving = [...ordered.slice(1, cutIndex), { ...target, path: a }];
  const id = uniqueId(piece, 'pivot');
  const partial = ratio < 1, movedId = partial ? uniqueId(piece, 'distributed-dart') : dart.id;
  const movedA = partial ? `${movedId}-in` : legA.id, movedB = partial ? `${movedId}-out` : legB.id;
  const relationId = partial ? `${piece.id}-${movedId}` : dart.relation;
  const edges = [...(partial ? [{ ...legB, path: mapPath(legB.path, map) }] : []),
    ...moving.map(e => ({ ...e, path: mapPath(e.path, map) })),
    { id: movedA, role: 'sew', path: linePath(map(a.end), dart.apex) }, { id: movedB, role: 'sew', path: linePath(dart.apex, a.end) },
    { ...target, id: `${id}-remainder`, path: b }, ...ordered.slice(cutIndex + 1, -1), ...(partial ? [legA] : [])];
  const annotations = rotatedAnnotations(piece, [legB.path, ...moving.map(e => e.path)], map, { allowGrainCrossing: true });
  const boundary = new Path(edges.flatMap(e => e.path.segments), { closed: true });
  annotations.grainline = fitGrainline(boundary, annotations.grainline);
  const replacements = new Map([[target.id, [{ piece: piece.id, edge: target.id, path: a, startMm: 0 },
    { piece: piece.id, edge: `${id}-remainder`, path: b, startMm: op.distanceMm }]]]);
  const edited = updatePiece(piece, { edges, ...annotations,
    notches: partitionNotches(piece, replacements, piece.id, edges),
    darts: [...annotations.darts.filter(d => partial || d.id !== dart.id).map(d => d.id === dart.id
      ? { ...d, intakeAngleRad: dart.intakeAngleRad * (1 - ratio), pivot: dart.apex, sewingTip: null } : d),
      { ...(partial ? {} : dart), id: movedId, apex: dart.apex, pivot: dart.apex, sewingTip: null,
        legA: movedA, legB: movedB, relation: relationId, intakeAngleRad: dart.intakeAngleRad * ratio, targetEdge: target.id }],
  });
  const result = { ...pattern, ...remapSewing(pattern, piece, replacements, pattern.pieces.map(p => p.id === piece.id ? edited : p)) };
  return partial ? { ...result, relations: [...result.relations, { id: relationId, kind: 'sew', direction: 'opposite',
    a: { piece: piece.id, edge: movedA }, b: { piece: piece.id, edge: movedB }, ease: { min: 0, max: 0 }, note: '分配したダーツの脚' }] } : result;
}
