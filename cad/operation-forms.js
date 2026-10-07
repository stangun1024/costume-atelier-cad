import { operationDefinitions } from '../pattern/operation-definitions.js';
import { CubicBezier } from '../core/geometry.js';
import { flattenPath } from '../core/path-tools.js';
import { eligibleEdges, slitRelations, operationReason } from '../pattern/capabilities.js';
import { referenceFields } from '../pattern/references.js';
import { authoringDefault, authoringForm } from './authoring-forms.js';
import { authoringDefinitions } from '../pattern/authoring-definitions.js';
import { sewingSides } from '../pattern/sewing.js';
import { isRelationOperation } from '../pattern/operations-relations.js';
import { changeRelationSelection } from './relation-forms.js';

export { operationNames } from './operation-labels.js';
const edgeNames = { neckline: '襟ぐり', shoulder: '肩線', armhole: '袖ぐり', side: '脇線', waist: 'ウエスト線',
  center: '中心線（わ）', cuff: '袖口', 'cap-front': '前袖山', 'cap-back': '後袖山',
  'underarm-front': '前袖下', 'underarm-back': '後袖下' };
export function edgeName(id) {
  if (edgeNames[id]) return edgeNames[id];
  if (/-panel-\d+-join$/.test(id)) return '分割線（縫合）';
  const fragment = id.match(/(?:^|-)panel-\d+-(.+)-(\d+)$/);
  if (fragment) return `${edgeName(fragment[1])}（分割後 ${fragment[2]}）`;
  const pivot = id.match(/^pivot-point-(\d+)-remainder$/);
  if (pivot) return `支点 ${pivot[1]} で分けた辺の残り`;
  if (/^spread-\d+-remainder$/.test(id)) return '切開した辺の残り';
  if (/^spread-\d+$/.test(id)) return '展開で追加した辺';
  if (/^dart-\d+-in$/.test(id)) return 'ダーツの脚（入り側）';
  if (/^dart-\d+-out$/.test(id)) return 'ダーツの脚（戻り側）';
  if (/^dart-\d+-remainder$/.test(id)) return 'ダーツ追加元の辺の残り';
  if (/^pivot-\d+-remainder$/.test(id)) return 'ダーツ移動先の辺の残り';
  if (/^slit-\d+-[01]$/.test(id)) return `開き（${id.endsWith('-0') ? 'A' : 'B'}側）`;
  return id;
}
export const getValue = (object, key) => key.split('.').reduce((o, k) => o?.[k], object);
export function setValue(object, key, value) {
  const parts = key.split('.');
  const target = parts.slice(0, -1).reduce((o, k) => o[k] ??= {}, object);
  target[parts.at(-1)] = value;
}
const openEdges = piece => eligibleEdges('RESHAPE', piece);
const cutEdges = piece => eligibleEdges('SLASH_SPREAD', piece);
const dartEdges = piece => eligibleEdges('ADD_DART', piece);
const pivotTargets = piece => eligibleEdges('PIVOT_DART', piece);
const splitEdges = piece => eligibleEdges('SPLIT_PIECE', piece);

/** Structural eligibility only; exact geometry is still validated by the engine on every edit. */
export const unavailableReason = operationReason;

const numeric = (key, label, min, max, step = 0.1) => ({ key, label, min, max, step, type: 'number' });
const parameter = (type, key, label, step = 0.1) => {
  const spec = operationDefinitions[type].parameters[key];
  return numeric(key, label, spec.minimum, spec.maximum, step);
};
const choice = (key, label, values) => ({ key, label, type: 'select', options: values.map(e => ({ value: e.id, label: e.name ?? edgeName(e.id) })) });
const innerMax = path => Math.max(0.001, Math.floor((path.length() - 0.002) * 1000) / 1000);
const displayDefault = value => Math.round(value * 1000) / 1000;
export function spreadSign(piece) {
  const points = flattenPath(piece.boundary);
  const area = points.slice(1).reduce((sum, p, i) => sum + points[i].x * p.y - p.x * points[i].y, 0);
  return area > 0 ? -1 : 1;
}
export function edgeStartName(piece, id) {
  if (piece.id === 'sleeve' && id === 'cap-front') return '袖山の頂点（前袖山の始点）';
  const index = piece.edges.findIndex(e => e.id === id);
  const previous = piece.edges[(index + piece.edges.length - 1) % piece.edges.length];
  return `${edgeName(previous.id)}と${edgeName(id)}の接点`;
}

