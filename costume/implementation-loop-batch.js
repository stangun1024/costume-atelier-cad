import { applyLoopMessage, loopHeader } from './implementation-loop.js';
import { stableId } from '../pattern/references.js';

// One reply bundling several loop messages. Shared by the app and the published CAD runner.
const STEP_TYPES = ['patch', 'resolve', 'inspect', 'ask'];
const HEADER_KEYS = ['format', 'version', 'sessionId', 'requestId', 'baseFlowRevision'];

export const loopBatchContract = {
  batch: { messages: [{ type: 'patch', changes: [] }, { type: 'resolve', resolutions: [] }, { type: 'inspect', queries: [{ kind: 'full' }] }, { type: 'ask', questions: [] }] },
};

export function applyLoopReply(pattern, session, message) {
  if (message?.type !== 'batch') return applyLoopMessage(pattern, session, message);
  if (JSON.stringify(message).length > 1000000) throw Error('回答は1MB以内のJSONにしてください');
  const fingerprint = stableId('reply', JSON.stringify(message));
  const receipt = session.receipts.find(item => item.requestId === message.requestId);
  if (receipt) { if (receipt.fingerprint !== fingerprint) throw Error('適用済みの要求IDに異なる回答が届きました'); return { session, duplicate: true, result: null }; }
  const keys = [...HEADER_KEYS, 'type', 'messages'], extra = Object.keys(message).filter(k => !keys.includes(k)), missing = keys.filter(k => !Object.hasOwn(message, k));
  if (missing.length || extra.length) throw Object.assign(Error(`batchの項目が契約と一致しません。${missing.length ? `不足：${missing.join(' / ')}。` : ''}${extra.length ? `余分：${extra.join(' / ')}。` : ''}`), { code: 'message-contract', details: [{ missing, extra }] });
  const header = loopHeader(session, 'batch');
  if (HEADER_KEYS.some(k => message[k] !== header[k])) throw Error('対象・要求・フロー版が一致しません。最新の結果または全体をAIへ送り直してください');
  const steps = message.messages;
  if (!Array.isArray(steps) || !steps.length || steps.length > 10) throw Error('batchのmessagesは1〜10件です');
  let current = session, result = null, patched = false;
  const results = [];
  for (const [index, step] of steps.entries()) {
    try {
      if (!step || typeof step !== 'object' || Array.isArray(step)) throw Error('各messageはJSONオブジェクトです');
      if (!STEP_TYPES.includes(step.type)) throw Error(`batch内のtypeは${STEP_TYPES.join(' / ')}です。endは単独で送ってください`);
      const repeated = HEADER_KEYS.filter(k => Object.hasOwn(step, k));
      if (repeated.length) throw Error(`batch内のmessageに共通ヘッダー（${repeated.join(' / ')}）を書かないでください`);
      const applied = applyLoopMessage(pattern, current, { ...loopHeader(current, step.type), ...step });
      current = applied.session; if (applied.result) result = applied.result; if (step.type === 'patch') patched = true;
      results.push({ index, type: step.type, ...current.lastPacket });
    } catch (error) {
      error.message = `messages[${index}]（${step?.type ?? '不明'}）：${error.message}`;
      error.details = (error.details?.length ? error.details : [{ message: error.message }]).map(detail => ({ ...detail, path: `messages[${index}]${detail.path ? `.${detail.path}` : ''}` }));
      error.recovery ??= 'batch全体を適用していません。型紙・フロー版・質問は変更前のままです。同じrequestIdで修正したbatch全体を返してください。';
      throw error;
    }
  }
  const next = structuredClone(current);
  // Keep the last step's packet at the top so end gates and screens read it as usual.
  next.lastPacket = { ...current.lastPacket, batch: results.slice(0, -1) };
  if (patched) next.previousPlan = structuredClone(session.plan);
  next.receipts = [...session.receipts, { requestId: message.requestId, fingerprint }].slice(-100);
  return { session: next, result, duplicate: false };
}
