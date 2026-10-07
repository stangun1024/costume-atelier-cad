import { record, finite } from '../core/input-validation.js';
import { measurePattern } from '../pattern/measurements.js';
import { stableId } from '../pattern/references.js';
import { constructionProgress } from '../pattern/construction-progress.js';
import { pendingCategories } from './pending-categories.js';

export const flowContract = {
  version: 2,
  parameter: { id: 'panel-width', label: 'パネルの仕上がり幅', value: 70, min: 20, max: 150, unit: 'mm' },
  parameterValue: { parameter: 'panel-width' },
  generatedReference: { fromOperation: 'make-panel', kind: 'piece', name: '左パネル' },
  measurement: { edgeLength: '実在する辺の固定ID、または生成物参照', mode: 'path' },
  calculation: { calc: 'add', args: [10, { parameter: 'panel-width' }] },
  rules: ['生成物参照は先行操作の生成物だけを対象にし、kindと任意のnameで一意に指定します。参照先をdependsOnへ明記してください。',
    '計測は各操作の直前の形状を使います。modeはpathまたはsewn。計算はadd/subtract/multiply/divideの2引数です。',
    'OPEN_FOLDは既存のpieceとedgeの固定IDを維持し、裁断指定と辺の役割を変更します。新しい左右パーツを生成しません。',
    '生成物の特定や計算ができる独立した作業は一括で実行します。トポロジ変更後、次の形状を判断する必要がある場合はinspectを挟みます。設計判断が不足する作業はpendingへ残します。',
    '寸法は基準点・方向・仕上がり寸法と裁断時の展開寸法を区別します。既存幾何から算出できる値は計測・計算式を使い、意匠判断だけをまとめて質問します。'],
};

export function validateFlowParameters(parameters) {
  if (!Array.isArray(parameters) || parameters.length > 60) throw new TypeError('調整パラメータは60件以内の配列です');
  const ids = new Set();
  for (const p of parameters) {
    record(p, ['id', 'label', 'value', 'min', 'max', 'unit'], 'parameter');
    if (typeof p.id !== 'string' || !/^[a-z][a-z0-9-]{1,99}$/.test(p.id) || ids.has(p.id)) throw new TypeError('パラメータIDは一意の英小文字IDです');
    if (typeof p.label !== 'string' || !p.label.trim() || p.label.length > 120 || !['mm','deg','ratio','count'].includes(p.unit)) throw new TypeError('パラメータの名前と単位を指定してください');
    finite(p.min, '最小値', -10000, 10000); finite(p.max, '最大値', p.min, 10000); finite(p.value, p.label, p.min, p.max);
    if (p.unit === 'count' && !Number.isInteger(p.value)) throw new TypeError('本数は整数です');
    ids.add(p.id);
  }
}

export function createFlowResolver(plan) {
  const parameters = new Map((plan.parameters ?? []).map(p => [p.id, p.value]));
  return (pattern, command, index) => {
    const dependencies = new Set(plan.operations[index].dependsOn);
    const visit = (value, depth = 0) => {
      if (depth > 24) throw new RangeError('計算式が深すぎます');
      if (value === null || typeof value !== 'object') return value;
      const next = x => visit(x, depth + 1);
      if (Array.isArray(value)) return value.map(next);
      if (Object.hasOwn(value, 'fromOperation')) {
        record(value, ['fromOperation','kind','name'], '生成物参照');
        if (!dependencies.has(value.fromOperation)) throw new RangeError('生成元の操作をdependsOnに指定してください');
        if (!['piece','edge','feature','relation'].includes(value.kind) || (value.name !== undefined && typeof value.name !== 'string')) throw new TypeError('生成物のkind/nameが不正です');
        const operation = pattern.referenceGraph.operations.find(op => op.id === value.fromOperation);
        const candidates = (operation?.createdIds ?? []).map(id => pattern.referenceGraph.entities[id])
          .filter(e => e?.status === 'active' && e.kind === value.kind && (value.name === undefined || e.name === value.name));
        if (candidates.length !== 1) {
          const error = new RangeError(`生成物を一意に選べません：${value.fromOperation}（${candidates.length}件）`);
          error.candidates = candidates.map(e => ({ id:e.id, name:e.name, kind:e.kind })); throw error;
        }
        return candidates[0].id;
      }
      if (Object.hasOwn(value, 'parameter')) {
        record(value, ['parameter'], 'パラメータ参照');
        if (!parameters.has(value.parameter)) throw new RangeError(`調整パラメータがありません：${value.parameter}`);
        return parameters.get(value.parameter);
      }
      if (Object.hasOwn(value, 'edgeLength')) {
        record(value, ['edgeLength','mode'], '辺の計測');
        if (!['path','sewn'].includes(value.mode)) throw new TypeError('辺の計測modeはpath/sewnです');
        const result = measurePattern(pattern, { kind:'edge-length', edgeId:next(value.edgeLength) });
        return finite(value.mode === 'path' ? result.pathLength : result.sewnLength, '計測結果');
      }
      if (Object.hasOwn(value, 'calc')) {
        record(value, ['calc','args'], '計算式');
        if (!Array.isArray(value.args) || value.args.length !== 2) throw new TypeError('計算式は2引数です');
        const [a,b] = value.args.map(x => finite(next(x), '計算引数'));
        const operations = { add:()=>a+b, subtract:()=>a-b, multiply:()=>a*b, divide:()=>a/b };
        if (!Object.hasOwn(operations, value.calc)) throw new TypeError('対応しない計算式です');
        return finite(operations[value.calc](), '計算結果');
      }
      return Object.fromEntries(Object.entries(value).map(([key,item]) => [key,next(item)]));
    };
    return visit(command);
  };
}

