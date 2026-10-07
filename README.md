# Costume Atelier CAD

衣装アトリエの3.2で使用するCADエンジンと、実際のエンジンから生成した加工教材です。
Node.js 22以上。外部パッケージのインストールは不要です。

## AIの入口

1. アプリから届く `aicad-loop-packet` の `toolGuide` を確認します。`commit` は今回のアプリと同じ公開版です。mainの最新版で置き換えないでください。
2. `toolGuide.indexUrl` の索引で全操作の概要を読み、使用する操作のJSONを取得します。各JSONには契約・実行命令・前後のSVGと意味付きデータ・準備状態が含まれます。全件は `toolGuide.bundleUrl` です。
3. 教材中の固定ID・採寸・数値を今回の指示へ流用しません。今回の型紙・採寸・解釈・ユーザー回答は依頼JSONが正本です。適用可否は今回のgeometryのoperations/targetsで確認します。
4. コードを実行できるAIは以下の試行手順を使えます。取得や実行ができない場合はその旨を伝え、画面の「教材を添付する依頼に切り替え」を使ってください。実行したと装わないでください。

## 加工案を手元で試す

```sh
git clone https://github.com/stangun1024/costume-atelier-cad.git
cd costume-atelier-cad
git checkout --detach <toolGuide.commit>
node scripts/run-cad-loop.mjs /path/to/ai-loop-packet.json /path/to/candidate.json /path/to/preview
```

`ai-loop-packet.json` は3.2の「受け渡しファイルを保存」で取得します。コピー本文の場合は末尾の `aicad-loop-packet` JSONをファイルに保存しても使えます。個人の依頼JSON・採寸・画像・生成結果をこのリポジトリにアップロードする必要はありません。

`candidate.json` はアプリへ返す1件の `patch / inspect / ask / resolve / end` そのものです。`nextMessage` のformat/version/sessionId/requestId/baseFlowRevisionを維持し、typeと対応する項目を指定します。詳細は依頼内のcontractと `costume/implementation-loop.js` を参照してください。

人間とのやりとり・コピー貼り付けの往復回数をできるだけ抑えるため、返答前にAI側で可能な仕様確認・計測・加工の試行・結果確認・エラー修正を済ませてください。実行環境がある場合は、指定commitのCADと今回のlocalExecutionで候補を実行し、成功した `report.json` と `pattern.svg` を確認してから `preview/response.json` をそのままアプリへ返してください。失敗したら同じ依頼・同じヘッダーに対する候補を手元で修正・再実行します。AI側で解決できる確認や修正のためだけに人間へ中継を求めないでください。失敗時はresponse.jsonをnullに上書きします。

実行できない場合も、JSON形式・契約・ID・依存順・数値・単位・目的との対応を確認してください。未実施の実行や図の確認を成功扱いにしません。人間の判断が必要な不明点は推測で埋めず、独立した質問を同じaskに並べ、各質問は1つの判断・1つの回答で完結させてください。

この入口は、アプリと同じ原型・加工フロー・判断状態で1件を試行します。試行で発行された次のrequestIdやセッションをアプリへ持ち込む経路はありません。複数の加工は1件のpatchのchangesにまとめて試してください。成功した実際のアプリの返答を受け取るまで次の要求へ進みません。

ローカルのinspect成功だけではアプリのend条件を満たしません。最終patchの適用後、アプリでinspect fullを実行し、最新の結果を受け取ってからendを返してください。質問への人間の回答はアプリ上で行い、AIが回答を捏造しないでください。持ち込み型紙画像の図形演算は未対応です。

## フロー全体の再計算

既存の `aicad-procedural-flow`（version:1、base、intentIds、plan）も利用できます。

```sh
node scripts/run-implementation.mjs flow.json preview
```

こちらの出力はフローのレポートで、3.2への回答JSONではありません。

## 公開内容と版

CAD実行入口と教材生成器から参照されるソースだけを収録します。`cad/`の少数の補助ファイルは教材の既定操作生成に必要な依存です。アプリ本体・保存済み制作データ・参考画像・認証情報・元プロジェクトのGit履歴は含みません。

`cad-release.json` のreleaseIdは公開対象全ファイル（このmanifest自身を除く）の内容から作るSHA-256です。各ファイルのハッシュも記録します。アプリの公開設定はさらにGitHubのコミットへ固定されます。エンジンを変更した場合は新しい公開版を用意してからアプリを公開します。

数値整合性は着用時のフィットや縫製可能性の保証ではありません。未対応の加工・試着・縫い代・取付などの残る確認を人間へ引き継いでください。
