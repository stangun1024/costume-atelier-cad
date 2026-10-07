import { Point, Path } from '../core/geometry.js';
import { flattenPath, reversePath } from '../core/path-tools.js';
import { deepFreeze } from './piece.js';
import { inside } from './validation.js';
import { finite, splitPath, linePath, updatePiece, assertInteriorCut } from './operation-tools.js';
import { remapSewing, partitionNotches } from './sewing.js';
import { edgeOperationReason } from './capabilities.js';
import { internalPath } from './internal-path.js';
import { attachmentWithinPiece } from './assembly-sewing.js';

/** Place a grain arrow inside each new panel, preserving the source grain direction. */
export function panelGrain(boundary, original) {
  const polygon = flattenPath(boundary, 0.01);
  const d = original.start.vectorTo(original.end).normalized();
  const normal = { x: -d.y, y: d.x };
  const offsets = polygon.map(p => p.x * normal.x + p.y * normal.y);
  const lo = Math.min(...offsets), hi = Math.max(...offsets);
  let best = null;
  for (let i = 1; i < 32; i++) {
    const offset = lo + (hi - lo) * i / 32;
    const ts = [];
    for (let j = 1; j < polygon.length; j++) {
      const a = polygon[j - 1], b = polygon[j];
      const pa = offsets[j - 1], pb = offsets[j];
      if ((pa <= offset && pb > offset) || (pb <= offset && pa > offset)) {
        const p = a.lerp(b, (offset - pa) / (pb - pa));
        ts.push(p.x * d.x + p.y * d.y);
      }
    }
    ts.sort((a, b) => a - b);
    for (let j = 1; j < ts.length; j += 2) {
      const length = ts[j] - ts[j - 1];
      if (!best || length > best.length) best = { offset, lo: ts[j - 1], hi: ts[j], length };
    }
  }
  if (!best || best.length < 2) throw new RangeError('分割後のパーツに地の目線を置く余地がありません');
  const at = t => new Point(normal.x * best.offset + d.x * t, normal.y * best.offset + d.y * t);
  return linePath(at(best.lo + best.length * 0.2), at(best.hi - best.length * 0.2));
}

/** Partition at two arbitrary boundary positions; preserve all existing sewing chains. */
export function splitPiece(pattern, piece, op) {
  if (piece.attachmentLines.length) throw new RangeError('内部取付線のあるパーツの分割は未対応です。取付線を作る前の操作を編集してください');
  const endpoints = [[op.startEdge, op.startDistanceMm], [op.endEdge, op.endDistanceMm]];
  const points = endpoints.map(([id, distance]) => {
    const edge = piece.edge(id);
    const reason = edgeOperationReason('SPLIT_PIECE', piece, edge);
    if (reason) throw new RangeError(reason);
    finite(distance, '分割位置', 0, edge.path.length(0.0001));
    return distance === 0 ? edge.path.start : Math.abs(distance - edge.path.length(0.0001)) < 1e-7 ? edge.path.end : splitPath(edge.path, distance)[0].end;
  });
  let cutPath = internalPath(points[0], points[1], op.segments);
  if (op.segments === undefined) assertInteriorCut(piece, ...points);
  else if (points[0].distanceTo(points[1]) < 0.001 || !attachmentWithinPiece(piece, cutPath))
    throw new RangeError('分割曲線は異なる外周2点を結び、その間は型紙内部を通る必要があります');
  let serial = 1;
  while (pattern.pieces.some(p => p.id === `${piece.id}-panel-${serial}`)) serial++;
  const newId = `${piece.id}-panel-${serial}`, seamId = `${newId}-join`;
  const fragments = new Map(), expanded = [];
  for (const edge of piece.edges) {
    const distances = [...new Set(endpoints.filter(([id]) => id === edge.id).map(([, d]) => d))]
      .filter(d => d > 0 && d < edge.path.length(0.0001) - 1e-7).sort((a, b) => a - b);
    let path = edge.path, startMm = 0;
    const parts = [];
    for (const distance of distances) {
      const [a, b] = splitPath(path, distance - startMm);
      parts.push({ path: a, startMm }); path = b; startMm = distance;
    }
    parts.push({ path, startMm });
    const entries = parts.map((part, i) => ({ ...part, edge: i ? `${newId}-${edge.id}-${i}` : edge.id, role: edge.role }));
    fragments.set(edge.id, entries); expanded.push(...entries);
  }
  const first = expanded.findIndex(f => f.path.start.distanceTo(points[0]) < 1e-6);
  const ordered = [...expanded.slice(first), ...expanded.slice(0, first)];
  const second = ordered.findIndex(f => f.path.start.distanceTo(points[1]) < 1e-6);
  if (first < 0 || second <= 0) throw new RangeError('異なる2点を分割位置に指定してください');
  const groups = [ordered.slice(0, second), ordered.slice(second)];
  // Reuse the exact partition endpoints, including floating-point rounding.
  cutPath = internalPath(groups[0][0].path.start, groups[1][0].path.start, op.segments);
  const children = groups.map((group, i) => {
    const id = i ? newId : piece.id;
    group.forEach(f => { f.piece = id; });
    const edges = group.map(f => ({ id: f.edge, role: f.role, path: f.path }));
    edges.push({ id: seamId, role: 'sew', path: i ? cutPath : reversePath(cutPath) });
    return { id, edges };
  });
  const panels = children.map(({ id, edges }, i) => {
    const boundary = new Path(edges.flatMap(e => e.path.segments), { closed: true });
    const has = edgeId => edges.some(e => e.id === edgeId);
    const darts = piece.darts.filter(d => {
      if (has(d.legA) !== has(d.legB)) throw new RangeError('ダーツを横切る分割はできません');
      return has(d.legA);
    });
    const features = piece.features.filter(f => {
      const ids = f.type === 'slit' ? f.edges : [f.id];
      if (ids.some(has) && !ids.every(has)) throw new RangeError('開きの両側を別パーツに分割することはできません');
      return ids.every(has);
    });
    const polygon = flattenPath(boundary);
    return updatePiece(piece, { id, name: `${piece.name}・${i ? '分割B' : '分割A'}`, edges, darts, features, splitFrom: piece.splitFrom ?? piece.id,
      guides: [], landmarks: Object.fromEntries(Object.entries(piece.landmarks).filter(([, p]) => inside(p, polygon))),
      grainline: panelGrain(boundary, piece.grainline),
      notches: partitionNotches(piece, fragments, id, edges),
      cut: { ...piece.cut, onFold: edges.some(e => e.role === 'fold'),
        ...(piece.cut.onFold && !edges.some(e => e.role === 'fold') ? { quantity: 2, mirroredPair: true } : {}) },
    });
  });
  const pieces = pattern.pieces.flatMap(p => p.id === piece.id ? panels : [p]);
  const remapped = remapSewing(pattern, piece, fragments, pieces);
  return deepFreeze({ ...pattern, ...remapped,
    pieceChanges: [{ source: piece.id, outputs: [piece.id, newId] }],
    relations: [...remapped.relations,
    { id: seamId, kind: 'sew', direction: 'opposite', a: { piece: piece.id, edge: seamId }, b: { piece: newId, edge: seamId },
      ease: { min: 0, max: 0 }, note: `${piece.name}の分割線` }] });
}
