import { emptyImplementationPlan, previewImplementation, validateImplementationPlan, implementationToolCatalog } from './implementation-plan.js';
import { createAIContext } from '../pattern/ai-context.js';
import { stableId } from '../pattern/references.js';
import { measurePattern } from '../pattern/measurements.js';
import { executionReport } from './procedural-flow.js';
import { implementationError } from './implementation-error.js';

const copy = value => structuredClone(value);
const text = (value,label,max=20000) => { if(typeof value!=='string'||!value.trim()||value.length>max)throw Error(`${label}を指定してください`); };
function exact(value,keys) {
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error(`JSONオブジェクトが必要です。必須項目：${keys.join(' / ')}`);
  const missing=keys.filter(k=>!Object.hasOwn(value,k)),extra=Object.keys(value).filter(k=>!keys.includes(k));
  if(missing.length||extra.length)throw Object.assign(Error(`JSONの項目が契約と一致しません。${missing.length?`不足：${missing.join(' / ')}。`:''}${extra.length?`余分：${extra.join(' / ')}。`:''}`),
    {code:'message-contract',details:[{missing,extra}],recovery:'不足項目を補い、余分な項目を除いてください。end再送前にはinspect fullの成功が必要です。'});
}
function fullInspected(session) {
  return !session.failed && session.lastPacket.status==='inspected' && session.lastPacket.fullInspection===true
    && session.lastPacket.flowRevision===session.flowRevision;
}
const ids = value => Array.isArray(value)&&value.every(id=>typeof id==='string')&&new Set(value).size===value.length;
export function validateDecisionQuestions(questions,intentIds=null) {
  if(!Array.isArray(questions)||questions.length>100||!ids(questions.map(q=>q?.id)))throw Error('質問は重複しないIDで100件以内にしてください');
  for(const q of questions){
    exact(q,['id','intentIds','question','reason','options','answer','askedAt','answeredAt','resolution','resolvedAt']);
    for(const key of ['id','question','reason','askedAt'])text(q[key],key);
    if(!ids(q.intentIds)||!q.intentIds.length||intentIds&&q.intentIds.some(id=>!intentIds.includes(id)))throw Error('質問の目的IDが不正です');
    if(!Array.isArray(q.options)||q.options.length>6)throw Error('選択肢は6件以内です');
    q.options.forEach(option=>text(option,'選択肢'));
    for(const key of ['answer','answeredAt','resolution','resolvedAt'])if(typeof q[key]!=='string'||q[key].length>20000)throw Error('判断履歴が不正です');
    if(!!q.answer.trim()!==!!q.answeredAt||!!q.resolution.trim()!==!!q.resolvedAt||q.resolution&&!q.answer.trim())throw Error('回答・解決状態が不正です');
  }
}
export function answerLoopQuestion(session,id,answer) {
  validateLoopSession(session);text(answer,'回答');
  const next=copy(session),question=next.questions?.find(q=>q.id===id);
  if(!question||question.answer||session.completion)throw Error('未回答の質問を選んでください');
  question.answer=answer.trim();question.answeredAt=new Date().toISOString();
  next.requestId=crypto.randomUUID();if(!next.failed)next.lastPacket={status:'answered',questionId:id};
  validateLoopSession(next);return next;
}
export function createLoopSession(pattern,intentIds,basis,seed=null) {
  const plan=copy(seed??emptyImplementationPlan(pattern,intentIds));
  if(plan.version===1){plan.version=2;plan.parameters=[];}
  previewImplementation(pattern,plan,intentIds);
  return {version:1,sessionId:crypto.randomUUID(),requestId:crypto.randomUUID(),flowRevision:0,basis,intentIds:copy(intentIds),
    plan,receipts:[],lastPacket:{status:'snapshot'},failed:false,completion:null};
}
export function validateLoopSession(session) {
  exact(session,['version','sessionId','requestId','flowRevision','basis','intentIds','plan','receipts','lastPacket','failed','completion',...('questions' in session?['questions']:[]),...('previousPlan' in session?['previousPlan']:[])]);
  if('questions' in session)validateDecisionQuestions(session.questions,session.intentIds);
  if(session.version!==1||!Number.isSafeInteger(session.flowRevision)||session.flowRevision<0||typeof session.failed!=='boolean'||!ids(session.intentIds))throw Error('相談セッションが不正です');
  text(session.sessionId,'セッションID',120);text(session.requestId,'要求ID',120);text(session.basis,'相談の前提',4000000);
  validateImplementationPlan(session.plan,session.intentIds);
  if('previousPlan' in session)validateImplementationPlan(session.previousPlan,session.intentIds);
  if(!Array.isArray(session.receipts)||session.receipts.length>100)throw Error('受け渡し履歴が不正です');
  for(const receipt of session.receipts){exact(receipt,['requestId','fingerprint']);text(receipt.requestId,'要求ID',120);text(receipt.fingerprint,'指紋',120);}
  if(!session.lastPacket||typeof session.lastPacket!=='object'||Array.isArray(session.lastPacket)||JSON.stringify(session.lastPacket).length>8000000)throw Error('実行結果が不正です');
  if(session.completion!==null)validateCompletion(session.completion,session);
  return session;
}
function validateCompletion(end,session) {
  if((session.questions??[]).some(q=>!q.resolution))throw Error('未解決の質問が残っています');
  exact(end,['summary','completedIntentIds','unresolved','humanChecks']);text(end.summary,'終了の説明');
  if(!ids(end.completedIntentIds)||!Array.isArray(end.unresolved)||!Array.isArray(end.humanChecks)||end.humanChecks.length>50)throw Error('終了判定の形式が不正です');
  end.humanChecks.forEach(value=>text(value,'人間の確認事項'));
  for(const item of end.unresolved){exact(item,['intentId','reason']);text(item.reason,'未解決の理由');}
  const classified=[...end.completedIntentIds,...end.unresolved.map(item=>item.intentId)];
  if(!ids(classified)||classified.length!==session.intentIds.length||session.intentIds.some(id=>!classified.includes(id)))throw Error('全目的を重複なく完了または未解決に分類してください');
  const unresolved=new Set(end.unresolved.map(item=>item.intentId));
  if(session.plan.pending.some(item=>item.intentIds.some(id=>!unresolved.has(id))))throw Error('未実行作業の目的を完了扱いにできません。未解決へ分類してください');
}
export function loopHeader(session,type='patch') {
  return {format:'aicad-loop-message',version:1,sessionId:session.sessionId,requestId:session.requestId,baseFlowRevision:session.flowRevision,type};
}
export const loopContract = {
  operation:{id:'作業ID',intentIds:['目的ID'],dependsOn:[],description:'対象・数値・目的・維持条件',command:{id:'同じ作業ID',type:'対応する加工名',refs:{piece:'固定IDまたは生成物参照'}}},
  pending:{id:'作業ID',intentIds:['目的ID'],category:'information | unsupported | execution-failed | sewing | not-needed',tool:'加工名',reason:'理由と再開条件',parameters:{}},
  patch:{changes:[{type:'set-parameter',id:'既存パラメータID',value:75}]},
  changes:{'set-parameter':['id','value'],'upsert-parameter':['parameter: {id,label,value,min,max,unit}'],'remove-parameter':['id'],
    'add-operation':['operation: {id,intentIds,dependsOn,description,command}','afterId: 先行作業ID。先頭に追加ならnull'],
    'replace-operation':['id','operation: 同じIDの作業全体'],'remove-operation':['id'],'set-pending':['pending: 未実行作業の全リスト']},
  inspect:{queries:[{kind:'full'},{kind:'pieces',pieceIds:['固定ID']},{kind:'measure',query:{kind:'edge-length',edgeId:'固定ID'}}]},
  ask:{questions:[{id:'質問ID',intentIds:['目的ID'],question:'人間に判断してほしいこと',reason:'判断が必要な理由・影響',options:['選択肢（自由回答も可能）']}]},
  resolve:{resolutions:[{questionId:'回答済みの質問ID',resolution:'回答をどの作業へ反映したか、または加工不要とした理由'}]},
  end:{summary:'完了内容または引き渡し理由',completedIntentIds:[],unresolved:[{intentId:'目的ID',reason:'未解決の理由'}],humanChecks:[]},
};
export function loopSnapshot(session,pattern) {
  const result=previewImplementation(pattern,session.plan,session.intentIds);
  return {status:'snapshot',plan:session.plan,tools:implementationToolCatalog(result.pattern),report:executionReport(result,session.plan),
    baseContextRevision:session.plan.contextRevision,completion:session.completion,endAllowed:fullInspected(session)&&!(session.questions??[]).some(q=>!q.resolution),lastFailure:session.failed?session.lastPacket.error:null};
}
function patchPlan(plan,changes) {
  if(!Array.isArray(changes)||!changes.length||changes.length>100)throw Error('changesは1〜100件です');
  const next=copy(plan);
  const index=(collection,id)=>{const at=collection.findIndex(x=>x.id===id);if(at<0)throw Error(`対象IDがありません：${id}`);return at;};
  for(const [changeIndex,change] of changes.entries()){
    try {
    switch(change?.type){
      case 'set-parameter':exact(change,['type','id','value']);next.parameters[index(next.parameters,change.id)].value=change.value;break;
      case 'upsert-parameter':{exact(change,['type','parameter']);const at=next.parameters.findIndex(p=>p.id===change.parameter?.id);if(at<0)next.parameters.push(copy(change.parameter));else next.parameters[at]=copy(change.parameter);break;}
      case 'remove-parameter':exact(change,['type','id']);next.parameters.splice(index(next.parameters,change.id),1);break;
      case 'add-operation':{exact(change,['type','operation','afterId']);const at=change.afterId===null?-1:index(next.operations,change.afterId);next.operations.splice(at+1,0,copy(change.operation));break;}
      case 'replace-operation':exact(change,['type','id','operation']);if(change.operation?.id!==change.id)throw Error('置換では作業IDを維持してください');next.operations[index(next.operations,change.id)]=copy(change.operation);break;
      case 'remove-operation':exact(change,['type','id']);next.operations.splice(index(next.operations,change.id),1);break;
      case 'set-pending':exact(change,['type','pending']);next.pending=copy(change.pending);break;
      default:throw Error('未対応の差分操作です');
    }
    } catch(error) {
      error.changeIndex=changeIndex;
      if(['add-operation','replace-operation','remove-operation'].includes(change?.type))error.operationId ??= change?.operation?.id ?? change?.id ?? null;
      error.details=(error.details?.length ? error.details : [{message:error.message}]).map(detail=>({...detail,path:detail.path??`changes[${changeIndex}]`}));
      throw error;
    }
  }
  return next;
}
function geometryDelta(before,after) {
  if(!after)return null;
  const delta={contextRevision:after.contextRevision};
  for(const key of ['entities','pieces','edges','constraints']){
    const old=new Map((before?.[key]??[]).map(item=>[item.id,JSON.stringify(item)])),current=new Set(after[key].map(item=>item.id));
    delta[key]={upsert:after[key].filter(item=>old.get(item.id)!==JSON.stringify(item)),removed:[...old.keys()].filter(id=>!current.has(id))};
  }
  const changedEdges=new Set(delta.edges.upsert.map(e=>e.id));
  delta.neighborConstraints=after.constraints.filter(c=>[...(c.a??[]),...(c.b??[]),...(c.edgeIds??[])].some(id=>changedEdges.has(id)));
  const neighbors=new Set(delta.neighborConstraints.flatMap(c=>[...(c.a??[]),...(c.b??[]),...(c.edgeIds??[])]));
  delta.neighborEdges=after.edges.filter(e=>neighbors.has(e.id)&&!changedEdges.has(e.id));
  return delta;
}
export function applyLoopMessage(pattern,session,message) {
  validateLoopSession(session);
  if(!message||JSON.stringify(message).length>1000000)throw Error('回答は1MB以内のJSONにしてください');
  const fingerprint=stableId('reply',JSON.stringify(message));
  const receipt=session.receipts.find(item=>item.requestId===message.requestId);
  if(receipt){if(receipt.fingerprint!==fingerprint)throw Error('適用済みの要求IDに異なる回答が届きました');return {session,duplicate:true,result:null};}
  if(session.completion)throw Error('終了済みです。再相談を開始してください');
  if(message.format!=='aicad-loop-message'||message.version!==1||message.sessionId!==session.sessionId||message.requestId!==session.requestId||message.baseFlowRevision!==session.flowRevision)throw Error('対象・要求・フロー版が一致しません。最新の結果または全体をAIへ送り直してください');
  const common=['format','version','sessionId','requestId','baseFlowRevision','type'];
  if(session.failed&&['ask','resolve'].includes(message.type))throw Error('直前の処理が失敗しています。patchまたはinspectの成功を確認してから質問・解決報告を送ってください');
  if((session.questions??[]).some(q=>!q.answer)&&message.type!=='inspect')throw Error('ユーザーへの質問が未回答です。先に画面から回答してください');
  const before=previewImplementation(pattern,session.plan,session.intentIds);
  let result=before,next=copy(session),packet;
  if(message.type==='patch'){
    exact(message,[...common,'changes']);next.plan=patchPlan(session.plan,message.changes);
    try { result=previewImplementation(pattern,next.plan,session.intentIds); }
    catch(error) {
      const changeIndex=message.changes.findLastIndex(change=>['add-operation','replace-operation'].includes(change.type)
        && error.operationId !== null && error.operationId !== undefined && change.operation?.id===error.operationId);
      if(changeIndex>=0)error.changeIndex=changeIndex;
      throw error;
    }
    // Retain only the last successful patch's input for the comparison preview.
    next.previousPlan=copy(session.plan);
    next.flowRevision++;
    const a=before.pattern?createAIContext(before.pattern):null,b=result.pattern?createAIContext(result.pattern):null;
    packet={status:'applied',changes:copy(message.changes),geometryDelta:geometryDelta(a,b),report:executionReport(result,next.plan)};
  }else if(message.type==='inspect'){
    exact(message,[...common,'queries']);
    if(!Array.isArray(message.queries)||!message.queries.length||message.queries.length>30)throw Error('照会は1〜30件です');
    const context=before.pattern?createAIContext(before.pattern):null;
    packet={status:'inspected',flowRevision:session.flowRevision,fullInspection:message.queries.some(q=>q.kind==='full'),answers:message.queries.map(query=>{
      if(query.kind==='full'){exact(query,['kind']);return {...loopSnapshot(session,pattern),lastFailure:null,endAllowed:!(session.questions??[]).some(q=>!q.resolution)};}
      if(!context)throw Error('持ち込み画像は図形・数値の照会に対応していません');
      if(query.kind==='pieces'){
        exact(query,['kind','pieceIds']);if(!ids(query.pieceIds)||query.pieceIds.length>100)throw Error('部品IDを指定してください');
        const pieces=query.pieceIds.map(id=>{const p=context.pieces.find(p=>p.id===id);if(!p)throw Error(`部品がありません：${id}`);return p;});
        const edgeIds=new Set(pieces.flatMap(p=>p.edgeIds));return {pieces,edges:context.edges.filter(e=>edgeIds.has(e.id)),constraints:context.constraints.filter(c=>[...(c.a??[]),...(c.b??[]),...(c.edgeIds??[])].some(id=>edgeIds.has(id)))};
      }
      if(query.kind==='measure'){exact(query,['kind','query']);return {query:query.query,value:measurePattern(before.pattern,query.query)};}
      throw Error('未対応の照会です');
    })};
  }else if(message.type==='ask'){
    exact(message,[...common,'questions']);
    if(!Array.isArray(message.questions)||!message.questions.length||message.questions.length>10)throw Error('一度の質問は1〜10件です');
    const questions=message.questions.map(q=>{
      exact(q,['id','intentIds','question','reason','options']);
      return {...copy(q),answer:'',askedAt:new Date().toISOString(),answeredAt:'',resolution:'',resolvedAt:''};
    });
    next.questions=[...(session.questions??[]),...questions];
    validateDecisionQuestions(next.questions,session.intentIds);
    packet={status:'awaiting-answer'};
  }else if(message.type==='resolve'){
    exact(message,[...common,'resolutions']);
    if(!Array.isArray(message.resolutions)||!message.resolutions.length||message.resolutions.length>100||!ids(message.resolutions.map(r=>r?.questionId)))throw Error('解決報告の質問IDが不正です');
    for(const item of message.resolutions){
      exact(item,['questionId','resolution']);text(item.resolution,'解決内容');
      const question=next.questions?.find(q=>q.id===item.questionId);
      if(!question?.answer||question.resolution)throw Error('回答済み・未解決の質問を指定してください');
      question.resolution=item.resolution;question.resolvedAt=new Date().toISOString();
    }
    packet={status:'resolved',resolutions:copy(message.resolutions)};
  }else if(message.type==='end'){
    exact(message,[...common,'summary','completedIntentIds','unresolved','humanChecks']);
    if(session.failed)throw Error('直前の処理が失敗しています。修正または照会の成功結果を確認してからendを送ってください');
    if(!fullInspected(session))throw Object.assign(Error('終了前にinspectのqueries:[{kind:"full"}]を実行し、成功した最新の結果を確認してください'),{code:'full-inspection-required'});
    if((session.questions??[]).some(q=>!q.resolution))throw Error('回答済みの判断を反映し、resolveで解決内容を報告してから終了してください');
    const end=Object.fromEntries(['summary','completedIntentIds','unresolved','humanChecks'].map(key=>[key,copy(message[key])]));
    validateCompletion(end,session);
    // Carry known technical limits into the human handoff even if the AI omits them.
    end.humanChecks=[...new Set([...end.humanChecks,...executionReport(before,session.plan).humanChecks])];
    if(end.humanChecks.length>50)throw Error('自動で引き継ぐ確認事項を含めhumanChecksを50件以内に整理してください');
    if(before.validation&&!before.validation.valid)throw Error('数値条件が成立していません');
    next.completion=end;packet={status:end.unresolved.length?'human-review-required':'ended',completion:end};
  }else throw Error('typeはpatch / inspect / ask / resolve / endです');
  next.failed=false;next.lastPacket=packet;next.requestId=crypto.randomUUID();
  next.receipts=[...next.receipts,{requestId:message.requestId,fingerprint}].slice(-100);
  validateLoopSession(next);
  return {session:next,result,duplicate:false};
}
export function loopFailure(session,error) {
  return {...copy(session),failed:true,lastPacket:{status:'failed',error:{...implementationError(error),
    recovery:error.recovery??'型紙とフロー版は変更していません。同じrequestIdで修正patchまたはinspectを送り、endの前にはinspect fullの成功結果を確認してください。'},
    note:'差分は適用されていません。現在のフローを維持して修正してください。'}};
}
