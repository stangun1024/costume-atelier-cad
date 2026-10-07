/** All coordinates and distances are millimetres; +x is right, +y is down. */
function finite(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
  return value;
}

function point(value, name = 'point') {
  if (!(value instanceof Point)) throw new TypeError(`${name} must be a Point`);
  return value;
}

function parameter(t) {
  finite(t, 't');
  if (t < 0 || t > 1) throw new RangeError('t must be between 0 and 1');
}

export class Vector {
  constructor(x, y) {
    this.x = finite(x, 'x');
    this.y = finite(y, 'y');
    Object.freeze(this);
  }

  get length() { return finite(Math.hypot(this.x, this.y), 'vector length'); }

  scale(factor) {
    finite(factor, 'factor');
    return new Vector(this.x * factor, this.y * factor);
  }

  normalized() {
    const length = this.length;
    if (length === 0) throw new RangeError('Cannot normalize a zero vector');
    return new Vector(this.x / length, this.y / length);
  }
}

export class Point {
  constructor(x, y) {
    this.x = finite(x, 'x');
    this.y = finite(y, 'y');
    Object.freeze(this);
  }

  vectorTo(other) {
    point(other);
    return new Vector(other.x - this.x, other.y - this.y);
  }

  distanceTo(other) { return this.vectorTo(other).length; }

  translate(vector) {
    if (!(vector instanceof Vector)) throw new TypeError('Expected a Vector');
    return new Point(this.x + vector.x, this.y + vector.y);
  }

  equals(other) {
    return other instanceof Point && this.x === other.x && this.y === other.y;
  }

  lerp(other, t) {
    point(other);
    parameter(t);
    if (t === 0) return this;
    if (t === 1) return other;
    return new Point((1 - t) * this.x + t * other.x, (1 - t) * this.y + t * other.y);
  }
}

export class Line {
  constructor(start, end) {
    this.start = point(start, 'start');
    this.end = point(end, 'end');
    Object.freeze(this);
  }

  pointAt(t) { return this.start.lerp(this.end, t); }
  length() { return this.start.distanceTo(this.end); }
  get controlPoints() { return [this.start, this.end]; }
}

/** Cubic Bezier evaluated and split using de Casteljau's algorithm. */
export class CubicBezier {
  constructor(start, control1, control2, end) {
    this.start = point(start, 'start');
    this.control1 = point(control1, 'control1');
    this.control2 = point(control2, 'control2');
    this.end = point(end, 'end');
    Object.freeze(this);
  }

  get controlPoints() { return [this.start, this.control1, this.control2, this.end]; }

  split(t = 0.5) {
    parameter(t);
    const a = this.start.lerp(this.control1, t);
    const b = this.control1.lerp(this.control2, t);
    const c = this.control2.lerp(this.end, t);
    const d = a.lerp(b, t);
    const e = b.lerp(c, t);
    const midpoint = d.lerp(e, t);
    return [
      new CubicBezier(this.start, a, d, midpoint),
      new CubicBezier(midpoint, e, c, this.end),
    ];
  }

  pointAt(t) { return this.split(t)[0].end; }

  /**
   * Absolute error budget in mm (apart from floating-point rounding).
   * Chord and control polygon bound the true arc length. Subdivision divides
   * the budget between children, so error does not accumulate per segment.
   */
  length(tolerance = 0.001) {
    positiveTolerance(tolerance);
    let subdivisions = 0;
    const measure = (curve, budget, depth) => {
      const p = curve.controlPoints;
      const lower = p[0].distanceTo(p[3]);
      const upper = finite(p[0].distanceTo(p[1]) + p[1].distanceTo(p[2])
        + p[2].distanceTo(p[3]), 'control polygon length');
      if ((upper - lower) / 2 <= budget) return lower + (upper - lower) / 2;
      if (depth >= 24 || ++subdivisions > 100000) {
        throw new RangeError('Curve length did not converge; increase tolerance');
      }
      const [left, right] = curve.split();
      return finite(measure(left, budget / 2, depth + 1)
        + measure(right, budget / 2, depth + 1), 'curve length');
    };
    return measure(this, tolerance, 0);
  }
}

function positiveTolerance(tolerance) {
  finite(tolerance, 'tolerance');
  if (tolerance <= 0) throw new RangeError('tolerance must be positive');
}

/** A nonempty, continuous path. Joining endpoints must match exactly. */
export class Path {
  constructor(segments, { closed = false } = {}) {
    if (!Array.isArray(segments) || segments.length === 0) {
      throw new TypeError('A path needs at least one segment');
    }
    if (typeof closed !== 'boolean') throw new TypeError('closed must be a boolean');
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (!(segment instanceof Line || segment instanceof CubicBezier)) {
        throw new TypeError('Path segments must be Line or CubicBezier instances');
      }
      if (i > 0 && !segments[i - 1].end.equals(segment.start)) {
        throw new RangeError(`Disconnected path at segment ${i}`);
      }
    }
    if (closed && !segments.at(-1).end.equals(segments[0].start)) {
      throw new RangeError('Closed path must end at its start; use path.close()');
    }
    this.segments = Object.freeze([...segments]);
    this.closed = closed;
    Object.freeze(this);
  }

  get start() { return this.segments[0].start; }
  get end() { return this.segments.at(-1).end; }

  /** Adds an explicit closing line so measurement and SVG use the same edges. */
  close() {
    if (this.closed) return this;
    const segments = this.end.equals(this.start)
      ? this.segments : [...this.segments, new Line(this.end, this.start)];
    return new Path(segments, { closed: true });
  }

  length(tolerance = 0.001) {
    positiveTolerance(tolerance);
    const count = this.segments.filter(segment => segment instanceof CubicBezier).length;
    return finite(this.segments.reduce((sum, segment) => sum + (
      segment instanceof CubicBezier ? segment.length(tolerance / count) : segment.length()
    ), 0), 'path length');
  }

  /** Conservative bounds using the Bezier control hull; never clips a curve. */
  bounds() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const segment of this.segments) {
      for (const p of segment.controlPoints) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
    }
    return { minX, minY, maxX, maxY };
  }
}
