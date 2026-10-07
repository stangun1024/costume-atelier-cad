import { edgeChanges } from './reference-events.js';
/** A sewing side is one edge, or an ordered chain of edges across split pieces. */
export const sewingRefs = side => Array.isArray(side) ? side : [side];
export const compactRefs = refs => refs.length === 1 ? refs[0] : refs;
export const effectiveEdgeLength = (piece, edge, tolerance = 0.001) =>
  piece.features.find(f => f.type === 'pleats' && Object.hasOwn(f.sewnLengths, edge.id))?.sewnLengths[edge.id] ?? edge.path.length(tolerance);
export const sewingLength = (pattern, side) => sewingRefs(side).reduce((sum, ref) =>
  { const piece = pattern.pieces.find(p => p.id === ref.piece);
    const line = [...piece.edges, ...(piece.attachmentLines ?? [])].find(e => e.id === ref.edge);
    return sum + (ref.range?.mode === 'interval' ? ref.range.endMm - ref.range.startMm : effectiveEdgeLength(piece, line)); }, 0);

/** participants are the only stored form. a/b below are a read-only compatibility view. */
export function participantRefs(pattern, participant) {
  return (participant?.segments ?? []).map(segment => {
    const pieceRef = segment.pieceRef ?? participant.pieceRef;
    const piece = pattern.pieces.find(p => p.entityId === pieceRef || p.id === pieceRef);
    const edge = piece && [...piece.edges, ...(piece.attachmentLines ?? [])].find(e => e.entityId === segment.lineRef || e.id === segment.lineRef);
    return { piece: piece?.id ?? pieceRef, edge: edge?.id ?? segment.lineRef, ...(segment.range?.mode === 'interval' ? { range: segment.range } : {}) };
  });
}
export function sewingSides(pattern, relation) {
  if (!relation?.participants) return relation;
  const [a, b] = relation.participants;
  const directionOf = p => p?.segments?.every(s => s.direction === 'forward') ? 'forward'
    : p?.segments?.every(s => s.direction === 'reverse') ? 'reverse' : null;
  const da = directionOf(a), db = directionOf(b);
  const refs = p => {
    const list = participantRefs(pattern, p);
    return compactRefs(directionOf(p) === 'reverse' ? list.reverse() : list);
  };
  const difference = b?.fit?.mode === 'stretch' ? (b.fit.amountMm ?? 0) : -(b?.fit?.amountMm ?? 0);
  return { ...relation, a: refs(a), b: refs(b), ease: relation.legacyEase ?? { min: difference, max: difference },
    direction: relation.legacyDirection ?? (da && db ? da === db ? 'same' : 'opposite' : null) };
}
export const relationRefs = (pattern, relation) => relation.participants
  ? relation.participants.flatMap(p => participantRefs(pattern, p))
  : [...sewingRefs(relation.a), ...sewingRefs(relation.b)];

export function normalizeSewingRelation(pattern, relation) {
  const { a, b, direction, ease, ...metadata } = relation;
  const participants = relation.participants ?? [a, b].map((side, index) => {
    const reversed = index === 1 && direction === 'opposite';
    const refs = [...sewingRefs(side)];
    if (reversed) refs.reverse();
    return { id: index === 0 ? 'a' : 'b', pieceRef: refs[0]?.piece,
      segments: refs.map(ref => ({ pieceRef: ref?.piece, lineRef: ref?.edge,
        range: { mode: 'whole' }, direction: index === 0 || direction === 'same' ? 'forward' : reversed ? 'reverse' : null })),
      fit: { mode: 'plain' } };
  });
  return { ...metadata,
    ...(!relation.participants ? { legacy: true, legacyEase: ease, referenceParticipantId: 'a', matchPoints: [],
      ...(direction != null && !['same', 'opposite'].includes(direction) ? { legacyDirection: direction } : {}) } : {}),
    participants: participants.map(participant => {
      const refs = participantRefs(pattern, participant);
      const owner = pattern.pieces.find(p => p.id === refs[0]?.piece);
      return { ...participant, pieceRef: owner?.entityId ?? participant.pieceRef,
        segments: participant.segments.map((segment, i) => {
          const piece = pattern.pieces.find(p => p.id === refs[i]?.piece);
          const edge = piece && [...piece.edges, ...(piece.attachmentLines ?? [])].find(e => e.id === refs[i]?.edge);
          const { pieceRef, ...rest } = segment;
          return { ...rest, lineRef: edge?.entityId ?? segment.lineRef,
            ...(piece && piece.id !== owner?.id ? { pieceRef: piece.entityId ?? piece.id } : {}) };
        }) };
    }) };
}

