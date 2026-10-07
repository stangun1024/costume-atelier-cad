import { initializeReferences, resolveReference } from './references.js';
import { locateAtLength } from '../core/path-tools.js';
import { effectiveEdgeLength, sewingLength, sewingSides } from './sewing.js';
import { record } from '../core/input-validation.js';
import { sewingLine, participantGeometry } from './assembly-sewing.js';

/** Read-only measurements against the same fixed identities used by commands. */
export function measurePattern(input, query) {
  record(query,['kind','edgeId','dartId','a','b'],'measurement');
  const pattern=initializeReferences(input);
  const edge=id=>{const r=resolveReference(pattern,id,'edge').entity,p=pattern.pieces.find(p=>p.id===r.localPiece);return {piece:p,edge:sewingLine(p,r.localId)};};
  const point=ref=>{
    record(ref,['edgeId','position','pieceId','landmark'],'point-reference');
    if(ref.edgeId){const located=resolveReference(pattern,ref.edgeId,'edge',ref.position),owner=pattern.pieces.find(p=>p.id===located.entity.localPiece);
      if(located.distance===null)throw new TypeError('点の位置には基準・単位・値が必要です');return locateAtLength(sewingLine(owner,located.entity.localId).path,located.distance).point;}
    const p=resolveReference(pattern,ref.pieceId,'piece').entity,piece=pattern.pieces.find(x=>x.id===p.localId);
    if(!Object.hasOwn(piece.landmarks,ref.landmark))throw new RangeError('基準点がありません');return piece.landmarks[ref.landmark];
  };
  if(query.kind==='edge-length'){const {piece,edge:e}=edge(query.edgeId);return {unit:'mm',pathLength:e.path.length(0.001),sewnLength:effectiveEdgeLength(piece,e)};}
  if(query.kind==='point-distance')return {unit:'mm',distance:point(query.a).distanceTo(point(query.b))};
  if(query.kind==='dart'){const r=resolveReference(pattern,query.dartId,'feature').entity,piece=pattern.pieces.find(p=>p.id===r.localPiece),dart=piece.darts.find(d=>d.id===r.localId);
    if(!dart)throw new RangeError('ダーツを指定してください');return {angleDeg:dart.intakeAngleRad*180/Math.PI,mouthChordMm:piece.edge(dart.legA).path.start.distanceTo(piece.edge(dart.legB).path.end),pivot:dart.apex,sewingTip:dart.sewingTip};}
  if(query.kind==='seams')return pattern.relations.map(stored=>{const r=sewingSides(pattern,stored);return {id:r.entityId,referenceParticipantId:stored.referenceParticipantId,participants:stored.participants,
    participantLengths:stored.participants.map(p=>({id:p.id,lengthMm:participantGeometry(pattern,p).length})),aLengthMm:sewingLength(pattern,r.a),bLengthMm:sewingLength(pattern,r.b),allowedEaseMm:r.ease,direction:r.direction??null};});
  throw new RangeError('未対応の計測です');
}
