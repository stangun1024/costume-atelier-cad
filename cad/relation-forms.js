import { operationTargets, edgeOperationReason } from '../pattern/capabilities.js';
import { effectiveEdgeLength } from '../pattern/sewing.js';
import { isRelationOperation } from '../pattern/operations-relations.js';
import { sewingLines } from '../pattern/assembly-sewing.js';
import { fabricInstances } from '../pattern/fabric-instances.js';

export function relationEdgeChoices(pattern, pieceRef, relationId = null) {
  const piece = pattern.pieces.find(p => p.entityId === pieceRef || p.id === pieceRef);
  if (!piece) return [];
  return sewingLines(piece).filter(e => !edgeOperationReason('ADD_RELATION', piece, e));
}
export function relationDefault(type, pattern, piece) {
  if (!isRelationOperation(type)) return null;
  const op = { type, piece: piece.id };
  if (type !== 'ADD_RELATION') {
    const relation = operationTargets(type, 'relation', pattern, piece).find(c => !c.reason)?.target;
    op.relation = relation?.id ?? '';
    if (type === 'REMOVE_RELATION') return op;
    if (relation) return { ...op, kind: 'sew', name: relation.name ?? relation.note ?? relation.id,
      referenceParticipantId: relation.referenceParticipantId, participants: relation.participants.map(p => ({
        id: p.id, pieceRef: p.pieceRef, ...(p.instanceId ? {instanceId:p.instanceId} : {}), ...(p.face ? {face:p.face} : {}), segments: p.segments.map(s => ({ lineRef: s.lineRef, range: { ...s.range }, direction: s.direction ?? 'forward' })), fit: { ...p.fit },
      })), matchPoints: structuredClone(relation.matchPoints ?? []) };
  }
  const other = pattern.pieces.find(p => p.id !== piece.id && relationEdgeChoices(pattern, p.entityId).length)
    ?? (fabricInstances(piece).length > 1 ? piece : null);
  return { ...op, kind: 'sew', name: '縫合', referenceParticipantId: 'a', matchPoints: [], participants: [piece, other].map((p, i) => ({
    id: i === 0 ? 'a' : 'b', pieceRef: p?.entityId ?? '',
    segments: [{ lineRef: p ? relationEdgeChoices(pattern, p.entityId)[0]?.entityId ?? '' : '', range: { mode: 'whole' }, direction: i === 0 ? 'forward' : 'reverse' }], fit: { mode: 'plain' },
  })) };
}
export function relationForm(pattern, piece, op) {
  const fields = [];
  if (op.type !== 'ADD_RELATION') fields.push({ key: 'relation', label: '対象の縫合', type: 'select', options:
    operationTargets(op.type, 'relation', pattern, piece).filter(c => !c.reason).map(c => ({ value: c.target.id, label: c.target.name ?? c.target.note ?? c.target.id })) });
  if (op.type !== 'REMOVE_RELATION') {
    fields.push({ key: 'name', label: '縫合名', type: 'text', maxLength: 120 });
    fields.push({ key: 'referenceParticipantId', label: '長さの基準になる参加線', type: 'select', options: op.participants.map((p, i) => ({ value: p.id, label: `参加線${i + 1}` })) });
    op.participants.forEach((p, i) => {
      const owner = pattern.pieces.find(piece => piece.entityId === p.pieceRef);
      fields.push({key:`participants.${i}.instanceId`,label:`参加線${i+1}：裁断個体`,type:'select',optional:true,omitEmpty:true,
        options:[{value:'',label:'型紙全体（個体未指定）'},...(owner?fabricInstances(owner).map(x=>({value:x.id,label:x.name})):[])]},
        {key:`participants.${i}.face`,label:`参加線${i+1}：布の面`,type:'select',optional:true,omitEmpty:true,
          options:[{value:'',label:'未指定'},{value:'front',label:'表'},{value:'back',label:'裏'}]});
      const edges = relationEdgeChoices(pattern, p.pieceRef, op.relation);
      fields.push({ key: `participants.${i}.pieceRef`, label: `参加線${i + 1}：布${i === 0 ? '（計測の基準）' : ''}`, type: 'select', options:
        pattern.pieces.map(piece => ({ value: piece.entityId, label: piece.name })) },
      { key: `participants.${i}.segments.0.lineRef`, label: `参加線${i + 1}：縫い線`, type: 'select', options:
        edges.map(edge => { const owner = pattern.pieces.find(piece => piece.entityId === p.pieceRef);
          return { value: edge.entityId, label: `${edge.name ?? edge.id} · ${effectiveEdgeLength(owner, edge).toFixed(1)} mm` }; }) });
      fields.push({ key: `participants.${i}.segments.0.direction`, label: '縫合の進行方向', type: 'select', options: [
        { value: 'reverse', label: '終点→始点（基準線と反対方向）' }, { value: 'forward', label: '始点→終点（基準線と同方向）' },
      ] });
      fields.push({ key: `participants.${i}.segments.0.range.mode`, label: '縫う範囲', type: 'select', options: [{ value: 'whole', label: '線全体' }, { value: 'interval', label: '途中の区間' }] });
      if (p.segments[0].range.mode === 'interval') for (const [key, label] of [['startMm', '開始'], ['endMm', '終了']]) fields.push({ key: `participants.${i}.segments.0.range.${key}`, label: `${label}：線の元の始点から (mm)`, type: 'number', min: 0, max: 20000, step: 0.1 });
      if (p.id !== op.referenceParticipantId) {
        fields.push({ key: `participants.${i}.fit.mode`, label: '長さの差の意図', type: 'select', options: [{ value: 'plain', label: '通常縫合（差を許可しない）' }, { value: 'ease', label: 'いせ込み' }, { value: 'gather', label: 'ギャザー' }, { value: 'stretch', label: '伸ばし付け' }] });
        if (p.fit.mode !== 'plain') {
          fields.push({ key: `participants.${i}.fit.amountMm`, label: `${p.fit.mode === 'stretch' ? '伸ばす' : '縮める'}量 (mm)`, type: 'number', min: 0.001, max: 20000, step: 0.1 });
          if (op.matchPoints?.length) for (let j = 0; j <= op.matchPoints.length; j++) fields.push({ key: `participants.${i}.fit.intervalAmountsMm.${j}`, label: `参加線${i + 1}の区間${j + 1}：加工量 (mm)`, type: 'number', min: 0, max: 20000, step: 0.1 });
        }
      }
      if (p.segments.length > 1) fields.push({ key: `participants.${i}.segments`, label: '連続する線の区間一覧（JSON）', type: 'text', json: true, maxLength: 20000 });
    });
    for (const [j, point] of (op.matchPoints ?? []).entries()) {
      fields.push({ key: `matchPoints.${j}.id`, label: `対応点${j + 1}の名前`, type: 'text', maxLength: 120 });
      op.participants.forEach((p, i) => fields.push({ key: `matchPoints.${j}.positionsMm.${p.id}`, label: `対応点${j + 1}：参加線${i + 1}の縫合方向の始点から (mm)`, type: 'number', min: 0, max: 20000, step: 0.1 }));
    }
  }
  return { note: '一つの縫合に2〜16枚の参加線を登録できます。裁断個体・表裏・外周または内部取付線・部分区間を指定。通常は同長、いせ等は対象の布と加工量を明示。左右未指定の型紙全体の関係から右だけを推定しません。同一個体の重複縫いは未対応です。', fields };
}
export function changeRelationSelection(operation, pattern, piece, key, value, raw) {
  if (!isRelationOperation(operation.type)) return null;
  if (key === 'relation' && operation.type === 'UPDATE_RELATION') {
    const relation = pattern.relations.find(r => r.id === value);
    const next = relationDefault(operation.type, { ...pattern, relations: [relation, ...pattern.relations.filter(r => r !== relation)] }, piece);
    next.id = operation.id; next.group = operation.group; next.comment = operation.comment;
    return { operation: next, values: {} };
  }
  const next = structuredClone(operation), values = { ...raw, [key]: value };
  for (const [field, rawValue] of Object.entries(raw)) {
    const parts = field.split('.');
    if (field !== 'matchPoints' && !field.endsWith('.intervalAmountsMm') && !field.endsWith('.segments')) {
      const target = parts.slice(0, -1).reduce((o, k) => o[k] ??= {}, next);
      target[parts.at(-1)] = typeof rawValue === 'string' && (/\.(startMm|endMm|amountMm)$/.test(field) || field.includes('.positionsMm.') || /\.intervalAmountsMm\.\d+$/.test(field)) ? Number(rawValue) : rawValue;
    } else { try { const target = parts.slice(0, -1).reduce((o, k) => o[k] ??= {}, next); target[parts.at(-1)] = JSON.parse(rawValue); } catch { /* readOperation reports invalid JSON on save. */ } }
  }
  const match = key.match(/^participants\.(\d+)\.pieceRef$/);
  if (match) {
    const i = Number(match[1]);
    next.participants[i].pieceRef = value;
    delete next.participants[i].instanceId; delete next.participants[i].face;
    delete values[`participants.${i}.instanceId`]; delete values[`participants.${i}.face`];
    next.participants[i].segments[0].lineRef = relationEdgeChoices(pattern, value, operation.relation)[0]?.entityId ?? '';
    values[`participants.${i}.segments.0.lineRef`] = next.participants[i].segments[0].lineRef;
  } else if (/\.range\.mode$/.test(key)) {
    const i = Number(key.split('.')[1]), segment = next.participants[i].segments[0];
    segment.range = value === 'whole' ? { mode: 'whole' } : { mode: 'interval', startMm: 0, endMm: 10 };
    delete values[`participants.${i}.segments.0.range.startMm`]; delete values[`participants.${i}.segments.0.range.endMm`];
  } else if (/\.fit\.mode$/.test(key)) {
    const i = Number(key.split('.')[1]); next.participants[i].fit = value === 'plain' ? { mode: 'plain' } : { mode: value, amountMm: 1 };
    delete values[`participants.${i}.fit.amountMm`]; delete values[`participants.${i}.fit.intervalAmountsMm`];
  } else if (key === 'referenceParticipantId') {
    next.referenceParticipantId = value; next.participants.find(p => p.id === value).fit = { mode: 'plain' };
    const i = next.participants.findIndex(p => p.id === value);
    for (const k of Object.keys(values)) if (k.startsWith(`participants.${i}.fit.`)) delete values[k];
  } else if (key === 'relation') {
    next.relation = value;
    if (next.refs) delete next.refs.relation;
  }
  next.matchPoints ??= [];
  return { operation: next, values };
}