export function changeFormSelection(operation, piece, key, value, raw, pattern = null) {
  if (pattern) { const changed = changeRelationSelection(operation, pattern, piece, key, value, raw); if (changed) return changed; }
  const next = structuredClone(operation), values = { ...raw, [key]: value };
  setValue(next, key, value);
  if (next.refs && Object.hasOwn(referenceFields[operation.type] ?? {}, key)) delete next.refs[key];
  if (operation.type === 'SET_PIECE_PLACEMENT' && key === 'otherPiece' && pattern) {
    next.targetLineRef = pattern.pieces.find(p => p.id === value)?.edges[0]?.entityId ?? '';
    values.targetLineRef = next.targetLineRef;
  }
  if (['RENAME_ENTITY', 'SET_ENTITY_SEMANTICS'].includes(operation.type) && key === 'entity') {
    next.refs = { ...next.refs, entity: value };
    const target = [piece, ...piece.edges, ...piece.darts, ...piece.features].find(e => e.entityId === value);
    if (operation.type === 'RENAME_ENTITY') { next.name = target?.name ?? value; values.name = next.name; }
  }
  const distanceKey = operation.type === 'SPLIT_PIECE' ? ({ startEdge: 'startDistanceMm', endEdge: 'endDistanceMm' })[key]
    : ['ADD_DART', 'PIVOT_DART', 'SLASH_SPREAD'].includes(operation.type) && ['edge', 'targetEdge', 'cutEdge'].includes(key) ? 'distanceMm' : null;
  if (distanceKey) {
    next[distanceKey] = displayDefault(piece.edge(value).path.length() / 2);
    values[distanceKey] = String(next[distanceKey]);
    if (next.positions) delete next.positions[distanceKey];
  }
  if (operation.type === 'SLASH_SPREAD' && key === 'pivotEdge') { next.pivotDistanceMm = 0; values.pivotDistanceMm = '0'; if (next.positions) delete next.positions.pivotDistanceMm; }
  return { operation: next, values };
}

export function defaultOperation(type, pattern, piece) {
  if(authoringDefinitions[type])return authoringDefault(type,pattern,piece);
  const operation = { type, piece: piece.id };
  const preferred = (edges, id) => edges.find(e => e.id === id) ?? edges[0];
  switch (type) {
    case 'EXTEND': return { ...operation, amountMm: 0 };
    case 'ADD_SEAM_ALLOWANCE': return { ...operation, widthMm: piece.cut.seamAllowance || 10 };
    case 'RESHAPE': {
      const edge = preferred(openEdges(piece), 'cuff'), path = edge.path;
      const cubic = path.segments.length === 1 && path.segments[0] instanceof CubicBezier ? path.segments[0] : null;
      const c1 = cubic ? cubic.controlPoints[1] : path.start.lerp(path.end, 1 / 3);
      const c2 = cubic ? cubic.controlPoints[2] : path.start.lerp(path.end, 2 / 3);
      return { ...operation, edge: edge.id,
        control1Offset: { x: displayDefault(c1.x - path.start.x), y: displayDefault(c1.y - path.start.y) },
        control2Offset: { x: displayDefault(c2.x - path.end.x), y: displayDefault(c2.y - path.end.y) } };
    }
    case 'SLASH_SPREAD': {
      const cut = preferred(cutEdges(piece), piece.id === 'sleeve' ? 'cuff' : 'waist');
      const pivot = piece.edges.find(e => e.id === (piece.id === 'sleeve' ? 'cap-front' : 'shoulder')) ?? piece.edges.find(e => e.id !== cut.id);
      return { ...operation, pivotEdge: pivot.id, pivotDistanceMm: 0,
        cutEdge: cut.id, distanceMm: displayDefault(cut.path.length() / 2), angleDeg: 10 * spreadSign(piece) };
    }
    case 'ADD_FLARE': return { ...operation, amountMm: 80 };
    case 'ADD_SLIT': return { ...operation, relation: slitRelations(pattern, piece)[0].id, lengthMm: 60, from: 'end' };
    case 'ADD_DART': {
      const edge = preferred(dartEdges(piece), 'waist');
      return { ...operation, edge: edge.id, distanceMm: displayDefault(Math.min(80, edge.path.length() / 2)), widthMm: 20, depthMm: 80 };
    }
    case 'PIVOT_DART': return { ...operation, dart: piece.darts[0].id, targetEdge: preferred(pivotTargets(piece), 'neckline').id, distanceMm: 20 };
    case 'CONVERT_DART_TO_SEAMS': return { ...operation, dart: piece.darts[0].id };
    case 'RENAME_ENTITY': {
      const edge = piece.edges[0];
      return { ...operation, entity: edge.entityId, refs: { piece: piece.entityId, entity: edge.entityId }, name: edge.name, nameSource: 'user' };
    }
    case 'SET_ENTITY_SEMANTICS': return { ...operation, entity: piece.edges[0].entityId,
      refs: { piece: piece.entityId, entity: piece.edges[0].entityId }, semantics: { anatomicalRegion: null, anatomicalSide: null }, semanticSource: 'user', confidence: null };
    case 'SPLIT_PIECE': {
      const edges = splitEdges(piece);
      const start = preferred(edges, piece.id === 'sleeve' ? 'underarm-front' : 'side');
      const end = preferred(edges.filter(e => e.id !== start.id), piece.id === 'sleeve' ? 'underarm-back' : 'center');
      return { ...operation, startEdge: start.id, startDistanceMm: displayDefault(start.path.length() / 2),
        endEdge: end.id, endDistanceMm: displayDefault(end.path.length() / 2) };
    }
  }
}

