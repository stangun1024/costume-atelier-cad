import { Point, Vector, Line, CubicBezier, Path } from '../core/geometry.js';
import { Transform } from '../core/transforms.js';
import { linePath, mapPath, updatePiece, replacePiece } from './operation-tools.js';
import { panelGrain } from './operations-split.js';
import { sewingSides, mapSewingRelation } from './sewing.js';
import { edgeChanges } from './reference-events.js';
import { resolveReference } from './references.js';
import { PatternPiece } from './piece.js';
import { rectanglePanelReason } from './capabilities.js';

export function mergePieces(pattern, piece, op) {
  const other = pattern.pieces.find(p => p.id === op.otherPiece), stored = pattern.relations.find(r => r.id === op.relation);
  const relation = sewingSides(pattern, stored);
  if (piece.attachmentLines.length || other?.attachmentLines.length || stored?.participants && (stored.participants.length !== 2
      || stored.participants.some(p => p.segments.some(s => s.range.mode !== 'whole') || p.fit.mode !== 'plain')))
    throw new RangeError('結合は内部取付線がなく、二辺全体の通常縫合を持つ分割パーツに対応しています');
  if (!other || other === piece || !relation || Array.isArray(relation.a) || Array.isArray(relation.b)
      || new Set([relation.a.piece, relation.b.piece]).size !== 2 || ![relation.a.piece, relation.b.piece].includes(piece.id)
      || ![relation.a.piece, relation.b.piece].includes(other.id) || relation.ease.min !== 0 || relation.ease.max !== 0
      || relation.direction !== 'opposite') throw new RangeError('2パーツ間の逆方向の単一の等長縫合を選んでください');
  if (!piece.splitFrom || piece.splitFrom !== other.splitFrom || piece.features.length || other.features.length
      || piece.drafting.derivedFrom || other.drafting.derivedFrom) throw new RangeError('同じ元型紙を分割した、折り構造のないパーツが必要です');
  const edgeA = piece.edge(relation.a.piece === piece.id ? relation.a.edge : relation.b.edge);
  const edgeB = other.edge(relation.a.piece === other.id ? relation.a.edge : relation.b.edge);
  if ([edgeA, edgeB].some(e => e.path.segments.length !== 1 || !(e.path.segments[0] instanceof Line))
      || edgeA.path.start.distanceTo(edgeB.path.end) > 1e-7 || edgeA.path.end.distanceTo(edgeB.path.start) > 1e-7) throw new RangeError('座標が逆向きに一致する直線の切替だけを結合できます');
  const ga = piece.grainline.start.vectorTo(piece.grainline.end).normalized(), gb = other.grainline.start.vectorTo(other.grainline.end).normalized();
  if (Math.abs(ga.x * gb.y - ga.y * gb.x) > 1e-7) throw new RangeError('地の目の向きが異なるパーツは結合できません');
  const id = `${piece.id}-${op.id}`;
  if (pattern.pieces.some(p => p.id === id)) throw new RangeError('結合パーツIDが重複しています');
  const chain = (p, edge) => { const index = p.edges.indexOf(edge); return [...p.edges.slice(index + 1), ...p.edges.slice(0, index)]; };
  const originals = [[piece, edgeA], [other, edgeB]], occupied = new Set(), maps = new Map();
  const edges = originals.flatMap(([p, seam]) => {
    const replacements = new Map(); maps.set(p.id, replacements);
    return chain(p, seam).map(e => {
      const local = occupied.has(e.id) ? `merged-${e.id}` : e.id;
      if (occupied.has(local)) throw new RangeError('辺の名前が衝突しています'); occupied.add(local);
      replacements.set(e.id, [{ piece: id, edge: local, path: e.path, startMm: 0 }]);
      return { ...e, id: local };
    });
  });
  const mapped = ref => maps.has(ref.piece) ? { piece: id, edge: maps.get(ref.piece).get(ref.edge)?.[0].edge } : ref;
  const boundary = new Path(edges.flatMap(e => e.path.segments), { closed: true }), onFold = edges.some(e => e.role === 'fold');
  const darts = originals.flatMap(([p]) => p.darts.map(d => ({ ...d, legA: mapped({piece:p.id,edge:d.legA}).edge, legB: mapped({piece:p.id,edge:d.legB}).edge })));
  if (new Set(darts.map(d => d.id)).size !== darts.length) throw new RangeError('ダーツIDが重複しています');
  const merged = new PatternPiece({ ...piece, id, name: `${piece.name}・結合`, edges, darts,
    grainline: panelGrain(boundary, piece.grainline), guides: [], landmarks: { ...piece.landmarks, ...other.landmarks },
    notches: originals.flatMap(([p]) => p.notches.map(n => ({ ...n, edgeId: mapped({piece:p.id,edge:n.edgeId}).edge }))),
    cut: { ...piece.cut, quantity: onFold ? 1 : Math.max(piece.cut.quantity, other.cut.quantity), onFold, mirroredPair: !onFold && (piece.cut.mirroredPair || other.cut.mirroredPair) },
    cuttingBoundary: null });
  return { ...pattern, pieces: [...pattern.pieces.filter(p => p !== piece && p !== other), merged],
    relations: pattern.relations.filter(r => r !== stored).map(r => mapSewingRelation(pattern, r, mapped)),
    notchPairs: pattern.notchPairs.map(pair => ({ ...pair, ...Object.fromEntries(['a','b'].map(side => [side, maps.has(pair[side].piece) ? { ...pair[side], piece: id } : pair[side]])) })),
    mergeChanges: [{ sources: [piece.id, other.id], output: id }],
    topologyChanges: originals.flatMap(([p]) => edgeChanges(pattern, p, maps.get(p.id))),
  };
}
export function parallelSpread(pattern, piece, op) {
  const { minX, maxX } = piece.boundary.bounds(), cutX = minX + op.positionMm;
  const reason = rectanglePanelReason(piece);
  if (reason) throw new RangeError(reason);
  if (cutX >= maxX) throw new RangeError('切開位置はパネルの内部にしてください');
  const map = p => new Point(p.x + (p.x > cutX ? op.amountMm : 0), p.y);
  const edges = piece.edges.map(e=>({...e,path:mapPath(e.path,map)}));
  const boundary = new Path(edges.flatMap(e=>e.path.segments),{closed:true});
  return replacePiece(pattern,updatePiece(piece,{edges,guides:[],grainline:panelGrain(boundary,piece.grainline),
    landmarks:Object.fromEntries(Object.entries(piece.landmarks).map(([k,p])=>[k,map(p)]))}));
}
export function trueDartEdge(pattern,piece,op) {
  if(piece.features.length)throw new RangeError('折り構造を追加する前に整形してください');
  const dart=piece.darts.find(d=>d.id===op.dart);if(!dart)throw new RangeError('ダーツを指定してください');
  const ai=piece.edges.findIndex(e=>e.id===dart.legA),bi=piece.edges.findIndex(e=>e.id===dart.legB);
  const before=piece.edges[(ai-1+piece.edges.length)%piece.edges.length],after=piece.edges[(bi+1)%piece.edges.length];
  if(before===after||before.role==='fold'||after.role==='fold'||piece.darts.some(d=>[d.legA,d.legB].includes(before.id)||[d.legA,d.legB].includes(after.id)))throw new RangeError('ダーツ両隣に整形できる輪郭が必要です');
  const mouthA=piece.edge(dart.legA).path.start,mouthB=piece.edge(dart.legB).path.end,u=dart.apex.vectorTo(mouthA),v=dart.apex.vectorTo(mouthB);
  const rotation=Transform.rotation(Math.atan2(u.x*v.y-u.y*v.x,u.x*v.x+u.y*v.y),dart.apex),inverse=rotation.inverse();
  const incoming=before.path.segments.at(-1),outgoing=after.path.segments[0];
  const a=rotation.apply(incoming instanceof Line?incoming.start:incoming.control2),b=outgoing instanceof Line?outgoing.end:outgoing.control1;
  const t1=a.vectorTo(mouthB).normalized(),t2=mouthB.vectorTo(b).normalized(),sum=new Vector(t1.x+t2.x,t1.y+t2.y);
  if(sum.length<1e-6)throw new RangeError('閉鎖時の端が折り返しています');const tangent=sum.normalized();
  const previous=new CubicBezier(incoming.start,incoming instanceof Line?incoming.start.lerp(incoming.end,1/3):incoming.control1,
    inverse.apply(mouthB.translate(tangent.scale(-incoming.length()/3))),incoming.end);
  const next=new CubicBezier(outgoing.start,mouthB.translate(tangent.scale(outgoing.length()/3)),
    outgoing instanceof Line?outgoing.start.lerp(outgoing.end,2/3):outgoing.control2,outgoing.end);
  return replacePiece(pattern,updatePiece(piece,{edges:piece.edges.map(e=>e===before?{...e,path:new Path([...e.path.segments.slice(0,-1),previous])}:e===after?{...e,path:new Path([next,...e.path.segments.slice(1)])}:e)}));
}
export function setEdgeAllowances(pattern,piece,op) {
  const widths={};
  for(const item of op.widths){const ref=resolveReference(pattern,item.edgeId,'edge').entity;
    if(ref.localPiece!==piece.id||Object.hasOwn(widths,ref.localId))throw new RangeError('対象パーツの各辺を1度ずつ指定してください');
    if(piece.edge(ref.localId).role==='fold'&&item.widthMm!==0)throw new RangeError('わの辺は縫い代0mmです');widths[ref.localId]=item.widthMm;}
  if(Object.keys(widths).length!==piece.edges.length)throw new RangeError('全ての辺に縫い代幅を指定してください');
  return replacePiece(pattern,updatePiece(piece,{cut:{...piece.cut,seamAllowance:Math.max(...Object.values(widths)),seamAllowances:widths}}));
}
export function setEdgeAllowance(pattern, piece, op) {
  const edge = piece.edge(op.edge);
  if (piece.darts.some(d => [d.legA, d.legB].includes(edge.id))) throw new RangeError('ダーツ脚は裁断外周ではありません。口の両隣の辺を設定してください');
  if (edge.role === 'fold' && op.widthMm !== 0) throw new RangeError('わの辺は縫い代0mmです');
  const widths = Object.fromEntries(piece.edges.map(e => [e.id, piece.cut.seamAllowances?.[e.id] ?? (e.role === 'fold' ? 0 : piece.cut.seamAllowance)]));
  widths[edge.id] = op.widthMm;
  // Dart-leg entries only describe the local folded allowance, never a V-shaped cut.
  for (const dart of piece.darts) {
    const ai = piece.edges.findIndex(e => e.id === dart.legA), bi = piece.edges.findIndex(e => e.id === dart.legB);
    const before = piece.edges[(ai - 1 + piece.edges.length) % piece.edges.length], after = piece.edges[(bi + 1) % piece.edges.length];
    if (widths[before.id] === widths[after.id]) widths[dart.legA] = widths[dart.legB] = widths[before.id];
  }
  return replacePiece(pattern, updatePiece(piece, { cut: { ...piece.cut, seamAllowance: Math.max(...Object.values(widths)), seamAllowances: widths } }));
}
