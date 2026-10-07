import { Point, Vector, Line, CubicBezier, Path } from './geometry.js';
import { Transform, transformPath } from './transforms.js';

export function reversePath(path) {
  return new Path([...path.segments].reverse().map(segment => segment instanceof Line
    ? new Line(segment.end, segment.start)
    : new CubicBezier(segment.end, segment.control2, segment.control1, segment.start)),
  { closed: path.closed });
}

export function translatePath(path, x, y) {
  return transformPath(path, Transform.translation(x, y));
}

export function tangentAt(segment, t) {
  if (segment instanceof Line) return segment.start.vectorTo(segment.end).normalized();
  const [a, b, c, d] = segment.controlPoints;
  const s = 1 - t;
  return new Vector(
    3 * s * s * (b.x - a.x) + 6 * s * t * (c.x - b.x) + 3 * t * t * (d.x - c.x),
    3 * s * s * (b.y - a.y) + 6 * s * t * (c.y - b.y) + 3 * t * t * (d.y - c.y),
  ).normalized();
}

/** Interpolation policy for hand-drawn ruler curves; not a Bunka formula.
 * Shared tangent directions provide G1 continuity; handles are 1/3 chord long.
 * Optional per-knot directions express drafting tangencies explicitly.
 */
export function smoothThrough(points, tangents = []) {
  if (!Array.isArray(points) || points.length < 2 || points.some(p => !(p instanceof Point))) {
    throw new TypeError('smoothThrough needs at least two Points');
  }
  const directions = points.map((p, i) => {
    if (tangents[i]) return tangents[i].normalized();
    return points[Math.max(0, i - 1)].vectorTo(points[Math.min(points.length - 1, i + 1)]).normalized();
  });
  return new Path(points.slice(1).map((end, i) => {
    const start = points[i];
    const handle = start.distanceTo(end) / 3;
    if (handle === 0) throw new RangeError('Interpolation points must be distinct');
    return new CubicBezier(start, start.translate(directions[i].scale(handle)),
      end.translate(directions[i + 1].scale(-handle)), end);
  }));
}

function partialLength(segment, t) {
  return segment instanceof Line ? segment.length() * t : segment.split(t)[0].length(0.0001);
}

/** Arc-length location used to transfer notches between mating edges. */
export function locateAtLength(path, distance) {
  const lengths = path.segments.map(segment => segment.length(0.0001));
  const total = lengths.reduce((a, b) => a + b, 0);
  if (!Number.isFinite(distance) || distance < 0 || distance > total + 0.001) {
    throw new RangeError('Distance must lie on the path');
  }
  let remaining = Math.min(distance, total);
  for (let i = 0; i < path.segments.length; i++) {
    if (remaining > lengths[i] && i < path.segments.length - 1) {
      remaining -= lengths[i];
      continue;
    }
    const segment = path.segments[i];
    if (lengths[i] === 0) throw new RangeError('Cannot locate a notch on a zero-length segment');
    let low = 0, high = 1;
    for (let step = 0; step < 36; step++) {
      const mid = (low + high) / 2;
      if (partialLength(segment, mid) < remaining) low = mid;
      else high = mid;
    }
    const t = remaining === 0 ? 0 : remaining === lengths[i] ? 1 : (low + high) / 2;
    return { point: segment.pointAt(t), tangent: tangentAt(segment, t), segmentIndex: i, t };
  }
  throw new RangeError('Could not locate distance');
}

/** For drafting curves with strictly increasing y, e.g. shoulder -> underarm. */
export function locateAtY(path, y) {
  if (!Number.isFinite(y)) throw new TypeError('y must be finite');
  let prefix = 0;
  for (let i = 0; i < path.segments.length; i++) {
    const segment = path.segments[i];
    if (segment.controlPoints.some((p, j, list) => j > 0 && p.y < list[j - 1].y)) {
      throw new RangeError('locateAtY requires monotone control-point y coordinates');
    }
    if (y >= segment.start.y && y <= segment.end.y) {
      let low = 0, high = 1;
      for (let step = 0; step < 40; step++) {
        const mid = (low + high) / 2;
        if (segment.pointAt(mid).y < y) low = mid;
        else high = mid;
      }
      const t = (low + high) / 2;
      return { point: segment.pointAt(t), tangent: tangentAt(segment, t),
        distance: prefix + partialLength(segment, t) };
    }
    prefix += segment.length(0.0001);
  }
  throw new RangeError('y is outside the path');
}

export function distanceToSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const squared = dx * dx + dy * dy;
  if (squared === 0) return p.distanceTo(a);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / squared));
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

/** Adaptive approximation with control-hull distance bounded by tolerance. */
export function flattenPath(path, tolerance = 0.05) {
  if (!Number.isFinite(tolerance) || tolerance <= 0) throw new RangeError('Invalid flattening tolerance');
  const points = [path.start];
  let nodes = 0;
  const visit = (segment, depth) => {
    if (++nodes > 100000) throw new RangeError('Flattening subdivision limit exceeded');
    const flat = segment instanceof Line || Math.max(
      distanceToSegment(segment.control1, segment.start, segment.end),
      distanceToSegment(segment.control2, segment.start, segment.end),
    ) <= tolerance;
    if (flat) { points.push(segment.end); return; }
    if (depth >= 24) throw new RangeError('Flattening did not converge');
    for (const child of segment.split()) visit(child, depth + 1);
  };
  for (const segment of path.segments) visit(segment, 0);
  return points;
}
