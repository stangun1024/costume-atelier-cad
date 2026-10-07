import { createAIContext, applyAIProposal } from '../pattern/ai-context.js';
import { compileOperations, OPERATION_FORMAT, OPERATION_VERSION } from '../pattern/operations.js';
import { getDraftingMethod } from '../pattern/blocks/index.js';
import { validatePattern } from '../pattern/validation.js';
import { authoringDefinitions } from '../pattern/authoring-definitions.js';
import { operationDefinitions } from '../pattern/operation-definitions.js';
import { createFlowResolver, validateFlowParameters, flowContract } from './procedural-flow.js';
import { pendingCategories } from './pending-categories.js';

const text = (value, label) => {
  if (typeof value !== 'string' || !value.trim() || value.length > 20000) throw new TypeError(`${label}を記入してください`);
};
function exact(value, keys, label, path='plan') {
  const object = value && typeof value === 'object' && !Array.isArray(value);
  const missing = keys.filter(key => !object || !Object.hasOwn(value, key));
  const extra = object ? Object.keys(value).filter(key => !keys.includes(key)) : [];
  if (!object || missing.length || extra.length) throw Object.assign(new TypeError(`${label}の項目が不正です：${path}${missing.length ? `／不足：${missing.join(' / ')}` : ''}${extra.length ? `／余分：${extra.join(' / ')}` : ''}`), {
    code:'plan-contract', details:[{path, expected:keys, actualType:value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value, missing, extra}],
  });
}
export function implementationPattern(base) {
  return compileOperations({ format: OPERATION_FORMAT, version: OPERATION_VERSION,
    methodVersion: getDraftingMethod(base.method).version, base, operations: [] }).pattern;
}
export function emptyImplementationPlan(pattern, intentIds=[]) {
  return { version: 2, parameters: [], contextRevision: pattern ? createAIContext(pattern).contextRevision : null, operations: [],
    pending:intentIds.map((id,i)=>({id:`pending-${i+1}`,intentIds:[id],category:'information',tool:'加工方法の相談',reason:'操作と条件を決めてください',parameters:{}})) };
}

/** Stored plans are descriptions plus explicit executable commands, never inferred amounts. */
export function validateImplementationPlan(plan, intentIds) {
  exact(plan, ['version', 'contextRevision', 'operations', 'pending', ...(plan?.version === 2 ? ['parameters'] : [])], '加工計画');
  if (![1,2].includes(plan.version) || !(plan.contextRevision === null || typeof plan.contextRevision === 'string' && plan.contextRevision.length <= 120)
      || !Array.isArray(plan.operations) || plan.operations.length > 100 || !Array.isArray(plan.pending) || plan.pending.length > 100
      || JSON.stringify(plan).length > 1000000) throw new TypeError('加工計画の版・件数・サイズが不正です');
  if (plan.version === 2) validateFlowParameters(plan.parameters);
  const allowed = new Set(intentIds), used = new Set(), finished = new Set();
  const identity = item => {
    text(item.id, '作業ID');
    if (!/^[a-z][a-z0-9-]{1,99}$/.test(item.id) || used.has(item.id)) throw new TypeError('作業IDは一意の英小文字・数字・ハイフンです');
    used.add(item.id);
    if (!Array.isArray(item.intentIds) || !item.intentIds.length || new Set(item.intentIds).size !== item.intentIds.length
        || item.intentIds.some(id => !allowed.has(id))) throw new TypeError('作業には2.3に存在する目的IDを指定してください');
  };
  for (const [operationIndex, item] of plan.operations.entries()) {
    const path = `plan.operations[${operationIndex}]`;
    try {
      exact(item, ['id', 'intentIds', 'dependsOn', 'description', 'command'], '加工操作', path); identity(item); text(item.description, '操作説明');
      if (!Array.isArray(item.dependsOn) || new Set(item.dependsOn).size !== item.dependsOn.length
          || item.dependsOn.some(id => !finished.has(id))) throw Object.assign(new TypeError('依存操作は先に並んでいる実行操作を指定してください'), {details:[{path:`${path}.dependsOn`,actual:item.dependsOn,expected:[...finished]}]});
      const command = item.command;
      const issues = [];
      if (!command || typeof command !== 'object' || Array.isArray(command)) issues.push({path:`${path}.command`,expected:'object',actual:command});
      else {
        if(command.id !== item.id)issues.push({path:`${path}.command.id`,expected:item.id,actual:command.id ?? null});
        if(!Object.hasOwn(operationDefinitions, command.type))issues.push({path:`${path}.command.type`,expected:Object.keys(operationDefinitions),actual:command.type ?? null});
        if(!command.refs?.piece)issues.push({path:`${path}.command.refs.piece`,expected:'固定IDまたは生成物参照',actual:command.refs?.piece ?? null});
      }
      if(issues.length)throw Object.assign(new TypeError('実行操作には同じID・対応するtype・refs.pieceが必要です'), {code:'plan-contract',details:issues});
      finished.add(item.id);
    } catch (error) {
      error.operationId = typeof item?.id === 'string' ? item.id : null;
      error.operationIndex = operationIndex;
      error.operationType = item?.command?.type ?? null;
      error.details ??= [{path, message:error.message}];
      throw error;
    }
  }
  for (const [index, item] of plan.pending.entries()) {
    exact(item, ['id', 'intentIds', 'tool', 'reason', 'parameters', ...(Object.hasOwn(item ?? {}, 'category') ? ['category'] : [])], '未確定作業', `plan.pending[${index}]`); identity(item); text(item.tool, '加工名'); text(item.reason, '未確定理由');
    if (item.category !== undefined && !Object.hasOwn(pendingCategories,item.category)) throw new TypeError('pending.categoryの区分が不正です');
    if (!item.parameters || typeof item.parameters !== 'object' || Array.isArray(item.parameters)) throw new TypeError('未確定の加工条件はオブジェクトで指定してください');
  }
  if (plan.contextRevision === null && plan.operations.length) throw new TypeError('持ち込み画像には図形加工を適用できません');
  const covered=new Set([...plan.operations,...plan.pending].flatMap(item=>item.intentIds));
  if(intentIds.some(id=>!covered.has(id)))throw new TypeError('全ての目的を実行操作または未実行作業に関連付けてください');
  return plan;
}

