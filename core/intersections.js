import { Line, CubicBezier, Path } from './geometry.js';

const clamp = t => Math.max(0, Math.min(1, t));
const cross = (x, y, u, v) => x * v - y * u;
const at = (coefficients, t) => coefficients.reduceRight((value, c) => value * t + c, 0);
const derivative = coefficients => coefficients.slice(1).map((c, i) => c * (i + 1));
const power = values => [values[0], 3 * (values[1] - values[0]),
  3 * (values[2] - 2 * values[1] + values[0]), values[3] - 3 * values[2] + 3 * values[1] - values[0]];

/** Isolate polynomial roots using monotonic intervals, including double roots. */
function roots(coefficients, epsilon = 64 * Number.EPSILON * Math.max(1, ...coefficients.map(Math.abs))) {
  const c = [...coefficients];
  while (c.length > 1 && c.at(-1) === 0) c.pop();
  if (c.length === 1) return [];
  if (c.length === 2) {
    const t = -c[0] / c[1];
    return t >= 0 && t <= 1 ? [t] : [];
  }
  const stops = [0, ...roots(derivative(c)).filter(t => t > 0 && t < 1), 1].sort((a, b) => a - b);
  const result = stops.filter(t => Math.abs(at(c, t)) <= epsilon);
  for (let i = 1; i < stops.length; i++) {
    let low = stops[i - 1], high = stops[i], f = at(c, low);
    if (f * at(c, high) >= 0) continue;
    for (let j = 0; j < 60; j++) {
      const mid = (low + high) / 2, value = at(c, mid);
      if ((f < 0) === (value < 0)) { low = mid; f = value; } else high = mid;
    }
    result.push((low + high) / 2);
  }
  return result.sort((a, b) => a - b).filter((t, i, list) => i === 0 || t - list[i - 1] > 1e-10);
}

function hit(a, b, tA, tB) {
  return { kind: 'point', point: a.pointAt(tA).lerp(b.pointAt(tB), 0.5), tA, tB };
}

function lineLine(a, b, tolerance) {
  const r = a.start.vectorTo(a.end), s = b.start.vectorTo(b.end);
  const q = a.start.vectorTo(b.start), lr = r.length, ls = s.length;
  if (lr === 0 && ls === 0) return a.start.distanceTo(b.start) <= tolerance ? [hit(a, b, 0, 0)] : [];
  if (lr === 0) {
    const t = clamp(((a.start.x - b.start.x) * s.x + (a.start.y - b.start.y) * s.y) / (ls * ls));
    return a.start.distanceTo(b.pointAt(t)) <= tolerance ? [hit(a, b, 0, t)] : [];
  }
  if (ls === 0) return swap(lineLine(b, a, tolerance));
  const denominator = cross(r.x, r.y, s.x, s.y);
  // A scale-relative roundoff threshold, not an angular user tolerance.
  if (Math.abs(denominator) > Number.EPSILON * 8 * lr * ls) {
    const t = cross(q.x, q.y, s.x, s.y) / denominator;
    const u = cross(q.x, q.y, r.x, r.y) / denominator;
    if (t < -tolerance / lr || t > 1 + tolerance / lr || u < -tolerance / ls || u > 1 + tolerance / ls) return [];
    const tc = clamp(t), uc = clamp(u);
    return a.pointAt(tc).distanceTo(b.pointAt(uc)) <= tolerance ? [hit(a, b, tc, uc)] : [];
  }
  if (Math.abs(cross(q.x, q.y, r.x, r.y)) / lr > tolerance) return [];
  const projectA = p => ((p.x - a.start.x) * r.x + (p.y - a.start.y) * r.y) / (lr * lr);
  const projectB = p => clamp(((p.x - b.start.x) * s.x + (p.y - b.start.y) * s.y) / (ls * ls));
  const t0 = projectA(b.start), t1 = projectA(b.end);
  const low = Math.max(0, Math.min(t0, t1)), high = Math.min(1, Math.max(t0, t1));
  if (high < low - tolerance / lr) return [];
  if ((high - low) * lr <= tolerance) {
    const t = clamp((low + high) / 2);
    return [hit(a, b, t, projectB(a.pointAt(t)))];
  }
  const start = a.pointAt(low), end = a.pointAt(high);
  return [{ kind: 'overlap', start, end, tA: [low, high], tB: [projectB(start), projectB(end)] }];
}

