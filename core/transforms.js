import { Point, Vector, Line, CubicBezier, Path } from './geometry.js';

/** Affine matrix: x' = ax + cy + e, y' = bx + dy + f. Angles are radians. */
export class Transform {
  constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
    if (![a, b, c, d, e, f].every(Number.isFinite)) throw new TypeError('Transform coefficients must be finite');
    Object.assign(this, { a, b, c, d, e, f });
    Object.freeze(this);
  }

  static translation(x, y) { return new Transform(1, 0, 0, 1, x, y); }

  static rotation(angle, center = new Point(0, 0)) {
    if (!Number.isFinite(angle)) throw new TypeError('Angle must be finite');
    return around(new Transform(Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle)), center);
  }

  static scaling(x, y = x, center = new Point(0, 0)) {
    return around(new Transform(x, 0, 0, y), center);
  }

  static reflection(axis) {
    if (!(axis instanceof Line) || axis.length() === 0) throw new TypeError('Reflection needs a nonzero Line axis');
    const { x, y } = axis.start.vectorTo(axis.end).normalized();
    return around(new Transform(2 * x * x - 1, 2 * x * y, 2 * x * y, 2 * y * y - 1), axis.start);
  }

  /** Apply this transform first, then next. */
  then(next) {
    if (!(next instanceof Transform)) throw new TypeError('Expected a Transform');
    const { a, b, c, d, e, f } = this;
    return new Transform(next.a * a + next.c * b, next.b * a + next.d * b,
      next.a * c + next.c * d, next.b * c + next.d * d,
      next.a * e + next.c * f + next.e, next.b * e + next.d * f + next.f);
  }

  inverse() {
    const { a, b, c, d, e, f } = this;
    const det = a * d - b * c;
    if (!Number.isFinite(det) || det === 0) throw new RangeError('Transform is not invertible');
    return new Transform(d / det, -b / det, -c / det, a / det,
      (c * f - d * e) / det, (b * e - a * f) / det);
  }

  apply(value) {
    const { a, b, c, d, e, f } = this;
    if (value instanceof Point) return new Point(a * value.x + c * value.y + e, b * value.x + d * value.y + f);
    if (value instanceof Vector) return new Vector(a * value.x + c * value.y, b * value.x + d * value.y);
    if (value instanceof Line) return new Line(this.apply(value.start), this.apply(value.end));
    if (value instanceof CubicBezier) return new CubicBezier(...value.controlPoints.map(p => this.apply(p)));
    if (value instanceof Path) return new Path(value.segments.map(segment => this.apply(segment)), { closed: value.closed });
    throw new TypeError('Expected Point, Vector, Line, CubicBezier, or Path');
  }
}

function around(transform, center) {
  if (!(center instanceof Point)) throw new TypeError('Center must be a Point');
  return Transform.translation(-center.x, -center.y).then(transform).then(Transform.translation(center.x, center.y));
}

export const rotatePath = (path, angle, center) => applyPath(path, Transform.rotation(angle, center));
export const scalePath = (path, x, y = x, center) => applyPath(path, Transform.scaling(x, y, center));
export const mirrorPath = (path, axis) => applyPath(path, Transform.reflection(axis));
export function transformPath(path, transform) { return applyPath(path, transform); }

function applyPath(path, transform) {
  if (!(path instanceof Path) || !(transform instanceof Transform)) throw new TypeError('Expected a Path and Transform');
  return transform.apply(path);
}