export function mapSewingRelation(pattern, relation, map) {
  if (!relation.participants) return { ...relation, ...Object.fromEntries(['a', 'b'].map(side =>
    [side, compactRefs(sewingRefs(relation[side]).flatMap(map))])) };
  let pending = false;
  const participants = relation.participants.map(participant => {
    const refs = participantRefs(pattern, participant);
    const segments = participant.segments.flatMap((segment, i) => {
      let replacements = map(refs[i]);
      if (!Array.isArray(replacements)) replacements = [replacements];
      if (segment.range?.mode === 'interval' && (replacements.length !== 1 || replacements[0].piece !== refs[i].piece || replacements[0].edge !== refs[i].edge)) {
        pending = true;
        return [segment];
      }
      if (segment.direction === 'reverse') replacements = [...replacements].reverse();
      return replacements.map(ref => ({ ...segment, pieceRef: ref.piece, lineRef: ref.edge }));
    });
    if (!relation.legacy && new Set(segments.map(s => s.pieceRef)).size > 1) pending = true;
    return { ...participant, pieceRef: segments[0]?.pieceRef, segments };
  });
  return { ...relation, participants, ...(pending ? { status: 'pending', pendingReason: '分割で参加線または部分区間の対応が変わりました。縫合を再選択してください。' } : {}) };
}

/** Keep sewing chains and notch measurements attached when an edge is partitioned.
 * fragments carry the original edge's increasing arc-length offsets.
 */
export function remapSewing(pattern, source, replacements, pieces) {
  const lookup = ref => ref.piece === source.id ? replacements.get(ref.edge) : null;
  const relations = pattern.relations.map(r => mapSewingRelation(pattern, r,
    ref => lookup(ref)?.map(f => ({ piece: f.piece, edge: f.edge })) ?? [ref]));
  const notchPairs = pattern.notchPairs.map(pair => ({ ...pair, ...Object.fromEntries(['a', 'b'].map(side => {
    const ref = pair[side];
    if (ref.piece !== source.id) return [side, ref];
    const mark = source.notches.find(n => n.id === ref.notch);
    const fragments = replacements.get(mark.edgeId);
    if (!fragments) return [side, ref];
    const fragment = fragments.findLast(f => mark.distanceFromStart >= f.startMm - 1e-7) ?? fragments[0];
    const offset = ref.fromEnd ? source.edge(mark.edgeId).path.length() - fragment.startMm - fragment.path.length() : fragment.startMm;
    return [side, { ...ref, piece: fragment.piece, distanceOffsetMm: (ref.distanceOffsetMm ?? 0) + offset }];
  })) }));
  return { relations, notchPairs, pieces, topologyChanges: edgeChanges(pattern, source, replacements) };
}

export function partitionNotches(source, replacements, pieceId, edges) {
  return source.notches.flatMap(mark => {
    const fragments = replacements.get(mark.edgeId);
    if (!fragments) return edges.some(e => e.id === mark.edgeId) ? [mark] : [];
    const f = fragments.findLast(f => mark.distanceFromStart >= f.startMm - 1e-7) ?? fragments[0];
    return f.piece === pieceId ? [{ ...mark, edgeId: f.edge, distanceFromStart: Math.max(0, mark.distanceFromStart - f.startMm) }] : [];
  });
}