export function previewImplementation(pattern, plan, intentIds) {
  validateImplementationPlan(plan, intentIds);
  if (!pattern) {
    if (plan.operations.length) throw new RangeError('加工可能な原型がありません');
    return { pattern: null, validation: null, appliedCount: 0, pending: plan.pending };
  }
  const context = createAIContext(pattern);
  if (plan.contextRevision !== context.contextRevision) throw new RangeError('型紙の版が変わっています。3.2で依頼を作り直してください');
  const candidate = plan.operations.length ? applyAIProposal(pattern, {
    format: 'aicad-ai-proposal', version: '1.0.0', contextRevision: plan.contextRevision, operations: plan.operations.map(item => item.command),
  }, plan.version === 2 ? createFlowResolver(plan) : null) : pattern;
  if (JSON.stringify(candidate.body) !== JSON.stringify(pattern.body)) throw new RangeError('加工操作は身体採寸を変更できません');
  return { pattern: candidate, validation: validatePattern(candidate), appliedCount: plan.operations.length, pending: plan.pending };
}

export function implementationToolCatalog(pattern) {
  return {
    proceduralFlow: flowContract,
    geometry: pattern ? createAIContext(pattern) : null,
    rules: ['amountは説明用です。実行はplan.operations[].commandのみです。',
      '目的IDを維持し、1作業を複数の目的へ関連付けられます。',
      '未確定寸法・未対応加工はpendingへ置き、理由とnullのパラメータを記録してください。',
      '依存操作は先に並べます。plan v2では生成物参照・パラメータ・計測式を使い、ID待ちだけで作業を分断しないでください。',
      '対応する実行操作を組み合わせることはできますが、未対応のtypeを発明してはいけません。',
      'ADD_RELATION / UPDATE_RELATION / REMOVE_RELATIONで外周二辺全体の通常縫合を編集できます。参加線のネストした固定IDも解決します。',
      '縫合追加は配置・上前下前・層順の成立を意味しません。必要な取付仕様が未対応なら目的をpendingに保持してください。',
      '数値整合性は着用時の適合を保証しません。'],
    authoring: Object.entries(authoringDefinitions).map(([type, d]) => ({ type, ...d })),
    limitations: ['結合は同一座標の分割パーツ、平行展開とプリーツは長方形パネルに対応。',
      'ダーツを閉じた輪郭の整形はTRUE_DART_EDGE。任意の折り構造や裁断用折返しは別途設計。',
      'SET_EDGE_ALLOWANCEは直線・曲線の1辺の幅だけを置換。他辺は保持。単一ダーツは口の両隣を同じ正の幅にする。',
      '比翼は取付線・折り線、任意指定のボタン穴・芯範囲を生成。縫合・配置は個体と表裏を明示しconstructionの不足項目を確認。開閉可能性は別途確認。'],
  };
}
