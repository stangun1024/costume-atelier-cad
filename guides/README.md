# 加工ツール一覧

全例は教材です。見本のID・寸法は今回の加工指示に流用しないでください。各例はspecimenIdの独立した実行前状態からcommandを1回適用した結果です。specimensのparentとpreparationCommandは見本の準備手順で、今回の加工計画ではありません。SVGの配置は表示用です。意味付きデータの座標・IDを正本とします。

Web閲覧では各操作のMarkdown教材を優先します。契約・実行命令・準備手順を読み、必要な実行前後データは小分けのページから確認できます。図を見られない場合はSVGを見たと装わないでください。

- [EXTEND — 袖丈を変更](readable/EXTEND.md): 袖山・袖口幅を維持して袖丈を50mm延長。身体採寸は維持。
- [RESHAPE — 輪郭のカーブを変更](readable/RESHAPE.md): 端点を維持し、制御点の指定で袖口のカーブを変更。
- [SLASH_SPREAD — 切り開いて展開](readable/SLASH_SPREAD.md): 指定支点を固定して外向きに10度開く。輪郭方向により角度の符号が変わる。
- [ADD_FLARE — 袖口にフレアを追加](readable/ADD_FLARE.md): 袖口を展開して分量を追加。袖山と身体採寸を維持。
- [ADD_SLIT — 縫合に開きを追加](readable/ADD_SLIT.md): 縫合の終端から60mmを開きにし、対応する両辺の縫合範囲を更新。
- [ADD_SEAM_ALLOWANCE — 縫い代を設定](readable/ADD_SEAM_ALLOWANCE.md): 1パーツの外周全体を均一10mmへ置換。辺別設定を解除し、縫い線を維持。0mmで解除。
- [ADD_DART — ダーツを追加](readable/ADD_DART.md): ウエスト辺の始点から80mmに取り量20mm・深さ80mmのダーツを追加。
- [PIVOT_DART — ダーツを移動](readable/PIVOT_DART.md): 展開中心を使ってダーツを襟ぐりへ移動。
- [SPLIT_PIECE — 線でパーツを分割](readable/SPLIT_PIECE.md): 指定した2点の直線で分割し、切替の縫合関係を作る。 / 外周の同じ辺の2点を曲線で結び、2パーツへ分割。
- [CONVERT_DART_TO_SEAMS — ダーツを通常の縫合に変換](readable/CONVERT_DART_TO_SEAMS.md): ダーツの脚を通常の縫合辺に変換。輪郭とダーツとしての意味の変化を区別。
- [RENAME_ENTITY — 対象の名前を変更](readable/RENAME_ENTITY.md): 固定IDと形状を維持して名称と命名者情報を変更。SVGの輪郭は変わらない。
- [SET_ENTITY_SEMANTICS — 対象の意味を設定](readable/SET_ENTITY_SEMANTICS.md): 形状・固定IDを維持してAIの意味付けを記録。SVGだけでは確認できない変更。
- [SET_CUT_INSTANCES — 裁断個体の左右と向きを設定](readable/SET_CUT_INSTANCES.md): 左右対称裁断の二枚に着用者左右と反転を明示。型紙形状は維持し、取付先はこの個体IDで指定する。
- [ADD_RELATION — 縫合を追加](readable/ADD_RELATION.md): 独立した二枚の300mmの辺を一つの通常縫合へ登録。配置・層順は別の仕様。
- [UPDATE_RELATION — 縫合を変更](readable/UPDATE_RELATION.md): 参加者と縫合の固定IDを維持し、縫合名を変更。辺の再選択も同じ操作契約。
- [REMOVE_RELATION — 縫合を解除](readable/REMOVE_RELATION.md): 縫合を解除し、使用がなくなった辺を開いた辺に戻す。パーツ形状は維持。
- [ADD_ATTACHMENT_LINE — 内部の線を描く](readable/ADD_ATTACHMENT_LINE.md): 外周を変えず、パネル内部に260mmの取付線を生成。 / 滑らかな曲線を裁断ガイドとして出力。外周は維持し、穴や切欠きにはしない。 / 閉じた曲線ガイドを保存・出力。独立した内部穴の生成ではない。
- [SET_PIECE_PLACEMENT — パーツの取付位置を指定](readable/SET_PIECE_PLACEMENT.md): 相手の上辺始点を基準にX20mm、Y30mmへ配置。画面上の型紙の並べ方とは別に保存。
- [SET_OVERLAP_RELATION — パーツの重なりを指定](readable/SET_OVERLAP_RELATION.md): 見本パネルを相手のパネルより表側に指定。縫合は別の操作。
- [REMOVE_ASSEMBLY_RELATION — 取付位置と重なりを解除](readable/REMOVE_ASSEMBLY_RELATION.md): 全体の重なり関係を解除。型紙と縫合は保持。
- [MOVE_VERTEX — 輪郭の端点を移動](readable/MOVE_VERTEX.md): 端点を右20mm・下10mm移動し、接続する辺も更新。
- [EXTEND_HEM — 身頃の丈・裾幅を変更](readable/EXTEND_HEM.md): 下端を50mm延長し、パーツ1枚の裾幅を40mm増加。
- [REDRAW_EDGE — 曲線を引き直す](readable/REDRAW_EDGE.md): 両端を維持して上辺を曲線に引き直す。
- [DISTRIBUTE_DART — ダーツを移動・分配](readable/DISTRIBUTE_DART.md): ダーツ量の半分を指定辺へ移し、残りを元の位置に残す。
- [SET_DART_TIP — ダーツの縫い止まりを設定](readable/SET_DART_TIP.md): 展開中心・輪郭を維持し、縫い止まりだけを開口側へ20mm戻す。
- [PRINCESS_SEAM — ダーツから切替パーツを作る](readable/PRINCESS_SEAM.md): ダーツの脚と展開中心から指定辺への直線で切替パーツを作る。曲線仕上げは別。
- [OPEN_FOLD — わを左右の開きへ変更](readable/OPEN_FOLD.md): 輪郭・固定IDを維持し、わの1枚裁断を左右対称の2枚裁断へ変更。
- [REMOVE_PIECE — 不要なパーツを外す](readable/REMOVE_PIECE.md): 袖を外し、接続していた縫合・合印の対応を解除。残る相手辺を開いた辺にする。 / 曲線で分割した小さい側を削除し、残るパーツに外周の切欠きを作る。
- [ADD_NOTCH — 辺に合印を追加](readable/ADD_NOTCH.md): 上辺の始点から100mmに2本の合印を追加。輪郭は維持。
- [CREATE_RECTANGLE — 補強布・帯のパーツを作る](readable/CREATE_RECTANGLE.md): 元のパーツを維持し、300×400mmの独立パーツを追加。
- [ADJUST_DART — ダーツの取り量・深さを変更](readable/ADJUST_DART.md): 開口の中点・方向を維持し、取り量25mm・深さ90mmに変更。
- [CREATE_PLEATS — 直線プリーツを展開](readable/CREATE_PLEATS.md): 3本×深さ10mm×2の60mmを追加し、折り線と折る方向を記録。
- [CREATE_STAND_COLLAR — 直線型スタンドカラーを作る](readable/CREATE_STAND_COLLAR.md): 後→前の襟ぐり長から高さ40mm・重なり15mmの直線型の半身襟を生成。
- [CREATE_FACING — 辺に沿った見返しを作る](readable/CREATE_FACING.md): 指定辺の進行方向に対して左側へ幅30mmの見返しを生成。
- [CREATE_PLACKET — 別付け比翼パーツを作る](readable/CREATE_PLACKET.md): 比翼・折り線・取付線・14×2mmのボタン穴・幅16mmの裏側の芯を生成。身頃への縫合と配置は未完了。
- [MERGE_PIECES — 分割パーツを結合](readable/MERGE_PIECES.md): 同じ座標系の分割パーツを共通の直線縫合で結合。共通辺を除去。
- [PARALLEL_SPREAD — パネルを平行展開](readable/PARALLEL_SPREAD.md): 長方形の左端から100mmの位置で切開し、幅を40mm平行展開。
- [TRUE_DART_EDGE — ダーツを閉じた端を整える](readable/TRUE_DART_EDGE.md): ダーツを閉じたときにつながるよう両隣の輪郭を整える。縫い代・裁断用折返しは別。
- [SET_EDGE_ALLOWANCES — 辺別の縫い代を設定](readable/SET_EDGE_ALLOWANCES.md): 全辺の固定IDごとに縫い代10mmを設定。この見本は直線で、曲線の辺も指定可能。縫い線は維持。
- [SET_EDGE_ALLOWANCE — 1辺の縫い代を設定・変更](readable/SET_EDGE_ALLOWANCE.md): 全周10mmから裾だけ20mmへ置換。他の辺は10mmを保持し、加算しない。
