export const pendingCategories = Object.freeze({
  information: '情報・仕様が未確定', unsupported: 'CADの機能不足', 'execution-failed': '実行時の失敗',
  sewing: '意図的に縫製工程へ残す', 'not-needed': '加工不要', unclassified: '旧記録・区分未指定',
});
export const pendingCategoryLabel = item => pendingCategories[item.category ?? 'unclassified'];
