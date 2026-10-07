import { Point, Vector, Line, CubicBezier, Path } from '../core/geometry.js';
import { finite, point, mapPath, replacePiece, updatePiece } from './operation-tools.js';
import { edgeOperationReason, assertOperationAvailable } from './capabilities.js';
import { fitGrainline } from './grainline.js';

export function extend(pattern, piece, op) {
  assertOperationAvailable('EXTEND', pattern, piece);
  finite(op.amountMm, 'amountMm');
  const length = pattern.design.sleeveLength + op.amountMm;
  finite(length, 'sleeveLength', 300, 800);
  const height = piece.landmarks.frontUnderarm.y;
  if (length / 2 + 25 <= height) throw new RangeError('袖丈が肘線の製図条件を満たしません');
  const move = p => new Point(p.x, p.y + op.amountMm);
  const edges = piece.edges.map(edge => {
    if (edge.id === 'cuff') return { ...edge, path: mapPath(edge.path, move) };
    if (edge.id === 'underarm-front') return { ...edge, path: new Path([new Line(edge.path.start, move(edge.path.end))]) };
    if (edge.id === 'underarm-back') return { ...edge, path: new Path([new Line(move(edge.path.start), edge.path.end)]) };
    return edge;
  });
  const landmarks = { ...piece.landmarks, frontCuff: move(piece.landmarks.frontCuff), backCuff: move(piece.landmarks.backCuff) };
  const guides = piece.guides.map(guide => {
    if (guide.name === '肘線') return { ...guide, path: mapPath(guide.path, p => new Point(p.x, length / 2 + 25)) };
    if (guide.name === '袖中心線') return { ...guide, path: new Path([new Line(guide.path.start, move(guide.path.end))]) };
    return guide;
  });
  return replacePiece(pattern, updatePiece(piece, { edges, landmarks, guides,
    grainline: new Path([new Line(piece.grainline.start, move(piece.grainline.end))]) }), {
    design: { ...pattern.design, sleeveLength: length },
    dimensions: { ...pattern.dimensions, sleeve: { ...pattern.dimensions.sleeve, sleeveLength: length } },
  });
}

export function seamAllowance(pattern, piece, op) {
  finite(op.widthMm, 'widthMm', 0, 30);
  if (op.widthMm > 0) assertOperationAvailable('ADD_SEAM_ALLOWANCE', pattern, piece);
  const { seamAllowances, ...cut } = piece.cut;
  return replacePiece(pattern, updatePiece(piece, { cut: { ...cut, seamAllowance: op.widthMm } }));
}

export function reshape(pattern, piece, op) {
  const edge = piece.edge(op.edge);
  const reason = edgeOperationReason('RESHAPE', piece, edge);
  if (reason) throw new RangeError(`開いた辺のカーブ変更: ${reason}`);
  const a = point(op.control1Offset), b = point(op.control2Offset);
  const path = new Path([new CubicBezier(edge.path.start, edge.path.start.translate(new Vector(a.x, a.y)),
    edge.path.end.translate(new Vector(b.x, b.y)), edge.path.end)]);
  const edges = piece.edges.map(e => e.id === edge.id ? { ...e, path } : e);
  const boundary = new Path(edges.flatMap(e => e.path.segments), { closed: true });
  return replacePiece(pattern, updatePiece(piece, { edges, grainline: fitGrainline(boundary, piece.grainline),
    features: piece.features.map(f => f.type === 'slash-spread' && f.id === edge.id ? { ...f, edgeLengthMm: path.length() } : f) }));
}
