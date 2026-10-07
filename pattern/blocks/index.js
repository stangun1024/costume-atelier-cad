import { draftRecipeMethod, getDraftingRecipe, listRecipeMethods } from '../drafting/index.js';
import { withDraftingContract } from '../drafting-contract.js';

export const DEFAULT_DRAFTING_METHOD = 'bunka-new';

export function listDraftingMethods() {
  return listRecipeMethods();
}

export function getDraftingMethod(id) {
  return getDraftingRecipe(id).method;
}

/** A stable entry point: add another method without changing core or exporters. */
export function draftBasicPattern({ method = 'bunka-old', body, design = {} } = {}) {
  return withDraftingContract(draftRecipeMethod(method,body,design));
}
