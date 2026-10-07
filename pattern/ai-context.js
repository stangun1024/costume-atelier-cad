import { operationParameters } from './operation-definitions.js';
export { operationParameters } from './operation-definitions.js';
import { initializeReferences, stableId, ENGINE_VERSION, referenceFields } from './references.js';
import { operationTypes, operationReason, operationTargets } from './capabilities.js';
import { sewingRefs, effectiveEdgeLength, sewingSides } from './sewing.js';
import { applyOperationBatch } from './operations.js';
import { record } from '../core/input-validation.js';
import { authoringDefinitions } from './authoring-definitions.js';
import { sewingLines, sewingLine } from './assembly-sewing.js';
import { fabricInstances } from './fabric-instances.js';
import { constructionProgress } from './construction-progress.js';
import { openingCutPath } from './material-regions.js';

const geometry = path => path.segments.map(s => ({ type: s.controlPoints?.length === 4 ? 'cubic-bezier' : 'line',
  points: (s.controlPoints ?? [s.start, s.end]).map(p => ({ x: p.x, y: p.y })) }));

export function contextRevision(pattern) {
  return stableId('state', JSON.stringify({ body: pattern.body, design: pattern.design, graph: pattern.referenceGraph,
    relations: pattern.relations, assemblyRelations: pattern.assemblyRelations ?? [], notchPairs: pattern.notchPairs,
    shapes: pattern.pieces.map(p => ({ id: p.entityId, cut: p.cut, drafting: p.drafting, darts: p.darts, features: p.features,
      landmarks: p.landmarks, notches: p.notches, edges: sewingLines(p).map(e => ({ id: e.entityId, geometry: geometry(e.path) })), grain: geometry(p.grainline),
      ...(p.attachmentLines.some(l=>['region','interfacing','buttonhole','opening'].includes(l.role)||l.instanceId||l.face)
        ? {internalDesign:p.attachmentLines.map(l=>({id:l.entityId,role:l.role,instanceId:l.instanceId,face:l.face,widthMm:l.widthMm,allowanceMm:l.allowanceMm}))} : {}) })) }));
}

