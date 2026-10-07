import { Point, Line, Path } from '../core/geometry.js';
import { flattenPath, distanceToSegment } from '../core/path-tools.js';
import { intersectPaths, intersectSegments } from '../core/intersections.js';
import { offsetPath } from '../core/offsets.js';

export const openings = piece => piece.attachmentLines.filter(l => l.role === 'opening');
export function regionContains(path, point, tolerance = 1e-7) {
  const points = flattenPath(path, 0.01); let inside = false;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if (distanceToSegment(point, a, b) <= tolerance) return true;
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
export const openingCutPath = line => line.allowanceMm ? offsetPath(line.path, line.allowanceMm, { side: 'inward' }) : line.path;
export function buttonholeOutline(line) {
  if (line.path.closed || line.path.segments.length !== 1 || !(line.path.segments[0] instanceof Line)
      || !Number.isFinite(line.widthMm) || line.widthMm <= 0 || line.widthMm >= line.path.length())
    throw new RangeError('ボタン穴は幅より長い直線で指定してください');
  const a=line.path.start,b=line.path.end,d=a.vectorTo(b).normalized(),w=line.widthMm/2;
  const pts=[new Point(a.x-d.y*w,a.y+d.x*w),new Point(b.x-d.y*w,b.y+d.x*w),new Point(b.x+d.y*w,b.y-d.x*w),new Point(a.x+d.y*w,a.y-d.x*w)];
  return new Path(pts.map((p,i)=>new Line(p,pts[(i+1)%4])),{closed:true});
}
export function regionArea(path) {
  const pts = flattenPath(path, 0.05);
  return Math.abs(pts.slice(1).reduce((a, p, i) => a + pts[i].x * p.y - p.x * pts[i].y, 0) / 2);
}
export function validateRegion(piece, line) {
  if (!line.path.closed) throw new RangeError('開口・芯・領域は閉じた線で指定してください');
  const pts = flattenPath(line.path, 0.01), segments = pts.slice(1).map((p, i) => new Line(pts[i], p));
  if (regionArea(line.path) < 0.01) throw new RangeError('領域の面積が小さすぎます');
  for (let i = 0; i < segments.length; i++) for (let j = i + 1; j < segments.length; j++) {
    const adjacent = j === i + 1 || i === 0 && j === segments.length - 1;
    if (intersectSegments(segments[i], segments[j]).some(h => h.kind === 'overlap' || !adjacent)) throw new RangeError('領域の輪郭が自己交差しています');
  }
  if (pts.some(p => !regionContains(piece.boundary, p)) || line.role === 'opening' && intersectPaths(line.path, piece.boundary).length)
    throw new RangeError('内部開口は外周から離し、領域全体を布の中へ置いてください');
  for (const other of openings(piece).filter(o => o.id !== line.id)) {
    if (intersectPaths(line.path, other.path).length || pts.some(p => regionContains(other.path, p))
        || regionContains(line.path, other.path.start)) throw new RangeError('領域が内部開口と交差・重複しています');
  }
  if (line.role === 'opening') {
    if (line.instanceId !== undefined) throw new RangeError('内部開口は型紙全体に適用します。片側だけなら型紙を分けてください');
    const cut = openingCutPath(line);
    if (flattenPath(cut, 0.01).some(p => !regionContains(line.path, p))) throw new RangeError('開口の縫い代が開口内に収まりません');
  }
}
/** Keep the longest remaining portion of the original grain direction after cutting a hole. */
export function materialGrainline(piece) {
  const line = piece.grainline.segments[0], direction = line.start.vectorTo(line.end), length = direction.length;
  const ts = [0, 1];
  for (const hole of openings(piece)) for (const hit of intersectPaths(piece.grainline, hole.path)) if (hit.point) {
    const v = line.start.vectorTo(hit.point); ts.push(Math.max(0, Math.min(1, (v.x * direction.x + v.y * direction.y) / length ** 2)));
  }
  ts.sort((a, b) => a - b);
  const intervals = ts.slice(1).map((end, i) => ({ start: ts[i], end }))
    .filter(r => (r.end - r.start) * length > 2 && !openings(piece).some(h => regionContains(h.path, line.pointAt((r.start + r.end) / 2))))
    .sort((a, b) => b.end - b.start - (a.end - a.start));
  if (!intervals.length) throw new RangeError('開口後に地の目線を置く長さがありません。開口位置または地の目線を見直してください');
  const r = intervals[0];
  return new Path([new Line(line.pointAt(r.start === 0 ? 0 : r.start + 0.5 / length), line.pointAt(r.end === 1 ? 1 : r.end - 0.5 / length))]);
}
