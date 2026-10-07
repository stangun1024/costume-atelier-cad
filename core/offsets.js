import { Vector, Line, Path } from './geometry.js';
import { flattenPath } from './path-tools.js';
import { intersectSegments } from './intersections.js';

const cross = (a, b) => a.x * b.y - a.y * b.x;
const dot = (a, b) => a.x * b.x + a.y * b.y;
const area = points => points.reduce((sum, p, i) => {
  const q = points[(i + 1) % points.length];
  return sum + p.x * q.y - q.x * p.y;
}, 0) / 2;

function assertSimple(segments, closed, tolerance) {
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const adjacent = j === i + 1 || (closed && i === 0 && j === segments.length - 1);
      const hits = intersectSegments(segments[i], segments[j], { tolerance });
      if (hits.some(hit => hit.kind === 'overlap' || !adjacent)) {
        throw new RangeError('Offset requires simple geometry; self-intersection or overlap detected');
      }
    }
  }
}

/**
 * One-sided parallel path. Positive left uses normal (-dy, dx) (screen-right in Y-down coordinates).
 * Curves become polylines. Closed outward/inward sides are independent of winding.
 * No boolean cleanup: collapsed/reversed/self-intersecting offsets throw.
 */
export function offsetPath(path, distance, {
  side = 'left', join = 'miter', miterLimit = 4, flattenTolerance = 0.05, tolerance = 1e-7,
  maxSegments = 4096, segmentDistances = null,
} = {}) {
  if (!(path instanceof Path)) throw new TypeError('Expected a Path');
  if (!Number.isFinite(distance)) throw new TypeError('Offset distance must be finite');
  if (!['left', 'right', 'outward', 'inward'].includes(side)) throw new RangeError('Unknown offset side');
  if (!['miter', 'bevel'].includes(join)) throw new RangeError('Unknown offset join');
  if (!Number.isFinite(miterLimit) || miterLimit < 1) throw new RangeError('miterLimit must be at least 1');
  if (![flattenTolerance, tolerance].every(t => Number.isFinite(t) && t > 0)) throw new RangeError('Offset tolerances must be positive');
  if (!Number.isInteger(maxSegments) || maxSegments < 1) throw new RangeError('maxSegments must be a positive integer');
  if (!path.closed && ['outward', 'inward'].includes(side)) throw new RangeError('Outward/inward require a closed path');
  if (distance === 0) return path;
  if (Math.abs(distance) <= tolerance) throw new RangeError('Offset distance must exceed numerical tolerance');
  let points = flattenPath(path, flattenTolerance).filter((p, i, all) => i === 0 || p.distanceTo(all[i - 1]) > tolerance);
  if (path.closed && points.length > 1 && points[0].distanceTo(points.at(-1)) <= tolerance) points.pop();
  if (points.length < (path.closed ? 3 : 2)) throw new RangeError('Cannot offset degenerate geometry');
  const signedArea = path.closed ? area(points) : 0;
  if (path.closed && Math.abs(signedArea) <= tolerance * tolerance) throw new RangeError('Cannot offset a zero-area boundary');
  const count = path.closed ? points.length : points.length - 1;
  if (count > maxSegments) throw new RangeError('Offset segment limit exceeded; increase flattenTolerance or maxSegments');
  const source = Array.from({ length: count }, (_, i) => new Line(points[i], points[(i + 1) % points.length]));
  if (segmentDistances && (segmentDistances.length !== count || segmentDistances.some(w => !Number.isFinite(w) || w < 0)))
    throw new RangeError('Segment allowance widths must match the flattened boundary');
  assertSimple(source, path.closed, tolerance);
  let d = side === 'right' ? -distance : distance;
  if (side === 'outward') d = -Math.sign(signedArea) * distance;
  if (side === 'inward') d = Math.sign(signedArea) * distance;
  const directions = source.map(line => line.start.vectorTo(line.end).normalized());
  const distances = segmentDistances ? segmentDistances.map(w => w * Math.sign(d)) : directions.map(() => d);
  const normals = directions.map((v, i) => new Vector(-v.y * distances[i], v.x * distances[i]));
  const shifted = source.map((line, i) => new Line(line.start.translate(normals[i]), line.end.translate(normals[i])));
  const corners = points.map((point, i) => {
    if (!path.closed && i === 0) return [shifted[0].start];
    if (!path.closed && i === points.length - 1) return [shifted.at(-1).end];
    const previous = (i - 1 + count) % count, next = i % count;
    const u = directions[previous], v = directions[next], turn = cross(u, v);
    const a = shifted[previous].end, b = shifted[next].start;
    if (Math.abs(turn) <= 1e-12) {
      if (dot(u, v) <= 0) throw new RangeError('Cannot offset a reversing cusp');
      return a.distanceTo(b) <= tolerance ? [a] : [a, b];
    }
    const delta = a.vectorTo(b), travel = cross(delta, v) / turn;
    const intersection = a.translate(u.scale(travel));
    const localWidth = Math.max(Math.abs(distances[previous]), Math.abs(distances[next]));
    const ratio = localWidth ? point.distanceTo(intersection) / localWidth : 0;
    const outerCorner = turn * d < 0;
    // A width change along a nearly tangent curve is a step, not a distant spike.
    if (segmentDistances && distances[previous] !== distances[next] && ratio > miterLimit) return [a, b];
    if (outerCorner && (join === 'bevel' || ratio > miterLimit)) return [a, b];
    // Inner corners must be trimmed at the intersection, never bridged across the source.
    if (!outerCorner && ratio > miterLimit) throw new RangeError('Inner offset corner exceeds miterLimit');
    return [intersection];
  });
  for (let i = 0; i < count; i++) {
    const delta = corners[i].at(-1).vectorTo(corners[(i + 1) % corners.length][0]);
    if (dot(delta, directions[i]) <= tolerance) throw new RangeError('Offset collapses or reverses an edge; reduce distance');
  }
  points = corners.flat().filter((p, i, all) => i === 0 || p.distanceTo(all[i - 1]) > tolerance);
  const segments = points.slice(1).map((p, i) => new Line(points[i], p));
  if (path.closed) segments.push(new Line(points.at(-1), points[0]));
  if (segments.length > maxSegments) throw new RangeError('Offset segment limit exceeded; increase maxSegments');
  assertSimple(segments, path.closed, tolerance);
  if (path.closed && area(points) * signedArea <= 0) throw new RangeError('Offset boundary has collapsed');
  return new Path(segments, { closed: path.closed });
}

export function offsetLine(line, distance) {
  if (!(line instanceof Line)) throw new TypeError('Expected a Line');
  return offsetPath(new Path([line]), distance).segments[0];
}
