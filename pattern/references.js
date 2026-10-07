import { referenceFields, referenceKind as fieldKind } from './operation-definitions.js';
export { referenceFields } from './operation-definitions.js';
import { PatternPiece, deepFreeze } from './piece.js';
import { normalizeSewingRelation, mapSewingRelation } from './sewing.js';

export const REFERENCE_VERSION = '1.0.0';
export const ENGINE_VERSION = '0.6.0';
const edgeLabels = { neckline: '襟ぐり', shoulder: '肩線', armhole: '袖ぐり', side: '脇線', waist: 'ウエスト線',
  center: '中心線（わ）', cuff: '袖口', 'cap-front': '前袖山', 'cap-back': '後袖山',
  'underarm-front': '前袖下', 'underarm-back': '後袖下' };
const key = (kind, piece, local) => `${kind}:${piece ?? ''}:${local}`;
const stableJSON = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v)
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v);
// Portable deterministic identity, not a security hash. Collision checks below fail closed.
export function stableId(kind, seed) {
  let a = 2166136261, b = 2246822519;
  for (const c of seed) { a = Math.imul(a ^ c.charCodeAt(0), 16777619); b = Math.imul(b ^ c.charCodeAt(0), 3266489917); }
  return `${kind}-${(a >>> 0).toString(16).padStart(8, '0')}${(b >>> 0).toString(16).padStart(8, '0')}`;
}
export function operationIdentity(operation, used = []) {
  if (operation.id !== undefined) {
    if (typeof operation.id !== 'string' || !/^[a-z][a-z0-9-]{1,99}$/.test(operation.id)) throw new TypeError('操作IDの形式が不正です');
    if (used.includes(operation.id)) throw new ReferenceError('操作IDが重複しています');
    return operation.id;
  }
  const { id, ...payload } = operation;
  const seed = stableJSON(payload);
  let occurrence = 0, candidate;
  do { candidate = stableId('op', `${seed}:${occurrence++}`); } while (used.includes(candidate));
  return candidate;
}

export class TargetReferenceError extends RangeError {
  constructor(code, id, candidates = []) {
    super(`${code === 'ambiguous-reference' ? '参照先が複数あります。対象を再選択してください' : '参照先を解決できません。対象を再選択してください'}: ${id}`);
    this.code = code; this.entityIds = [id]; this.candidates = candidates;
  }
}

/** Flatten the current geometry into typed records; legacy ids remain an adapter only. */
function records(pattern) {
  const out = [];
  for (const p of pattern.pieces) {
    out.push({ kind: 'piece', localId: p.id, localPiece: null, item: p, name: p.name, role: 'pattern_piece' });
    for (const line of p.attachmentLines ?? []) out.push({ kind: 'edge', localId: line.id, localPiece: p.id, item: line,
      name: line.name, role: line.role === 'attachment' ? 'attachment_line' : line.role, lengthMm: line.path.length() });
    for (const d of p.darts) out.push({ kind: 'feature', localId: d.id, localPiece: p.id, item: d, name: `${p.name}・ダーツ ${d.id.match(/\d+/)?.[0] ?? ''}`, role: 'dart' });
    for (const f of p.features) out.push({ kind: 'feature', localId: f.id, localPiece: p.id, item: f,
      name: `${p.name}・${f.type === 'slash-spread' ? '展開' : f.type === 'pleats' ? 'プリーツ' : '開き'} ${f.id.match(/\d+/)?.[0] ?? ''}`, role: f.type });
    for (const e of p.edges) {
      const dart = p.darts.find(d => [d.legA, d.legB].includes(e.id));
      const feature = dart ?? p.features.find(f => f.id === e.id || f.edges?.includes(e.id));
      const role = dart ? 'dart_leg' : feature?.type === 'slash-spread' ? 'spread_opening' : feature?.type === 'slit' ? 'slit_edge' : e.role === 'sew' ? 'seam_edge' : e.role === 'fold' ? 'fold_edge' : 'open_edge';
      const label = dart ? `ダーツ ${dart.id.match(/\d+/)?.[0] ?? ''}・${dart.legA === e.id ? '入り側' : '戻り側'}の脚`
        : feature?.type === 'slash-spread' ? '展開で追加した辺' : feature?.type === 'slit' ? '開きの辺'
          : edgeLabels[e.id] ?? (e.id.endsWith('-join') ? '分割線（縫合）' : e.id.endsWith('-remainder') ? '分割された辺の後半' : '分割された辺');
      out.push({ kind: 'edge', localId: e.id, localPiece: p.id, item: e, name: `${p.name}・${label}`, role,
        featureLocalId: feature?.id ?? null, semantics: { boundaryRole: e.role,
          anatomicalRegion: edgeLabels[e.id] ? e.id : null,
          boundarySide: dart ? (dart.legA === e.id ? 'incoming' : 'outgoing') : null,
          anatomicalSide: null, meaningStatus: dart ? 'partially-known' : 'engine-defined' }, lengthMm: e.path.length() });
    }
  }
  for (const r of pattern.relations) out.push({ kind: 'relation', localId: r.id, localPiece: null, item: r, name: r.note ?? r.id, role: 'sewing_relation' });
  for (const r of pattern.assemblyRelations ?? []) out.push({ kind: 'relation', localId: r.id, localPiece: null, item: r, name: r.note ?? r.id, role: `${r.kind}_relation` });
  return out;
}

