export { operationTypes } from './operation-definitions.js';
import { Line } from '../core/geometry.js';
import { sewingSides, relationRefs } from './sewing.js';
import { isRelationOperation, relationEditReason, relationUpdateReason } from './operations-relations.js';
import { fabricInstances } from './fabric-instances.js';

export const straightEdge = edge => edge.path.segments.length === 1 && edge.path.segments[0] instanceof Line;
export const attachedFeature = (piece, edge) => piece.features.find(f => f.id === edge.id || f.edges?.includes(edge.id));
export const dartLeg = (piece, edge) => piece.darts.some(d => [d.legA, d.legB].includes(edge.id));
export function editablePieceReason(piece) {
  if (piece.features.length) return '展開・折り構造を作る前の手順で輪郭を変更してください';
  if (piece.drafting.derivedFrom) return '付属パーツの寸法は生成操作で変更してください';
  return '';
}

/** Shared by AI eligibility and execution; dimensions are checked separately. */
export function rectanglePanelReason(piece, { verticalGrain = false } = {}) {
  if (piece.darts.length || piece.features.length || piece.notches.length || piece.drafting.derivedFrom)
    return 'ダーツ・展開・合印のない独立パネルが必要です';
  if (piece.edges.length !== 4 || piece.edges.some(e => !straightEdge(e)
      || Math.abs(e.path.start.x - e.path.end.x) > 1e-7 && Math.abs(e.path.start.y - e.path.end.y) > 1e-7))
    return '軸に平行な長方形パネルを指定してください';
  if (verticalGrain && Math.abs(piece.grainline.start.x - piece.grainline.end.x) > 1e-7)
    return '縦地の目の長方形パネルを指定してください';
  return '';
}

export const eligibleEdges = (type, piece) => piece.edges.filter(edge => !edgeOperationReason(type, piece, edge));

/** A slit requires a single straight, unnotched seam on each side. Chains are unsupported. */
export function slitRelationReason(stored, piece, pattern = { pieces: [piece] }) {
  if (stored.participants && (stored.participants.length !== 2 || stored.participants.some(p => p.fit.mode !== 'plain' || p.segments.some(s => s.range.mode !== 'whole')))) return '開きは二辺全体の通常縫合のみ対応しています';
  const relation = sewingSides(pattern, stored);
  if (!relation || relation.a.piece !== piece.id || relation.b.piece !== piece.id) return '同一パーツの縫合関係を指定してください';
  if (relation.ease.min !== 0 || relation.ease.max !== 0) return '開きはいせ量ゼロの縫合のみ対応しています';
  if (!['same', 'opposite'].includes(relation.direction)) return '縫合方向が未確定です。元の操作から作り直してください';
  for (const id of [relation.a.edge, relation.b.edge]) {
    const edge = piece.edges.find(e => e.id === id);
    if (!edge || !straightEdge(edge) || piece.notches.some(n => n.edgeId === id)) return '合印のない直線の縫合辺が必要です';
    if (edge.path.length() <= 1.1) return '開きの後に縫合長を1 mmより長く残せる辺が必要です';
  }
  return '';
}

export const slitRelations = (pattern, piece) => pattern.relations.filter(relation => !slitRelationReason(relation, piece, pattern));

