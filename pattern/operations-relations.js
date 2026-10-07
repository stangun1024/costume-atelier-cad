import { updatePiece } from './operation-tools.js';
import { relationRefs } from './sewing.js';
import { locateAtLength } from '../core/path-tools.js';
import { inspectAssemblySeam, sewingLine, attachmentWithinPiece } from './assembly-sewing.js';
import { internalPath } from './internal-path.js';
import { stableId } from './references.js';
import { fabricInstances, validateFabricScope } from './fabric-instances.js';
import { validateRegion, materialGrainline } from './material-regions.js';
import { Line } from '../core/geometry.js';

export const isRelationOperation = type => ['ADD_RELATION', 'UPDATE_RELATION', 'REMOVE_RELATION'].includes(type);
export function relationEditReason(pattern, relation) {
  if (!relation || relation.kind !== 'sew') return '縫合がありません';
  if (pattern.pieces.some(p => p.darts.some(d => d.relation === relation.id) || p.features.some(f => f.relation === relation.id)))
    return 'ダーツ・開きの構造が使用中です。元の生成操作を編集してください';
  return '';
}
export function relationUpdateReason(pattern, relation) {
  const reason = relationEditReason(pattern, relation);
  if (reason) return reason;
  if (relation.legacy && (relation.participants?.length !== 2 || relation.participants.some(p => p.segments.length !== 1)
      || relation.legacyEase && (relation.legacyEase.min !== 0 || relation.legacyEase.max !== 0)))
    return '旧いせ・辺列は元の生成操作で編集してください';
  if (relation.participants.some(p => p.segments.some(s => !['forward', 'reverse'].includes(s.direction))))
    return '縫合方向が未確認です。元の操作から作り直してください';
  const refs = relationRefs(pattern, relation);
  if (pattern.notchPairs.some(pair => [pair.a, pair.b].every(mark => refs.some(ref => ref.piece === mark.piece
      && pattern.pieces.find(p => p.id === mark.piece)?.notches.some(n => n.id === mark.notch && n.edgeId === ref.edge)))))
    return '対応する合印があります。合印付き縫合は元の生成操作で編集してください';
  return '';
}
function fail(code, message, detail = {}) {
  const error = new RangeError(message); Object.assign(error, { code, ...detail }); throw error;
}
function replaceRelations(pattern, relations, freed = []) {
  const used = new Set(relations.flatMap(r => relationRefs(pattern, r)).map(r => `${r.piece}.${r.edge}`));
  const freedKeys = new Set(freed.map(r => `${r.piece}.${r.edge}`));
  return { ...pattern, relations, pieces: pattern.pieces.map(piece => updatePiece(piece, {
    edges: piece.edges.map(edge => {
      const key = `${piece.id}.${edge.id}`;
      return used.has(key) ? { ...edge, role: 'sew' } : freedKeys.has(key) ? { ...edge, role: 'open' } : edge;
    }),
  })) };
}
function relationFromOperation(pattern, op, previous = null) {
  if (op.kind !== 'sew') fail('unsupported-relation-kind', '縫合のkindはsewです');
  // Keep the reference first so legacy consumers retain their signed difference convention.
  const participants = [...op.participants].sort((a, b) => a.id === op.referenceParticipantId ? -1 : b.id === op.referenceParticipantId ? 1 : 0);
  const { participants: oldParticipants, referenceParticipantId, matchPoints, legacy, legacyEase, legacyDirection,
    status, pendingReason, ...metadata } = previous ?? {};
  const result = { ...metadata, ...(previous ? { id: previous.id, entityId: previous.entityId, name: op.name } : { id: `${op.id}-seam` }),
    kind: 'sew', note: op.name, referenceParticipantId: op.referenceParticipantId, participants: structuredClone(participants), matchPoints: structuredClone(op.matchPoints ?? []) };
  const inspected = inspectAssemblySeam({ ...pattern, relations: pattern.relations.filter(r => r !== previous) }, result, 0.05, false);
  if (inspected.errors.length) fail(inspected.errors[0].code, inspected.errors[0].message, { details: inspected.errors });
  return result;
}
export function addRelation(pattern, piece, op) {
  const relation = relationFromOperation(pattern, op);
  if (pattern.relations.some(r => r.id === relation.id)) fail('duplicate-relation', '縫合IDが重複しています');
  return replaceRelations(pattern, [...pattern.relations, relation]);
}
export function updateRelation(pattern, piece, op) {
  const previous = pattern.relations.find(r => r.id === op.relation), reason = relationUpdateReason(pattern, previous);
  if (reason) fail('protected-relation', reason);
  const refs = relationRefs(pattern, previous);
  const relation = relationFromOperation(pattern, op, previous);
  return replaceRelations(pattern, pattern.relations.map(r => r === previous ? relation : r), refs);
}
export function removeRelation(pattern, piece, op) {
  const previous = pattern.relations.find(r => r.id === op.relation), reason = relationEditReason(pattern, previous);
  if (reason) fail('protected-relation', reason);
  const refs = relationRefs(pattern, previous);
  const uses = mark => refs.some(ref => ref.piece === mark.piece
    && pattern.pieces.find(p => p.id === ref.piece)?.notches.some(n => n.id === mark.notch && n.edgeId === ref.edge
      && (!ref.range || n.distanceFromStart >= ref.range.startMm && n.distanceFromStart <= ref.range.endMm)));
  return { ...replaceRelations(pattern, pattern.relations.filter(r => r !== previous), refs),
    notchPairs: pattern.notchPairs.filter(pair => !uses(pair.a) && !uses(pair.b)) };
}