function createReferenceUpdate(before, operation, methodId) {
  const prior = before?.referenceGraph;
  const entities = Object.fromEntries(Object.entries(prior?.entities ?? {}).map(([id, e]) => [id, { ...e }]));
  const lineage = [...(prior?.lineage ?? [])];
  const aliases = new Map(Object.values(entities).filter(e => e.status === 'active').map(e => [key(e.kind, e.localPiece, e.localId), e.id]));
  const minted = new Set();
  const opId = operation?.id ?? 'base-schema-v1';
  function mint(kind, slot, metadata) {
    const namespace = methodId && methodId !== 'bunka-old' ? `${methodId}:` : '';
    const seed = `${namespace}${opId}:${kind}:${slot}`;
    const id = stableId(kind, seed);
    if (entities[id] || minted.has(id)) throw new Error(`ID collision or reuse: ${id}`);
    minted.add(id);
    entities[id] = { id, kind, status: 'active', createdBy: operation?.id ?? null,
      provenance: { source: 'engine', status: 'derived', confidence: null }, ...metadata };
    return id;
  }
  return { prior, entities, lineage, aliases, minted, opId, mint };
}

function applyPartitionEvents(after, update) {
  const { entities, lineage, aliases, opId, mint } = update;
  for (const event of after.mergeChanges ?? []) {
    const sources = event.sources.map(local => aliases.get(key('piece', null, local)));
    if (sources.some(id => !id)) throw new Error('Missing merge source identity');
    const id = mint('piece', `merge:${sources.join(':')}`, { localId: event.output, localPiece: null, sourceIds: sources });
    aliases.set(key('piece', null, event.output), id);
    for (const sourceId of sources) { entities[sourceId].status = 'retired'; entities[sourceId].retiredBy = opId;
      lineage.push({ operationId: opId, kind: 'merged', sourceId, outputs: [{ id }] }); }
  }
  // Pieces split into two new identities even when the legacy adapter retains one local id.
  for (const event of after.pieceChanges ?? []) {
    const oldId = aliases.get(key('piece', null, event.source));
    if (!oldId) throw new Error('Missing source piece identity');
    entities[oldId].status = 'retired'; entities[oldId].retiredBy = opId;
    const outputs = event.outputs.map((local, i) => {
      const id = mint('piece', `partition:${oldId}:${i === 0 ? 'forward' : 'remainder'}`, { localId: local, localPiece: null, sourceIds: [oldId] });
      aliases.set(key('piece', null, local), id);
      return { id };
    });
    lineage.push({ operationId: opId, kind: 'split', sourceId: oldId, outputs });
  }
  for (const event of after.topologyChanges ?? []) {
    const sourceKey = key('edge', event.source.piece, event.source.edge);
    const oldId = aliases.get(sourceKey);
    if (!oldId) throw new Error(`Missing source edge identity: ${sourceKey}`);
    const source = entities[oldId];
    const same = event.outputs.length === 1 && Math.abs(event.outputs[0].fromMm) < 1e-7
      && Math.abs(event.outputs[0].toMm - event.sourceLengthMm) < 0.001;
    aliases.delete(sourceKey);
    if (same) {
      const output = event.outputs[0];
      aliases.set(key('edge', output.piece, output.edge), oldId);
      source.localPiece = output.piece; source.localId = output.edge;
      continue;
    }
    source.status = 'retired'; source.retiredBy = opId; source.lengthMm = event.sourceLengthMm;
    const outputs = event.outputs.map((part, index) => {
      const slot = index === 0 ? 'before' : index === event.outputs.length - 1 ? 'after' : 'between';
      const id = mint('edge', `partition:${oldId}:${slot}`, {
        localPiece: part.piece, localId: part.edge, sourceIds: [oldId],
        rootName: source.rootName ?? source.name,
        name: `${source.rootName ?? source.name}・分割区間 ${Object.values(entities).filter(e => e.rootName === (source.rootName ?? source.name)).length + 1}`,
        semantics: source.semantics, role: source.role,
        ...(source.semanticProvenance ? { semanticProvenance: { ...source.semanticProvenance, status: 'inherited', sourceId: oldId } } : {}),
      });
      aliases.set(key('edge', part.piece, part.edge), id);
      return { id, fromMm: part.fromMm, toMm: part.toMm, direction: part.direction };
    });
    lineage.push({ operationId: opId, kind: 'partition', sourceId: oldId, sourceLengthMm: event.sourceLengthMm, outputs });
  }
}