function swap(results) {
  return results.map(result => ({ ...result, tA: result.tB, tB: result.tA }));
}

function lineCurve(line, curve, tolerance) {
  if (curve.controlPoints.every(p => p.equals(curve.start))) return lineLine(line, new Line(curve.start, curve.end), tolerance);
  const delta = line.start.vectorTo(line.end), length = delta.length;
  if (length === 0) {
    const xs = power(curve.controlPoints.map(p => p.x - line.start.x));
    const ys = power(curve.controlPoints.map(p => p.y - line.start.y));
    const coefficients = Math.max(...xs.map(Math.abs)) >= Math.max(...ys.map(Math.abs)) ? xs : ys;
    if (coefficients.every(c => c === 0)) return [hit(line, curve, 0, 0)];
    return roots(coefficients).filter(t => curve.pointAt(t).distanceTo(line.start) <= tolerance)
      .map(t => hit(line, curve, 0, t));
  }
  const normalDistances = curve.controlPoints.map(p => cross(delta.x / length, delta.y / length,
    p.x - line.start.x, p.y - line.start.y));
  const projections = power(curve.controlPoints.map(p => ((p.x - line.start.x) * delta.x
    + (p.y - line.start.y) * delta.y) / (length * length)));
  if (normalDistances.every(v => Math.abs(v) <= tolerance)) {
    // A collinear cubic may double back: preserve each monotonic overlap interval.
    const stops = [0, 1, ...roots(projections), ...roots([projections[0] - 1, ...projections.slice(1)]),
      ...roots(derivative(projections))].sort((a, b) => a - b)
      .filter((t, i, list) => i === 0 || t - list[i - 1] > 1e-10);
    const results = [];
    for (let i = 1; i < stops.length; i++) {
      const a = stops[i - 1], b = stops[i], middle = at(projections, (a + b) / 2);
      if (middle < 0 || middle > 1) continue;
      const u = clamp(at(projections, a)), v = clamp(at(projections, b));
      if (Math.abs(u - v) * length <= tolerance) results.push(hit(line, curve, u, a));
      else results.push({ kind: 'overlap', start: line.pointAt(u), end: line.pointAt(v), tA: [u, v], tB: [a, b] });
    }
    for (const t of stops) {
      const u = at(projections, t);
      if (u >= -tolerance / length && u <= 1 + tolerance / length
          && !results.some(r => r.kind === 'overlap' && t >= r.tB[0] && t <= r.tB[1])) results.push(hit(line, curve, clamp(u), t));
    }
    return results;
  }
  return roots(power(normalDistances)).flatMap(t => {
    const u = at(projections, t);
    if (u < -tolerance / length || u > 1 + tolerance / length) return [];
    return line.pointAt(clamp(u)).distanceTo(curve.pointAt(t)) <= tolerance ? [hit(line, curve, clamp(u), t)] : [];
  });
}

function bounds(curve) {
  const points = curve.controlPoints;
  return { minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)),
    minY: Math.min(...points.map(p => p.y)), maxY: Math.max(...points.map(p => p.y)) };
}
const size = box => Math.hypot(box.maxX - box.minX, box.maxY - box.minY);

function parametersAtPoint(curve, point, epsilon) {
  const xs = power(curve.controlPoints.map(p => p.x - point.x));
  const ys = power(curve.controlPoints.map(p => p.y - point.y));
  const values = Math.max(...xs.map(Math.abs)) >= Math.max(...ys.map(Math.abs)) ? xs : ys;
  return [0, 1, ...roots(values, epsilon)].filter(t => curve.pointAt(t).distanceTo(point) <= epsilon)
    .sort((a, b) => a - b).filter((t, i, list) => i === 0 || t - list[i - 1] > 1e-10);
}

function subcurve(curve, start, end) {
  if (start > end) return new CubicBezier(...subcurve(curve, end, start).controlPoints.reverse());
  if (start === 0) return curve.split(end)[0];
  return curve.split(start)[1].split((end - start) / (1 - start))[0];
}

