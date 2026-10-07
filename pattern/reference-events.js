/** Transient topology events. The reference graph consumes these at commit time. */
export function edgeChanges(pattern, source, replacements) {
  return [...(pattern.topologyChanges ?? []), ...[...replacements].map(([id, parts]) => ({
    kind: 'edge', source: { piece: source.id, edge: id }, sourceLengthMm: source.edge(id).path.length(),
    outputs: parts.map(p => ({ piece: p.piece, edge: p.edge,
      fromMm: p.startMm, toMm: p.startMm + p.path.length(), direction: 1 })),
  }))];
}
