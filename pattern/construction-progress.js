import { participantGeometry } from './assembly-sewing.js';
import { fabricInstances } from './fabric-instances.js';

/** Evidence from current geometry/relations, never a manually cleared pending flag. */
export function constructionProgress(pattern, piece) {
  if (piece.drafting?.derivedFrom?.kind !== 'placket') return null;
  const source = piece.drafting.derivedFrom.sources[0];
  const parent = pattern.pieces.find(p => p.id === source.piece);
  const attachment = piece.attachmentLines.find(l => l.role === 'attachment' && l.id === 'placket-attachment');
  const groups = new Map();
  for (const relation of pattern.relations) {
    const own = relation.participants?.find(p => [piece.id,piece.entityId].includes(p.pieceRef));
    const target = relation.participants?.find(p => parent && [parent.id,parent.entityId].includes(p.pieceRef));
    if (!own || !target || !own.face || !target.face || fabricInstances(parent).length > 1 && !target.instanceId) continue;
    try {
      if (!participantGeometry(pattern,target).segments.every(s=>s.line.id===source.edge)) continue;
      const scope={sourceInstanceId:own.instanceId??fabricInstances(piece)[0].id,targetInstanceId:target.instanceId??fabricInstances(parent)[0].id,
        sourceFace:own.face,targetFace:target.face};
      const key=JSON.stringify(scope),group=groups.get(key)??{scope,intervals:[]};
      for (const s of participantGeometry(pattern, own).segments) if (s.line === attachment) group.intervals.push([s.start,s.end]);
      groups.set(key,group);
    } catch { /* A failed relation is reported by normal validation. */ }
  }
  const completed=[...groups.values()].filter(({intervals})=>{
    let covered=0;
    for(const [a,b] of intervals.sort((a,b)=>a[0]-b[0])){if(a>covered+0.05)break;covered=Math.max(covered,b);}
    return attachment && covered>=attachment.path.length()-0.05;
  });
  const attached = completed.length>0;
  const upper = piece.id.endsWith('-upper');
  const buttonCenters = piece.guides.filter(g => g.kind === 'button-center');
  const holes = piece.attachmentLines.filter(l => l.role === 'buttonhole');
  const holeComplete = !upper || buttonCenters.length > 0 && buttonCenters.every(g => holes.some(h => {
    const a = g.path.start.lerp(g.path.end,0.5), b = h.path.start.lerp(h.path.end,0.5);
    return a.distanceTo(b) < 0.05 && h.widthMm > 0;
  }));
  const interfacing = piece.attachmentLines.some(l => l.role === 'interfacing' && l.path.closed && l.face === 'back');
  const placement = (pattern.assemblyRelations ?? []).some(r => r.kind === 'placement' && r.fromPieceRef === piece.entityId
    && r.toPieceRef === parent?.entityId && r.sourceFace && r.targetFace && (fabricInstances(parent).length === 1 || r.targetInstanceId)
    && completed.some(({scope})=>scope.sourceInstanceId===(r.sourceInstanceId??fabricInstances(piece)[0].id)
      && scope.targetInstanceId===(r.targetInstanceId??fabricInstances(parent)[0].id)
      && scope.sourceFace===r.sourceFace && scope.targetFace===r.targetFace));
  const checks = { attachment: attached, placement: Boolean(placement), buttonholes: holeComplete, interfacing };
  return { pieceId: piece.entityId ?? piece.id, name: piece.name, ...checks,
    missing: Object.keys(checks).filter(k => !checks[k]), openingFunctionVerified: false };
}