/** Recognize a shared span of the same cubic, including previously split curves. */
function coincidentSpans(a, b) {
  const scale = Math.max(1, ...[...a.controlPoints, ...b.controlPoints].flatMap(p => [Math.abs(p.x), Math.abs(p.y)]));
  const epsilon = 128 * Number.EPSILON * scale;
  const pairs = [];
  for (const t of [0, 1]) for (const u of parametersAtPoint(b, a.pointAt(t), epsilon)) pairs.push([t, u]);
  for (const u of [0, 1]) for (const t of parametersAtPoint(a, b.pointAt(u), epsilon)) pairs.push([t, u]);
  const spans = [];
  for (let i = 0; i < pairs.length; i++) {
    for (let j = i + 1; j < pairs.length; j++) {
      let [t0, u0] = pairs[i], [t1, u1] = pairs[j];
      if (Math.abs(t0 - t1) <= 1e-10 || Math.abs(u0 - u1) <= 1e-10) continue;
      if (t0 > t1) { [t0, t1] = [t1, t0]; [u0, u1] = [u1, u0]; }
      const ca = subcurve(a, t0, t1), cb = subcurve(b, u0, u1);
      if (!ca.controlPoints.every((p, k) => p.distanceTo(cb.controlPoints[k]) <= epsilon)) continue;
      if (!spans.some(s => Math.abs(s.tA[0] - t0) < 1e-10 && Math.abs(s.tA[1] - t1) < 1e-10)) {
        spans.push({ kind: 'overlap', start: ca.start, end: ca.end, tA: [t0, t1], tB: [u0, u1] });
      }
    }
  }
  return spans;
}

function straightSections(curve) {
  const points = curve.controlPoints;
  const farthest = points.reduce((best, p) => curve.start.distanceTo(p) > curve.start.distanceTo(best) ? p : best, curve.start);
  const direction = curve.start.vectorTo(farthest), length = direction.length;
  if (length === 0) return [{ line: new Line(curve.start, curve.end), start: 0, end: 1 }];
  const scale = Math.max(1, ...points.flatMap(p => [Math.abs(p.x), Math.abs(p.y)]));
  if (points.some(p => Math.abs(cross(direction.x / length, direction.y / length,
    p.x - curve.start.x, p.y - curve.start.y)) > 64 * Number.EPSILON * scale)) return null;
  const values = power(points.map(p => ((p.x - curve.start.x) * direction.x + (p.y - curve.start.y) * direction.y) / length));
  const stops = [0, ...roots(derivative(values)).filter(t => t > 0 && t < 1), 1];
  return stops.slice(1).map((end, i) => ({ line: new Line(curve.pointAt(stops[i]), curve.pointAt(end)), start: stops[i], end }));
}

function straightCurveIntersections(curve, other, sections, tolerance) {
  return sections.flatMap(section => {
    function originalParameter(fraction) {
      if (fraction === 0) return section.start;
      if (fraction === 1) return section.end;
      const direction = section.line.start.vectorTo(section.line.end), squared = direction.length ** 2;
      if (squared === 0) return section.start;
      let low = section.start, high = section.end;
      for (let i = 0; i < 60; i++) {
        const mid = (low + high) / 2, p = curve.pointAt(mid);
        const value = ((p.x - section.line.start.x) * direction.x + (p.y - section.line.start.y) * direction.y) / squared;
        if (value < fraction) low = mid; else high = mid;
      }
      return (low + high) / 2;
    }
    return lineCurve(section.line, other, tolerance).map(result => ({ ...result,
      tA: result.kind === 'overlap' ? result.tA.map(originalParameter) : originalParameter(result.tA) }));
  });
}

