import { Point, Line, Path } from '../core/geometry.js';
import { offsetPath } from '../core/offsets.js';
import { reversePath } from '../core/path-tools.js';
import { mapPath, linePath, updatePiece, replacePiece } from './operation-tools.js';
import { rectanglePiece } from './operations-authoring-shapes.js';
import { PatternPiece } from './piece.js';
import { panelGrain } from './operations-split.js';
import { resolveReference } from './references.js';
import { rectanglePanelReason } from './capabilities.js';

const point = (x, y) => new Point(x, y);
const newId = (pattern, piece, op, suffix = '') => {
  const id = `${piece.id}-${op.id}${suffix}`;
  if (pattern.pieces.some(p => p.id === id)) throw new RangeError('追加パーツIDが重複しています');
  return id;
};
export function createPleats(pattern, piece, op) {
  const reason = rectanglePanelReason(piece, { verticalGrain: true });
  if (reason) throw new RangeError(reason);
  const bounds = piece.boundary.bounds(), { minX, minY, maxX, maxY } = bounds;
  const positions = Array.from({ length: op.count }, (_, i) => minX + op.firstOffsetMm + i * op.spacingMm);
  if (positions.at(-1) >= maxX - 0.1 || positions[0] <= minX) throw new RangeError('プリーツ位置をパネルの幅内に収めてください');
  const intake = 2 * op.depthMm, expandedWidth = maxX - minX + op.count * intake;
  const move = p => point(p.x + positions.filter(x => x < p.x).length * intake, p.y);
  const edges = piece.edges.map(e => ({ ...e, path: mapPath(e.path, move) }));
  const guides = positions.flatMap((x, i) => {
    const start = x + i * intake;
    return [0, op.depthMm, intake].map((offset, j) => ({
      name: `プリーツ${i + 1}・${j === 1 ? '谷折り' : j === (op.direction === 'left' ? 0 : 2) ? '山折り' : '重ね位置'}`,
      kind: j === 1 ? 'valley-fold' : j === (op.direction === 'left' ? 0 : 2) ? 'mountain-fold' : 'placement',
      path: linePath(point(start + offset, minY), point(start + offset, maxY)),
    }));
  });
  const widths = Object.fromEntries(piece.edges.filter(e => Math.abs(e.path.start.y - e.path.end.y) < 1e-7).map(e => [e.id, e.path.length()]));
  return replacePiece(pattern, updatePiece(piece, { edges, guides,
    landmarks: Object.fromEntries(Object.entries(piece.landmarks).map(([k, p]) => [k, move(p)])),
    grainline: mapPath(piece.grainline, move),
    features: [{ id: `${op.id}-pleats`, type: 'pleats', count: op.count, depthMm: op.depthMm, direction: op.direction,
      foldedWidthMm: maxX - minX, expandedWidthMm: expandedWidth, sewnLengths: widths,
      edgeLengths: Object.fromEntries(edges.map(e => [e.id, e.path.length()])) }],
  }));
}
export function createStandCollar(pattern, piece, op) {
  if (op.necklineDirections && op.necklineDirections.length !== op.necklineIds.length) throw new RangeError('襟ぐりごとに方向を指定してください');
  const sources = op.necklineIds.map((id, i) => {
    const ref = resolveReference(pattern, id, 'edge').entity, owner = pattern.pieces.find(p => p.id === ref.localPiece), edge = owner.edge(ref.localId);
    if (edge.role !== 'open' || owner.features.length) throw new RangeError('他の縫合・折り構造に使っていない襟ぐりの辺を指定してください');
    const direction = op.necklineDirections?.[i] ?? (!owner.splitFrom && edge.id === 'neckline'
      ? owner.id === 'back' ? 1 : owner.id === 'front' ? -1 : null : null);
    if (![1, -1].includes(direction)) throw new RangeError('襟ぐりの後中心→前中心の方向をnecklineDirectionsで指定してください');
    return { piece: owner.id, edge: edge.id, direction, lengthMm: edge.path.length(0.001), shape: JSON.stringify(edge.path) };
  });
  const length = sources.reduce((n, s) => n + s.lengthMm, 0), width = length + op.overlapMm, height = op.heightMm;
  const id = newId(pattern, piece, op);
  if (length < 10) throw new RangeError('襟付け線が短すぎます');
  const edges = [{ id: 'top', role: 'open', path: linePath(point(0, 0), point(width, 0)) },
    { id: 'front', role: 'open', path: linePath(point(width, 0), point(width, height)) }];
  if (op.overlapMm) edges.push({ id: 'overlap', role: 'open', path: linePath(point(width, height), point(length, height)) });
  let cursor = length;
  const relations = [];
  for (let i = sources.length - 1; i >= 0; i--) {
    const source = sources[i], edgeId = `neck-${String.fromCharCode(97 + i)}`, end = cursor - source.lengthMm;
    edges.push({ id: edgeId, role: 'sew', path: linePath(point(cursor, height), point(Math.abs(end) < 1e-7 ? 0 : end, height)) });
    relations.push({ id: `${id}-${edgeId}`, kind: 'sew', direction: source.direction === 1 ? 'opposite' : 'same', a: { piece: source.piece, edge: source.edge }, b: { piece: id, edge: edgeId }, ease: { min: 0, max: 0 }, note: '襟付け' });
    cursor = end;
  }
  edges.push({ id: 'back', role: op.onFold ? 'fold' : 'open', path: linePath(point(0, height), point(0, 0)) });
  const collar = new PatternPiece({ id, name: 'スタンドカラー（直線型）', edges,
    grainline: linePath(point(width * 0.2, height / 2), point(width * 0.8, height / 2)),
    cut: { quantity: op.onFold ? 1 : 2, onFold: op.onFold, mirroredPair: !op.onFold, seamAllowance: 0 },
    drafting: { source: 'operation', derivedFrom: { kind: 'stand-collar', sources }, limitation: '直線型。襟の沿い・表裏の構成は着用設計が必要' } });
  const pieces = pattern.pieces.map(p => updatePiece(p, { edges: p.edges.map(e => sources.some(s => s.piece === p.id && s.edge === e.id) ? { ...e, role: 'sew' } : e) }));
  return { ...pattern, pieces: [...pieces, collar], relations: [...pattern.relations, ...relations] };
}
export function createFacing(pattern, piece, op) {
  const source = piece.edge(op.edge);
  if (source.role !== 'open' || piece.features.length) throw new RangeError('開いた辺に見返しを作成してください');
  const offset = offsetPath(source.path, op.widthMm, { side: op.side, join: 'miter' });
  const edges = [{ id: 'attachment', role: 'sew', path: source.path },
    { id: 'end', role: 'open', path: linePath(source.path.end, offset.end) },
    { id: 'outer', role: 'open', path: reversePath(offset) },
    { id: 'start', role: 'open', path: linePath(offset.start, source.path.start) }];
  const boundary = new Path(edges.flatMap(e => e.path.segments), { closed: true }), id = newId(pattern, piece, op);
  const facing = new PatternPiece({ id, name: `${piece.name}・見返し`, edges, grainline: panelGrain(boundary, piece.grainline),
    cut: { quantity: piece.cut.onFold ? 2 : piece.cut.quantity, onFold: false, mirroredPair: Boolean(piece.cut.onFold || piece.cut.mirroredPair), seamAllowance: 0 },
    drafting: { source: 'operation', derivedFrom: { kind: 'facing', sources: [{ piece: piece.id, edge: source.id, lengthMm: source.path.length(0.001), shape: JSON.stringify(source.path) }] },
      limitation: '帯の両端は直角接続。肩・脇との取り合いは別途設計' } });
  const updated = updatePiece(piece, { edges: piece.edges.map(e => e.id === source.id ? { ...e, role: 'sew' } : e) });
  return { ...pattern, pieces: [...pattern.pieces.map(p => p.id === piece.id ? updated : p), facing],
    relations: [...pattern.relations, { id: `${id}-seam`, kind: 'sew', direction: 'same', a: { piece: piece.id, edge: source.id }, b: { piece: id, edge: 'attachment' }, ease: { min: 0, max: 0 }, note: '見返し付け' }] };
}
export function createPlacket(pattern, piece, op) {
  const edge = piece.edge(op.edge);
  if (edge.role !== 'open' || edge.path.segments.length !== 1 || !(edge.path.segments[0] instanceof Line)) throw new RangeError('わを開いた後の直線の前開きを指定してください');
  const height = edge.path.length();
  if (2 * op.endMarginMm >= height) throw new RangeError('ボタンの端からの余白を短くしてください');
  if ((op.buttonholeLengthMm === undefined) !== (op.buttonholeWidthMm === undefined)) throw new RangeError('ボタン穴の長さと幅を両方指定してください');
  if (op.buttonholeLengthMm !== undefined && (op.buttonholeLengthMm >= op.finishedWidthMm || op.buttonholeWidthMm >= op.buttonholeLengthMm
      || op.buttonholeWidthMm >= op.buttonSpacingMm)) throw new RangeError('ボタン穴は仕上がり幅内に収め、穴幅を長さ・ボタン間隔より小さくしてください');
  if (op.interfacingWidthMm > op.finishedWidthMm) throw new RangeError('芯幅は比翼の仕上がり幅以内にしてください');
  const make = (suffix, name, panels) => {
    const id = newId(pattern, piece, op, suffix), width = panels * op.finishedWidthMm + 2 * op.turnUnderMm;
    const initial = rectanglePiece(id, name, width, height, 1, {
      derivedFrom: { kind: 'placket', sources: [{ piece: piece.id, edge: edge.id, lengthMm: height, shape: JSON.stringify(edge.path) }] },
      attachmentPending: true, limitation: '取付線を身頃個体へ縫合し配置する。穴・芯の不足はconstructionProgressで確認。開閉は実物で確認' });
    const attachmentLines = [{ id: 'placket-attachment', name: `${name}・取付線`, role: 'attachment',
      path: linePath(point(op.turnUnderMm, 0), point(op.turnUnderMm, height)), coordinateMode: 'piece-fixed' }];
    const guides = Array.from({ length: panels + 1 }, (_, i) => ({ name: `折り線${i + 1}`, kind: 'fold',
      path: linePath(point(op.turnUnderMm + i * op.finishedWidthMm, 0), point(op.turnUnderMm + i * op.finishedWidthMm, height)) }));
    const x = op.turnUnderMm + op.finishedWidthMm / 2;
    let index = 0;
    for (let y = op.endMarginMm; y <= height - op.endMarginMm; y += op.buttonSpacingMm) {
      guides.push({ name: 'ボタン中心', kind: 'button-center', path: linePath(point(x - 2, y), point(x + 2, y)) });
      if (suffix === '-upper' && op.buttonholeLengthMm !== undefined) attachmentLines.push({ id: `buttonhole-${++index}`, name: `${name}・ボタン穴${index}`,
        role: 'buttonhole', face: 'front', widthMm: op.buttonholeWidthMm,
        path: linePath(point(x - op.buttonholeLengthMm / 2, y), point(x + op.buttonholeLengthMm / 2, y)), coordinateMode: 'piece-fixed' });
    }
    if (op.interfacingWidthMm !== undefined) {
      const left = x - op.interfacingWidthMm / 2, right = x + op.interfacingWidthMm / 2, top = op.endMarginMm, bottom = height - op.endMarginMm;
      const pts = [point(left,top),point(right,top),point(right,bottom),point(left,bottom)];
      attachmentLines.push({ id: 'placket-interfacing', name: `${name}・芯の範囲`, role: 'interfacing', face: 'back', coordinateMode: 'piece-fixed',
        path: new Path(pts.map((p,i) => new Line(p,pts[(i+1)%4])), { closed: true }) });
    }
    return new PatternPiece({ ...initial, guides, attachmentLines });
  };
  return { ...pattern, pieces: [...pattern.pieces, make('-upper', '比翼・上前の帯', 3), make('-under', '比翼・下前の帯', 2)],
    notices: [...pattern.notices, '比翼の帯・折り線・取付線を作成しました。取付先の個体・表裏・配置と、穴・芯の指定状況を確認してください。'] };
}
