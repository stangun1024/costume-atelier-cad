import { flattenPath, distanceToSegment, locateAtLength } from '../core/path-tools.js';
import { sewingRefs, sewingLength, sewingSides, participantRefs } from './sewing.js';
import { inspectAssemblySeam, attachmentWithinPiece } from './assembly-sewing.js';
import { inspectAssemblyRelations } from './operations-relations.js';
import { validateInstances, validateFabricScope } from './fabric-instances.js';
import { openings, regionArea, regionContains, validateRegion, buttonholeOutline } from './material-regions.js';

function intersects(a, b, c, d, tolerance = 1e-7) {
  if (Math.max(a.x, b.x) + tolerance < Math.min(c.x, d.x)
      || Math.max(c.x, d.x) + tolerance < Math.min(a.x, b.x)
      || Math.max(a.y, b.y) + tolerance < Math.min(c.y, d.y)
      || Math.max(c.y, d.y) + tolerance < Math.min(a.y, b.y)) return false;
  const side = (p, q, r) => {
    const cross = (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    return Math.abs(cross) <= tolerance * p.distanceTo(q) ? 0 : Math.sign(cross);
  };
  const ac = side(a, b, c), ad = side(a, b, d), ca = side(c, d, a), cb = side(c, d, b);
  if (ac * ad < 0 && ca * cb < 0) return true;
  return (ac === 0 && distanceToSegment(c, a, b) <= tolerance)
    || (ad === 0 && distanceToSegment(d, a, b) <= tolerance)
    || (ca === 0 && distanceToSegment(a, c, d) <= tolerance)
    || (cb === 0 && distanceToSegment(b, c, d) <= tolerance);
}

export function findSelfIntersections(path, tolerance = 0.05) {
  const points = flattenPath(path, tolerance);
  const count = points.length - 1;
  const found = [];
  for (let i = 0; i < count; i++) {
    for (let j = i + 2; j < count; j++) {
      if (path.closed && i === 0 && j === count - 1) continue;
      if (intersects(points[i], points[i + 1], points[j], points[j + 1])) found.push([i, j]);
    }
  }
  return found;
}

function signedArea(points) {
  return points.slice(1).reduce((sum, next, i) => sum + points[i].x * next.y - next.x * points[i].y, 0) / 2;
}

export function inside(point, polygon) {
  let contained = false;
  for (let i = 0; i < polygon.length - 1; i++) {
    const a = polygon[i], b = polygon[i + 1];
    if (distanceToSegment(point, a, b) < 1e-7) return true;
    if ((a.y > point.y) !== (b.y > point.y)
        && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) contained = !contained;
  }
  return contained;
}

/** Numerical prototype checks. Flattening is approximate, not exact topology proof. */
export function validatePattern(pattern, { flattenTolerance = 0.05, seamTolerance = 0.05 } = {}) {
  for (const tolerance of [flattenTolerance, seamTolerance]) {
    if (!Number.isFinite(tolerance) || tolerance <= 0) throw new RangeError('Validation tolerances must be positive');
  }
  const errors = [], warnings = [], pieceReports = [], seamReports = [], notchReports = [];
  const error = (code, message, details = {}) => errors.push({ code, message, ...details });
  if (pattern.unit !== 'mm') error('invalid-unit', 'Pattern unit must be mm');
  if (pattern.pieces.length === 0) error('empty-pattern', 'Pattern must contain at least one piece');
  const byId = new Map();
  for (const piece of pattern.pieces) {
    try { validateInstances(piece); } catch (e) { error('invalid-fabric-instances', e.message); }
    if (byId.has(piece.id)) error('duplicate-piece', `Duplicate piece ${piece.id}`);
    byId.set(piece.id, piece);
    const outline = piece.boundary;
    if (!outline.closed || !outline.start.equals(outline.end)) error('open-boundary', `${piece.id} is not closed`);
    const polygon = flattenPath(outline, flattenTolerance);
    const area = Math.abs(signedArea(polygon));
    if (area < 1) error('degenerate-area', `${piece.id} has negligible area`);
    if (outline.segments.some(segment => segment.length() < 1e-6)) error('zero-edge', `${piece.id} has a zero-length segment`);
    // Distributed construction darts may share one pivot on the sewing outline.
    // Permit endpoint contact there only; crossings and overlapping rays still fail.
    const sharedPivots = piece.darts.filter((d,i,all)=>all.some((other,j)=>j!==i&&other.apex.distanceTo(d.apex)<1e-7)).map(d=>d.apex);
    const crossings = findSelfIntersections(outline, flattenTolerance).filter(([i,j])=>!sharedPivots.some(p=>{
      const a=polygon[i],b=polygon[i+1],c=polygon[j],d=polygon[j+1];
      const end=(s,e)=>s.distanceTo(p)<1e-7?e:e.distanceTo(p)<1e-7?s:null;
      const x=end(a,b),y=end(c,d);if(!x||!y)return false;
      const u=p.vectorTo(x).normalized(),v=p.vectorTo(y).normalized();
      return Math.abs(u.x*v.y-u.y*v.x)>1e-7||u.x*v.x+u.y*v.y<0;
    }));
    if (crossings.length) error('self-intersection', `${piece.id} has ${crossings.length} sampled boundary intersections`);
    const allowance = piece.cut?.seamAllowance;
    if (!Number.isFinite(allowance) || allowance < 0) error('invalid-allowance', `${piece.id} has an invalid allowance`);
    if (allowance > 0 && !piece.cuttingBoundary) error('missing-cutting-boundary', `${piece.id} has no cutting boundary`);
    if (piece.cuttingBoundary) {
      const cutting = piece.cuttingBoundary;
      if (!cutting.closed || findSelfIntersections(cutting, flattenTolerance).length) error('invalid-cutting-boundary', `${piece.id} cutting boundary is invalid`);
      const cutPolygon = flattenPath(cutting, flattenTolerance);
      if (allowance <= 0 || polygon.some(p => !inside(p, cutPolygon))) error('invalid-allowance-envelope', `${piece.id} cutting boundary must contain the sewing boundary`);
    }
    const dartIds = new Set();
    const featureIds = new Set();
    for (const feature of piece.features) {
      if (featureIds.has(feature.id)) error('duplicate-feature', `${piece.id}.${feature.id}`);
      featureIds.add(feature.id);
      if (feature.type === 'slit') {
        const relation = sewingSides(pattern, pattern.relations.find(r => r.id === feature.relation));
        if (!relation || relation.a.piece !== piece.id || relation.b.piece !== piece.id
            || !Array.isArray(feature.edges) || feature.edges.length !== 2) {
          error('orphan-slit', `${piece.id}.${feature.id}`); continue;
        }
        for (const id of feature.edges) {
          const edge = piece.edges.find(e => e.id === id);
          if (!edge || edge.role !== 'open' || !Number.isFinite(feature.lengthMm) || feature.lengthMm <= 0
              || Math.abs(edge.path.length() - feature.lengthMm) > seamTolerance) error('invalid-slit', `${piece.id}.${feature.id}`);
        }
      } else if (feature.type === 'slash-spread') {
        const edge = piece.edges.find(e => e.id === feature.id);
        if (!edge || edge.role !== 'open' || !Number.isFinite(feature.openingMm) || feature.openingMm <= 0
            || Math.abs(edge.path.length() - (feature.edgeLengthMm ?? feature.openingMm)) > seamTolerance) error('invalid-spread', `${piece.id}.${feature.id}`);
      } else if (feature.type === 'pleats') {
        if (!Number.isInteger(feature.count) || feature.count < 1 || !Number.isFinite(feature.depthMm) || feature.depthMm <= 0
            || Math.abs(feature.expandedWidthMm - feature.foldedWidthMm - 2 * feature.count * feature.depthMm) > seamTolerance
            || Math.abs(outline.bounds().maxX - outline.bounds().minX - feature.expandedWidthMm) > seamTolerance
            || piece.edges.some(e => !Number.isFinite(feature.edgeLengths?.[e.id]) || Math.abs(e.path.length() - feature.edgeLengths[e.id]) > seamTolerance)) error('invalid-pleats', `${piece.id}.${feature.id}`);
      } else error('unknown-feature', `${piece.id}.${feature.id}`);
    }
    for (const dart of piece.darts) {
      const a = piece.edges.find(e => e.id === dart.legA), b = piece.edges.find(e => e.id === dart.legB);
      const relation = sewingSides(pattern, pattern.relations.find(r => r.id === dart.relation));
      if (dartIds.has(dart.id)) error('duplicate-dart', `${piece.id}.${dart.id}`);
      dartIds.add(dart.id);
      if (!a || !b || !relation || relation.a.piece !== piece.id || relation.b.piece !== piece.id
          || relation.a.edge !== dart.legA || relation.b.edge !== dart.legB) {
        error('orphan-dart', `${piece.id}.${dart.id} has missing legs or relation`); continue;
      }
      if (a.path.end.distanceTo(dart.apex) > seamTolerance || b.path.start.distanceTo(dart.apex) > seamTolerance
          || Math.abs(a.path.length() - b.path.length()) > seamTolerance) error('invalid-dart-legs', `${piece.id}.${dart.id}`);
      const u = dart.apex.vectorTo(a.path.start), v = dart.apex.vectorTo(b.path.end);
      const angle = Math.abs(Math.atan2(u.x * v.y - u.y * v.x, u.x * v.x + u.y * v.y));
      if (!Number.isFinite(dart.intakeAngleRad) || dart.intakeAngleRad <= 0 || Math.abs(angle - dart.intakeAngleRad) > 1e-7) {
        error('dart-intake-mismatch', `${piece.id}.${dart.id} angular intake changed`);
      }
    }
    const grain = piece.grainline;
    if (!grain || grain.length() < 1 || grain.segments.length !== 1
        || Array.from({ length: 11 }, (_, i) => grain.segments[0].pointAt(i / 10)).some(point => !inside(point, polygon)
          || openings(piece).some(h => regionContains(h.path, point)))) {
      error('invalid-grainline', `${piece.id} grainline must lie inside the piece`);
    }
    const notchIds = new Set();
    for (const mark of piece.notches) {
      if (notchIds.has(mark.id)) error('duplicate-notch', `Duplicate notch ${piece.id}.${mark.id}`);
      notchIds.add(mark.id);
      const attachedEdge = piece.edges.find(edge => edge.id === mark.edgeId);
      if (!attachedEdge) { error('orphan-notch', `Unknown notch edge ${piece.id}.${mark.edgeId}`); continue; }
      try {
        const location = locateAtLength(attachedEdge.path, mark.distanceFromStart);
        if (location.point.distanceTo(mark.point) > seamTolerance) error('detached-notch', `Notch ${mark.id} is not at its recorded edge distance`);
      } catch {
        error('invalid-notch-distance', `Notch ${mark.id} is outside its edge`);
      }
    }
    pieceReports.push({ id: piece.id, perimeterMm: outline.length(), approximateAreaMm2: area - openings(piece).reduce((n,h) => n + regionArea(h.path), 0),
      closed: outline.closed, sampledIntersections: crossings.length });
  }
  const resolve = ref => byId.get(ref?.piece)?.edges.find(edge => edge.id === ref?.edge);
  const usedEdges = new Set(), relationIds = new Set();
  for (const stored of pattern.relations) {
    if (stored.participants && !stored.legacy) {
      if (relationIds.has(stored.id)) error('duplicate-relation', `Duplicate relation ${stored.id}`);
      relationIds.add(stored.id);
      const report = inspectAssemblySeam(pattern, stored, seamTolerance);
      for (const e of report.errors) error(e.code, e.message, e);
      if (stored.status === 'pending') error('unresolved-seam', stored.pendingReason ?? '縫合が未解決です');
      for (const p of stored.participants) for (const ref of participantRefs(pattern, p)) usedEdges.add(`${ref.piece}.${ref.edge}`);
      if (report.participants) seamReports.push({ id: stored.id, ...report, errors: undefined });
      continue;
    }
    const relation = sewingSides(pattern, stored);
    if (stored.status === 'pending') {
      error('unresolved-seam', stored.pendingReason ?? `${stored.id}: 縫合が未解決です`, { seamId: stored.id });
    }
    if (stored.participants) {
      const ids = stored.participants.map(p => p.id);
      if (ids.length !== 2 || new Set(ids).size !== ids.length || !ids.includes(stored.referenceParticipantId)) {
        error('invalid-participants', `${stored.id}: 二つの参加者と基準参加者が必要です`, { seamId: stored.id }); continue;
      }
      if (!stored.legacy && (stored.referenceParticipantId !== ids[0]
          || stored.participants[0].segments.some(s => s.direction !== 'forward'))) {
        error('invalid-reference-participant', `${stored.id}: 段階1の基準参加者は先頭でforwardにしてください`); continue;
      }
      if (stored.matchPoints?.length) { error('unsupported-match-points', `${stored.id}: 新形式の合印対応は未対応です`); continue; }
      let invalid = false;
      for (const participant of stored.participants) {
        const refs = participantRefs(pattern, participant), detail = { seamId: stored.id, participantId: participant.id };
        if (!refs.length || participant.fit?.mode !== 'plain' || participant.segments.some(s => s.range?.mode !== 'whole'
            || !['forward', 'reverse'].includes(s.direction) && !(stored.legacy && s.direction == null))) {
          error('unsupported-seam', `${stored.id}: 通常縫合・外周線全体のみ対応しています`, detail); invalid = true; continue;
        }
        if (!stored.legacy && (participant.segments.some(s => s.pieceRef && s.pieceRef !== participant.pieceRef)
            || new Set(refs.map(r => r.piece)).size !== 1)) {
          error('wrong-participant-piece', `${stored.id}: 一つの参加線は一枚の布に属する必要があります`, detail); invalid = true;
        }
        if (!stored.legacy) for (let i = 1; i < refs.length; i++) {
          const before = resolve(refs[i - 1]), after = resolve(refs[i]);
          if (!before || !after) continue;
          const end = before.path[participant.segments[i - 1].direction === 'reverse' ? 'start' : 'end'];
          const start = after.path[participant.segments[i].direction === 'reverse' ? 'end' : 'start'];
          if (end.distanceTo(start) > seamTolerance) { error('discontinuous-sewing-line', `${stored.id}: 参加線が連続していません`, detail); invalid = true; }
        }
      }
      if (invalid) continue;
    }
    const directionKnown = ['same', 'opposite'].includes(relation.direction);
    if (relation.direction === undefined || relation.direction === null)
      warnings.push({ code: 'unknown-seam-direction', message: `${relation.id}: 縫合方向が未確認です。元の操作から作り直してください` });
    else if (!directionKnown) error('invalid-seam-direction', `${relation.id}: 縫合方向はsameまたはoppositeです`);
    if (relationIds.has(relation.id)) error('duplicate-relation', `Duplicate relation ${relation.id}`);
    relationIds.add(relation.id);
    const a = sewingRefs(relation.a).map(resolve), b = sewingRefs(relation.b).map(resolve);
    if (!a.length || !b.length || [...a, ...b].some(e => !e)) { error('orphan-relation', `Unknown edge in ${relation.id}`); continue; }
    if (relation.kind !== 'sew' || [...a, ...b].some(e => e.role !== 'sew')) {
      error('invalid-relation', `Invalid sewing relation ${relation.id}`);
      continue;
    }
    for (const ref of [...sewingRefs(relation.a), ...sewingRefs(relation.b)]) {
      const key = `${ref.piece}.${ref.edge}`;
      if (usedEdges.has(key)) error('duplicate-sewing-edge', `Edge ${key} is sewn more than once`);
      usedEdges.add(key);
    }
    const aLength = sewingLength(pattern, relation.a), bLength = sewingLength(pattern, relation.b);
    if (![aLength, bLength].every(length => Number.isFinite(length) && length > 1e-7)) {
      error('invalid-sewing-length', `${relation.id}: 縫合長は正の有限値が必要です`, { seamId: relation.id }); continue;
    }
    const ease = aLength - bLength;
    const limits = relation.ease;
    const validLimits = Number.isFinite(limits?.min) && Number.isFinite(limits?.max) && limits.min <= limits.max;
    const passed = validLimits && ease >= limits.min - seamTolerance && ease <= limits.max + seamTolerance;
    if (!passed) error('seam-mismatch', `${relation.name ?? relation.note ?? relation.id} [${relation.id}]: 布1は${aLength.toFixed(3)}mm、布2は${bLength.toFixed(3)}mm、差は${Math.abs(ease).toFixed(3)}mmです。取付線を修正するか、対応するいせ等の生成操作を編集してください。`,
      { seamId: relation.id, participantId: stored.participants?.[1]?.id ?? 'b', range: { mode: 'whole' },
        measuredLengthMm: bLength, targetLengthMm: aLength, differenceMm: bLength - aLength,
        allowedEaseMm: limits, toleranceMm: seamTolerance });
    seamReports.push({ id: relation.id, aLengthMm: aLength, bLengthMm: bLength, easeMm: ease,
      participants: stored.participants?.map((p, i) => ({ id: p.id, lengthMm: i === 0 ? aLength : bLength })),
      allowedEaseMm: limits, direction: relation.direction ?? null, directionKnown, passed: passed && stored.status !== 'pending' });
  }
  for (const e of inspectAssemblyRelations(pattern)) error(e.code, e.message, e);
  for (const piece of pattern.pieces) {
    for (const line of piece.attachmentLines ?? []) {
      try {
        validateFabricScope(piece, line.instanceId, line.face);
        if (['region','interfacing','opening'].includes(line.role)) validateRegion(piece, line);
        if (line.role === 'buttonhole' && !attachmentWithinPiece(piece,buttonholeOutline(line))) throw new RangeError('ボタン穴の幅が布の範囲を外れています');
      } catch (e) { error('invalid-internal-design', e.message); }
      if (!attachmentWithinPiece(piece, line.path)) error('invalid-attachment-line', `${piece.name}の内部取付線が布の範囲外または長さゼロです`);
    }
    for (const source of piece.drafting?.derivedFrom?.sources ?? []) {
      const parent = byId.get(source.piece)?.edges.find(e => e.id === source.edge);
      if (!parent || Math.abs(parent.path.length(0.001) - source.lengthMm) > seamTolerance || source.shape && JSON.stringify(parent.path) !== source.shape) error('stale-derived-piece', `${piece.id}: 参照元が変わりました。付属パーツを作り直してください`);
    }
    for (const edge of piece.edges) {
      if (edge.role === 'sew' && !usedEdges.has(`${piece.id}.${edge.id}`)) error('unpaired-edge', `${piece.id}.${edge.id} has no sewing partner`);
    }
  }
  for (const pair of pattern.notchPairs) {
    const locations = [pair.a, pair.b].map(ref => {
      const piece = byId.get(ref?.piece);
      const mark = piece?.notches.find(mark => mark.id === ref?.notch);
      const attachedEdge = piece?.edges.find(edge => edge.id === mark?.edgeId);
      if (!mark || !attachedEdge) return null;
      const offset = ref.distanceOffsetMm ?? 0;
      if (!Number.isFinite(offset) || offset < -seamTolerance) return null;
      return { mark, length: (ref.fromEnd ? attachedEdge.path.length(0.0001) - mark.distanceFromStart : mark.distanceFromStart) + offset };
    });
    if (locations.some(location => !location)) { error('orphan-notch-pair', 'Notch pair references an unknown notch'); continue; }
    const [a, b] = locations;
    const onSide = (side, ref, mark) => sewingRefs(side).some(edge => edge.piece === ref.piece && edge.edge === mark.edgeId);
    const relation = pattern.relations.map(r => sewingSides(pattern, r)).find(r =>
      onSide(r.a, pair.a, a.mark) && onSide(r.b, pair.b, b.mark)
      || onSide(r.b, pair.a, a.mark) && onSide(r.a, pair.b, b.mark));
    const directionKnown = ['same', 'opposite'].includes(relation?.direction);
    const directionMatches = !directionKnown || ((!!pair.a.fromEnd === !!pair.b.fromEnd) === (relation.direction === 'same'));
    if (!directionMatches) error('notch-direction-mismatch', `Notch pair ${pair.a.notch}/${pair.b.notch} uses inconsistent sewing ends`);
    const ease = a.length - b.length;
    const passed = directionMatches && a.mark.count === b.mark.count && Number.isFinite(pair.lowerEase)
      && Math.abs(ease - pair.lowerEase) <= seamTolerance;
    if (!passed) error('notch-mismatch', `Notch pair ${pair.a.notch}/${pair.b.notch} does not match`);
    notchReports.push({ a: pair.a.notch, b: pair.b.notch, lowerEaseMm: ease, expectedLowerEaseMm: pair.lowerEase, passed });
  }
  return { valid: errors.length === 0, errors, warnings, pieces: pieceReports, seams: seamReports, notches: notchReports,
    tolerances: { curveFlatteningMm: flattenTolerance, seamComparisonMm: seamTolerance },
    limitations: ['Self-intersection and grainline checks use a polyline approximation.', 'Numerical validity does not establish garment fit.'] };
}
