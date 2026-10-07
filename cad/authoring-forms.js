import { authoringDefinitions } from '../pattern/authoring-definitions.js';
import { operationTargets } from '../pattern/capabilities.js';
import { isRelationOperation } from '../pattern/operations-relations.js';
import { relationDefault, relationForm } from './relation-forms.js';
import { sewingLines } from '../pattern/assembly-sewing.js';
import { fabricInstances } from '../pattern/fabric-instances.js';

const labels={endpoint:'動かす端',offset:'移動量',amountMm:'丈・展開量 (mm)',widthChangeMm:'パーツの裾幅増減 (mm)',
  control1Offset:'始点側の制御点',control2Offset:'終点側の制御点',ratio:'移動する割合 (0〜1)',setbackMm:'展開中心から縫い止まりまで (mm)',
  widthMm:'幅 (mm)',depthMm:'深さ (mm)',heightMm:'高さ (mm)',quantity:'裁断枚数',name:'パーツ名',count:'本数',
  spacingMm:'間隔 (mm)',firstOffsetMm:'最初の位置 (mm)',direction:'折る方向',necklineIds:'襟ぐりの固定ID一覧（JSON）',necklineDirections:'襟ぐりをたどる方向の一覧（1または-1、JSON）',
  overlapMm:'重なり (mm)',onFold:'後中心をわにする',side:'見返しを作る側',finishedWidthMm:'仕上がり幅 (mm)',
  turnUnderMm:'端の折り込み (mm)',buttonSpacingMm:'ボタン間隔 (mm)',endMarginMm:'端の余白 (mm)',positionMm:'切開位置 (mm)',widths:'辺別の縫い代（JSON）'};
