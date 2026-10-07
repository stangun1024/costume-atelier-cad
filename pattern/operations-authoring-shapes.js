import { Point } from '../core/geometry.js';
import { PatternPiece } from './piece.js';
import { linePath } from './operation-tools.js';

export function rectanglePiece(id, name, width, height, quantity = 1, drafting = {}) {
  const a = new Point(0, 0), b = new Point(width, 0), c = new Point(width, height), d = new Point(0, height);
  return new PatternPiece({ id, name, edges: [[a, b], [b, c], [c, d], [d, a]].map(([s, e], i) => ({ id: ['top', 'right', 'bottom', 'left'][i], role: 'open', path: linePath(s, e) })),
    grainline: linePath(new Point(width / 2, height * 0.2), new Point(width / 2, height * 0.8)),
    cut: { quantity, onFold: false, mirroredPair: false, seamAllowance: 0 }, drafting: { source: 'operation', ...drafting } });
}
