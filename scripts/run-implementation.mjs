import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { implementationPattern, previewImplementation } from '../costume/implementation-plan.js';
import { executionReport } from '../costume/procedural-flow.js';
import { createAIContext } from '../pattern/ai-context.js';
import { renderPatternSvg } from '../export/pattern-svg.js';
import { implementationError } from '../costume/implementation-error.js';

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath || process.argv.length !== 4) {
  console.error('Usage: node scripts/run-implementation.mjs input.json output-directory');process.exitCode=1;
} else {
  const directory=resolve(outputPath);
  await mkdir(directory,{recursive:true});
  try {
    const input=JSON.parse(await readFile(resolve(inputPath),'utf8'));
    if(input.format!=='aicad-procedural-flow'||input.version!==1||!Array.isArray(input.intentIds))throw Error('未対応のフロー形式です');
    const pattern=implementationPattern(input.base);
    const result=previewImplementation(pattern,input.plan,input.intentIds);
    const svgPath=resolve(directory,`pattern-${randomUUID()}.svg`);
    const report={...executionReport(result,input.plan),geometry:createAIContext(result.pattern),plan:input.plan,svg:svgPath};
    await writeFile(svgPath,renderPatternSvg(result.pattern));
    await writeFile(resolve(directory,'report.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify({status:report.status,appliedCount:result.appliedCount,report:resolve(directory,'report.json'),svg:svgPath}));
  } catch(error) {
    const report={status:'failed',svg:null,error:implementationError(error)};
    await writeFile(resolve(directory,'report.json'),JSON.stringify(report,null,2));
    console.error(JSON.stringify(report));process.exitCode=1;
  }
}
