import oldBunka from './recipes/bunka-old.json' with { type: 'json' };
import newBunka from './recipes/bunka-new.json' with { type: 'json' };
import doreme from './recipes/doreme-new.json' with { type: 'json' };
import common from './recipes/common.json' with { type: 'json' };
import { deepFreeze } from '../piece.js';
import { compileDraftingRecipe } from './compile.js';

const registrations=deepFreeze({
  'bunka-new':{recipe:newBunka,system:'bunka'},
  'bunka-old':{recipe:oldBunka,system:'bunka'},
  'doreme-new':{recipe:doreme,system:'doreme'},
});
const recipes=Object.fromEntries(Object.entries(registrations).map(([id,entry])=>[id,entry.recipe]));
export const hasRecipeMethod=id=>Object.hasOwn(registrations,id);
export function recipeSystem(id) {
  if(!hasRecipeMethod(id))throw new RangeError(`Unsupported drafting method: ${id}`);
  return registrations[id].system;
}
deepFreeze(common);
export function getDraftingRecipe(id,{bundle=false}={}) {
  if(!Object.hasOwn(recipes,id))throw new RangeError(`Unsupported drafting method: ${id}`);
  const recipe=recipes[id];
  if(!bundle)return recipe;
  const available={...common,...recipe.templates},selected={};
  function collect(value){
    if(!value||typeof value!=='object')return;
    if(Object.hasOwn(value,'$call')&&!Object.hasOwn(selected,value.$call)){
      const definition=available[value.$call];
      if(!definition)throw new RangeError(`Missing drafting template: ${value.$call}`);
      selected[value.$call]=definition;collect(definition);
    }
    for(const child of Object.values(value))collect(child);
  }
  collect(recipe.steps);collect(recipe.result);
  return deepFreeze({...structuredClone(recipe),templates:structuredClone(selected)});
}
export const listRecipeMethods=()=>Object.values(recipes).map(r=>r.method);
export function draftRecipeMethod(id,body,design={}) {
  return compileDraftingRecipe(getDraftingRecipe(id),body,design,[common]);
}