function reconcileReferenceRecords(after, operation, update) {
  const { entities, lineage, aliases, opId, mint } = update;
  const active = new Set();
  const current = records(after);
  for (const r of current) {
    const k = key(r.kind, r.localPiece, r.localId);
    let id = aliases.get(k);
    // Features can move to a split panel while retaining their identity.
    if (!id && r.item.entityId && entities[r.item.entityId]?.status === 'active') id = r.item.entityId;
    if (!id) {
      const pieceId = r.localPiece ? aliases.get(key('piece', null, r.localPiece)) : '';
      const slot = operation ? `${pieceId}:${r.role === 'buttonhole' ? r.localId : r.localId.replace(/\d+/g, '#')}` : `bunka-old-schema-v1:${r.localPiece ?? ''}:${r.localId}`;
      id = mint(r.kind, slot, {});
    }
    if (active.has(id)) throw new Error(`Duplicate identity in geometry: ${id}`);
    active.add(id); aliases.set(k, id);
    const previous = entities[id];
    const priorName = previous.name;
    entities[id] = { ...previous, id, kind: r.kind, status: 'active', localId: r.localId, localPiece: r.localPiece,
      name: priorName ?? r.name, role: r.role, semantics: { ...r.semantics, ...previous.semantics, boundaryRole: r.item.role ?? previous.semantics?.boundaryRole },
      ...(r.lengthMm !== undefined ? { lengthMm: r.lengthMm } : {}),
      pieceId: r.localPiece ? aliases.get(key('piece', null, r.localPiece)) : null,
      featureId: r.featureLocalId ? aliases.get(key('feature', r.localPiece, r.featureLocalId)) : null,
    };
  }
  for (const e of Object.values(entities)) if (e.status === 'active' && !active.has(e.id)) {
    e.status = 'retired'; e.retiredBy = opId;
    lineage.push({ operationId: opId, kind: 'removed', sourceId: e.id, outputs: [] });
  }
}

function applyEntityMetadata(before, operation, entities) {
  if (['SET_PIECE_PLACEMENT', 'SET_OVERLAP_RELATION'].includes(operation?.type)) {
    const kind = operation.type === 'SET_PIECE_PLACEMENT' ? 'placement' : 'over';
    const previous = (before.assemblyRelations ?? []).find(r => r.kind === kind && r.fromPieceRef === operation.refs.piece
      && (kind === 'placement' || r.toPieceRef === operation.refs.otherPiece));
    if (previous?.entityId && entities[previous.entityId]) entities[previous.entityId].name = operation.name;
  }
  if (operation?.type === 'UPDATE_RELATION') {
    const entity = entities[resolveReference(before, operation.refs.relation, 'relation').entity.id];
    entity.name = operation.name;
  }
  if (operation?.type === 'RENAME_ENTITY') {
    const id = resolveReference(before, operation.refs.entity, null).entity.id;
    const e = entities[id];
    if (!e || e.status !== 'active') throw new TargetReferenceError('missing-reference', id);
    e.name = operation.name; e.rootName = operation.name; e.provenance = { source: operation.nameSource ?? 'user', status: operation.nameSource === 'ai' ? 'proposed' : 'confirmed', confidence: null };
  }
  if (operation?.type === 'SET_ENTITY_SEMANTICS') {
    const e = entities[resolveReference(before, operation.refs.entity, null).entity.id];
    if (!e || e.status !== 'active') throw new TargetReferenceError('missing-reference', operation.refs.entity);
    e.semantics = { ...e.semantics, ...operation.semantics, meaningStatus: operation.semanticSource === 'ai' ? 'proposed' : 'confirmed' };
    e.semanticProvenance = { source: operation.semanticSource, status: operation.semanticSource === 'ai' ? 'proposed' : 'confirmed', confidence: operation.confidence ?? null };
  }
}