/** Model-facing data deliberately excludes the legacy names used as internal keys. */
export function createAIContext(input) {
  const pattern = initializeReferences(input), graph = pattern.referenceGraph;
  const constraints = pattern.relations.map(stored => { const r = sewingSides(pattern, stored); return ({ id: r.entityId, name: graph.entities[r.entityId].name, kind: 'sew',
    referenceParticipantId: stored.referenceParticipantId, participants: stored.participants, matchPoints: stored.matchPoints,
    status: stored.status ?? 'registered',
    a: sewingRefs(r.a).map(ref => sewingLine(pattern.pieces.find(p => p.id === ref.piece), ref.edge).entityId),
    b: sewingRefs(r.b).map(ref => sewingLine(pattern.pieces.find(p => p.id === ref.piece), ref.edge).entityId), easeMm: r.ease,
    direction: r.direction ?? null,
    endpointMapping: r.direction === 'same' ? 'a.start=b.start; a.end=b.end'
      : r.direction === 'opposite' ? 'a.start=b.end; a.end=b.start' : null }); });
  for (const p of pattern.pieces) for (const d of p.darts) constraints.push({ id: d.entityId, kind: 'dart',
    edgeIds: [p.edge(d.legA).entityId, p.edge(d.legB).entityId], equalLegs: true, intakeAngleRad: d.intakeAngleRad });
  const targets = pattern.pieces.map(piece => ({ id: piece.entityId, name: piece.name,
    cut: piece.cut, instances: fabricInstances(piece), drafting: piece.drafting, construction: constructionProgress(pattern,piece), landmarks: piece.landmarks,
    grainline: geometry(piece.grainline), guides: piece.guides.map(g => ({ name: g.name, kind: g.kind ?? 'construction', geometry: geometry(g.path) })),
    darts: piece.darts.map(d => ({ id: d.entityId, pivot: d.apex, sewingTip: d.sewingTip ?? null,
      legA: piece.edge(d.legA).entityId, legB: piece.edge(d.legB).entityId, intakeAngleDeg: d.intakeAngleRad * 180 / Math.PI })),
    attachmentLines: piece.attachmentLines.map(line => ({ id: line.entityId, name: line.name, purpose: line.role ?? 'attachment',
      closed: line.path.closed, coordinateMode: 'piece-fixed', instanceId: line.instanceId ?? null, face: line.face ?? null,
      widthMm: line.widthMm ?? null, allowanceMm: line.allowanceMm ?? null,
      ...(line.role === 'opening' ? { cuttingGeometry: geometry(openingCutPath(line)) } : {}),
      reviewRequired: !!line.boundaryRevision && line.boundaryRevision !== stableId('boundary', JSON.stringify(piece.boundary)),
      geometry: geometry(line.path), lengthMm: line.path.length() })),
    edgeIds: piece.edges.map(e => e.entityId), featureIds: [...piece.darts, ...piece.features].map(f => f.entityId),
    operations: operationTypes.map(type => {
      const reason = operationReason(type, pattern, piece);
      return { type, available: !reason, reason,
        targets: Object.fromEntries(Object.keys(referenceFields[type] ?? {}).map(field => [field,
          operationTargets(type, field, pattern, piece).map(({ target, reason }) => ({
            id: target.entityId, name: target.name, available: !reason, reason,
          }))])),
      };
    }) }));
  return {
    format: 'aicad-ai-context', version: '1.0.0', engineVersion: ENGINE_VERSION, contextRevision: contextRevision(pattern), unit: 'mm',
    draftingContract: pattern.draftingContract,
    instructions: ['操作対象はこのデータに存在する固定IDで参照してください。名前からIDを推測しないでください。',
      '操作のavailableは構造上の候補です。数値と組み合わせは実行時に検証されます。',
      'ADD_SEAM_ALLOWANCEは選択した1パーツの外周全体を均一幅へ置き換え、既存の辺別設定も解除します。SET_EDGE_ALLOWANCEは指定した直線・曲線の1辺だけをwidthMmへ置き換え、他辺を保持（未設定は0mm）します。加算ではありません。「基本10mm・裾20mm」は均一10mmの後、裾の1辺を20mmに設定します。SET_EDGE_ALLOWANCESは全辺をまとめて指定します。',
      '縫い代は1パーツ1本の等長・直線・90度未満のダーツを閉じて計算し、戻り脚legB側への片倒しに展開。口の両隣と両脚は同じ正の幅が必要です。複数ダーツは未対応。確定したダーツ位置や幅をエラー回避のため勝手に変えないでください。',
      '原子的な提案としてoperationsを返してください。曖昧な参照は自動選択されません。'],
    sewingDirectionContract: '正本はparticipants。一人は一枚の布の参加線。segmentsのdirectionはforward/reverseで縫合進行方向を指定。a/bは旧クライアント用の二者表示。nullは旧データの未確認方向。',
    assemblyRelations: pattern.assemblyRelations ?? [],
    assemblyLimitations: ['ADD/UPDATE_RELATIONは2〜16参加者、全体またはinterval、外周と内部取付線。plainは同長、ease/gatherは長い側、stretchは短い側に正のamountMmを指定。差を自動解釈しない。',
      'matchPointsは{id,positionsMm:{参加者ID:縫合方向の始点からの有効長mm}}。対応点がある加工はfit.intervalAmountsMmに区間ごとの加工量を明示。',
      'ADD_ATTACHMENT_LINEは用途を区別：attachmentは縫合線、regionは閉じた取付範囲、interfacingは閉じた芯範囲、buttonholeは直線の長さとwidthMm、openingは実際の閉じた内部穴（allowanceMmは穴内に残す縫い代）。cut-guideは穴ではない。局所座標に固定され、輪郭変更後はreviewRequiredを確認。',
      'SPLIT_PIECEは外周2点とsegmentsで曲線分割。同じ辺の2点も可。外周に接する切欠きは分割→inspect→REMOVE_PIECE。独立した穴はpurpose:opening。内部線付き分割は未対応なので穴・内部線は分割後に追加。',
      'SET_CUT_INSTANCESで裁断個体の着用者左右とmirroredを明示。縫合はparticipants[].instanceId/face、配置・重なりはsource/targetInstanceId、source/targetFace、両側のRegionRef、state(always/open/closed)を指定。省略は型紙全体で左右を推測しない。局所重なりは指定領域に限る。二次元の設計記録であり、可視幅や開閉機構の物理検証ではない。同一個体の重複縫いは未対応。',
      'participants[].pieceRefとsegments[].lineRefは固定IDで、plan v2では生成物参照も利用可能。ネストした参照も所有パーツと一意性を照合する。',
      '縫合の追加だけで配置・層順・上前下前の目的を完了扱いにしない。未対応の取付仕様はpendingへ残す。'],
    entities: Object.values(graph.entities).map(({ localId, localPiece, ...entity }) => entity),
    pieces: targets,
    edges: pattern.pieces.flatMap(p => sewingLines(p).map(e => ({ id: e.entityId, geometry: geometry(e.path),
      lengthMm: e.path.length(0.001), sewnLengthMm: effectiveEdgeLength(p,e),
      notches: p.notches.filter(n => n.edgeId === e.id).map(n => ({ id: n.id, distanceFromStartMm: n.distanceFromStart, count: n.count })) }))),
    constraints, lineage: graph.lineage, history: graph.operations,
    measurementContracts: {function:'measurePattern',readOnly:true,kinds:['edge-length','point-distance','dart','seams'],
      pointReference:'{pieceId,landmark} または {edgeId,position:{basis,unit,value}}'},
    operationContracts: Object.fromEntries(Object.entries(operationParameters).map(([type, parameters]) => [type, {
      ...(authoringDefinitions[type] ? { label: authoringDefinitions[type].label, requiredParameters: authoringDefinitions[type].required,
        limitation: authoringDefinitions[type].limitation } : {}),
      requiredRefs: ['piece', ...Object.keys(referenceFields[type] ?? {})],
      positions: Object.fromEntries(Object.values(referenceFields[type] ?? {}).filter(Boolean).map(field => [field, {
        required: field !== 'pivotDistanceMm', bases: [{ basis: 'arc_length_from_start', unit: 'mm' }, { basis: 'ratio_from_start', unit: 'ratio', minimum: 0, maximum: 1 }],
      }])), parameters,
    }])),
    proposalFormat: { format: 'aicad-ai-proposal', version: '1.0.0', contextRevision: contextRevision(pattern), operations: [] },
  };
}

