/** Shared operation contract; no geometry, UI or AI execution dependencies. */
import { authoringDefinitions } from './authoring-definitions.js';
import { pathSegmentsSchema } from './internal-path.js';
const number = (min, max) => ({ type: 'number', ...(min !== undefined ? { minimum: min } : {}), ...(max !== undefined ? { maximum: max } : {}) });
const vector = { type: 'object', required: ['x', 'y'], additionalProperties: false, properties: { x: number(), y: number() } };
const parameters = {
  EXTEND: { amountMm: number() }, ADD_SEAM_ALLOWANCE: { widthMm: number(0, 30) },
  RESHAPE: { control1Offset: vector, control2Offset: vector }, SLASH_SPREAD: { angleDeg: { ...number(-60, 60), description: '外向きのみ。絶対値0.01以上。輪郭の向きに依存します' } },
  ADD_FLARE: { amountMm: number(0.1, 300) }, ADD_SLIT: { lengthMm: number(0.1, 300), from: { enum: ['start', 'end'] } },
  ADD_DART: { widthMm: number(0.1, 100), depthMm: number(1, 300) }, PIVOT_DART: {}, SPLIT_PIECE: { segments: pathSegmentsSchema },
  CONVERT_DART_TO_SEAMS: {}, RENAME_ENTITY: { name: { type: 'string', minLength: 1, maxLength: 120 }, nameSource: { const: 'ai' } },
  SET_ENTITY_SEMANTICS: { semantics: { type: 'object', minProperties: 1, additionalProperties: false, properties: {
    anatomicalRegion: { type: ['string', 'null'], maxLength: 120 }, anatomicalSide: { enum: [null, 'toward_side_seam', 'toward_center', 'toward_neckline', 'wearer_left', 'wearer_right'] } } },
    semanticSource: { const: 'ai' }, confidence: { type: ['number', 'null'], minimum: 0, maximum: 1 } },
};
const references = {
  RESHAPE: { edge: null }, SLASH_SPREAD: { pivotEdge: 'pivotDistanceMm', cutEdge: 'distanceMm' },
  ADD_DART: { edge: 'distanceMm' }, PIVOT_DART: { dart: null, targetEdge: 'distanceMm' },
  ADD_SLIT: { relation: null }, SPLIT_PIECE: { startEdge: 'startDistanceMm', endEdge: 'endDistanceMm' },
  CONVERT_DART_TO_SEAMS: { dart: null }, RENAME_ENTITY: { entity: null },
  SET_ENTITY_SEMANTICS: { entity: null },
};
const types = ['EXTEND', 'RESHAPE', 'SLASH_SPREAD', 'ADD_FLARE', 'ADD_SLIT', 'ADD_SEAM_ALLOWANCE',
  'ADD_DART', 'PIVOT_DART', 'SPLIT_PIECE', 'CONVERT_DART_TO_SEAMS', 'RENAME_ENTITY', 'SET_ENTITY_SEMANTICS'];
for (const [type, definition] of Object.entries(authoringDefinitions)) {
  types.push(type); parameters[type] = definition.parameters; references[type] = definition.references;
}
export const referenceKind = field => field === 'dart' ? 'feature' : field === 'relation' ? 'relation'
  : ['piece', 'otherPiece'].includes(field) ? 'piece' : field === 'entity' ? null : 'edge';
export const operationDefinitions = Object.fromEntries(types.map(type => [type, {
  keys: [...Object.keys(parameters[type]), ...Object.keys(references[type] ?? {}), ...Object.values(references[type] ?? {}).filter(Boolean)], references: references[type] ?? {}, parameters: parameters[type],
  units: Object.fromEntries(Object.keys(parameters[type]).map(key => [key,
    key.endsWith('Mm') || key.endsWith('Offset') ? 'mm' : key.endsWith('Deg') ? 'degree' : null])),
}]));
export const operationTypes = types;
export const referenceFields = Object.fromEntries(Object.entries(operationDefinitions)
  .filter(([, definition]) => Object.keys(definition.references).length).map(([type, definition]) => [type, definition.references]));
// Preserve the established contract ordering for external clients.
export const operationParameters = Object.fromEntries(Object.keys(parameters).map(type => [type, operationDefinitions[type].parameters]));
