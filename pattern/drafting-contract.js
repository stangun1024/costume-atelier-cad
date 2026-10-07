import { PatternPiece, deepFreeze } from './piece.js';

export const DRAFTING_CONTRACT = deepFreeze({
  version: '1.0.0', unit: 'mm', coordinates: { x: 'right', y: 'down', space: 'piece-local' },
  sourceOfTruth: 'named-sewing-edges', displayPlacement: 'export-only',
  measurements: 'body-input-not-finished-dimensions',
  dartState: 'flat-open', sewingTipDefault: null,
  absentFeatures: 'do-not-invent', curveAccuracy: 'method-curve-policy',
  fitVerified: false,
});

/** Adds drafting provenance, never changes method formulae or their geometry. */
export function withDraftingContract(pattern) {
  return deepFreeze({ ...pattern, draftingContract: DRAFTING_CONTRACT,
    pieces: pattern.pieces.map(piece => new PatternPiece({ ...piece,
      drafting: { coordinateSpace: 'piece-local', source: 'method', methodId: pattern.method.id,
        methodVersion: pattern.method.version, curvePolicy: pattern.method.curvePolicy,
        sewingTipStatus: 'not-designed', ...piece.drafting },
      darts: piece.darts.map(dart => ({ ...dart, pivot: dart.apex, sewingTip: dart.sewingTip ?? null })),
    })),
  });
}