export function authoringDefault(type,pattern,piece){
  if(isRelationOperation(type))return relationDefault(type,pattern,piece);
  const d=authoringDefinitions[type];if(!d)return null;
  const op={type,piece:piece.id,comment:d.label};
  if (type === 'SET_CUT_INSTANCES') return { ...op, instances: structuredClone(fabricInstances(piece)) };
  if (type === 'SET_EDGE_ALLOWANCE') {
    const edge = operationTargets(type,'edge',pattern,piece).find(c=>!c.reason)?.target;
    return { ...op, edge: edge?.id ?? '', widthMm: piece.cut.seamAllowances?.[edge?.id] ?? piece.cut.seamAllowance ?? 0 };
  }
  if (type === 'ADD_ATTACHMENT_LINE') {
    const b = piece.boundary.bounds(), x = (b.minX + b.maxX) / 2, y = (b.minY + b.maxY) / 2;
    return { ...op, name: '内部線', start: { x: x - 10, y }, end: { x: x + 10, y }, purpose: 'attachment', closed: false };
  }
  if (['SET_PIECE_PLACEMENT', 'SET_OVERLAP_RELATION'].includes(type)) {
    const other = pattern.pieces.find(p => p !== piece) ?? (fabricInstances(piece).length > 1 ? piece : null);
    return { ...op, otherPiece: other?.id ?? '', name: type === 'SET_PIECE_PLACEMENT' ? '取付位置' : '表側の重なり',
      ...(type === 'SET_PIECE_PLACEMENT' ? { sourceLineRef: sewingLines(piece)[0]?.entityId ?? '', targetLineRef: other ? sewingLines(other)[0]?.entityId ?? '' : '',
        sourceDistanceMm: 0, targetDistanceMm: 0, offsetMm: { x: 0, y: 0 }, rotationDeg: 0 } : {}) };
  }
  for(const [field,distance] of Object.entries(d.references)){
    const candidates=operationTargets(type,field,pattern,piece).filter(c=>!c.reason),target=candidates[0]?.target;
    op[field]=target?.id??'';if(distance)op[distance]=target?.path?target.path.length()/2:0;
  }
  const preset={amountMm:0,widthChangeMm:0,widthMm:40,depthMm:10,heightMm:40,quantity:1,name:'追加パーツ',count:3,
    ratio:0.5,setbackMm:20,spacingMm:20,firstOffsetMm:20,overlapMm:15,finishedWidthMm:20,turnUnderMm:10,buttonSpacingMm:60,endMarginMm:20,positionMm:20};
  for(const [key,s] of Object.entries(d.parameters)){
    if (!d.required.includes(key)) continue;
    if(Object.hasOwn(preset,key))op[key]=typeof preset[key]==='number'?Math.max(s.minimum??-Infinity,Math.min(s.maximum??Infinity,preset[key])):preset[key];
    else if(s.enum)op[key]=s.enum[0];else if(s.type==='boolean')op[key]=true;
    else if(s.type==='object')op[key]={x:0,y:0};
    else if(key==='necklineIds')op[key]=['back','front'].flatMap(id=>pattern.pieces.filter(p=>p.id===id).flatMap(p=>p.edges.filter(e=>e.id==='neckline'&&e.role==='open').map(e=>e.entityId)));
    else if(key==='necklineDirections')op[key]=op.necklineIds.map(id=>pattern.pieces.find(p=>p.edges.some(e=>e.entityId===id))?.id==='back'?1:-1);
    else if(key==='widths')op[key]=piece.edges.map(e=>({edgeId:e.entityId,widthMm:e.role==='fold'?0:10}));
  }
  return op;
}
export function authoringForm(pattern,piece,op){
  if(isRelationOperation(op.type))return relationForm(pattern,piece,op);
  const d=authoringDefinitions[op.type];if(!d)return null;
  const fields=[{key:'comment',label:'操作の説明',type:'text',maxLength:2000}];
  if (op.type === 'SET_CUT_INSTANCES') {
    op.instances.forEach((item,i) => fields.push(
      {key:`instances.${i}.id`,label:`裁断${i+1}の固定ID`,type:'text',maxLength:100},
      {key:`instances.${i}.name`,label:`裁断${i+1}の名前`,type:'text',maxLength:120},
      {key:`instances.${i}.side`,label:'着用者から見た側',type:'select',options:[['unspecified','未指定'],['left','左'],['right','右'],['center','中央']].map(([value,label])=>({value,label}))},
      {key:`instances.${i}.mirrored`,label:'型紙座標を左右反転',type:'select',boolean:true,options:[{value:'false',label:'しない'},{value:'true',label:'する'}]}));
    return {note:d.limitation,fields};
  }
  for(const [field,distance] of Object.entries(d.references)){
    const targets=operationTargets(op.type,field,pattern,piece).filter(c=>!c.reason);
    fields.push({key:field,label:field==='dart'?'対象のダーツ':field==='otherPiece'?'基準・相手の布':field==='relation'?'対象の関係':'対象の辺',type:'select',options:targets.map(c=>({value:c.target.id,label:c.target.name??c.target.id}))});
    if(distance)fields.push({key:distance,label:'辺の始点からの位置 (mm)',type:'number',min:0,step:0.1});
  }
  for(const [key,s] of Object.entries(d.parameters)){
    if (['widthMm','allowanceMm'].includes(key) && op.type === 'ADD_ATTACHMENT_LINE'
      && (key === 'widthMm' ? op.purpose !== 'buttonhole' : op.purpose !== 'opening')) continue;
    const owner = key.startsWith('target') ? pattern.pieces.find(p => p.id === op.otherPiece) : piece;
    if (['instanceId','sourceInstanceId','targetInstanceId'].includes(key) || ['sourceRegionRef','targetRegionRef'].includes(key)) {
      const instances = key.endsWith('InstanceId') || key === 'instanceId';
      fields.push({key,label:instances?'裁断個体（左右）':key.startsWith('target')?'相手側の取付領域':'取付する側の領域',type:'select',optional:true,omitEmpty:true,
        options:[{value:'',label:instances?'型紙全体（個体未指定）':'全体（領域未指定）'},...(owner ? instances ? fabricInstances(owner).map(i=>({value:i.id,label:i.name}))
          : owner.attachmentLines.filter(l=>l.path.closed&&['region','interfacing'].includes(l.role)).map(l=>({value:l.entityId,label:l.name})) : [])]}); continue;
    }
    if (key === 'segments') {
      fields.push({key,label:'曲線の区間（空欄は直線）',type:'text',json:true,optional:true,maxLength:20000});continue;
    }
    const label=({start:'取付線の始点',end:'取付線の終点',offsetMm:'基準布の局所軸に沿った移動量',rotationDeg:'基準布に対する回転角 (度)',sourceDistanceMm:'取付する線の始点から (mm)',targetDistanceMm:'基準線の始点から (mm)'})[key]??labels[key]??key;
    if (op.type === 'SET_PIECE_PLACEMENT' && ['sourceLineRef', 'targetLineRef'].includes(key)) {
      const owner = key === 'sourceLineRef' ? piece : pattern.pieces.find(p => p.id === op.otherPiece);
      fields.push({ key, label: key === 'sourceLineRef' ? '取付する布の基準線' : '相手の布の基準線', type: 'select', options: owner ? sewingLines(owner).map(line => ({ value: line.entityId, label: line.name ?? line.id })) : [] }); continue;
    }
    if(s.enum||s.type==='boolean')fields.push({key,label:key==='purpose'?'線の用途':key==='closed'?'閉じた線':label,type:'select',boolean:s.type==='boolean',options:(s.enum??['true','false']).map(v=>({value:v,label:({attachment:'縫付線','cut-guide':'裁断ガイド',fold:'折り線',construction:'参考線',start:'始点',end:'終点',left:'左',right:'右',true:'はい',false:'いいえ'})[v]??v}))});
    else if(s.type==='object')for(const axis of ['x','y'])fields.push({key:`${key}.${axis}`,label:`${label} ${axis.toUpperCase()} (mm)`,type:'number',step:0.1,min:-10000,max:10000});
    else if(s.type==='array')fields.push({key,label,type:'text',json:true,maxLength:20000});
    else if(s.type==='string')fields.push({key,label,type:'text',maxLength:s.maxLength});
    else fields.push({key,label,type:'number',min:s.minimum,max:s.maximum,step:s.type==='integer'?1:0.1});
  }
  for (const field of fields) {
    const key = field.key.split('.')[0];
    if (d.parameters[key] && !d.required.includes(key)) {
      field.optional = true; field.omitEmpty = true;
      if (field.type === 'select' && !field.options.some(o => o.value === '')) field.options.unshift({value:'',label:'未指定'});
    }
    if (['face','sourceFace','targetFace'].includes(key)) {
      field.label = key === 'targetFace' ? '相手の布の表裏' : '布の表裏';
      field.options = [{value:'',label:'未指定'},{value:'front',label:'表'},{value:'back',label:'裏'}];
    }
    if (key === 'state') { field.label='適用する開閉状態'; field.options=[{value:'',label:'常時'},{value:'always',label:'常時'},{value:'open',label:'開いた時'},{value:'closed',label:'閉じた時'}]; }
    if (key === 'purpose') field.options.forEach(o=>o.label=({region:'取付領域',interfacing:'芯の範囲',buttonhole:'ボタン穴',opening:'内部開口（実際の穴）'})[o.value]??o.label);
    if (key === 'allowanceMm') field.label='開口の内側に残す縫い代 (mm)';
    if (key === 'buttonholeLengthMm') field.label='ボタン穴の長さ（任意・mm）';
    if (key === 'buttonholeWidthMm') field.label='ボタン穴の幅（任意・mm）';
    if (key === 'interfacingWidthMm') field.label='芯の幅（任意・mm）';
  }
  return {note:`${d.limitation} 初期値は例です。実際の加工条件に合わせて変更してください。`,fields};
}
