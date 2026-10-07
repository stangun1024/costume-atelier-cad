import { Line, Path } from '../core/geometry.js';
import { flattenPath } from '../core/path-tools.js';
import { offsetPath } from '../core/offsets.js';

/** Preserve edge ownership while flattening curves, including zero-width fold edges. */
export function offsetEdges(edges, widths, { closed = false, side = 'outward' } = {}) {
  const segments = [], segmentDistances = [];
  for (const edge of edges) {
    const width = widths[edge.id];
    if (!Number.isFinite(width) || width < 0 || width > 30) throw new RangeError(`辺 ${edge.id} の縫い代幅を0〜30mmで指定してください`);
    const points = flattenPath(edge.path, 0.05);
    for (let i = 1; i < points.length; i++) if (points[i - 1].distanceTo(points[i]) > 1e-7) {
      segments.push(new Line(points[i - 1], points[i])); segmentDistances.push(width);
    }
  }
  const path = new Path(segments, { closed });
  const maximum = Math.max(...segmentDistances);
  return maximum ? offsetPath(path, maximum, { side, segmentDistances }) : path;
}