function curveCurve(a, b, tolerance, maxNodes) {
  const equal = (x, y) => x.every((p, i) => p.equals(y[i]));
  if (equal(a.controlPoints, b.controlPoints) || equal(a.controlPoints, [...b.controlPoints].reverse())) {
    const reversed = !equal(a.controlPoints, b.controlPoints);
    if (a.controlPoints.every(p => p.equals(a.start))) return [hit(a, b, 0, 0)];
    return [{ kind: 'overlap', start: a.start, end: a.end, tA: [0, 1], tB: reversed ? [1, 0] : [0, 1] }];
  }
  const spans = coincidentSpans(a, b);
  if (spans.length) return spans;
  const straightA = straightSections(a), straightB = straightSections(b);
  if (straightA) return straightCurveIntersections(a, b, straightA, tolerance);
  if (straightB) return swap(straightCurveIntersections(b, a, straightB, tolerance));
  // Bounding-hull subdivision retains tangencies which chord intersection can miss.
  const candidates = [];
  let visited = 0;
  function visit(ca, cb, a0, a1, b0, b1, depth) {
    if (++visited > maxNodes || depth > 80) throw new RangeError('Intersection subdivision did not converge (possibly overlapping curves)');
    const ba = bounds(ca), bb = bounds(cb);
    if (ba.maxX < bb.minX || bb.maxX < ba.minX || ba.maxY < bb.minY || bb.maxY < ba.minY) return;
    const sa = size(ba), sb = size(bb);
    if (Math.max(sa, sb) <= tolerance / 2) { candidates.push({ a0, a1, b0, b1 }); return; }
    if (sa >= sb) {
      const [left, right] = ca.split(), mid = (a0 + a1) / 2;
      visit(left, cb, a0, mid, b0, b1, depth + 1); visit(right, cb, mid, a1, b0, b1, depth + 1);
    } else {
      const [left, right] = cb.split(), mid = (b0 + b1) / 2;
      visit(ca, left, a0, a1, b0, mid, depth + 1); visit(ca, right, a0, a1, mid, b1, depth + 1);
    }
  }
  visit(a, b, 0, 1, 0, 1, 0);
  // Merge adjacent parameter boxes, not just positions (a curve can revisit a point).
  const groups = [];
  for (const candidate of candidates) {
    let merged = candidate;
    for (let i = 0; i < groups.length;) {
      const g = groups[i];
      if (merged.a0 <= g.a1 && g.a0 <= merged.a1 && merged.b0 <= g.b1 && g.b0 <= merged.b1) {
        merged = { a0: Math.min(merged.a0, g.a0), a1: Math.max(merged.a1, g.a1),
          b0: Math.min(merged.b0, g.b0), b1: Math.max(merged.b1, g.b1) };
        groups.splice(i, 1); i = 0;
      } else i++;
    }
    groups.push(merged);
  }
  return groups.map(g => {
    const t = (g.a0 + g.a1) / 2, u = (g.b0 + g.b1) / 2;
    if (a.pointAt(t).distanceTo(b.pointAt(u)) > tolerance) {
      throw new RangeError('Intersection cluster is unresolved; reduce tolerance (possibly overlapping curves)');
    }
    return hit(a, b, t, u);
  }).sort((first, second) => first.tA - second.tA || first.tB - second.tB);
}

/** Finite segment intersections. Parameters refer to the original segments, in [0,1]. */
export function intersectSegments(a, b, { tolerance = 0.001, maxNodes = 100000 } = {}) {
  if (![a, b].every(s => s instanceof Line || s instanceof CubicBezier)) throw new TypeError('Expected Line or CubicBezier segments');
  if (!Number.isFinite(tolerance) || tolerance <= 0) throw new RangeError('Intersection tolerance must be positive');
  if (!Number.isInteger(maxNodes) || maxNodes < 1) throw new RangeError('maxNodes must be a positive integer');
  if (a instanceof Line && b instanceof Line) return lineLine(a, b, tolerance);
  if (a instanceof Line) return lineCurve(a, b, tolerance);
  if (b instanceof Line) return swap(lineCurve(b, a, tolerance));
  return curveCurve(a, b, tolerance, maxNodes);
}

/** Results retain segment indexes; shared vertices can appear once per segment pair. */
export function intersectPaths(a, b, options = {}) {
  if (!(a instanceof Path) || !(b instanceof Path)) throw new TypeError('Expected Paths');
  return a.segments.flatMap((first, segmentA) => b.segments.flatMap((second, segmentB) =>
    intersectSegments(first, second, options).map(result => ({ ...result, segmentA, segmentB }))));
}