export function applyAIProposal(input, proposal, resolveOperation = null) {
  record(proposal, ['format', 'version', 'contextRevision', 'operations'], 'proposal');
  if (proposal.format !== 'aicad-ai-proposal' || proposal.version !== '1.0.0') throw new RangeError('未対応のAI提案形式です');
  const pattern = initializeReferences(input);
  if (proposal.contextRevision !== contextRevision(pattern)) {
    const error = new RangeError('参照した型紙が変更されています。最新のAI向けJSONを取得してください'); error.code = 'stale-context'; throw error;
  }
  if (!Array.isArray(proposal.operations) || !proposal.operations.length) throw new TypeError('提案には1件以上の操作が必要です');
  for (const op of proposal.operations) {
    if (!op?.id || !op.refs || !op.refs.piece || !Object.hasOwn(operationParameters, op.type)) throw new TypeError('AI提案には操作ID・type・refsが必要です');
    for (const [field, distance] of Object.entries(referenceFields[op.type] ?? {})) {
      if (!op.refs[field]) throw new TypeError(`AI提案にはrefs.${field}が必要です`);
      if (op[field] !== undefined) throw new TypeError('AI提案の対象は固定IDのみで指定してください');
      if (distance && distance !== 'pivotDistanceMm' && !op.positions?.[distance]) throw new TypeError(`positions.${distance}の基準と単位が必要です`);
      if (distance && op[distance] !== undefined) throw new TypeError('AI提案の位置にはpositionsを使用してください');
    }
    if (op.piece !== undefined) throw new TypeError('AI提案にはrefs.pieceを使用してください');
    if (op.type === 'RENAME_ENTITY' && op.nameSource !== 'ai') throw new TypeError('AIの命名はnameSource: aiとして記録してください');
    if (op.type === 'SET_ENTITY_SEMANTICS' && op.semanticSource !== 'ai') throw new TypeError('AIの推測はsemanticSource: aiとして記録してください');
  }
  return applyOperationBatch(pattern, proposal.operations, resolveOperation);
}
