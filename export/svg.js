import { Line, Path } from '../core/geometry.js';

function number(value) {
  if (!Number.isFinite(value)) throw new RangeError('SVG values must be finite');
  return String(Object.is(value, -0) ? 0 : value);
}

function xml(value) {
  if (typeof value !== 'string') throw new TypeError('SVG text must be a string');
  if (/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/u.test(value)) {
    throw new TypeError('SVG text contains invalid XML characters');
  }
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[char]);
}

export { number as svgNumber, xml as escapeXml };

function coordinates(point) { return `${number(point.x)} ${number(point.y)}`; }

export function pathToSvgData(path) {
  if (!(path instanceof Path)) throw new TypeError('Expected a Path');
  const commands = [`M ${coordinates(path.start)}`];
  for (const segment of path.segments) {
    commands.push(segment instanceof Line
      ? `L ${coordinates(segment.end)}`
      : `C ${coordinates(segment.control1)} ${coordinates(segment.control2)} ${coordinates(segment.end)}`);
  }
  if (path.closed) commands.push('Z');
  return commands.join(' ');
}

/** One SVG user unit equals one mm. Padding is measured beyond the stroke. */
export function renderSvg(paths, {
  padding = 10,
  strokeWidth = 0.3,
  title = 'Parametric geometry',
} = {}) {
  if (!Array.isArray(paths) || paths.length === 0 || paths.some(path => !(path instanceof Path))) {
    throw new TypeError('Expected a nonempty array of Paths');
  }
  if (!Number.isFinite(padding) || padding < 0) throw new RangeError('padding must be nonnegative');
  if (!Number.isFinite(strokeWidth) || strokeWidth <= 0) throw new RangeError('strokeWidth must be positive');
  const bounds = paths.map(path => path.bounds());
  const margin = padding + strokeWidth / 2;
  const minX = Math.min(...bounds.map(box => box.minX)) - margin;
  const minY = Math.min(...bounds.map(box => box.minY)) - margin;
  const width = Math.max(...bounds.map(box => box.maxX)) + margin - minX;
  const height = Math.max(...bounds.map(box => box.maxY)) + margin - minY;
  if (width <= 0 || height <= 0) throw new RangeError('SVG viewport must have positive dimensions');
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${number(width)}mm" height="${number(height)}mm" viewBox="${number(minX)} ${number(minY)} ${number(width)} ${number(height)}">`,
    `  <title>${xml(title)}</title>`,
    `  <g fill="none" stroke="#172554" stroke-width="${number(strokeWidth)}" stroke-linejoin="round" stroke-linecap="round">`,
    ...paths.map((path, index) => `    <path id="path-${index + 1}" d="${pathToSvgData(path)}"/>`),
    '  </g>',
    '</svg>',
  ];
  return lines.join('\n') + '\n';
}
