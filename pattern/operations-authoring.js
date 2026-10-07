import { Point, Vector, Line, CubicBezier, Path } from '../core/geometry.js';
import { locateAtLength } from '../core/path-tools.js';
import { rectanglePiece } from './operations-authoring-shapes.js';
import { createPleats, createStandCollar, createFacing, createPlacket } from './operations-fabric.js';
import { mergePieces, parallelSpread, trueDartEdge, setEdgeAllowances, setEdgeAllowance } from './operations-finishing.js';
import { updatePiece, replacePiece, linePath, mapPath, finite } from './operation-tools.js';
import { fitGrainline } from './grainline.js';
import { splitPiece } from './operations-split.js';
import { convertDart, pivotDart } from './operations-dart.js';
import { relationRefs } from './sewing.js';
import { addRelation, updateRelation, removeRelation, addAttachmentLine, setPlacement, setOverlap, removeAssemblyRelation } from './operations-relations.js';
import { authoringDefinitions } from './authoring-definitions.js';
import { editablePieceReason, edgeOperationReason } from './capabilities.js';
import { validateInstances } from './fabric-instances.js';

function validateValue(value, schema, key) {
  if (schema.enum && !schema.enum.includes(value)) throw new TypeError(`${key}の選択肢が不正です`);
  if (schema.type === 'number' || schema.type === 'integer') {
    finite(value, key, schema.minimum, schema.maximum);
    if (schema.type === 'integer' && !Number.isInteger(value)) throw new TypeError(`${key}は整数です`);
  } else if (schema.type === 'boolean') {
    if (typeof value !== 'boolean') throw new TypeError(`${key}は真偽値です`);
  } else if (schema.type === 'array') {
    if (!Array.isArray(value) || value.length < schema.minItems || value.length > schema.maxItems || schema.uniqueItems && new Set(value).size !== value.length) throw new TypeError(`${key}の配列が不正です`);
    value.forEach((v, i) => validateValue(v, schema.items, `${key}[${i}]`));
  } else if (schema.type === 'string') {
    if (typeof value !== 'string' || value.trim().length < (schema.minLength ?? 0) || value.length > schema.maxLength) throw new TypeError(`${key}の文字列が不正です`);
  } else if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !Object.hasOwn(schema.properties, k) && !schema.additionalProperties)) throw new TypeError(`${key}の項目が不正です`);
    for (const k of schema.required ?? []) if (!Object.hasOwn(value, k)) throw new TypeError(`${key}.${k}が必要です`);
    for (const [k, v] of Object.entries(value)) validateValue(v, schema.properties[k] ?? schema.additionalProperties, `${key}.${k}`);
  }
}
export function validateAuthoringParameters(op) {
  const definition = authoringDefinitions[op.type];
  if (!definition) return;
  for (const key of definition.required) if (!Object.hasOwn(op, key)) throw new TypeError(`${key}が必要です`);
  for (const [key, schema] of Object.entries(definition.parameters)) if (Object.hasOwn(op, key)) validateValue(op[key], schema, key);
}
const close = (a, b) => a.distanceTo(b) < 1e-7;
function editable(piece) {
  const reason = editablePieceReason(piece);
  if (reason) throw new RangeError(reason);
}
function edited(pattern, piece, edges, patch = {}) {
  const boundary = new Path(edges.flatMap(e => e.path.segments), { closed: true });
  return replacePiece(pattern, updatePiece(piece, { edges, ...patch, grainline: fitGrainline(boundary, piece.grainline) }));
}
function moveEndpoints(path, map) {
  return new Path(path.segments.map(s => {
    const a = map(s.start), b = map(s.end);
    return s instanceof Line ? new Line(a, b) : new CubicBezier(a,
      s.control1.translate(s.start.vectorTo(a)), s.control2.translate(s.end.vectorTo(b)), b);
  }));
}
export function moveVertex(pattern, piece, op) {
  editable(piece);
  const edge = piece.edge(op.edge), old = edge.path[op.endpoint];
  if (piece.darts.some(d => [piece.edge(d.legA).path.start, d.apex, piece.edge(d.legB).path.end].some(p => close(p, old)))) throw new RangeError('ダーツの端点にはダーツ専用の加工を使ってください');
  const offset = new Vector(op.offset.x, op.offset.y);
  for (const e of piece.edges.filter(e => e.role === 'fold')) {
    if ([e.path.start, e.path.end].some(p => close(p, old))) {
      const d = e.path.start.vectorTo(e.path.end).normalized();
      if (Math.abs(d.x * offset.y - d.y * offset.x) > 1e-7) throw new RangeError('わの線から端点を外すことはできません');
    }
  }
  const map = p => close(p, old) ? p.translate(offset) : p;
  return edited(pattern, piece, piece.edges.map(e => ({ ...e, path: moveEndpoints(e.path, map) })), {
    landmarks: Object.fromEntries(Object.entries(piece.landmarks).map(([k, p]) => [k, map(p)])),
  });
}
export function extendHem(pattern, piece, op) {
  editable(piece);
  const edge = piece.edge(op.edge), y = edge.path.start.y;
  if (edge.path.segments.length !== 1 || !(edge.path.segments[0] instanceof Line) || Math.abs(y - edge.path.end.y) > 1e-7
      || Math.abs(y - piece.boundary.bounds().maxY) > 1e-7) throw new RangeError('最下端の水平な直線を指定してください');
  const adjacent = piece.edges.filter(e => e !== edge && [e.path.start, e.path.end].some(p => close(p, edge.path.start) || close(p, edge.path.end)));
  if (adjacent.length !== 2 || adjacent.some(e => e.path.segments.length !== 1 || !(e.path.segments[0] instanceof Line))) throw new RangeError('裾の両隣には直線の辺が必要です');
  const lo = Math.min(edge.path.start.x, edge.path.end.x), hi = Math.max(edge.path.start.x, edge.path.end.x);
  if (hi - lo + op.widthChangeMm <= 1) throw new RangeError('変更後の裾幅は1mmより大きくしてください');
  const fold = adjacent.find(e => e.role === 'fold');
  const fixedX = fold ? (close(fold.path.start, edge.path.start) || close(fold.path.start, edge.path.end) ? fold.path.start.x : fold.path.end.x) : null;
  const map = p => {
    if (!close(p, edge.path.start) && !close(p, edge.path.end)) return p;
    const dx = fixedX === null ? (p.x === lo ? -0.5 : 0.5) * op.widthChangeMm
      : Math.abs(p.x - fixedX) < 1e-7 ? 0 : (p.x > fixedX ? 1 : -1) * op.widthChangeMm;
    return new Point(p.x + dx, p.y + op.amountMm);
  };
  return edited(pattern, piece, piece.edges.map(e => ({ ...e, path: moveEndpoints(e.path, map) })), {
    landmarks: Object.fromEntries(Object.entries(piece.landmarks).map(([k, p]) => [k, map(p)])),
  });
}
export function redrawEdge(pattern, piece, op) {
  editable(piece);
  if (piece.darts.some(d => [d.legA, d.legB].includes(op.edge))) throw new RangeError('ダーツの脚は曲線へ変更できません');
  const edge = piece.edge(op.edge);
  if (edge.role === 'fold') throw new RangeError('わの線は直線のまま維持してください');
  const path = new Path([new CubicBezier(edge.path.start,
    edge.path.start.translate(new Vector(op.control1Offset.x, op.control1Offset.y)),
    edge.path.end.translate(new Vector(op.control2Offset.x, op.control2Offset.y)), edge.path.end)]);
  return edited(pattern, piece, piece.edges.map(e => e.id === edge.id ? { ...e, path } : e));
}
export function setDartTip(pattern, piece, op) {
  const dart = piece.darts.find(d => d.id === op.dart);
  if (!dart) throw new RangeError('ダーツがありません');
  const midpoint = piece.edge(dart.legA).path.start.lerp(piece.edge(dart.legB).path.end, 0.5);
  if (op.setbackMm >= dart.apex.distanceTo(midpoint)) throw new RangeError('縫い止まりはダーツの口より内側に置いてください');
  const sewingTip = dart.apex.translate(dart.apex.vectorTo(midpoint).normalized().scale(op.setbackMm));
  return replacePiece(pattern, updatePiece(piece, { darts: piece.darts.map(d => d.id === dart.id ? { ...d, pivot: d.apex, sewingTip } : d) }));
}
export function princessSeam(pattern, piece, op) {
  editable(piece);
  const dart = piece.darts.find(d => d.id === op.dart);
  if (!dart) throw new RangeError('切替へ変換するダーツを指定してください');
  if ([dart.legA, dart.legB].includes(op.endEdge)) throw new RangeError('切替の終点にはダーツの脚以外を指定してください');
  const converted = convertDart(pattern, piece, op);
  const current = converted.pieces.find(p => p.id === piece.id);
  const result = splitPiece(converted, current, { startEdge: dart.legA, startDistanceMm: current.edge(dart.legA).path.length(0.0001),
    endEdge: op.endEdge, endDistanceMm: op.endDistanceMm });
  return { ...result, notices: [...result.notices, 'ダーツを切替パーツに変換しました。胸付近は直線の構成線です。曲線仕上げと試着補正が必要です。'] };
}
export function openFold(pattern, piece, op) {
  editable(piece);
  const edge = piece.edge(op.edge);
  if (edge.role !== 'fold' || !piece.cut.onFold || piece.edges.filter(e=>e.role==='fold').length!==1) throw new RangeError('わの辺が1本のパーツを指定してください');
  return replacePiece(pattern, updatePiece(piece, { edges: piece.edges.map(e => e.id === edge.id ? { ...e, role: 'open' } : e),
    cut: { ...piece.cut, onFold: false, quantity: 2, mirroredPair: true },
    drafting: { ...piece.drafting, opening: { centerEdge: edge.id, overlapMm: 0 } } }));
}
export function removePiece(pattern, piece) {
  if (pattern.pieces.length < 2) throw new RangeError('最後のパーツは外せません');
  const removed = pattern.relations.filter(r => relationRefs(pattern, r).some(ref => ref.piece === piece.id));
  const freed = removed.flatMap(r => relationRefs(pattern, r));
  return { ...pattern, pieces: pattern.pieces.filter(p => p.id !== piece.id).map(p => updatePiece(p, {
    edges: p.edges.map(e => freed.some(ref => ref.piece === p.id && ref.edge === e.id)
      && !pattern.relations.filter(r => !removed.includes(r)).some(r => relationRefs(pattern, r).some(ref => ref.piece === p.id && ref.edge === e.id)) ? { ...e, role: 'open' } : e),
  })), relations: pattern.relations.filter(r => !removed.includes(r)),
  assemblyRelations: (pattern.assemblyRelations ?? []).filter(r => ![r.fromPieceRef, r.toPieceRef].includes(piece.entityId)),
  notchPairs: pattern.notchPairs.filter(pair => pair.a.piece !== piece.id && pair.b.piece !== piece.id) };
}
export function addNotch(pattern, piece, op) {
  const edge = piece.edge(op.edge), at = locateAtLength(edge.path, op.distanceMm);
  const reason = edgeOperationReason('ADD_NOTCH', piece, edge);
  if (reason) throw new RangeError(reason);
  return replacePiece(pattern, updatePiece(piece, { notches: [...piece.notches,
    { id: `${op.id}-notch`, edgeId: edge.id, distanceFromStart: op.distanceMm, count: op.count, point: at.point, tangent: at.tangent }] }));
}
export function createRectangle(pattern, piece, op) {
  const id = `${piece.id}-${op.id}`;
  if (pattern.pieces.some(p => p.id === id)) throw new RangeError('追加パーツIDが重複しています');
  return { ...pattern, pieces: [...pattern.pieces, rectanglePiece(id, op.name, op.widthMm, op.heightMm, op.quantity)] };
}
export function adjustDart(pattern, piece, op) {
  editable(piece);
  const dart = piece.darts.find(d => d.id === op.dart);
  if (!dart) throw new RangeError('変更するダーツを指定してください');
  const a = piece.edge(dart.legA).path.start, b = piece.edge(dart.legB).path.end, center = a.lerp(b, 0.5);
  const direction = a.vectorTo(b).normalized(), inward = center.vectorTo(dart.apex).normalized();
  const nextA = center.translate(direction.scale(-op.widthMm / 2)), nextB = center.translate(direction.scale(op.widthMm / 2));
  const apex = center.translate(inward.scale(op.depthMm));
  const moveMouth = p => close(p, a) ? nextA : close(p, b) ? nextB : p;
  const u = apex.vectorTo(nextA), v = apex.vectorTo(nextB);
  const angle = Math.abs(Math.atan2(u.x * v.y - u.y * v.x, u.x * v.x + u.y * v.y));
  // A distributed dart can share its pivot with another dart. Only this dart's
  // legs own its new pivot; coincident endpoints of other darts stay fixed.
  const edges = piece.edges.map(e => ({ ...e, path: moveEndpoints(e.path, p =>
    [dart.legA, dart.legB].includes(e.id) && close(p, dart.apex) ? apex : moveMouth(p)) }));
  return edited(pattern, piece, edges, {
    guides: [], darts: piece.darts.map(d => d.id === dart.id ? { ...d, apex, pivot: apex, sewingTip: null, intakeAngleRad: angle } : d),
  });
}
export const authoringHandlers = {
  SET_CUT_INSTANCES: (pattern, piece, op) => {
    const updated = updatePiece(piece, { cut: { ...piece.cut, instances: structuredClone(op.instances) } });
    validateInstances(updated); return replacePiece(pattern, updated);
  },
  ADD_ATTACHMENT_LINE: addAttachmentLine, SET_PIECE_PLACEMENT: setPlacement, SET_OVERLAP_RELATION: setOverlap, REMOVE_ASSEMBLY_RELATION: removeAssemblyRelation,
  ADD_RELATION: addRelation, UPDATE_RELATION: updateRelation, REMOVE_RELATION: removeRelation,
  MOVE_VERTEX: moveVertex, EXTEND_HEM: extendHem, REDRAW_EDGE: redrawEdge,
  DISTRIBUTE_DART: pivotDart, SET_DART_TIP: setDartTip, PRINCESS_SEAM: princessSeam,
  OPEN_FOLD: openFold, REMOVE_PIECE: removePiece, ADD_NOTCH: addNotch, CREATE_RECTANGLE: createRectangle,
  ADJUST_DART: adjustDart, CREATE_PLEATS: createPleats, CREATE_STAND_COLLAR: createStandCollar,
  CREATE_FACING: createFacing, CREATE_PLACKET: createPlacket,
  MERGE_PIECES: mergePieces, PARALLEL_SPREAD: parallelSpread, TRUE_DART_EDGE: trueDartEdge, SET_EDGE_ALLOWANCES: setEdgeAllowances, SET_EDGE_ALLOWANCE: setEdgeAllowance,
};