function recordFeatureConversions(after, operation, update) {
  const { entities, lineage, aliases } = update;
  if (['CONVERT_DART_TO_SEAMS', 'PRINCESS_SEAM'].includes(operation?.type)) {
    const retired = Object.values(entities).find(e => e.kind === 'feature' && e.id === operation.refs.dart);
    const relation = after.relations.find(r => r.convertedFromDart === retired?.id);
    if (retired && relation) {
      const event = lineage.findLast(e => e.sourceId === retired.id);
      event.kind = 'converted'; event.outputs = [{ id: aliases.get(key('relation', null, relation.id)) }];
    }
  }
}

function decorateReferenceGeometry(after, update) {
  const { entities, aliases } = update;
  const decorate = (kind, p, value) => {
    const e = entities[aliases.get(key(kind, p, value.id))];
    return { ...value, entityId: e.id, name: e.name };
  };
  const pieces = after.pieces.map(p => new PatternPiece({ ...p,
    entityId: aliases.get(key('piece', null, p.id)),
    name: entities[aliases.get(key('piece', null, p.id))].name,
    edges: p.edges.map(e => decorate('edge', p.id, e)),
    attachmentLines: p.attachmentLines.map(e => decorate('edge', p.id, e)),
    darts: p.darts.map(d => decorate('feature', p.id, d)), features: p.features.map(f => decorate('feature', p.id, f)),
  }));
  // Resolve to current local geometry before decorating: topology can retire an
  // edge identity while intentionally retaining the local sewn fragment's name.
  return { pieces, assemblyRelations: (after.assemblyRelations ?? []).map(r => decorate('relation', null, r)), relations: after.relations.map(r => normalizeSewingRelation({ ...after, pieces },
    decorate('relation', null, mapSewingRelation(after, r, ref => ref)))) };
}

/** Partition identities before reconciling geometry; metadata never changes identity seeds. */
export function updateReferences(before, after, operation = null) {
  const update = createReferenceUpdate(before, operation, after.method?.id);
  applyPartitionEvents(after, update);
  reconcileReferenceRecords(after, operation, update);
  applyEntityMetadata(before, operation, update.entities);
  recordFeatureConversions(after, operation, update);
  const geometry = decorateReferenceGeometry(after, update);
  const { prior, entities, lineage, minted } = update;
  const { topologyChanges, pieceChanges, mergeChanges, ...clean } = after;
  const operations = [...(prior?.operations ?? [])];
  if (operation) operations.push({ id: operation.id, type: operation.type, group: operation.group ?? null,
    ...(operation.comment !== undefined ? { comment: operation.comment } : {}),
    inputIds: [...Object.values(operation.refs ?? {}), ...(operation.participants ?? []).flatMap(p => [p.pieceRef, ...p.segments.map(s => s.lineRef)]),
      ...[operation.sourceLineRef, operation.targetLineRef, operation.sourceRegionRef, operation.targetRegionRef].filter(Boolean)], createdIds: [...minted],
    retiredIds: Object.values(entities).filter(e => e.retiredBy === operation.id).map(e => e.id) });
  return deepFreeze({ ...clean, ...geometry,
    referenceGraph: { version: REFERENCE_VERSION, entities, lineage, operations } });
}

