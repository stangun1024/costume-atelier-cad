import { evaluateDraftingRecipe } from './evaluator.js';
import { record, finite } from '../../core/input-validation.js';
import { validatePattern } from '../validation.js';

export function compileDraftingRecipe(recipe, bodyInput, designInput = {}, libraries = []) {
  const method=recipe.method;
  for(const [value,allowed,name] of [[bodyInput,['unit',...method.requiredMeasurements],'body'],[designInput,method.supportedDesignParameters,'design']]){
    if(value&&typeof value==='object')for(const key of Object.keys(value))if(!allowed.includes(key))throw new TypeError(`Unsupported ${name} parameter: ${key}（未対応の項目）`);
  }
  record(bodyInput,['unit',...method.requiredMeasurements],'body');
  record(designInput,method.supportedDesignParameters,'design');
  if(bodyInput.unit!=='mm')throw new TypeError('body.unit must be mm');
  const body={unit:'mm'};
  for(const key of method.requiredMeasurements)body[key]=finite(bodyInput[key],key,...method.inputRanges[key]);
  const design={sleeveLength:finite(designInput.sleeveLength??body.armLength,'sleeveLength',...method.inputRanges.sleeveLength)};
  const result=evaluateDraftingRecipe(recipe,{body,design},libraries);
  // Historical old-Bunka callers inspect invalid combinations themselves.
  // Preserve that contract; the editing compiler always validates every method.
  if(recipe.validation!==undefined&&!['report','strict'].includes(recipe.validation))throw new RangeError('レシピのvalidationはreport/strictです');
  if(recipe.validation!=='report'){
    const report=validatePattern(result);
    if(!report.valid)throw new RangeError(`採寸の組み合わせで原型が成立しません: ${report.errors.map(e=>e.message).join('、')}`);
  }
  return result;
}
