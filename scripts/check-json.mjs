import { readFile } from 'node:fs/promises';

const [file, ...extra] = process.argv.slice(2);
if (!file || extra.length) {
  console.error('Usage: node scripts/check-json.mjs candidate.json');
  process.exitCode = 2;
} else {
  try {
    const source = await readFile(file, 'utf8');
    try {
      JSON.parse(source);
      console.log('JSONの文法チェックに成功しました。加工契約・ID・内容の正しさは別途確認してください。');
    } catch (error) {
      console.error(`JSONの文法エラー: ${error.message}`);
      const match = /\bposition (\d+)/i.exec(error.message);
      const location = /\bline (\d+) column (\d+)/i.exec(error.message);
      let position = match ? Number(match[1]) : null;
      if (position === null && location) {
        const lines = source.split('\n');
        position = lines.slice(0, Number(location[1]) - 1).reduce((sum, line) => sum + line.length + 1, 0) + Number(location[2]) - 1;
      }
      if (position === null && /unexpected end/i.test(error.message)) position = source.length;
      if (position !== null) {
        const before = source.slice(0, position);
        const line = before.split('\n').length;
        const column = position - before.lastIndexOf('\n');
        console.error(`位置: ${position}（0始まり）、行: ${line}、列: ${column}（1始まり、UTF-16単位）`);
        console.error(`直前: ${JSON.stringify(source.slice(Math.max(0, position - 60), position))}`);
        console.error(`該当: ${position === source.length ? 'ファイル末尾' : JSON.stringify(source.slice(position, position + 1))}`);
        console.error(`以降: ${JSON.stringify(source.slice(position + 1, position + 61))}`);
      }
      console.error('説明文・Markdownの囲み・複数JSONの連結がないか確認し、修正後に同じファイルを再チェックしてください。');
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`JSONファイルを読み込めません: ${error.message}`);
    process.exitCode = 2;
  }
}