export function executionReport(result, plan) {
  const pieces=result.pattern?.pieces??[];
  const internalLineReviews=pieces.flatMap(p=>p.attachmentLines.filter(l=>l.boundaryRevision&&l.boundaryRevision!==stableId('boundary',JSON.stringify(p.boundary)))
    .map(l=>({pieceId:p.entityId,lineId:l.entityId,name:l.name,reason:'輪郭変更後も局所座標に固定されています。位置・寸法を再確認してください。'})));
  const humanChecks=[];
  if(result.pattern)humanChecks.push('数値整合性は意匠の再現・縫製仕様の完成・着用フィットを保証しません。試着と縫製条件を確認してください。');
  if(pieces.some(p=>!p.cut.seamAllowance&&!p.cut.seamAllowances))humanChecks.push('縫い代未設定のパーツがあります。裁断前に縫い代を設計してください。');
  for(const piece of pieces.filter(p=>p.cut.seamAllowance>0&&p.darts.length===1))
    humanChecks.push(`${piece.name}：ダーツ縫い代は戻り脚（${piece.darts[0].legB}）側への片倒しで生成しています。縫製の倒す方向と一致するか確認してください。`);
  if(pieces.some(p=>p.attachmentLines.some(l=>l.role==='cut-guide')))humanChecks.push('裁断ガイドは印刷用の線です。実際の穴・除去領域には変換されていません。');
  if(internalLineReviews.length)humanChecks.push('輪郭変更後に位置の再確認が必要な内部線があります。全体確認のinternalLineReviewsを参照してください。');
  const construction = pieces.map(p => constructionProgress(result.pattern,p)).filter(Boolean);
  for (const item of construction) humanChecks.push(`${item.name}：${item.missing.length ? `未設計：${item.missing.map(k=>({attachment:'取付縫合',placement:'個体と表裏を指定した配置',buttonholes:'ボタン穴寸法',interfacing:'裏面の芯範囲'})[k]).join('・')}。` : '取付・配置・穴・芯を記録済み。'}開閉可能性と縫製順序は別途確認してください。`);
  return { status:plan.pending.length ? 'needs-follow-up' : 'review-required', appliedCount:result.appliedCount,
    internalLineReviews,humanChecks,construction,
    pendingByCategory:Object.fromEntries(Object.keys(pendingCategories).map(category=>[category,plan.pending.filter(p=>(p.category??'unclassified')===category)])),
    parameters:plan.parameters ?? [], pending:plan.pending, validation:result.validation,
    outputs:result.pattern?.referenceGraph.operations.map(op => ({ id:op.id, type:op.type,
      created:op.createdIds.map(id=>result.pattern.referenceGraph.entities[id]).map(e=>({id:e.id,name:e.name,kind:e.kind,status:e.status})) })) ?? [],
    notes:['数値整合性の確認は着用適合や意匠の完成を保証しません。','人間が変更したパラメータ値を維持して続きを設計してください。'] };
}
