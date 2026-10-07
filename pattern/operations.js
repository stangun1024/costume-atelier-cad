import { operationDefinitions } from './operation-definitions.js';
import { draftBasicPattern } from './blocks/index.js';
import { deepFreeze } from './piece.js';
import { validatePattern } from './validation.js';
import { record, targetPiece, deriveCuttingBoundaries } from './operation-tools.js';
import { extend, seamAllowance, reshape } from './operations-basic.js';
import { slashSpread, addFlare, addSlit } from './operations-topology.js';
import { addDart, pivotDart, convertDart } from './operations-dart.js';
import { splitPiece } from './operations-split.js';
import { authoringHandlers, validateAuthoringParameters } from './operations-authoring.js';
import { ENGINE_VERSION, initializeReferences, updateReferences, validateReferences, operationIdentity, bindOperation } from './references.js';

export const OPERATION_FORMAT = 'aicad-pattern-operations';
export const OPERATION_VERSION = '0.6.0';
const compatibleEngine = version => version === undefined || ['0.4.0', '0.5.0', ENGINE_VERSION].includes(version);
const registry = {
  ...Object.fromEntries(Object.entries(authoringHandlers).map(([type, apply]) => [type, { apply }])),
  EXTEND: { apply: extend },
  ADD_SEAM_ALLOWANCE: { apply: seamAllowance },
  RESHAPE: { apply: reshape },
  SLASH_SPREAD: { apply: slashSpread },
  ADD_FLARE: { apply: addFlare },
  ADD_SLIT: { apply: addSlit },
  ADD_DART: { apply: addDart },
  PIVOT_DART: { apply: pivotDart },
  SPLIT_PIECE: { apply: splitPiece },
  CONVERT_DART_TO_SEAMS: { apply: convertDart },
  RENAME_ENTITY: { apply: (pattern, piece, op) => {
    if (typeof op.name !== 'string' || !op.name.trim() || op.name.length > 120) throw new TypeError('名前は1〜120文字で指定してください');
    if (op.nameSource !== undefined && !['user', 'ai'].includes(op.nameSource)) throw new TypeError('nameSourceはuserまたはaiです');
    return pattern;
  } },
  SET_ENTITY_SEMANTICS: { apply: (pattern, piece, op) => {
    record(op.semantics, ['anatomicalRegion', 'anatomicalSide'], 'semantics');
    if (!Object.keys(op.semantics).length) throw new TypeError('意味の属性を1つ以上指定してください');
    if (op.semantics.anatomicalRegion !== undefined && op.semantics.anatomicalRegion !== null
      && (typeof op.semantics.anatomicalRegion !== 'string' || !op.semantics.anatomicalRegion.trim() || op.semantics.anatomicalRegion.length > 120)) throw new TypeError('anatomicalRegionは1〜120文字またはnullです');
    if (op.semantics.anatomicalSide !== undefined && ![null, 'toward_side_seam', 'toward_center', 'toward_neckline', 'wearer_left', 'wearer_right'].includes(op.semantics.anatomicalSide)) throw new TypeError('anatomicalSideが未対応です');
    if (!['user', 'ai'].includes(op.semanticSource)) throw new TypeError('semanticSourceはuserまたはaiです');
    if (op.confidence !== undefined && op.confidence !== null && (!Number.isFinite(op.confidence) || op.confidence < 0 || op.confidence > 1)) throw new TypeError('confidenceは0〜1またはnullです');
    return pattern;
  } },
};

function assertValid(pattern) {
  const validation = validatePattern(pattern);
  if (!validation.valid) {
    const error = new RangeError(`数値検証に失敗しました: ${validation.errors.map(e => `${e.code}: ${e.message}`).join(', ')}`);
    error.code = validation.errors[0].code; error.validation = validation; error.details = validation.errors;
    throw error;
  }
  return validation;
}

