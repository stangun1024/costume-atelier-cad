import { authoringDefinitions } from '../pattern/authoring-definitions.js';
export const operationNames = {
  ...Object.fromEntries(Object.entries(authoringDefinitions).map(([type,d])=>[type,d.label])),
  EXTEND: '袖丈を変更', RESHAPE: '輪郭のカーブを変更', SLASH_SPREAD: '切り開いて展開',
  ADD_FLARE: '袖口にフレアを追加', ADD_SLIT: '縫合に開きを追加', ADD_SEAM_ALLOWANCE: '縫い代を設定',
  ADD_DART: 'ダーツを追加', PIVOT_DART: 'ダーツを移動', SPLIT_PIECE: '線でパーツを分割',
  CONVERT_DART_TO_SEAMS: 'ダーツを通常の縫合に変換',
  RENAME_ENTITY: '対象の名前を変更',
  SET_ENTITY_SEMANTICS: '対象の意味を設定',
};
