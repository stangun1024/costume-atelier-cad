import { Point, Line, CubicBezier, Path } from '../core/geometry.js';

const coordinate = { type: 'number', minimum: -10000, maximum: 10000 };
const point = { type: 'object', required: ['x', 'y'], additionalProperties: false, properties: { x: coordinate, y: coordinate } };
export const pathSegmentsSchema = { type: 'array', minItems: 1, maxItems: 64, items: {
  type: 'object', required: ['type', 'end'], additionalProperties: false,
  properties: { type: { enum: ['line', 'cubic'] }, end: point, control1: point, control2: point },
} };

// The same local-mm path representation serves guides and boundary-to-boundary cuts.
export function internalPath(start, end, segments, closed = false) {
  const at = value => {
    if (!value || Object.keys(value).some(k => !['x', 'y'].includes(k))
      || ![value.x, value.y].every(n => Number.isFinite(n) && Math.abs(n) <= 10000)) throw new RangeError('線の座標は有限の局所座標mmで指定してください');
    return new Point(value.x, value.y);
  };
  const first = at(start), last = at(end);
  if (typeof closed !== 'boolean') throw new TypeError('closedは真偽値です');
  const specs = segments === undefined ? [{ type: 'line', end }] : segments;
  if (!Array.isArray(specs) || !specs.length || specs.length > 64) throw new RangeError('segmentsは1〜64区間です');
  let cursor = first;
  const parts = specs.map((segment, index) => {
    if (!segment || !['line', 'cubic'].includes(segment.type)
      || Object.keys(segment).some(k => !['type', 'end', ...(segment.type === 'cubic' ? ['control1', 'control2'] : [])].includes(k))) throw new TypeError('線分はtype/end、曲線はtype/end/control1/control2を指定してください');
    const supplied = at(segment.end);
    const next = index === specs.length - 1 && supplied.distanceTo(last) < 1e-6 ? last : supplied;
    const part = segment.type === 'line' ? new Line(cursor, next) : new CubicBezier(cursor, at(segment.control1), at(segment.control2), next);
    if (new Path([part]).length() < 0.001) throw new RangeError('長さゼロの区間は使えません');
    cursor = next;
    return part;
  });
  if (!cursor.equals(last)) throw new RangeError('segmentsの最後のendを線全体のendに合わせてください');
  if (closed && !cursor.equals(first)) throw new RangeError('閉じた線は最後のendをstartに合わせてください。自動で閉じる直線は追加しません');
  return new Path(parts, { closed });
}
