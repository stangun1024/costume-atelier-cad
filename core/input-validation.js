/** Input checks shared by geometry, authored documents and browser sessions. */
export function record(value, keys, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${name}: オブジェクトが必要です`);
  for (const key of Object.keys(value)) if (!keys.includes(key)) throw new TypeError(`${name}: 未対応の項目 ${key}`);
}
export function finite(value, name, min = -Infinity, max = Infinity) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${name}: 有限の数値が必要です`);
  if (value < min || value > max) throw new RangeError(`${name}: ${min}〜${max}の範囲で指定してください`);
  return value;
}
