import { Line, Path } from '../core/geometry.js';
import { locateAtLength, reversePath, flattenPath, distanceToSegment } from '../core/path-tools.js';
import { effectiveEdgeLength, relationRefs } from './sewing.js';
import { intersectPaths } from '../core/intersections.js';
import { validateFabricScope } from './fabric-instances.js';
import { openings, regionContains } from './material-regions.js';

export const sewingLines = piece => [...piece.edges, ...(piece.attachmentLines ?? [])];
export const sewingLine = (piece, ref) => sewingLines(piece).find(line => line.id === ref || line.entityId === ref);
export function segmentGeometry(pattern, participant, segment) {
  const ownerRef = segment.pieceRef ?? participant.pieceRef;
  const piece = pattern.pieces.find(p => p.id === ownerRef || p.entityId === ownerRef);
  const line = piece && sewingLine(piece, segment.lineRef);
  if (!line) throw Object.assign(new RangeError('参加線が見つかりません'), { code: 'orphan-relation' });
  if (line.instanceId !== undefined && line.instanceId !== participant.instanceId || line.face !== undefined && line.face !== participant.face)
    throw Object.assign(new RangeError('内部取付線に指定された個体・表裏と縫合参加者が一致しません'), { code: 'line-scope-mismatch' });
  if (piece.attachmentLines.includes(line) && (line.role !== 'attachment' || line.path.closed))
    throw Object.assign(new RangeError('縫合には開いた取付線を指定してください。裁断ガイド・折り線・参考線は縫合できません'), { code: 'invalid-sewing-purpose' });
  const total = line.path.length(0.0001), range = segment.range;
  const start = range?.mode === 'whole' ? 0 : range?.startMm;
  const end = range?.mode === 'whole' ? total : range?.endMm;
  if (!['whole', 'interval'].includes(range?.mode) || !Number.isFinite(start) || !Number.isFinite(end)
      || start < 0 || end > total + 0.001 || end - start <= 1e-7)
    throw Object.assign(new RangeError('縫合区間は線の始点からの距離で、0 ≤ 開始 < 終了 ≤ 全長を指定してください'), { code: 'invalid-sewing-range' });
  const pleats = piece.features.find(f => f.type === 'pleats' && Object.hasOwn(f.sewnLengths, line.id));
  if (pleats && range.mode !== 'whole') throw Object.assign(new RangeError('プリーツの部分区間は有効長の対応が未定義です。線全体を指定してください'), { code: 'unsupported-pleat-range' });
  const a = locateAtLength(line.path, start), b = locateAtLength(line.path, Math.min(end, total));
  const parts = line.path.segments.slice(a.segmentIndex, b.segmentIndex + 1).map((s, i, list) => {
    const first = i === 0, last = i === list.length - 1;
    const lo = first ? a.t : 0, hi = last ? b.t : 1;
    if (s instanceof Line) return hi > lo ? new Line(s.pointAt(lo), s.pointAt(hi)) : null;
    if (hi <= lo) return null;
    const prefix = hi < 1 ? s.split(hi)[0] : s;
    return lo > 0 ? prefix.split(lo / hi)[1] : prefix;
  }).filter(Boolean);
  const path = new Path(parts);
  return { piece, line, start, end: Math.min(end, total), length: pleats ? effectiveEdgeLength(piece, line) : end - start,
    path: segment.direction === 'reverse' ? reversePath(path) : path };
}

export function participantGeometry(pattern, participant) {
  const segments = participant.segments.map(s => segmentGeometry(pattern, participant, s));
  return { segments, length: segments.reduce((sum, s) => sum + s.length, 0) };
}