/** Pure, atomic operation on the current geometry. Derived cutting lines are rebuilt. */
function applyOne(pattern, operation, deferValidation = false) {
  const handler = Object.hasOwn(registry, operation?.type) ? registry[operation.type] : null;
  record(operation, ['id', 'engineVersion', 'refs', 'positions', 'group', 'comment', 'type', 'piece', ...(handler ? operationDefinitions[operation.type].keys : [])], 'operation');
  if (operation.comment !== undefined && (typeof operation.comment !== 'string' || operation.comment.length > 2000)) throw new TypeError('操作の説明は2000文字以内の文字列が必要です');
  if (!handler) throw new RangeError(`未対応の操作: ${operation.type}`);
  validateAuthoringParameters(operation);
  if (!compatibleEngine(operation.engineVersion)) throw new RangeError('操作エンジンのバージョンが一致しません');
  if (operation.engineVersion === '0.4.0' && ['ADD_RELATION', 'UPDATE_RELATION', 'REMOVE_RELATION'].includes(operation.type)) throw new RangeError('縫合操作にはエンジン0.5.0が必要です');
  if (operation.engineVersion && operation.engineVersion !== ENGINE_VERSION && ['ADD_ATTACHMENT_LINE', 'SET_PIECE_PLACEMENT', 'SET_OVERLAP_RELATION', 'REMOVE_ASSEMBLY_RELATION'].includes(operation.type)) throw new RangeError('取付操作にはエンジン0.6.0が必要です');
  if (operation.group !== undefined) {
    record(operation.group, ['id', 'name'], 'group');
    if (typeof operation.group.id !== 'string' || !/^[a-z][a-z0-9-]{1,99}$/.test(operation.group.id)
      || typeof operation.group.name !== 'string' || !operation.group.name.trim() || operation.group.name.length > 120) throw new TypeError('グループには固定IDと1〜120文字の名前が必要です');
    const previous = pattern.referenceGraph?.operations.find(o => o.group?.id === operation.group.id);
    if (previous && previous.group.name !== operation.group.name) throw new RangeError('同じグループIDには同じ名前を指定してください');
  }
  pattern = initializeReferences(pattern);
  const id = operationIdentity(operation, pattern.referenceGraph.operations.map(o => o.id));
  operation = { ...bindOperation(pattern, operation), id, engineVersion: ENGINE_VERSION };
  if (!deferValidation) assertValid(pattern);
  const selected = targetPiece(pattern, operation.piece);
  if(selected.cut.seamAllowances && !['ADD_SEAM_ALLOWANCE','SET_EDGE_ALLOWANCE','SET_EDGE_ALLOWANCES','SET_CUT_INSTANCES','ADD_NOTCH','RENAME_ENTITY','SET_ENTITY_SEMANTICS','ADD_RELATION','UPDATE_RELATION','REMOVE_RELATION','ADD_ATTACHMENT_LINE','SET_PIECE_PLACEMENT','SET_OVERLAP_RELATION','REMOVE_ASSEMBLY_RELATION'].includes(operation.type)) throw new RangeError('輪郭加工の前に辺別縫い代を解除してください');
  let result = handler.apply(pattern, selected, operation);
  if (!deferValidation) { result = deriveCuttingBoundaries(result); assertValid(result); }
  result = updateReferences(pattern, result, operation);
  validateReferences(result);
  if (pattern.operationDocument) result = deepFreeze({ ...result, operationDocument: {
    ...pattern.operationDocument, version: OPERATION_VERSION,
    operations: [...pattern.operationDocument.operations, structuredClone(operation)],
  } });
  return deepFreeze({ ...result, lastOperation: operation });
}

export function applyPatternOperation(pattern, operation) { return applyOne(pattern, operation); }

