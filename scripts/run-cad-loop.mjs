import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { implementationPattern } from '../costume/implementation-plan.js';
import { applyLoopMessage, validateLoopSession } from '../costume/implementation-loop.js';
import { implementationError } from '../costume/implementation-error.js';
import { createAIContext } from '../pattern/ai-context.js';
import { executionReport } from '../costume/procedural-flow.js';
import { renderPatternSvg } from '../export/pattern-svg.js';

// A disposable, single-message preview. Never issue simulated request IDs to the app.
const [requestPath, messagePath, outputPath] = process.argv.slice(2);
if (!requestPath || !messagePath || !outputPath || process.argv.length !== 5) {
  console.error('Usage: node scripts/run-cad-loop.mjs ai-loop-packet.json candidate.json output-directory');
  process.exitCode = 1;
} else {
  const directory = resolve(outputPath);
  await mkdir(directory, { recursive: true });
  try {
    const saved = JSON.parse(await readFile(resolve(requestPath), 'utf8'));
    const request = saved.request ?? saved;
    const local = request.localExecution;
    const release = JSON.parse(await readFile(new URL('../cad-release.json', import.meta.url), 'utf8'));
    if (request.format !== 'aicad-loop-packet' || request.version !== 1 || local?.version !== 1
        || local.releaseId !== release.releaseId) throw Error('Use the exact CAD release specified by this request.');
    if (!local.base) throw Error('持ち込み画像の図形演算には対応していません');
    validateLoopSession(local.session);
    const message = JSON.parse(await readFile(resolve(messagePath), 'utf8'));
    for (const key of ['format', 'version', 'sessionId', 'requestId', 'baseFlowRevision']) {
      if (message[key] !== request.nextMessage?.[key]) throw Error(`Latest request header required: ${key}`);
    }
    const pattern = implementationPattern(local.base);
    const applied = applyLoopMessage(pattern, local.session, message);
    if (applied.duplicate) throw Error('This message has already been applied. Obtain the latest app packet.');
    const result = applied.result;
    const report = { previewOnly: true, releaseId: release.releaseId,
      messageType: message.type, packet: applied.session.lastPacket,
      report: executionReport(result, applied.session.plan), status: 'succeeded', geometry: createAIContext(result.pattern),
      instruction: 'Send response.json unchanged to the app. Only the app issues the next requestId. Local inspection does not satisfy the app end gate.' };
    await writeFile(resolve(directory, 'pattern.svg'), renderPatternSvg(result.pattern));
    await writeFile(resolve(directory, 'report.json'), JSON.stringify(report, null, 2));
    await writeFile(resolve(directory, 'response.json'), JSON.stringify(message, null, 2));
    console.log(JSON.stringify({ status: 'succeeded', previewOnly: true, directory }));
  } catch (error) {
    // Overwrite previous output names so a failed retry cannot leave an apparently valid response.
    await writeFile(resolve(directory, 'response.json'), 'null\n');
    await writeFile(resolve(directory, 'pattern.svg'), '<svg xmlns="http://www.w3.org/2000/svg"><text x="10" y="30">Preview failed; see report.json</text></svg>');
    const report = { status: 'failed', previewOnly: true, error: implementationError(error) };
    await writeFile(resolve(directory, 'report.json'), JSON.stringify(report, null, 2));
    console.error(JSON.stringify(report)); process.exitCode = 1;
  }
}
