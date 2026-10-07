import { createOperationDocument, compileOperations } from '../pattern/operations.js';
import { createAIContext, applyAIProposal } from '../pattern/ai-context.js';
import { bindOperation } from '../pattern/references.js';
import { operationDefinitions } from '../pattern/operation-definitions.js';
import { renderPatternSvg } from '../export/pattern-svg.js';
import { defaultOperation } from '../cad/operation-forms.js';
import { operationNames } from '../cad/operation-labels.js';

// Build teaching assets with the same commands and geometry engine used by 3.2.
// Each example starts from its named specimen, never from the previous example.
export function buildToolExamples() {
  const base = { method: 'bunka-old', body: { unit: 'mm', bust: 820, backLength: 375, armLength: 520 } };
  const original = compileOperations(createOperationDocument(base)).pattern;
  const specimens = {}, patterns = {};
  function command(pattern, raw) {
    const bound = bindOperation(pattern, raw);
    delete bound.piece;
    for (const [field, distance] of Object.entries(operationDefinitions[raw.type].references)) {
      delete bound[field];
      if (distance) delete bound[distance];
    }
    return bound;
  }
  function run(pattern, raw) {
    const operation = command(pattern, raw);
    return { operation, pattern: applyAIProposal(pattern, { ...createAIContext(pattern).proposalFormat, operations: [operation] }) };
  }
  function snapshot(pattern) {
    const context = createAIContext(pattern);
    return { svg: renderPatternSvg(pattern), contextRevision: context.contextRevision,
      entities: context.entities, pieces: context.pieces.map(({ operations, ...piece }) => piece),
      edges: context.edges, constraints: context.constraints, notices: pattern.notices };
  }
  function specimen(id, name, parent = null, raw = null) {
    const result = parent ? run(patterns[parent], raw) : { pattern: original };
    patterns[id] = result.pattern;
    specimens[id] = { name, parent, preparationCommand: result.operation ?? null, ...snapshot(result.pattern) };
  }
  specimen('base', '共通の見本原型（文化式旧原型・見本採寸）');
  specimen('panel', '300×400mmの長方形を追加した見本', 'base', {
    id: 'sample-panel', type: 'CREATE_RECTANGLE', piece: 'front', widthMm: 300, heightMm: 400, name: '見本パネル', quantity: 1 });
  specimen('dart', '後身頃に取り量20mm・深さ80mmのダーツを追加した見本', 'base', {
    id: 'sample-dart', type: 'ADD_DART', piece: 'back', edge: 'waist', distanceMm: 80, widthMm: 20, depthMm: 80 });
  specimen('split', '長方形を2分割した結合用の見本', 'panel', {
    id: 'sample-split', type: 'SPLIT_PIECE', piece: 'front-sample-panel', startEdge: 'right', startDistanceMm: 200, endEdge: 'left', endDistanceMm: 200 });
  specimen('opening', '前中心のわを開きに変更した見本', 'base', {
    id: 'sample-opening', type: 'OPEN_FOLD', piece: 'front', edge: 'center' });
  specimen('allowanced-panel', '全周10mmの縫い代を設定した見本', 'panel', {
    id: 'sample-allowance', type: 'ADD_SEAM_ALLOWANCE', piece: 'front-sample-panel', widthMm: 10 });
  specimen('panel-pair', '独立した等幅の二枚のパネル', 'panel', {
    id: 'sample-other-panel', type: 'CREATE_RECTANGLE', piece: 'front', widthMm: 300, heightMm: 400, name: '相手の見本パネル', quantity: 1 });
  const joinParticipants = ['front-sample-panel', 'front-sample-other-panel'].map((id, i) => {
    const p = patterns['panel-pair'].pieces.find(p => p.id === id);
    return { id: i === 0 ? 'a' : 'b', pieceRef: p.entityId, segments: [{ lineRef: p.edge('top').entityId,
      range: { mode: 'whole' }, direction: i === 0 ? 'forward' : 'reverse' }], fit: { mode: 'plain' } };
  });
  specimen('joined-panels', '二枚の独立パネルを通常縫合へ登録した見本', 'panel-pair', {
    id: 'sample-join', type: 'ADD_RELATION', piece: 'front-sample-panel', kind: 'sew', name: '見本の縫合',
    referenceParticipantId: 'a', participants: joinParticipants });
  specimen('overlaid-panels', '重なりを指定した見本', 'panel-pair', {
    id: 'sample-overlap', type: 'SET_OVERLAP_RELATION', piece: 'front-sample-panel', otherPiece: 'front-sample-other-panel', name: '見本の重なり' });
  const curvedCut = { startEdge: 'left', startDistanceMm: 100, endEdge: 'left', endDistanceMm: 300,
    segments: [{type:'cubic',control1:{x:80,y:300},control2:{x:80,y:100},end:{x:0,y:100}}] };
  specimen('curve-split', '同じ外周辺の2点を曲線で分割した見本', 'panel', {
    id:'sample-curve-split',type:'SPLIT_PIECE',piece:'front-sample-panel',...curvedCut });

  const specs = {
    SET_CUT_INSTANCES: ['opening', 'front', { instances: [
      { id:'right', name:'着用者右の前身頃', side:'right', mirrored:false },
      { id:'left', name:'着用者左の前身頃', side:'left', mirrored:true },
    ] }, '左右対称裁断の二枚に着用者左右と反転を明示。型紙形状は維持し、取付先はこの個体IDで指定する。'],
    SET_EDGE_ALLOWANCE: ['allowanced-panel', 'front-sample-panel', { edge:'bottom', widthMm:20 }, '全周10mmから裾だけ20mmへ置換。他の辺は10mmを保持し、加算しない。'],
    ADD_ATTACHMENT_LINE: ['panel', 'front-sample-panel', { name: 'ポケット取付線', start: { x: 20, y: 50 }, end: { x: 280, y: 50 } }, '外周を変えず、パネル内部に260mmの取付線を生成。'],
    SET_PIECE_PLACEMENT: ['panel-pair', 'front-sample-panel', { otherPiece: 'front-sample-other-panel',
      sourceLineRef: patterns['panel-pair'].pieces.find(p => p.id === 'front-sample-panel').edge('top').entityId,
      targetLineRef: patterns['panel-pair'].pieces.find(p => p.id === 'front-sample-other-panel').edge('top').entityId,
      name: '見本の取付位置', sourceDistanceMm: 0, targetDistanceMm: 0, offsetMm: { x: 20, y: 30 }, rotationDeg: 0 }, '相手の上辺始点を基準にX20mm、Y30mmへ配置。画面上の型紙の並べ方とは別に保存。'],
    SET_OVERLAP_RELATION: ['panel-pair', 'front-sample-panel', { otherPiece: 'front-sample-other-panel', name: 'パネルの表裏の順序' }, '見本パネルを相手のパネルより表側に指定。縫合は別の操作。'],
    REMOVE_ASSEMBLY_RELATION: ['overlaid-panels', 'front-sample-panel', {}, '全体の重なり関係を解除。型紙と縫合は保持。'],
    ADD_RELATION: ['panel-pair', 'front-sample-panel', { kind: 'sew', name: '見本の縫合', referenceParticipantId: 'a', participants: joinParticipants }, '独立した二枚の300mmの辺を一つの通常縫合へ登録。配置・層順は別の仕様。'],
    UPDATE_RELATION: ['joined-panels', 'front-sample-panel', { name: '変更後の見本縫合' }, '参加者と縫合の固定IDを維持し、縫合名を変更。辺の再選択も同じ操作契約。'],
    REMOVE_RELATION: ['joined-panels', 'front-sample-panel', {}, '縫合を解除し、使用がなくなった辺を開いた辺に戻す。パーツ形状は維持。'],
    EXTEND: ['base', 'sleeve', { amountMm: 50 }, '袖山・袖口幅を維持して袖丈を50mm延長。身体採寸は維持。'],
    RESHAPE: ['base', 'sleeve', { edge: 'cuff', control1Offset: { x: -100, y: 35 }, control2Offset: { x: 100, y: 35 } }, '端点を維持し、制御点の指定で袖口のカーブを変更。'],
    SLASH_SPREAD: ['base', 'sleeve', { pivotEdge: 'cap-front', pivotDistanceMm: 0, cutEdge: 'cuff', distanceMm: 100, angleDeg: -10 }, '指定支点を固定して外向きに10度開く。輪郭方向により角度の符号が変わる。'],
    ADD_FLARE: ['base', 'sleeve', { amountMm: 80 }, '袖口を展開して分量を追加。袖山と身体採寸を維持。'],
    ADD_SLIT: ['base', 'sleeve', { relation: 'sleeve-underarm', lengthMm: 60, from: 'end' }, '縫合の終端から60mmを開きにし、対応する両辺の縫合範囲を更新。'],
    ADD_SEAM_ALLOWANCE: ['panel', 'front-sample-panel', { widthMm: 10 }, '1パーツの外周全体を均一10mmへ置換。辺別設定を解除し、縫い線を維持。0mmで解除。'],
    ADD_DART: ['base', 'back', { edge: 'waist', distanceMm: 80, widthMm: 20, depthMm: 80 }, 'ウエスト辺の始点から80mmに取り量20mm・深さ80mmのダーツを追加。'],
    PIVOT_DART: ['dart', 'back', { targetEdge: 'neckline', distanceMm: 20 }, '展開中心を使ってダーツを襟ぐりへ移動。'],
    SPLIT_PIECE: ['panel', 'front-sample-panel', { startEdge: 'right', startDistanceMm: 200, endEdge: 'left', endDistanceMm: 200 }, '指定した2点の直線で分割し、切替の縫合関係を作る。'],
    CONVERT_DART_TO_SEAMS: ['dart', 'back', {}, 'ダーツの脚を通常の縫合辺に変換。輪郭とダーツとしての意味の変化を区別。'],
    RENAME_ENTITY: ['base', 'front', { name: '見本の襟ぐり', nameSource: 'ai' }, '固定IDと形状を維持して名称と命名者情報を変更。SVGの輪郭は変わらない。'],
    SET_ENTITY_SEMANTICS: ['base', 'front', { semantics: { anatomicalRegion: '襟ぐり', anatomicalSide: 'toward_neckline' }, semanticSource: 'ai', confidence: 0.8 }, '形状・固定IDを維持してAIの意味付けを記録。SVGだけでは確認できない変更。'],
    MOVE_VERTEX: ['panel', 'front-sample-panel', { edge: 'bottom', endpoint: 'start', offset: { x: 20, y: 10 } }, '端点を右20mm・下10mm移動し、接続する辺も更新。'],
    EXTEND_HEM: ['panel', 'front-sample-panel', { edge: 'bottom', amountMm: 50, widthChangeMm: 40 }, '下端を50mm延長し、パーツ1枚の裾幅を40mm増加。'],
    REDRAW_EDGE: ['panel', 'front-sample-panel', { edge: 'top', control1Offset: { x: 100, y: -20 }, control2Offset: { x: -100, y: -20 } }, '両端を維持して上辺を曲線に引き直す。'],
    DISTRIBUTE_DART: ['dart', 'back', { targetEdge: 'neckline', distanceMm: 20, ratio: 0.5 }, 'ダーツ量の半分を指定辺へ移し、残りを元の位置に残す。'],
    SET_DART_TIP: ['dart', 'back', { setbackMm: 20 }, '展開中心・輪郭を維持し、縫い止まりだけを開口側へ20mm戻す。'],
    PRINCESS_SEAM: ['dart', 'back', { endEdge: 'neckline', endDistanceMm: 20 }, 'ダーツの脚と展開中心から指定辺への直線で切替パーツを作る。曲線仕上げは別。'],
    OPEN_FOLD: ['base', 'front', { edge: 'center' }, '輪郭・固定IDを維持し、わの1枚裁断を左右対称の2枚裁断へ変更。'],
    REMOVE_PIECE: ['base', 'sleeve', {}, '袖を外し、接続していた縫合・合印の対応を解除。残る相手辺を開いた辺にする。'],
    ADD_NOTCH: ['panel', 'front-sample-panel', { edge: 'top', distanceMm: 100, count: 2 }, '上辺の始点から100mmに2本の合印を追加。輪郭は維持。'],
    CREATE_RECTANGLE: ['base', 'front', { widthMm: 300, heightMm: 400, name: '追加する見本パネル', quantity: 1 }, '元のパーツを維持し、300×400mmの独立パーツを追加。'],
    ADJUST_DART: ['dart', 'back', { widthMm: 25, depthMm: 90 }, '開口の中点・方向を維持し、取り量25mm・深さ90mmに変更。'],
    CREATE_PLEATS: ['panel', 'front-sample-panel', { count: 3, depthMm: 10, spacingMm: 60, firstOffsetMm: 40, direction: 'left' }, '3本×深さ10mm×2の60mmを追加し、折り線と折る方向を記録。'],
    CREATE_STAND_COLLAR: ['base', 'front', { heightMm: 40, overlapMm: 15, onFold: true }, '後→前の襟ぐり長から高さ40mm・重なり15mmの直線型の半身襟を生成。'],
    CREATE_FACING: ['panel', 'front-sample-panel', { edge: 'top', widthMm: 30, side: 'left' }, '指定辺の進行方向に対して左側へ幅30mmの見返しを生成。'],
    CREATE_PLACKET: ['opening', 'front', { edge: 'center', finishedWidthMm: 20, turnUnderMm: 10, buttonSpacingMm: 60, endMarginMm: 20, buttonholeLengthMm:14, buttonholeWidthMm:2, interfacingWidthMm:16 }, '比翼・折り線・取付線・14×2mmのボタン穴・幅16mmの裏側の芯を生成。身頃への縫合と配置は未完了。'],
    MERGE_PIECES: ['split', null, {}, '同じ座標系の分割パーツを共通の直線縫合で結合。共通辺を除去。'],
    PARALLEL_SPREAD: ['panel', 'front-sample-panel', { amountMm: 40, positionMm: 100 }, '長方形の左端から100mmの位置で切開し、幅を40mm平行展開。'],
    TRUE_DART_EDGE: ['dart', 'back', {}, 'ダーツを閉じたときにつながるよう両隣の輪郭を整える。縫い代・裁断用折返しは別。'],
    SET_EDGE_ALLOWANCES: ['panel', 'front-sample-panel', {}, '全辺の固定IDごとに縫い代10mmを設定。この見本は直線で、曲線の辺も指定可能。縫い線は維持。'],
  };
  const contracts = createAIContext(original).operationContracts;
  const examples = Object.keys(operationDefinitions).map(type => {
    if (!specs[type]) throw Error(`ツールの実行例が未定義です: ${type}`);
    const [specimenId, pieceId, values, effect] = specs[type], before = patterns[specimenId];
    const piece = pieceId ? before.pieces.find(p => p.id === pieceId) : before.pieces.find(p => p.splitFrom === 'front-sample-panel');
    try {
      const raw = { ...defaultOperation(type, before, piece), ...values, id: `example-${type.toLowerCase().replaceAll('_', '-')}` };
      const result = run(before, raw);
      return { type, label: operationNames[type], effect, contract: contracts[type], specimenId,
        command: result.operation, after: snapshot(result.pattern) };
    } catch (error) { throw Error(`ツール実行例 ${type} の生成に失敗: ${error.message}`, { cause: error }); }
  });
  const variants = [
    ['curved-guide','ADD_ATTACHMENT_LINE','panel','front-sample-panel',{
      name:'曲線の裁断ガイド',purpose:'cut-guide',start:{x:0,y:300},end:{x:0,y:100},segments:curvedCut.segments},'滑らかな曲線を裁断ガイドとして出力。外周は維持し、穴や切欠きにはしない。'],
    ['closed-guide','ADD_ATTACHMENT_LINE','panel','front-sample-panel',{
      name:'閉じた裁断ガイド',purpose:'cut-guide',closed:true,start:{x:150,y:100},end:{x:150,y:100},segments:[
        {type:'cubic',control1:{x:230,y:100},control2:{x:230,y:300},end:{x:150,y:300}},
        {type:'cubic',control1:{x:70,y:300},control2:{x:70,y:100},end:{x:150,y:100}}]},'閉じた曲線ガイドを保存・出力。独立した内部穴の生成ではない。'],
    ['curved-split','SPLIT_PIECE','panel','front-sample-panel',curvedCut,'外周の同じ辺の2点を曲線で結び、2パーツへ分割。'],
    ['remove-cutout','REMOVE_PIECE','curve-split','front-sample-panel',{},'曲線で分割した小さい側を削除し、残るパーツに外周の切欠きを作る。'],
  ];
  for(const [variantId,type,specimenId,piece,values,effect] of variants){
    const result=run(patterns[specimenId],{id:`example-${variantId}`,type,piece,...values});
    examples.push({variantId,type,label:operationNames[type],effect,contract:contracts[type],specimenId,
      command:result.operation,after:snapshot(result.pattern)});
  }
  return { format: 'aicad-tool-examples', version: 1, base,
    instructions: '全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。',
    specimens, examples };
}