/** Rebuild the base once, then replay immutable operations in order. v0.1 remains EXTEND-only. */
export function compileOperations(input) {
  record(input, ['format', 'version', 'engineVersion', 'methodVersion', 'base', 'operations'], 'document');
  if (!compatibleEngine(input.engineVersion)) throw new RangeError('操作エンジンのバージョンが一致しません');
  if (input.format !== OPERATION_FORMAT || !['0.1.0', '0.2.0', '0.3.0', '0.4.0', '0.5.0', OPERATION_VERSION].includes(input.version)) throw new RangeError('未対応の操作ファイル形式・バージョンです');
  if (!['0.5.0', OPERATION_VERSION].includes(input.version) && input.operations?.some(op => ['ADD_RELATION', 'UPDATE_RELATION', 'REMOVE_RELATION'].includes(op?.type))) throw new RangeError('縫合操作の保存形式は0.5.0以降が必要です');
  if (input.version !== OPERATION_VERSION && input.operations?.some(op => ['ADD_ATTACHMENT_LINE', 'SET_PIECE_PLACEMENT', 'SET_OVERLAP_RELATION', 'REMOVE_ASSEMBLY_RELATION'].includes(op?.type))) throw new RangeError('取付操作の保存形式は0.6.0が必要です');
  record(input.base, ['method', 'body', 'design'], 'base');
  if (typeof input.base.method !== 'string') throw new TypeError('原型の方式を明示してください');
  if (!Array.isArray(input.operations)) throw new TypeError('operations: 配列が必要です');
  const basePattern = initializeReferences(draftBasicPattern(input.base));
  if (input.methodVersion !== basePattern.method.version) throw new RangeError('原型の実装バージョンが一致しません');
  let pattern = basePattern;
  assertValid(pattern);
  const operations = [];
  for (const [index, operation] of input.operations.entries()) {
    try {
      if (input.version === '0.1.0' && operation?.type !== 'EXTEND') throw new RangeError('v0.1.0は袖のEXTENDのみ対応しています');
      pattern = applyOne(pattern, operation, true);
      operations.push(structuredClone(pattern.lastOperation));
    } catch (error) {
      const failure = new RangeError(`操作${index + 1} (${operation?.type ?? '?'})：${error.message}`, { cause: error });
      failure.operationIndex = index;
      failure.operationType = operation?.type;
      failure.operationId = operation?.id ?? null;
      failure.code = error.code ?? 'invalid-operation';
      failure.entityIds = error.entityIds ?? Object.values(operation?.refs ?? {});
      failure.candidates = error.candidates ?? [];
      failure.details = error.details ?? [];
      failure.validation = error.validation ?? null;
      throw failure;
    }
  }
  const document = deepFreeze({ format: OPERATION_FORMAT, version: OPERATION_VERSION, engineVersion: ENGINE_VERSION, methodVersion: basePattern.method.version,
    base: { method: basePattern.method.id, body: basePattern.body, design: basePattern.design }, operations });
  pattern = deepFreeze({ ...deriveCuttingBoundaries(pattern), operationDocument: document,
    notices: input.operations.length ? [
      ...basePattern.notices.filter(note => !note.startsWith('ウエスト絞り・')),
      `適用操作: ${input.operations.map(op => op.type).join(' → ')}`,
      '縫い代・ダーツ・開きは各パーツの操作履歴に従います。試着補正と縫製設計が必要です。',
    ] : basePattern.notices });
  return { document, basePattern, pattern, validation: assertValid(pattern) };
}

/** Pure transactional batch: the input remains untouched if any member fails. */
export function applyOperationBatch(pattern, operations, resolveOperation = null) {
  if (!Array.isArray(operations)) throw new TypeError('operationsは配列です');
  assertValid(pattern);
  let candidate = pattern;
  for (const [index, operation] of operations.entries()) {
    try { candidate = applyOne(candidate, resolveOperation ? resolveOperation(candidate, operation, index) : operation, true); }
    catch (error) { error.batchIndex = index; error.operationId = operation?.id ?? null; throw error; }
  }
  candidate = deriveCuttingBoundaries(candidate);
  assertValid(candidate);
  return candidate;
}

export function createOperationDocument(base) {
  const basePattern = draftBasicPattern(base);
  return compileOperations({ format: OPERATION_FORMAT, version: OPERATION_VERSION, methodVersion: basePattern.method.version, base, operations: [] }).document;
}