/** Candidates include reasons for AI clients; forms may display only eligible targets. */
export function operationTargets(type, field, pattern, piece) {
  if (type === 'REMOVE_ASSEMBLY_RELATION' && field === 'relation') return (pattern.assemblyRelations ?? [])
    .filter(r => [r.fromPieceRef, r.toPieceRef].includes(piece.entityId)).map(target => ({ target, reason: '' }));
  if (['SET_PIECE_PLACEMENT', 'SET_OVERLAP_RELATION'].includes(type) && field === 'otherPiece') return pattern.pieces.filter(p => p !== piece || fabricInstances(p).length>1).map(target => ({ target, reason: '' }));
  if (isRelationOperation(type) && field === 'relation') return pattern.relations
    .filter(r => relationRefs(pattern, r).some(ref => ref.piece === piece.id))
    .map(target => ({ target, reason: type === 'UPDATE_RELATION' ? relationUpdateReason(pattern, target) : relationEditReason(pattern, target) }));
  if(field==='otherPiece')return pattern.pieces.filter(p=>p.id!==piece.id).map(target=>({target,reason:target.splitFrom===piece.splitFrom?'':'同じ型紙から分割したパーツが必要です'}));
  if(type==='MERGE_PIECES'&&field==='relation')return pattern.relations.filter(stored=>{const r=sewingSides(pattern,stored);return !Array.isArray(r.a)&&!Array.isArray(r.b)&&r.a.piece!==r.b.piece&&[r.a.piece,r.b.piece].includes(piece.id);}).map(target=>({target,reason:''}));
  if (field === 'entity') return [piece, ...piece.edges, ...piece.darts, ...piece.features].map(target => ({ target, reason: '' }));
  if (field === 'dart') return piece.darts.map(target => ({ target, reason: '' }));
  if (field === 'relation') return slitRelations(pattern, piece).map(target => ({ target, reason: '' }));
  return piece.edges.map(target => ({ target, reason: field === 'pivotEdge'
    ? (piece.features.some(f => f.id === target.id) ? '展開口の途中は支点にできません' : '')
    : edgeOperationReason(type, piece, target) }));
}

/** Eligibility depends on current constraints, never merely on the edge's origin. */
export function edgeOperationReason(type, piece, edge) {
  if (isRelationOperation(type) && piece.attachmentLines.includes(edge) && (edge.role !== 'attachment' || edge.path.closed)) return '縫合には開いた取付線を指定してください';
  if (['SPLIT_PIECE', 'PRINCESS_SEAM'].includes(type) && piece.attachmentLines.length) return '内部取付線を作る前の操作で分割してください';
  if (isRelationOperation(type)) return edge.role === 'fold' ? '先にわを開いてください' : dartLeg(piece, edge) ? 'ダーツの脚は元の操作で編集してください'
    : attachedFeature(piece, edge) && attachedFeature(piece, edge).type !== 'pleats' ? '開き・展開口の構造線は未対応です' : '';
  if (piece.features.some(f => f.type === 'pleats') && type !== 'ADD_NOTCH') return 'プリーツ展開より前の手順で輪郭を変更してください';
  if (type === 'ADD_NOTCH' && dartLeg(piece, edge)) return 'ダーツの脚への合印は対応していません';
  if (type === 'SET_EDGE_ALLOWANCE' && dartLeg(piece, edge)) return 'ダーツ脚ではなく裁断外周の辺を選んでください';
  if (type === 'DISTRIBUTE_DART') type = 'PIVOT_DART';
  if (type === 'PRINCESS_SEAM') type = 'SPLIT_PIECE';
  if (type === 'OPEN_FOLD' && edge.role !== 'fold') return 'わの辺を選んでください';
  if (type === 'REDRAW_EDGE' && (edge.role === 'fold' || dartLeg(piece, edge))) return 'わ・ダーツの脚以外を選んでください';
  if (type === 'EXTEND_HEM' && (!straightEdge(edge) || Math.abs(edge.path.start.y - edge.path.end.y) > 1e-7 || Math.abs(edge.path.start.y - piece.boundary.bounds().maxY) > 1e-7)) return '最下端の水平な辺を選んでください';
  if (type === 'EXTEND_HEM') {
    const adjacent = piece.edges.filter(e => e !== edge && [e.path.start, e.path.end].some(p => p.distanceTo(edge.path.start) < 1e-7 || p.distanceTo(edge.path.end) < 1e-7));
    if (adjacent.length !== 2 || adjacent.some(e => !straightEdge(e))) return '裾の両隣には直線の辺が必要です';
  }
  if (['CREATE_FACING', 'CREATE_PLACKET'].includes(type) && edge.role !== 'open') return '開いた辺を選んでください';
  if (type === 'CREATE_PLACKET' && !straightEdge(edge)) return '直線の前開きを選んでください';
  const feature = attachedFeature(piece, edge);
  const notched = piece.notches.some(n => n.edgeId === edge.id);
  if (['ADD_DART', 'SLASH_SPREAD'].includes(type)) {
    if (edge.role !== 'open') return '新しい取り込み・展開口は開いた辺に作ります。縫合辺にはダーツ移動を使えます';
    if (notched) return 'この操作は合印のある辺の取り込みに未対応です';
    if (feature) return '展開口・開きの寸法制約を分割して引き継ぐ処理が未対応です';
  }
  if (type === 'RESHAPE') {
    if (edge.role !== 'open') return '縫合辺のカーブ変更には相手側との長さ調整が必要です';
    if (feature?.type === 'slit') return '開きの両側の長さを同時に調整する処理が必要です';
  }
  if (['PIVOT_DART', 'SPLIT_PIECE'].includes(type)) {
    if (dartLeg(piece, edge)) return 'ダーツの脚です。通常の縫合へ変換してから操作できます';
    if (feature) return '展開口・開きの制約を引き継ぐこの操作は未対応です';
    if (type === 'PIVOT_DART' && edge.role === 'fold') return '「わ」をダーツの口にすることはできません';
  }
  return '';
}