export function describeForm(pattern, piece, op) {
  if(authoringDefinitions[op.type])return authoringForm(pattern,piece,op);
  switch (op.type) {
    case 'SET_ENTITY_SEMANTICS': return { note: '意味の属性を記録します。未確定の項目は空欄・未指定にしてください。AIの推測とユーザーが確認した情報を区別します。', fields: [
      choice('entity', '意味を設定する対象', [piece, ...piece.edges, ...piece.darts, ...piece.features].map(e => ({ id: e.entityId, name: e.name }))),
      { key: 'semantics.anatomicalRegion', label: '衣服上の部位（任意）', type: 'text', maxLength: 120, optional: true },
      choice('semantics.anatomicalSide', '衣服上の方向', [{ id: 'unspecified', name: '未指定' }, { id: 'toward_side_seam', name: '脇側' }, { id: 'toward_center', name: '中心側' },
        { id: 'toward_neckline', name: '襟ぐり側' }, { id: 'wearer_left', name: '着用者の左側' }, { id: 'wearer_right', name: '着用者の右側' }]),
      choice('semanticSource', '情報の確定状態', [{ id: 'user', name: 'ユーザー確認済み' }, { id: 'ai', name: 'AIの推測' }]),
      { ...numeric('confidence', '確信度（任意、0〜1）', 0, 1, 0.01), optional: true }] };
    case 'RENAME_ENTITY': return { note: '名前を変えても固定IDと操作の参照先は変わりません。名前は120文字以内です。', fields: [
      choice('entity', '名前を変更する対象', [piece, ...piece.edges, ...piece.darts, ...piece.features].map(e => ({ id: e.entityId, name: e.name }))),
      { key: 'name', label: '名前', type: 'text', maxLength: 120 }] };
    case 'EXTEND': {
      const min = Math.max(300, Math.floor(2 * (pattern.dimensions.sleeve.capHeight - 25)) + 1);
      return { note: '仕上がりの設計袖丈を指定します。身体の腕丈は変わりません。', fields: [numeric('sleeveLength', '設計袖丈 (mm)', min, 800, 1)] };
    }
    case 'ADD_SEAM_ALLOWANCE': return { note: '全周の縫い代を設定します。0で解除。後続の輪郭変更に追従します。', fields: [parameter('ADD_SEAM_ALLOWANCE', 'widthMm', '縫い代幅 (mm)')] };
    case 'RESHAPE': return { note: '端点を固定したカーブです。制御点の位置は各端点からの距離で、右・下が正方向です。',
      fields: [choice('edge', '変更する辺', openEdges(piece)), ...['control1Offset', 'control2Offset'].flatMap((key, i) =>
        [numeric(`${key}.x`, `${i ? '終点' : '始点'}側 制御点 X (mm)`), numeric(`${key}.y`, `${i ? '終点' : '始点'}側 制御点 Y (mm)`)])] };
    case 'SLASH_SPREAD': {
      const sign = spreadSign(piece);
      return { note: `${piece.name}の操作です。赤点が固定する支点、橙の破線が切開線、薄橙が回す側です（補助線を表示）。切開位置は「${edgeStartName(piece, op.cutEdge)}」から辺に沿って測ります。切開する辺を変えると位置は中央に戻ります。${sign < 0 ? '−5°より−20°' : '5°より20°'}のほうが大きく開きます。地の目を横切る切開は未対応です。`, fields: [
        choice('pivotEdge', '支点（固定する点）', piece.edges.filter(e => e.id !== op.cutEdge).map(e => ({ id: e.id, name: edgeStartName(piece, e.id) }))),
        numeric('pivotDistanceMm', '支点辺の始点からの位置 (mm、0で始点)', 0, innerMax(piece.edge(op.pivotEdge).path)),
        choice('cutEdge', '切開する辺', cutEdges(piece).filter(e => e.id !== op.pivotEdge)),
        numeric('distanceMm', '辺の始点からの切開位置 (mm)', 0.001, innerMax(piece.edge(op.cutEdge).path)),
        numeric('angleDeg', '展開角度 (度、外へ開く向き)', sign < 0 ? -60 : 0.01, sign < 0 ? -0.01 : 60)] };
    }
    case 'ADD_FLARE': return { note: '袖口中央の切開で開く幅です。完成した袖口の水平幅とは異なります。', fields: [parameter('ADD_FLARE', 'amountMm', 'フレアの開き幅 (mm)')] };
    case 'ADD_SLIT': {
      const relation = sewingSides(pattern, pattern.relations.find(r => r.id === op.relation));
      const max = Math.min(300, ...[relation.a.edge, relation.b.edge].map(id => Math.floor((piece.edge(id).path.length() - 1.001) * 1000) / 1000));
      return { note: '縫合の両側を同じ長さだけ開きます。袖口側は「終点側」です。', fields: [
        choice('relation', '開く縫合', slitRelations(pattern, piece).map(r => ({ id: r.id, name: r.note ?? r.id }))),
        choice('from', '基準辺のどちらから開くか', [{ id: 'end', name: '終点側' }, { id: 'start', name: '始点側' }]), numeric('lengthMm', '開きの長さ (mm)', 0.1, max)] };
    }
    case 'ADD_DART': return { note: '曲線にも複数追加できます。位置と幅は辺に沿った距離、深さは口の両端を結ぶ線から頂点までの距離です。地の目線と重なる場合は、向きを保って地の目線を自動配置します。肩・脇に配置するときは追加後に「ダーツを移動」を使います。', fields: [
      choice('edge', '追加する辺', dartEdges(piece)), numeric('distanceMm', 'ダーツ中心位置 (mm)', 0.001, innerMax(piece.edge(op.edge).path)),
      parameter('ADD_DART', 'widthMm', 'ダーツ幅 (mm)'), parameter('ADD_DART', 'depthMm', 'ダーツの深さ (mm)')] };
    case 'PIVOT_DART': return { note: '頂点と角度量を維持して移動します。移動先の幅は位置に応じて変わります。切開線が地の目線を横切る場合は、固定側の向きを保って地の目線を自動配置します。', fields: [
      choice('dart', '移動するダーツ', piece.darts.map((d, i) => ({ id: d.id, name: `ダーツ ${i + 1}` }))),
      choice('targetEdge', '移動先の辺（肩・脇も選択可）', pivotTargets(piece)), numeric('distanceMm', '移動先の始点からの位置 (mm)', 0.001, innerMax(piece.edge(op.targetEdge).path))] };
    case 'CONVERT_DART_TO_SEAMS': return { note: '形状と脚同士の縫合を保ち、ダーツの角度制約を通常の等長縫合へ変換します。その後は脚へのパーツ分割などが可能です。元のダーツへ戻すにはUndoを使います。',
      fields: [choice('dart', '変換するダーツ', piece.darts.map(d => ({ id: d.id, name: d.name ?? d.id })))] };
    case 'SPLIT_PIECE': return { note: '輪郭上の2点を直線または曲線で結び、2パーツに分割します。同じ辺の2点も指定できます。0は辺の始点です。分割線に縫合関係を作り、不要な側は結果を確認して削除します。ダーツを横切る線・内部線付きパーツは未対応です。', fields: [
      choice('startEdge', '分割線の始点を置く辺', splitEdges(piece)), numeric('startDistanceMm', '始点：辺に沿った位置 (mm)', 0, innerMax(piece.edge(op.startEdge).path)),
      choice('endEdge', '分割線の終点を置く辺', splitEdges(piece)), numeric('endDistanceMm', '終点：辺に沿った位置 (mm)', 0, innerMax(piece.edge(op.endEdge).path)),
      {key:'segments',label:'曲線の区間（空欄は直線）',type:'text',json:true,optional:true,maxLength:20000}] };
  }
}