export function addAttachmentLine(pattern, piece, op) {
  if (piece.features.length) fail('unsupported-attachment-piece', '折り構造を持つ布への内部線は未対応です');
  const path = internalPath(op.start, op.end, op.segments, op.closed ?? false);
  if (path.length() < 1e-7) fail('invalid-attachment-line', '取付線の始点と終点を離してください');
  if (!attachmentWithinPiece(piece, path)) fail('attachment-outside-piece', '取付線は布の内部に置いてください');
  validateFabricScope(piece, op.instanceId, op.face);
  if (op.widthMm !== undefined && op.purpose !== 'buttonhole' || op.allowanceMm !== undefined && op.purpose !== 'opening')
    fail('invalid-line-dimensions', 'widthMmはbuttonhole、allowanceMmはopeningの専用寸法です');
  if (op.purpose === 'buttonhole' && (path.closed || path.segments.length !== 1 || !(path.segments[0] instanceof Line)
      || !Number.isFinite(op.widthMm) || op.widthMm <= 0 || op.widthMm >= path.length())) fail('invalid-buttonhole', 'ボタン穴は開いた直線と、長さより小さい正の幅が必要です');
  const line = { id: `${op.id}-line`, name: op.name, role: op.purpose ?? 'attachment', path,
    ...(op.instanceId !== undefined ? { instanceId: op.instanceId } : {}), ...(op.face ? { face: op.face } : {}),
    ...(op.widthMm !== undefined ? { widthMm: op.widthMm } : {}), ...(op.allowanceMm !== undefined ? { allowanceMm: op.allowanceMm } : {}),
    coordinateMode: 'piece-fixed', boundaryRevision: stableId('boundary', JSON.stringify(piece.boundary)) };
  if (['region','interfacing','opening'].includes(line.role)) validateRegion(piece, line);
  let updated = updatePiece(piece, { attachmentLines: [...piece.attachmentLines, line] });
  if (line.role === 'opening') updated = updatePiece(updated, { grainline: materialGrainline(updated) });
  return { ...pattern, pieces: pattern.pieces.map(p => p === piece ? updated : p) };
}
export function inspectAssemblyRelations(pattern) {
  const errors = [], relations = pattern.assemblyRelations ?? [], ids = new Set();
  const byId = ref => pattern.pieces.find(p => p.id === ref || p.entityId === ref);
  for (const r of relations) {
    const from = byId(r.fromPieceRef), to = byId(r.toPieceRef);
    if (!from || !to || from === to && (!r.sourceInstanceId || !r.targetInstanceId || r.sourceInstanceId === r.targetInstanceId) || ids.has(r.id)) { errors.push({ code: 'invalid-assembly-relation', message: `${r.note ?? r.id}：異なる布個体と一意の関係IDが必要です` }); continue; }
    ids.add(r.id);
    try {
      validateFabricScope(from, r.sourceInstanceId, r.sourceFace); validateFabricScope(to, r.targetInstanceId, r.targetFace);
      if (!['always','open','closed'].includes(r.state ?? 'always')) throw new RangeError('開閉状態はalways/open/closedです');
      if (Boolean(r.sourceRegionRef) !== Boolean(r.targetRegionRef)) throw new RangeError('局所領域は両方の布で指定してください');
      for (const [piece, ref, instanceId, face] of [[from,r.sourceRegionRef,r.sourceInstanceId,r.sourceFace],[to,r.targetRegionRef,r.targetInstanceId,r.targetFace]]) if (ref) {
        const line = piece.attachmentLines.find(l => l.id === ref || l.entityId === ref);
        if (!line?.path.closed || !['region','interfacing'].includes(line.role)) throw new RangeError('局所領域には所有する布の閉じたregionまたはinterfacing線を指定してください');
        if (!attachmentWithinPiece(piece, line.path)) throw new RangeError('指定領域が布から外れています');
        if (line.instanceId !== undefined && line.instanceId !== instanceId || line.face !== undefined && line.face !== face)
          throw new RangeError('領域線の個体・表裏と関係の指定が一致しません');
      }
    } catch (e) { errors.push({ code: 'invalid-assembly-scope', message: `${r.note ?? r.id}：${e.message}` }); }
    if (r.kind === 'placement') {
      try {
        const a = sewingLine(from, r.sourceLineRef), b = sewingLine(to, r.targetLineRef);
        if (!a || !b || ![r.sourceDistanceMm, r.targetDistanceMm, r.offsetMm?.x, r.offsetMm?.y, r.rotationDeg].every(Number.isFinite)) throw new RangeError('基準線・距離・移動量・回転が必要です');
        locateAtLength(a.path, r.sourceDistanceMm); locateAtLength(b.path, r.targetDistanceMm);
      } catch (e) { errors.push({ code: 'invalid-placement-anchor', message: `${r.note ?? r.id}：${e.message}` }); }
      if (relations.some(x => x !== r && x.kind === 'placement' && x.fromPieceRef === r.fromPieceRef
          && (!x.sourceInstanceId || !r.sourceInstanceId || x.sourceInstanceId === r.sourceInstanceId)
          && ((x.state ?? 'always') === 'always' || (r.state ?? 'always') === 'always' || x.state === r.state)))
        errors.push({ code: 'duplicate-placement', message: '同じ布個体・開閉状態に配置基準は一つです' });
    } else if (r.kind !== 'over') errors.push({ code: 'unsupported-assembly-kind', message: '配置または全体の重なりを指定してください' });
  }
  for (const kind of ['placement', 'over']) for (const state of ['open','closed']) {
    const edges = new Map();
    for (const r of relations.filter(r => r.kind === kind && (!r.state || r.state === 'always' || r.state === state))) {
      const from = byId(r.fromPieceRef), to = byId(r.toPieceRef);
      if (from && to) for (const a of fabricInstances(from).filter(i => !r.sourceInstanceId || i.id === r.sourceInstanceId))
        for (const b of fabricInstances(to).filter(i => !r.targetInstanceId || i.id === r.targetInstanceId)) {
          const key = `${from.id}/${a.id}`;
          edges.set(key, [...(edges.get(key) ?? []), `${to.id}/${b.id}`]);
        }
    }
    const active = new Set(), done = new Set();
    const visit = id => { if (active.has(id)) return true; if (done.has(id)) return false;
      active.add(id); const cycle = (edges.get(id) ?? []).some(visit); active.delete(id); done.add(id); return cycle; };
    if ([...edges.keys()].some(visit)) errors.push({ code: 'cyclic-assembly-relation', message: `${kind === 'over' ? '重なり' : '配置基準'}が循環しています` });
  }
  return errors;
}
function setAssembly(pattern, piece, op, kind) {
  const other = pattern.pieces.find(p => p.id === op.otherPiece);
  if (!other || other === piece && (!op.sourceInstanceId || !op.targetInstanceId || op.sourceInstanceId === op.targetInstanceId)) fail('invalid-assembly-piece', '異なる二つの布個体を指定してください');
  const existing = (pattern.assemblyRelations ?? []).find(r => r.kind === kind && r.fromPieceRef === piece.entityId
    && r.sourceInstanceId === op.sourceInstanceId && (r.state ?? 'always') === (op.state ?? 'always')
    && (kind === 'placement' || r.toPieceRef === other.entityId && r.targetInstanceId === op.targetInstanceId
      && r.sourceRegionRef === op.sourceRegionRef && r.targetRegionRef === op.targetRegionRef && r.sourceFace === op.sourceFace && r.targetFace === op.targetFace));
  const { type, refs, piece: ignored, otherPiece, engineVersion, id, ...parameters } = op;
  const relation = { ...parameters, id: existing?.id ?? `${id}-${kind}`, entityId: existing?.entityId,
    name: op.name, note: op.name, kind, fromPieceRef: piece.entityId, toPieceRef: other.entityId };
  const assemblyRelations = [...(pattern.assemblyRelations ?? []).filter(r => r !== existing), relation];
  const result = { ...pattern, assemblyRelations };
  const errors = inspectAssemblyRelations(result);
  if (errors.length) fail(errors[0].code, errors[0].message, { details: errors });
  return result;
}
export const setPlacement = (pattern, piece, op) => setAssembly(pattern, piece, op, 'placement');
export const setOverlap = (pattern, piece, op) => setAssembly(pattern, piece, op, 'over');
export function removeAssemblyRelation(pattern, piece, op) {
  const relation = (pattern.assemblyRelations ?? []).find(r => r.id === op.relation);
  if (!relation || ![relation.fromPieceRef, relation.toPieceRef].includes(piece.entityId)) fail('missing-assembly-relation', '解除する配置または重なりがありません');
  return { ...pattern, assemblyRelations: pattern.assemblyRelations.filter(r => r !== relation) };
}
