import { pathSegmentsSchema } from './internal-path.js';
const number = (min, max) => ({ type: 'number', minimum: min, maximum: max });
const vector = { type: 'object', required: ['x', 'y'], additionalProperties: false,
  properties: { x: number(-10000, 10000), y: number(-10000, 10000) } };
const contract = (label, references, parameters, required = Object.keys(parameters), limitation = '') => ({ label, references, parameters, required, limitation });
const id = { type: 'string', minLength: 1, maxLength: 120 };
const participants = { type: 'array', minItems: 2, maxItems: 16, items: {
  type: 'object', additionalProperties: false, required: ['id', 'pieceRef', 'segments', 'fit'], properties: {
    id, pieceRef: id, instanceId: id, face: { enum: ['front', 'back'] },
    segments: { type: 'array', minItems: 1, maxItems: 32, items: { type: 'object', additionalProperties: false, required: ['lineRef', 'range', 'direction'], properties: {
      lineRef: id, range: { type: 'object', additionalProperties: false, required: ['mode'], properties: { mode: { enum: ['whole', 'interval'] }, startMm: number(0, 20000), endMm: number(0, 20000) } }, direction: { enum: ['forward', 'reverse'] },
    } } },
    fit: { type: 'object', additionalProperties: false, required: ['mode'], properties: { mode: { enum: ['plain', 'ease', 'gather', 'stretch'] }, amountMm: number(0.001, 20000), intervalAmountsMm: { type: 'array', minItems: 1, maxItems: 101, items: number(0, 20000) } } },
  },
} };
const seamParameters = { kind: { enum: ['sew'] }, name: { type: 'string', minLength: 1, maxLength: 120 }, referenceParticipantId: id, participants,
  matchPoints: { type: 'array', minItems: 0, maxItems: 100, items: { type: 'object', required: ['id', 'positionsMm'], properties: { id, positionsMm: { type: 'object', additionalProperties: number(0, 20000), properties: {} } } } } };
const seamLimitation = '2〜16参加者。外周または内部取付線、全体またはinterval(startMm/endMm)。参加者のinstanceIdで裁断個体、faceで表front/裏backを指定。省略は型紙全体の関係で左右を推定しない。縫い代を除いた有効長を比較。基準はplain。他はplain/ease/gather/stretch、加工量はamountMm。プリーツの部分区間・同一個体の繰り返し縫いは未対応。';
const placement = { name: id, sourceLineRef: id, targetLineRef: id, sourceDistanceMm: number(0, 20000), targetDistanceMm: number(0, 20000), offsetMm: vector, rotationDeg: number(-180, 180) };
const scope = { sourceInstanceId: id, targetInstanceId: id, sourceFace: { enum: ['front','back'] }, targetFace: { enum: ['front','back'] },
  sourceRegionRef: id, targetRegionRef: id, state: { enum: ['always','open','closed'] } };
