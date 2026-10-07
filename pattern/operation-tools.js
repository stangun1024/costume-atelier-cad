import { record, finite } from '../core/input-validation.js';
import { Point, Line, CubicBezier, Path } from '../core/geometry.js';
import { locateAtLength, flattenPath } from '../core/path-tools.js';
import { intersectPaths } from '../core/intersections.js';
import { inside } from './validation.js';
import { PatternPiece, deepFreeze } from './piece.js';
import { offsetPath } from '../core/offsets.js';
import { dartAllowance } from './dart-allowance.js';
import { offsetEdges } from './allowance-path.js';
import { constructionProgress } from './construction-progress.js';

export { record, finite } from '../core/input-validation.js';

export function point(value) {
  record(value, ['x', 'y'], 'point');
  return new Point(finite(value.x, 'x'), finite(value.y, 'y'));
}
export const linePath = (a, b) => new Path([new Line(a, b)]);
export function assertInteriorCut(piece, a, b) {
  const polygon = flattenPath(piece.boundary);
  const hits = intersectPaths(linePath(a, b), piece.boundary, { tolerance: 0.0001 });
  if (a.distanceTo(b) < 0.001 || hits.some(h => h.kind !== 'point'
      || (h.point.distanceTo(a) > 0.001 && h.point.distanceTo(b) > 0.001))
      || Array.from({ length: 19 }, (_, i) => a.lerp(b, (i + 1) / 20)).some(p => !inside(p, polygon))) {
    throw new RangeError('切開線は輪郭と交差せず型紙の内部を通る必要があります');
  }
}
export function mapPath(path, map) {
  return new Path(path.segments.map(s => s instanceof Line
    ? new Line(map(s.start), map(s.end)) : new CubicBezier(...s.controlPoints.map(map))), { closed: path.closed });
}
export function splitPath(path, distance) {
  finite(distance, 'distanceMm', 0, path.length(0.0001));
  if (distance < 0.001 || path.length(0.0001) - distance < 0.001) throw new RangeError('分割位置は辺の端から0.001 mm以上離してください');
  const { segmentIndex: i, t, point: p } = locateAtLength(path, distance);
  const s = path.segments[i];
  const halves = s instanceof Line ? [new Line(s.start, p), new Line(p, s.end)] : s.split(t);
  return [new Path([...path.segments.slice(0, i), ...(t > 0 ? [halves[0]] : [])]),
    new Path([...(t < 1 ? [halves[1]] : []), ...path.segments.slice(i + 1)])];
}
export function targetPiece(pattern, id) {
  const piece = pattern.pieces.find(p => p.id === id);
  if (!piece) throw new RangeError(`未知のパーツ: ${id}`);
  return piece;
}
export function replacePiece(pattern, piece, extra = {}) {
  return deepFreeze({ ...pattern, ...extra, pieces: pattern.pieces.map(p => p.id === piece.id ? piece : p) });
}
export function updatePiece(piece, patch) {
  const edges = patch.edges ?? piece.edges;
  const notches = (patch.notches ?? piece.notches).map(n => {
    const edge = edges.find(e => e.id === n.edgeId);
    if (!edge) throw new RangeError(`合印の参照辺を失いました: ${n.edgeId}`);
    const location = locateAtLength(edge.path, n.distanceFromStart);
    return { ...n, point: location.point, tangent: location.tangent };
  });
  return new PatternPiece({ ...piece, ...patch, notches, cuttingBoundary: null });
}
export function deriveCuttingBoundaries(pattern) {
  return deepFreeze({ ...pattern, pieces: pattern.pieces.map(piece => {
    const construction = constructionProgress(pattern, piece);
    if (construction) piece = new PatternPiece({ ...piece, drafting: { ...piece.drafting,
      attachmentPending: !construction.attachment, constructionPending: construction.missing.length > 0 } });
    const width = piece.cut.seamAllowance;
    if (!width) return piece.cuttingBoundary ? new PatternPiece({ ...piece, cuttingBoundary: null }) : piece;
    const cuttingBoundary = piece.cut.seamAllowances ? variableAllowances(piece)
      : piece.darts.length ? dartAllowance(piece, width) : offsetPath(piece.boundary, width, { side: 'outward', join: 'miter' });
    return new PatternPiece({ ...piece, cuttingBoundary });
  }) });
}
function variableAllowances(piece) {
  const widths = piece.cut.seamAllowances;
  if (Object.keys(widths).length !== piece.edges.length || piece.edges.some(e => !Number.isFinite(widths[e.id]) || widths[e.id] < 0
      || e.role === 'fold' && widths[e.id] !== 0)) throw new RangeError('辺の構成が変わりました。辺別縫い代を設定し直してください');
  return piece.darts.length ? dartAllowance(piece, piece.cut.seamAllowance, widths)
    : offsetEdges(piece.edges, widths, { closed: true });
}
export function uniqueId(piece, prefix) {
  let i = 1;
  while (piece.edges.some(e => e.id === `${prefix}-${i}` || e.id.startsWith(`${prefix}-${i}-`)) || piece.darts.some(d => d.id === `${prefix}-${i}`)) i++;
  return `${prefix}-${i}`;
}