export function formValues(operation, pattern) {
  const values = structuredClone(operation);
  if(operation.type==='ADD_ATTACHMENT_LINE'){values.purpose??='attachment';values.closed??=false;}
  for(const [key,s] of Object.entries(authoringDefinitions[operation.type]?.parameters??{})){
    if(s.type==='array' && !isRelationOperation(operation.type))values[key]=JSON.stringify(values[key]);
    if(s.type==='boolean')values[key]=String(values[key]);
  }
  if (['RENAME_ENTITY', 'SET_ENTITY_SEMANTICS'].includes(operation.type)) values.entity = operation.refs.entity;
  if (operation.type === 'SET_ENTITY_SEMANTICS') {
    values.semantics.anatomicalSide ??= 'unspecified'; values.semantics.anatomicalRegion ??= ''; values.confidence ??= '';
  }
  if (operation.type === 'SLASH_SPREAD') values.pivotDistanceMm ??= 0;
  if(['ADD_ATTACHMENT_LINE','SPLIT_PIECE'].includes(operation.type))values.segments=operation.segments?JSON.stringify(operation.segments):'';
  if (operation.type === 'EXTEND') values.sleeveLength = pattern.design.sleeveLength + operation.amountMm;
  return values;
}

export function readOperation(operation, pattern, fields, rawValues) {
  const result = structuredClone(operation);
  const fieldErrors = {};
  for (const field of fields) {
    const raw = rawValues[field.key];
    if (field.omitEmpty && (raw === undefined || raw === null || raw === '')) {
      const keys = field.key.split('.'), owner = keys.slice(0,-1).reduce((o,k) => o?.[k], result);
      if (owner) delete owner[keys.at(-1)];
      continue;
    }
    if (field.type === 'text') {
      if(field.json){if(field.optional&&(raw===undefined||raw===null||String(raw).trim()==='')){delete result[field.key];continue;}try{setValue(result,field.key,JSON.parse(raw));}catch{fieldErrors[field.key]=`${field.label}のJSONが不正です`;}continue;}
      if (field.optional && (raw === '' || raw === null)) { setValue(result, field.key, null); continue; }
      if (typeof raw !== 'string' || !raw.trim() || raw.length > field.maxLength) fieldErrors[field.key] = `${field.label}を1〜${field.maxLength}文字で入力してください`;
      else { setValue(result, field.key, raw); if (operation.type === 'RENAME_ENTITY' && field.key === 'name' && raw !== operation.name) result.nameSource = 'user'; }
      continue;
    }
    if (field.type === 'select') {
      if (!field.options.some(o => o.value === raw)) fieldErrors[field.key] = `${field.label}を選んでください`;
      else setValue(result, field.key, field.boolean ? raw === 'true' : field.key === 'semantics.anatomicalSide' && raw === 'unspecified' ? null : raw);
      continue;
    }
    if (field.optional && raw === '') { setValue(result, field.key, null); continue; }
    const value = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
    if (!Number.isFinite(value)) fieldErrors[field.key] = `${field.label}を数値で入力してください`;
    else if ((field.min !== undefined && value < field.min) || (field.max !== undefined && value > field.max))
      fieldErrors[field.key] = `${field.label}は${field.min ?? '制限なし'}〜${field.max ?? '制限なし'}の範囲です`;
    else if (operation.type === 'SLASH_SPREAD' && field.key === 'angleDeg' && Math.abs(value) < 0.01)
      fieldErrors[field.key] = '展開角度の絶対値は0.01度以上にしてください';
    else if (field.key === 'sleeveLength') result.amountMm = value - pattern.design.sleeveLength;
    else {
      setValue(result, field.key, value);
      for (const [refField, positionField] of Object.entries(referenceFields[operation.type] ?? {})) {
        if (positionField === field.key && value !== getValue(operation, field.key)) {
          if (result.positions) delete result.positions[positionField];
          if (result.refs) delete result.refs[refField];
        }
      }
    }
  }
  if (Object.keys(fieldErrors).length) {
    const error = new RangeError(Object.values(fieldErrors).join('。'));
    error.fieldErrors = fieldErrors;
    throw error;
  }
  if (isRelationOperation(result.type) && result.participants?.length) {
    result.refs = { ...result.refs, piece: result.participants[0].pieceRef };
    delete result.piece;
    if (result.refs.relation && result.relation !== operation.relation) delete result.refs.relation;
  }
  return result;
}