export function operationReason(type, pattern, piece) {
  if (type === 'SET_CUT_INSTANCES') return '';
  if (type === 'ADD_ATTACHMENT_LINE') return piece.features.length ? '折り構造のあるパーツへの内部線は未対応です' : '';
  if (['SET_PIECE_PLACEMENT', 'SET_OVERLAP_RELATION'].includes(type)) return pattern.pieces.length > 1 || fabricInstances(piece).length>1 ? '' : '異なる二つの布個体が必要です';
  if (type === 'REMOVE_ASSEMBLY_RELATION') return operationTargets(type, 'relation', pattern, piece).length ? '' : '解除できる配置または重なりがありません';
  if (isRelationOperation(type)) {
    if (type !== 'ADD_RELATION') return operationTargets(type, 'relation', pattern, piece).some(c => !c.reason) ? '' : '編集可能な縫合がありません';
    const available = p => [...p.edges, ...p.attachmentLines].some(e => !edgeOperationReason(type, p, e));
    return available(piece) && (fabricInstances(piece).length>1 || pattern.pieces.some(p => p !== piece && available(p))) ? '' : '別の布個体と接続できる線が必要です';
  }
  if (piece.cut.seamAllowances && !['ADD_SEAM_ALLOWANCE', 'SET_EDGE_ALLOWANCE', 'SET_EDGE_ALLOWANCES', 'SET_CUT_INSTANCES', 'ADD_NOTCH', 'RENAME_ENTITY', 'SET_ENTITY_SEMANTICS'].includes(type))
    return '輪郭加工の前に辺別縫い代を解除してください';
  if (['MOVE_VERTEX', 'EXTEND_HEM', 'REDRAW_EDGE', 'ADJUST_DART', 'PRINCESS_SEAM', 'OPEN_FOLD'].includes(type)) {
    const reason = editablePieceReason(piece);
    if (reason) return reason;
  }
  if(type==='MERGE_PIECES')return !piece.splitFrom||piece.features.length||piece.attachmentLines.length||!pattern.pieces.some(p=>p!==piece&&p.splitFrom===piece.splitFrom)?'内部取付線のない、同じ型紙から分割したパーツが必要です':'';
  if(type==='TRUE_DART_EDGE')return piece.darts.length&&!piece.features.length?'':'折り構造のないダーツ付き型紙が必要です';
  if(type==='PARALLEL_SPREAD')return rectanglePanelReason(piece);
  if(['SET_EDGE_ALLOWANCE','SET_EDGE_ALLOWANCES'].includes(type))return piece.darts.length>1?'辺別縫い代は1パーツに1本までのダーツに対応しています':'';
  if (piece.features.some(f => f.type === 'pleats') && !['ADD_NOTCH', 'ADD_SEAM_ALLOWANCE', 'REMOVE_PIECE', 'CREATE_RECTANGLE', 'RENAME_ENTITY', 'SET_ENTITY_SEMANTICS'].includes(type)) return 'プリーツ展開より前の手順で加工してください';
  if (type === 'ADJUST_DART') return !piece.darts.length ? '対象のダーツがありません' : piece.features.length ? '展開より先にダーツを調整してください' : '';
  if (type === 'CREATE_PLEATS') return rectanglePanelReason(piece, { verticalGrain: true });
  if (type === 'CREATE_STAND_COLLAR') return pattern.pieces.some(p => !p.features.length && p.edges.some(e => e.role === 'open')) ? '' : '折り構造に使っていない開いた襟ぐりを指定してください';
  if (['CREATE_FACING','CREATE_PLACKET'].includes(type)) return piece.features.length || !piece.edges.some(e=>!edgeOperationReason(type,piece,e)) ? '対応する開いた辺がありません' : '';
  if (type === 'DISTRIBUTE_DART') return operationReason('PIVOT_DART', pattern, piece);
  if (['SET_DART_TIP', 'PRINCESS_SEAM'].includes(type)) return !piece.darts.length ? '対象のダーツがありません' : piece.features.length ? '展開・折り構造より先に加工してください' : '';
  if (type === 'OPEN_FOLD') return piece.cut.onFold && piece.edges.filter(e => e.role === 'fold').length === 1 ? '' : 'わの辺が1本のパーツを指定してください';
  if (type === 'REMOVE_PIECE') return pattern.pieces.length > 1 ? '' : '最後のパーツは外せません';
  if (['MOVE_VERTEX', 'EXTEND_HEM', 'REDRAW_EDGE'].includes(type)) return piece.edges.some(e => !edgeOperationReason(type, piece, e)) ? '' : '現在の制約で対象にできる辺がありません';
  if (['ADD_NOTCH', 'CREATE_RECTANGLE'].includes(type)) return '';
  const changed = piece.features.length || piece.darts.length;
  if (type === 'EXTEND') {
    if (piece.splitFrom) return '袖丈はパーツ分割より前の履歴で変更してください';
    if (piece.id !== 'sleeve' || !['bunka-old', 'bunka-new', 'doreme-new'].includes(pattern.method.id)) return '対応原型の袖が対象です';
    if (changed) return '展開・開き・ダーツより前の履歴で袖丈を変更してください';
    if (!['underarm-front', 'underarm-back'].every(id => { const e = piece.edges.find(e => e.id === id); return e && straightEdge(e) && e.path.start.x === e.path.end.x; })) return '垂直な直線の袖下が必要です';
  } else if (type === 'ADD_SEAM_ALLOWANCE') {
    if (piece.cut.onFold || piece.edges.some(e => e.role === 'fold')) return '「わ」のあるパーツの縫い代は未対応です';
    if (piece.darts.length > 1) return '閉じて展開する縫い代は1パーツに1本のダーツに対応しています';
  } else if (['SLASH_SPREAD', 'ADD_FLARE'].includes(type)) {
    if (type === 'ADD_FLARE' && piece.splitFrom) return '分割後は「切り開いて展開」を使ってください';
    if (type === 'ADD_FLARE' && (piece.id !== 'sleeve' || !['bunka-old', 'bunka-new', 'doreme-new'].includes(pattern.method.id))) return '対応原型の袖が対象です';
    if (piece.darts.length || piece.features.some(f => f.type !== 'slash-spread')) return '開き・ダーツより前に展開を追加してください';
    if (!piece.edges.some(e => !edgeOperationReason('SLASH_SPREAD', piece, e))) return '合印のない開いた辺が必要です';
  } else if (type === 'ADD_SLIT') {
    if (piece.darts.length) return 'ダーツ付きパーツへの開きは未対応です';
    if (piece.features.some(f => f.type === 'slit')) return '開きは1パーツにつき1回までです';
    if (!slitRelations(pattern, piece).length) return '同一パーツ内で、合印なし・直線・いせゼロの縫合が必要です';
  } else if (['ADD_DART', 'RESHAPE', 'SPLIT_PIECE', 'PIVOT_DART', 'CONVERT_DART_TO_SEAMS'].includes(type)) {
    if (['PIVOT_DART', 'CONVERT_DART_TO_SEAMS'].includes(type) && !piece.darts.length) return '先にダーツを追加してください';
    if (type !== 'CONVERT_DART_TO_SEAMS' && !piece.edges.some(e => !edgeOperationReason(type, piece, e))) return '現在の制約で対象にできる辺がありません';
  } else if (!['RENAME_ENTITY', 'SET_ENTITY_SEMANTICS'].includes(type)) return '未対応の操作です';
  return '';
}

export function assertOperationAvailable(type, pattern, piece) {
  const reason = operationReason(type, pattern, piece);
  if (reason) throw new RangeError(`${type}: ${reason}`);
}