export function pointInsidePiece(piece, point, tolerance = 0.05, ignorePath = null) {
  if (openings(piece).some(h => h.path !== ignorePath && regionContains(h.path, point))) return false;
  const polygon = flattenPath(piece.boundary, tolerance);
  let inside = false;
  for (let i = 1; i < polygon.length; i++) {
    const a = polygon[i - 1], b = polygon[i];
    if (distanceToSegment(point, a, b) <= tolerance) return true;
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

export function attachmentWithinPiece(piece, path) {
  if (path.length() <= 1e-7) return false;
  const hits = intersectPaths(path, piece.boundary, { tolerance: 0.0001 });
  return !hits.some(h => h.kind !== 'point' || h.point.distanceTo(path.start) > 0.001 && h.point.distanceTo(path.end) > 0.001)
    && !openings(piece).filter(h => h.path !== path).some(h => intersectPaths(path, h.path).length)
    && flattenPath(path, 0.01).every(p => pointInsidePiece(piece, p, 0.05, path));
}

/** Same routine is used by the operation handler and final pattern validation. */
export function inspectAssemblySeam(pattern, relation, tolerance = 0.05, checkLengths = true) {
  const errors = [], measurements = [], participants = relation.participants ?? [];
  const error = (code, message, detail = {}) => errors.push({ code, message, seamId: relation.id, ...detail });
  const ids = participants.map(p => p.id);
  if (ids.length < 2 || ids.length > 16 || new Set(ids).size !== ids.length || !ids.includes(relation.referenceParticipantId)) {
    error('invalid-participants', '縫合には2〜16個の一意の参加者と基準参加者が必要です'); return { errors };
  }
  for (const p of participants) {
    try {
      if (!p.segments?.length || p.segments.some(s => !['forward', 'reverse'].includes(s.direction))) throw new RangeError('参加線と方向が必要です');
      const g = participantGeometry(pattern, p);
      validateFabricScope(g.segments[0].piece, p.instanceId, p.face);
      for (const s of g.segments) {
        const owner = pattern.pieces.find(piece => piece.id === p.pieceRef || piece.entityId === p.pieceRef);
        if (s.piece !== owner) throw new RangeError('参加線と布の所有者が一致しません');
        if (s.line.role === 'fold' || s.piece.darts.some(d => [d.legA, d.legB].includes(s.line.id))
            || s.piece.features.some(f => f.type !== 'pleats' && (f.id === s.line.id || f.edges?.includes(s.line.id))))
          throw new RangeError('わ・ダーツ・展開口は通常の縫合線にできません');
      }
      for (let i = 1; i < g.segments.length; i++) if (g.segments[i - 1].path.end.distanceTo(g.segments[i].path.start) > tolerance)
        throw Object.assign(new RangeError('参加線の区間が連続していません'), { code: 'discontinuous-sewing-line' });
      const fit = p.fit;
      if (!['plain', 'ease', 'gather', 'stretch'].includes(fit?.mode)) throw new RangeError('縫製モードを指定してください');
      if (p.id === relation.referenceParticipantId && fit.mode !== 'plain') throw new RangeError('基準参加者は通常縫合にしてください');
      if (fit.mode !== 'plain' && (!Number.isFinite(fit.amountMm) || fit.amountMm <= 0)) throw new RangeError('いせ・ギャザー・伸長量は正のmm値が必要です');
      if (fit.mode === 'plain' && fit.amountMm !== undefined) throw new RangeError('通常縫合にはいせ量を指定できません');
      if (fit.mode === 'plain' && fit.intervalAmountsMm !== undefined) throw new RangeError('通常縫合には区間加工量を指定できません');
      if (p.segments.some(s => s.range.mode === 'whole' && (s.range.startMm !== undefined || s.range.endMm !== undefined))) throw new RangeError('線全体には開始・終了距離を指定しないでください');
      measurements.push({ participant: p, ...g });
    } catch (e) { error(e.code ?? 'invalid-seam-participant', e.message, { participantId: p.id }); }
  }
  if (errors.length) return { errors };
  const baseline = measurements.find(m => m.participant.id === relation.referenceParticipantId);
  const points = relation.matchPoints ?? [];
  const checkpoints = [Object.fromEntries(measurements.map(m => [m.participant.id, 0]))];
  for (const point of points) {
    if (!point.id || !point.positionsMm || Object.keys(point.positionsMm).length !== ids.length
        || measurements.some(m => !Number.isFinite(point.positionsMm[m.participant.id]))) {
      error('invalid-match-point', '対応点には各参加線の縫合方向の始点からの距離が必要です'); continue;
    }
    checkpoints.push(point.positionsMm);
  }
  checkpoints.push(Object.fromEntries(measurements.map(m => [m.participant.id, m.length])));
  if (new Set(points.map(p => p.id)).size !== points.length) error('duplicate-match-point', '対応点IDが重複しています');
  for (const m of measurements) for (let i = 1; i < checkpoints.length; i++) {
    const from = checkpoints[i - 1][m.participant.id], to = checkpoints[i][m.participant.id];
    if (!(to > from) || to > m.length + tolerance) error('invalid-match-point-order', '対応点は縫合方向に順番に、線の範囲内で指定してください', { participantId: m.participant.id });
  }
  const reports = [];
  if (!errors.length && checkLengths) for (const m of measurements.filter(m => m !== baseline)) {
    const fit = m.participant.fit, sign = fit.mode === 'stretch' ? -1 : 1;
    if (fit.mode !== 'plain' && points.length && (!fit.intervalAmountsMm || fit.intervalAmountsMm.length !== checkpoints.length - 1
        || fit.intervalAmountsMm.some(v => !Number.isFinite(v) || v < 0) || Math.abs(fit.intervalAmountsMm.reduce((a, b) => a + b, 0) - fit.amountMm) > tolerance)) {
      error('missing-fit-distribution', '対応点がある縫合は、区間ごとの加工量を明示して合計を総量に一致させてください', { participantId: m.participant.id }); continue;
    }
    for (let i = 1; i < checkpoints.length; i++) {
      const target = checkpoints[i][baseline.participant.id] - checkpoints[i - 1][baseline.participant.id];
      const actual = checkpoints[i][m.participant.id] - checkpoints[i - 1][m.participant.id];
      const amount = fit.mode === 'plain' ? 0 : (points.length ? fit.intervalAmountsMm[i - 1] : fit.amountMm) * sign;
      const passed = Math.abs(actual - target - amount) <= tolerance;
      const detail = { participantId: m.participant.id, intervalIndex: i - 1, measuredLengthMm: actual,
        targetLengthMm: target, differenceMm: actual - target, expectedDifferenceMm: amount, toleranceMm: tolerance };
      if (!passed) error('seam-mismatch', `${relation.note ?? relation.name ?? relation.id}：${m.participant.id}の区間${i}は${actual.toFixed(3)}mm、基準は${target.toFixed(3)}mmです。差${(actual - target).toFixed(3)}mmが指定${amount.toFixed(3)}mmに一致しません。区間か加工量を修正してください。`, detail);
      reports.push({ ...detail, passed });
    }
  }
  const own = [];
  for (const m of measurements) for (const s of m.segments) {
    const key = `${s.piece.id}.${s.line.id}`, instanceId = m.participant.instanceId;
    const same = x => x.key === key && (!x.instanceId || !instanceId || x.instanceId === instanceId);
    if (own.some(x => same(x) && Math.min(x.end, s.end) - Math.max(x.start, s.start) > 1e-7)) error('duplicate-sewing-interval', '同じ個体の区間が縫合内で重複しています');
    own.push({ key, instanceId, start: s.start, end: s.end });
    for (const other of pattern.relations.filter(r => r.id !== relation.id)) {
      const overlaps = other.participants && !other.legacy ? other.participants.flatMap(p => {
        try { return participantGeometry(pattern, p).segments.map(g => ({ key: `${g.piece.id}.${g.line.id}`, instanceId: p.instanceId, start: g.start, end: g.end })); } catch { return []; }
      }) : relationRefs(pattern, other).map(ref => ({ key: `${ref.piece}.${ref.edge}`, start: 0, end: Infinity }));
      if (overlaps.some(x => same(x) && Math.min(x.end, s.end) - Math.max(x.start, s.start) > 1e-7))
        error('duplicate-sewing-interval', 'この線の区間は別の縫合で使用されています。同時に縫う布は同じ縫合へ追加してください。');
    }
  }
  const second = measurements.find(m => m !== baseline);
  return { errors, intervals: reports, participants: measurements.map(m => ({ id: m.participant.id, lengthMm: m.length, mode: m.participant.fit.mode })),
    aLengthMm: baseline.length, bLengthMm: second.length, easeMm: baseline.length - second.length,
    allowedEaseMm: { min: -(second.participant.fit.mode === 'stretch' ? -1 : 1) * (second.participant.fit.amountMm ?? 0), max: -(second.participant.fit.mode === 'stretch' ? -1 : 1) * (second.participant.fit.amountMm ?? 0) },
    direction: baseline.participant.segments[0].direction === second.participant.segments[0].direction ? 'same' : 'opposite', directionKnown: true,
    passed: !errors.length && relation.status !== 'pending' };
}