export function validateReferences(pattern) {
  const graph = pattern.referenceGraph;
  if (!graph || graph.version !== REFERENCE_VERSION) throw new RangeError('参照グラフのバージョンが未対応です');
  const ids = new Set();
  for (const r of records(pattern)) {
    const id = r.item.entityId, e = graph.entities[id];
    if (!e || e.id !== id || e.status !== 'active' || e.kind !== r.kind || e.localId !== r.localId || e.localPiece !== r.localPiece || ids.has(id)) throw new RangeError(`参照グラフと形状が一致しません: ${id}`);
    ids.add(id);
  }
  if (Object.values(graph.entities).some(e => e.status === 'active' && !ids.has(e.id))) throw new RangeError('形状にない有効な参照があります');
  const sources = new Set();
  const incoming = new Map(Object.keys(graph.entities).map(id => [id, 0])), outgoing = new Map();
  for (const event of graph.lineage) {
    if (!graph.entities[event.sourceId] || graph.entities[event.sourceId].status !== 'retired' || sources.has(event.sourceId)) throw new RangeError('辺の変更履歴に重複・参照切れがあります');
    sources.add(event.sourceId);
    if (event.outputs.some(part => !graph.entities[part.id] || part.id === event.sourceId)) throw new RangeError('辺の変更先の参照が不正です');
    if (event.kind === 'partition' && event.outputs.some(p => !Number.isFinite(p.fromMm) || !Number.isFinite(p.toMm)
      || p.fromMm < 0 || p.toMm <= p.fromMm || p.toMm > event.sourceLengthMm + 0.001 || p.direction !== 1)) throw new RangeError('辺の対応区間が不正です');
    outgoing.set(event.sourceId, event.outputs.map(p => p.id));
    for (const p of event.outputs) incoming.set(p.id, incoming.get(p.id) + 1);
  }
  const queue = [...incoming].filter(([, count]) => count === 0).map(([id]) => id);
  let visited = 0;
  while (visited < queue.length) for (const id of outgoing.get(queue[visited++]) ?? []) {
    incoming.set(id, incoming.get(id) - 1); if (incoming.get(id) === 0) queue.push(id);
  }
  if (visited !== incoming.size) throw new RangeError('辺の変更履歴が循環しています');
  return true;
}
export function initializeReferences(pattern) {
  if (pattern.referenceGraph) {
    validateReferences(pattern);
    return pattern.relations.some(r => !r.participants) ? deepFreeze({ ...pattern,
      relations: pattern.relations.map(r => normalizeSewingRelation(pattern, r)) }) : pattern;
  }
  return updateReferences(null, pattern);
}

export function resolveReference(pattern, id, kind, position = null) {
  const graph = pattern.referenceGraph;
  const root = graph?.entities[id];
  if (!root || (kind && root.kind !== kind)) throw new TargetReferenceError('unknown-reference', id);
  let distance = null;
  if (position) {
    if (root.kind !== 'edge' || !Number.isFinite(position.value) || position.value < 0
      || (position.basis === 'arc_length_from_start' ? position.unit !== 'mm'
        : position.basis === 'ratio_from_start' ? position.unit !== 'ratio' || position.value > 1 : true)) throw new TypeError('位置には距離(mm)または比率(ratio、0〜1)の基準・単位・有限値が必要です');
    if (Object.keys(position).some(k => !['basis', 'unit', 'value'].includes(k))) throw new TypeError('位置に未対応の項目があります');
    distance = position.basis === 'ratio_from_start' ? position.value * root.lengthMm : position.value;
    if (distance > root.lengthMm + 1e-7) throw new RangeError('位置が辺の長さを超えています');
  }
  const queue = [{ entity: root, distance }], results = [], seen = new Set();
  while (queue.length) {
    const candidate = queue.shift(), e = candidate.entity;
    const marker = `${e.id}:${candidate.distance}`;
    if (seen.has(marker)) continue; seen.add(marker);
    if (e.status === 'active') { if (!kind || e.kind === kind) results.push(candidate); continue; }
    const event = graph.lineage.findLast(event => event.sourceId === e.id);
    for (const part of event?.outputs ?? []) {
      const child = graph.entities[part.id];
      if (!child || (kind && child.kind !== kind)) continue;
      let nextDistance = candidate.distance;
      if (nextDistance !== null) {
        if (!Number.isFinite(part.fromMm) || nextDistance < part.fromMm - 1e-7 || nextDistance > part.toMm + 1e-7) continue;
        const fraction = (nextDistance - part.fromMm) / (part.toMm - part.fromMm);
        nextDistance = Math.max(0, Math.min(child.lengthMm, fraction * child.lengthMm));
      }
      queue.push({ entity: child, distance: nextDistance });
    }
  }
  if (results.length !== 1) throw new TargetReferenceError(results.length ? 'ambiguous-reference' : 'missing-reference', id,
    results.map(r => ({ id: r.entity.id, name: r.entity.name, pieceId: r.entity.pieceId, distanceMm: r.distance })));
  return results[0];
}