export const authoringDefinitions = {
  SET_CUT_INSTANCES: contract('裁断個体の左右と向きを設定', {}, { instances: { type: 'array', minItems: 1, maxItems: 20,
    items: { type: 'object', additionalProperties: false, required: ['id','name','side','mirrored'], properties: {
      id: { type: 'string', minLength: 1, maxLength: 100 }, name: id, side: { enum: ['left','right','center','unspecified'] }, mirrored: { type: 'boolean' },
    } } } }, undefined, '裁断枚数を変えず個体を定義。左右は着用者基準。mirroredは型紙座標に対する反転。既存関係が使うIDを削除すると拒否。左右対称裁断は反転あり・なしを同数。'),
  ADD_RELATION: contract('縫合を追加', {}, seamParameters, ['kind', 'name', 'referenceParticipantId', 'participants'], seamLimitation),
  UPDATE_RELATION: contract('縫合を変更', { relation: null }, seamParameters, ['kind', 'name', 'referenceParticipantId', 'participants'], seamLimitation),
  REMOVE_RELATION: contract('縫合を解除', { relation: null }, {}, [], '使用中のダーツ・開きは解除不可。辺と対応する合印の対を再評価し、合印自体は保持。'),
  ADD_ATTACHMENT_LINE: contract('内部の線を描く', {}, { name: id, start: vector, end: vector,
    purpose: { enum: ['attachment', 'cut-guide', 'fold', 'construction', 'region', 'interfacing', 'buttonhole', 'opening'] }, segments: pathSegmentsSchema, closed: { type: 'boolean' },
    instanceId: id, face: { enum: ['front','back'] }, widthMm: number(0.1,10), allowanceMm: number(0,30) },
    ['name', 'start', 'end'], '局所座標mmの直線・ベジェ曲線。closed:trueはstart=end。region/interfacingは閉じた範囲。buttonholeは直線の長さとwidthMmで寸法を指定。openingは外周から独立した実際の閉じた穴で、allowanceMmは穴の内側に残す縫い代（省略0）。cut-guideは穴にしない。instanceId/faceで個体・表裏を指定できるがopeningは型紙全体のみ。位置は自動追従しない。編集・削除は生成操作の置換・削除。'),
  SET_PIECE_PLACEMENT: contract('パーツの取付位置を指定', { otherPiece: null }, { ...placement, ...scope }, Object.keys(placement), 'pieceをotherPiece基準へ配置。instanceIdで個体、Faceで表裏、RegionRefで両布の閉じた領域線を指定。stateはalways/open/closed。省略は全体。一つの個体に同じ状態の配置基準は一つ。二次元配置であり、開閉や3Dの物理検証ではない。'),
  SET_OVERLAP_RELATION: contract('パーツの重なりを指定', { otherPiece: null }, { name: id, ...scope }, ['name'], 'pieceがotherPieceより表側。個体・表裏・両側の閉じた領域線・開閉状態を指定可能。領域はsourceRegionRef/targetRegionRefを両方指定。省略は全体。可視幅や開閉可能性を自動保証しない。'),
  REMOVE_ASSEMBLY_RELATION: contract('取付位置と重なりを解除', { relation: null }, {}, []),
  MOVE_VERTEX: contract('輪郭の端点を移動', { edge: null }, { endpoint: { enum: ['start', 'end'] }, offset: vector }),
  EXTEND_HEM: contract('身頃の丈・裾幅を変更', { edge: null }, { amountMm: number(-500, 1000), widthChangeMm: number(-300, 300) }, undefined,
    '水平な直線の下端と、直線の隣接辺が対象。幅の増減はパーツ1枚分。'),
  REDRAW_EDGE: contract('曲線を引き直す', { edge: null }, { control1Offset: vector, control2Offset: vector }, undefined,
    '端点を維持。縫合相手の変更は同じ一括操作に含める。'),
  DISTRIBUTE_DART: contract('ダーツを移動・分配', { dart: null, targetEdge: 'distanceMm' }, { ratio: number(0.001, 1) }),
  SET_DART_TIP: contract('ダーツの縫い止まりを設定', { dart: null }, { setbackMm: number(0, 100) }, undefined,
    '展開中心と輪郭は維持し、開口の中点方向への距離で縫い止まりだけを設定。'),
  PRINCESS_SEAM: contract('ダーツから切替パーツを作る', { dart: null, endEdge: 'endDistanceMm' }, {}, [],
    '既存ダーツの脚を上部切替に使用し、展開中心から指定辺へ直線分割。胸周辺の曲線仕上げは別操作。'),
  OPEN_FOLD: contract('わを左右の開きへ変更', { edge: null }, {}, [],
    '左右対称の2枚裁断へ変更。重なり・比翼は別途作成。'),
  REMOVE_PIECE: contract('不要なパーツを外す', {}, {}, [],
    '接続していた縫合と合印の対を解除し、残る相手辺を開いた辺にする。'),
  ADD_NOTCH: contract('辺に合印を追加', { edge: 'distanceMm' }, { count: { type: 'integer', minimum: 1, maximum: 3 } }),
  CREATE_RECTANGLE: contract('補強布・帯のパーツを作る', {}, { widthMm: number(2, 2000), heightMm: number(2, 2000), name: { type: 'string', minLength: 1, maxLength: 120 }, quantity: { type: 'integer', minimum: 1, maximum: 20 } }),
  ADJUST_DART: contract('ダーツの取り量・深さを変更', { dart: null }, { widthMm: number(0.1, 100), depthMm: number(1, 300) }, undefined,
    '開口の中点と方向を維持し、弦長と深さを変更。身体のBPは動かさない。'),
  CREATE_PLEATS: contract('直線プリーツを展開', {}, { count: { type: 'integer', minimum: 1, maximum: 30 }, depthMm: number(0.5, 100), spacingMm: number(1, 200), firstOffsetMm: number(0.1, 2000), direction: { enum: ['left', 'right'] } }, undefined,
    '縦地の目の長方形パネル限定。完成幅に1本あたり深さの2倍を追加。曲線パネル・他のダーツ・合印とは併用不可。'),
  CREATE_STAND_COLLAR: contract('直線型スタンドカラーを作る', {}, { necklineIds: { type: 'array', minItems: 1, maxItems: 8, uniqueItems: true, items: { type: 'string', minLength: 1, maxLength: 120 } }, necklineDirections: { type: 'array', minItems: 1, maxItems: 8, items: { enum: [1, -1] } }, heightMm: number(5, 150), overlapMm: number(0, 60), onFold: { type: 'boolean' } }, ['necklineIds', 'heightMm', 'overlapMm', 'onFold'],
    '襟ぐりを後中心→前中心の順に指定。necklineDirectionsは各辺をその順にたどる方向（1=始点→終点、-1=終点→始点）。省略は内蔵原型の未分割の後襟ぐり1・前襟ぐり-1のみ。半身分の直線襟。湾曲・折返し襟は別途設計。'),
  CREATE_FACING: contract('辺に沿った見返しを作る', { edge: null }, { widthMm: number(2, 100), side: { enum: ['left', 'right'] } }, undefined,
    '開いた1辺から一定幅の帯を生成。元のパーツ外周との交点で切り揃える処理は含まない。'),
  CREATE_PLACKET: contract('別付け比翼パーツを作る', { edge: null }, { finishedWidthMm: number(5, 80), turnUnderMm: number(1, 30), buttonSpacingMm: number(10, 150), endMarginMm: number(5, 100),
    buttonholeLengthMm: number(2,60), buttonholeWidthMm: number(0.1,10), interfacingWidthMm: number(1,80) }, ['finishedWidthMm','turnUnderMm','buttonSpacingMm','endMarginMm'],
    '帯・折り線・内部取付線を生成。ボタン穴長さと幅は両方指定、上前のみ生成。芯幅を指定すれば裏面の閉じた範囲を両帯に生成（仕上がり幅以内）。取付線を個体・表裏付きADD_RELATIONで身頃へ縫合し、SET_PIECE_PLACEMENTで配置する。取付・穴・芯の不足は現データから再評価する。開閉可能性は別途確認。'),
  MERGE_PIECES: contract('分割パーツを結合', { otherPiece: null, relation: null }, {}, [],
    '同じ座標系で分割した2パーツの共通の直線縫合辺を除去して結合。異なる原型の配置合わせは含まない。'),
  PARALLEL_SPREAD: contract('パネルを平行展開', {}, { amountMm: number(0.1, 500), positionMm: number(0.1, 2000) }, undefined,
    '軸に平行な長方形パネルを縦に切開して平行展開。ダーツや折り構造のあるパネルは未対応。'),
  TRUE_DART_EDGE: contract('ダーツを閉じた端を整える', { dart: null }, {}, [],
    'ダーツ両隣の輪郭を閉鎖時に滑らかにつなぐ。ダーツの裁断用折返し・縫い代は別処理。'),
  SET_EDGE_ALLOWANCES: contract('辺別の縫い代を設定', {}, { widths: { type: 'array', minItems: 1, maxItems: 100, items: {
    type: 'object', required: ['edgeId','widthMm'], additionalProperties: false, properties: { edgeId: { type: 'string', minLength: 1, maxLength: 120 }, widthMm: number(0,30) } } } }, undefined,
    '直線・曲線の全辺の固定IDを1度ずつ指定し、わの辺は0mm。単一ダーツは口の両隣と両脚を同じ正の幅にする。形状の自己交差・つぶれは拒否。'),
  SET_EDGE_ALLOWANCE: contract('1辺の縫い代を設定・変更', { edge: null }, { widthMm: number(0,30) }, undefined,
    '直線・曲線の指定した1辺の幅を置き換える。他辺の幅は保持し、未設定なら0mm。加算ではない。わは0mm。ダーツ脚への直接指定は不可、口の両隣は同じ正の幅が必要。複数辺を連動変更する場合は同じ一括操作で実行する。'),
};
