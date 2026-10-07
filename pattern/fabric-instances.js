/** Instance IDs are local to a pattern piece; wearer side is always explicit. */
export function fabricInstances(piece) {
  return piece.cut.instances ?? Array.from({ length: piece.cut.quantity ?? 1 }, (_, i) => ({
    id: `copy-${i + 1}`, name: `${piece.name}・裁断${i + 1}`, side: 'unspecified', mirrored: Boolean(piece.cut.mirroredPair && i % 2),
  }));
}
export function instanceOf(piece, id) {
  const result = fabricInstances(piece).find(i => i.id === id);
  if (!result) throw new RangeError(`${piece.name}の裁断個体 ${id} がありません`);
  return result;
}
export const fabricKey = (piece, instanceId) => `${piece.entityId ?? piece.id}/${instanceId ?? '*'}`;
export function validateFabricScope(piece, instanceId, face) {
  if (instanceId !== undefined) instanceOf(piece, instanceId);
  if (face !== undefined && !['front', 'back'].includes(face)) throw new RangeError('布の面はfront（表）またはback（裏）です');
}
export function validateInstances(piece) {
  const instances = fabricInstances(piece);
  if (instances.length !== (piece.cut.quantity ?? 1) || new Set(instances.map(i => i.id)).size !== instances.length
      || instances.some(i => !/^[a-z][a-z0-9-]{0,99}$/.test(i.id) || typeof i.name !== 'string' || !i.name.trim()
        || !['left','right','center','unspecified'].includes(i.side) || typeof i.mirrored !== 'boolean'))
    throw new RangeError(`${piece.name}：裁断枚数と一致する一意の個体ID・名前・着用者側・反転指定が必要です`);
  if (piece.cut.mirroredPair && instances.filter(i => i.mirrored).length !== instances.length / 2)
    throw new RangeError(`${piece.name}：左右対称裁断は反転あり・なしを同数にしてください`);
}