/** Resolve canonical references, while accepting old local ids only as a migration adapter. */
export function bindOperation(pattern, input) {
  const result = structuredClone(input), refs = { ...(input.refs ?? {}) }, fields = referenceFields[input.type] ?? {};
  if (input.refs !== undefined && (!input.refs || typeof input.refs !== 'object' || Array.isArray(input.refs))) throw new TypeError('refsはオブジェクトです');
  if (Object.keys(refs).some(k => !['piece', ...Object.keys(fields)].includes(k))) throw new TypeError('未対応の参照フィールドです');
  const positions = { ...(input.positions ?? {}) };
  if (input.positions !== undefined && (!input.positions || typeof input.positions !== 'object' || Array.isArray(input.positions))) throw new TypeError('positionsはオブジェクトです');
  if (Object.keys(positions).some(k => !Object.values(fields).includes(k))) throw new TypeError('未対応の位置フィールドです');
  const entities = Object.values(pattern.referenceGraph.entities);
  const alias = (field, local) => entities.find(e => e.status === 'active' && e.kind === fieldKind(field) && e.localId === local
    && (['piece', 'otherPiece', 'relation'].includes(field) || e.localPiece === input.piece));
  if (!refs.piece) refs.piece = alias('piece', input.piece)?.id;
  if (!refs.piece) throw new TargetReferenceError('unknown-reference', input.piece);
  const resolved = [];
  for (const [field, distanceField] of Object.entries(fields)) {
    if (!refs[field]) refs[field] = alias(field, input[field])?.id;
    if (!refs[field]) throw new TargetReferenceError('unknown-reference', input[field] ?? field);
    if (distanceField && !positions[distanceField] && input[distanceField] !== undefined) positions[distanceField] = { basis: 'arc_length_from_start', unit: 'mm', value: input[distanceField] };
    let reference;
    try { reference = resolveReference(pattern, refs[field], fieldKind(field), distanceField ? positions[distanceField] : null); }
    catch (error) { error.message = `${field}${distanceField ? ` / ${distanceField}` : ''}: ${error.message}`; throw error; }
    result[field] = reference.entity.localId;
    if (distanceField && reference.distance !== null) result[distanceField] = reference.distance;
    resolved.push(reference.entity);
  }
  let p;
  try { p = resolveReference(pattern, refs.piece, 'piece').entity; }
  catch (error) {
    if (error.code !== 'ambiguous-reference') throw error;
    const ids = [...new Set(resolved.filter(e => e.pieceId).map(e => e.pieceId))];
    if (ids.length !== 1 || !error.candidates.some(c => c.id === ids[0])) throw error;
    p = pattern.referenceGraph.entities[ids[0]];
  }
  for (const e of resolved) if (e.pieceId && e.pieceId !== p.id) throw new TargetReferenceError('wrong-piece', e.id);
  result.piece = p.localId;
  result.refs = refs;
  if (['ADD_RELATION', 'UPDATE_RELATION'].includes(input.type)) {
    result.participants = input.participants.map(participant => {
      const owner = resolveReference(pattern, participant.pieceRef, 'piece').entity;
      const segments = participant.segments.map(segment => {
        const line = resolveReference(pattern, segment.lineRef, 'edge').entity;
        if (line.pieceId !== owner.id) throw new TargetReferenceError('wrong-piece', line.id);
        return { ...segment, lineRef: line.id };
      });
      return { ...participant, pieceRef: owner.id, segments };
    });
    if (!result.participants.some(participant => participant.pieceRef === p.id)) throw new TargetReferenceError('wrong-piece', p.id);
  }
  if (input.type === 'SET_PIECE_PLACEMENT') {
    for (const [field, ownerId] of [['sourceLineRef', p.id], ['targetLineRef', refs.otherPiece]]) {
      const line = resolveReference(pattern, input[field], 'edge').entity;
      if (line.pieceId !== ownerId) throw new TargetReferenceError('wrong-piece', line.id);
      result[field] = line.id;
    }
  }
  if (['SET_PIECE_PLACEMENT','SET_OVERLAP_RELATION'].includes(input.type)) {
    for (const [field, ownerId] of [['sourceRegionRef',p.id],['targetRegionRef',refs.otherPiece]]) if (input[field]) {
      const line = resolveReference(pattern, input[field], 'edge').entity;
      if (line.pieceId !== ownerId) throw new TargetReferenceError('wrong-piece', line.id);
      result[field] = line.id;
    }
  }
  if (Object.keys(positions).length) result.positions = positions;
  return result;
}
