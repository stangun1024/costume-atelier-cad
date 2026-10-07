import { Line, Path } from '../core/geometry.js';
import { Transform } from '../core/transforms.js';
import { flattenPath } from '../core/path-tools.js';
import { offsetPath } from '../core/offsets.js';
import { intersectSegments } from '../core/intersections.js';
import { offsetEdges } from './allowance-path.js';

const EPS = 1e-7;
const cross = (u, v) => u.x * v.y - u.y * v.x;
const dot = (u, v) => u.x * v.x + u.y * v.y;
const area = points => points.reduce((sum, p, i) => {
  const q = points[(i + 1) % points.length];
  return sum + p.x * q.y - q.x * p.y;
}, 0);
const fail = message => { throw new RangeError(`ダーツ縫い代：${message}`); };

function rayHits(points, origin, direction) {
  const hits = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], v = a.vectorTo(points[i + 1]), den = cross(direction, v);
    if (Math.abs(den) < EPS) continue;
    const delta = origin.vectorTo(a), distance = cross(delta, v) / den, t = cross(delta, direction) / den;
    if (distance > 0 && t >= -EPS && t <= 1 + EPS) {
      const position = i + Math.max(0, Math.min(1, t));
      if (!hits.some(h => Math.abs(h.position - position) < EPS))
        hits.push({ position, point: a.lerp(points[i + 1], Math.max(0, Math.min(1, t))) });
    }
  }
  return hits;
}

function slice(points, from, to) {
  return [from.point, ...points.filter((_, i) => i > from.position + EPS && i < to.position - EPS), to.point];
}

/** A single, straight, equal-legged boundary dart. The excess folds toward legB.
 * Close only the local joining frame; never rotate or edit the stored sewing geometry.
 * Reflect the CLOSED cutting contour into both halves of the dart excess, then unfold.
 */
export function dartAllowance(piece, width, widths = null) {
  if (piece.darts.length !== 1) fail('現在は1パーツに1本のダーツに対応しています');
  const dart = piece.darts[0], ai = piece.edges.findIndex(e => e.id === dart.legA);
  const bi = piece.edges.findIndex(e => e.id === dart.legB), n = piece.edges.length;
  if (ai < 0 || bi !== (ai + 1) % n) fail('連続した2本の脚が必要です');
  const a = piece.edges[ai].path, b = piece.edges[bi].path, apex = dart.apex;
  if (a.segments.length !== 1 || b.segments.length !== 1 || !(a.segments[0] instanceof Line)
      || !(b.segments[0] instanceof Line) || a.end.distanceTo(apex) > EPS || b.start.distanceTo(apex) > EPS
      || Math.abs(a.length() - b.length()) > 0.001) fail('頂点で接続する等長の直線ダーツが必要です');
  const u = apex.vectorTo(a.start), v = apex.vectorTo(b.end);
  const angle = Math.atan2(cross(u, v), dot(u, v));
  const winding = Math.sign(area(flattenPath(piece.boundary)));
  if (angle * winding <= EPS || Math.abs(angle) >= Math.PI / 2) fail('内向きで90度未満のダーツが必要です');
  const close = Transform.rotation(angle, apex), reopen = close.inverse();
  const ordered = Array.from({ length: n - 2 }, (_, i) => piece.edges[(bi + 1 + i) % n]);
  if (widths) {
    const before = widths[ordered.at(-1).id], after = widths[ordered[0].id];
    if (before !== after || before <= 0) fail('ダーツ口の両隣は同じ正の縫い代幅にしてください');
    if (widths[dart.legA] !== before || widths[dart.legB] !== before) fail('ダーツ脚の幅は口の両隣と揃えてください。脚だけの幅変更はできません');
    width = before;
  }
  const chain = new Path(ordered.flatMap(e => e.path.segments));
  const side = winding > 0 ? 'right' : 'left';
  const offset = widths ? offsetEdges(ordered, widths, { side }) : offsetPath(chain, width, { side, join: 'miter' });
  const points = [offset.start, ...offset.segments.map(s => s.end)];
  const incoming = points.map(p => close.apply(p)), outgoing = [...points];
  const pa = incoming.at(-1), pb = outgoing[0];
  const du = incoming.at(-2).vectorTo(pa).normalized(), dv = pb.vectorTo(outgoing[1]).normalized();
  const den = cross(du, dv);
  let join;
  if (Math.abs(den) < EPS) {
    if (dot(du, dv) <= 0 || pa.distanceTo(pb) > 0.001) fail('閉鎖時の外周が接続しません');
    join = pa.lerp(pb, 0.5);
  } else join = pa.translate(du.scale(cross(pa.vectorTo(pb), dv) / den));
  if (join.distanceTo(b.end) > width * 4) fail('閉鎖時の外周の角が長すぎます');
  const joined = [...incoming.slice(0, -1), join, ...outgoing.slice(1)];
  const joinIndex = incoming.length - 1;
  const seamHits = rayHits(joined, apex, v.normalized()).sort((x, y) => Math.abs(x.position - joinIndex) - Math.abs(y.position - joinIndex));
  const seam = seamHits[0];
  if (!seam || seam.point.distanceTo(b.end) > width * 4 || apex.distanceTo(seam.point) <= v.length)
    fail('閉じた脚の延長と裁断線の交点が求まりません');
  const foldDirection = Transform.rotation(angle / 2).apply(v.normalized());
  const fold = rayHits(joined, apex, foldDirection).find(h => h.position > seam.position + EPS);
  if (!fold || fold.position >= joined.length - 1) fail('倒す側の裁断線とダーツ折山が交差しません');
  const reflected = Transform.reflection(new Line(apex, b.end));
  const middle = Transform.reflection(new Line(apex, Transform.rotation(-angle / 2, apex).apply(b.end)));
  const half = slice(joined, seam, fold).map(p => reflected.apply(p));
  const cap = [...half.map(p => middle.apply(p)), ...half.slice(0, -1).reverse()];
  if (cap.some(p => {
    const ray = apex.vectorTo(p);
    return cross(u, ray) * winding < -EPS || cross(ray, v) * winding < -EPS || ray.length <= EPS;
  })) fail('折り返した裁断線がダーツ口の範囲を外れます');
  // Keep the original open-chain interior exactly; only trim/extend its two ends.
  const startStop = Math.max(1, Math.ceil(seam.position - joinIndex));
  const endStop = Math.min(joinIndex - 1, Math.floor(seam.position));
  if (startStop > endStop) fail('ダーツの処理範囲が外周全体に及びます');
  const startPart = slice(joined, seam, { position: joinIndex + startStop, point: points[startStop] });
  const endPart = slice(joined, { position: endStop, point: incoming[endStop] }, seam).map(p => reopen.apply(p));
  const body = [...startPart, ...points.slice(startStop + 1, endStop), ...endPart];
  const all = [...body, ...cap];
  const clean = all.filter((p, i) => !i || p.distanceTo(all[i - 1]) > EPS);
  if (clean[0].distanceTo(clean.at(-1)) <= EPS) clean.pop();
  const segments = clean.map((p, i) => new Line(p, clean[(i + 1) % clean.length]));
  for (let i = 0; i < segments.length; i++) for (let j = i + 1; j < segments.length; j++) {
    const adjacent = j === i + 1 || i === 0 && j === segments.length - 1;
    if (intersectSegments(segments[i], segments[j], { tolerance: EPS }).some(h => h.kind === 'overlap' || !adjacent))
      fail('開いた裁断線に自己交差があります');
  }
  if (Math.sign(area(clean)) !== winding) fail('裁断線の向きが反転しました');
  return new Path(segments, { closed: true });
}
