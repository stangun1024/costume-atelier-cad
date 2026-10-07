import { Vector, Line, Path } from '../core/geometry.js';
import { translatePath, locateAtLength } from '../core/path-tools.js';
import { pathToSvgData, svgNumber as n, escapeXml as xml } from './svg.js';
import { participantRefs } from '../pattern/sewing.js';
import { segmentGeometry } from '../pattern/assembly-sewing.js';
import { openings, openingCutPath, buttonholeOutline } from '../pattern/material-regions.js';

const text = (x, y, content, attributes = '') => `<text x="${n(x)}" y="${n(y)}" ${attributes}>${xml(content)}</text>`;
const svgLine = (x1, y1, x2, y2, attributes = '') => `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" ${attributes}/>`;

/** Display-only seam overlay, shared with the CAD viewport. */
export function renderSewingHighlight(pattern, relation, piece, x = 0, y = 0) {
  const parts = [];
  for (const participant of relation?.participants ?? []) {
    for (const [i, ref] of participantRefs(pattern, participant).entries()) {
      if (ref.piece !== piece.id) continue;
      let geometry;
      try { geometry = segmentGeometry(pattern, participant, participant.segments[i]); } catch { continue; }
      const path = translatePath(geometry.path, x, y), direction = participant.segments[i].direction == null ? null : 'forward';
      parts.push(`<path fill="none" stroke="#8b52b0" stroke-width="1.5" d="${pathToSvgData(path)}"><title>${xml(relation.name ?? relation.id ?? '縫合')} / ${xml(participant.id)}</title></path>`);
      if (['forward', 'reverse'].includes(direction)) {
        const at = locateAtLength(path, path.length() / 2), sign = direction === 'reverse' ? -1 : 1;
        const tip = at.point.translate(at.tangent.scale(5 * sign)), tail = at.point.translate(at.tangent.scale(-5 * sign));
        const normal = new Vector(-at.tangent.y, at.tangent.x);
        const left = at.point.translate(normal.scale(2)), right = at.point.translate(normal.scale(-2));
        parts.push(svgLine(tail.x, tail.y, tip.x, tip.y, 'stroke="#8b52b0" stroke-width="1"'),
          `<path fill="none" stroke="#8b52b0" stroke-width="1" d="M ${n(left.x)} ${n(left.y)} L ${n(tip.x)} ${n(tip.y)} L ${n(right.x)} ${n(right.y)}"/>`);
      }
    }
  }
  return parts.join('\n');
}

/** Full-scale sewing lines with semantic SVG groups and drafting annotations. */
export function renderPatternSvg(pattern, { pieceIds = pattern.pieces.map(piece => piece.id), showConstruction = true, highlightedRelationId = null, comparisonPattern = null } = {}) {
  if (!Array.isArray(pieceIds) || pieceIds.length === 0 || new Set(pieceIds).size !== pieceIds.length) {
    throw new TypeError('pieceIds must be a nonempty list of unique ids');
  }
  if (typeof showConstruction !== 'boolean') throw new TypeError('showConstruction must be a boolean');
  const pieces = pieceIds.map(id => {
    const piece = pattern.pieces.find(piece => piece.id === id);
    if (!piece) throw new RangeError(`Unknown piece: ${id}`);
    return piece;
  });
  let cursor = 20;
  // Both comparison layers share each piece's local origin and the combined bounds.
  const layoutPieces = comparisonPattern ? [...comparisonPattern.pieces, ...pieces.filter(piece => !comparisonPattern.pieces.some(other => other.id === piece.id))] : pieces;
  const layout = layoutPieces.map(reference => {
    const piece = pieces.find(piece => piece.id === reference.id) ?? reference;
    const currentBounds = (piece.cuttingBoundary ?? piece.boundary).bounds();
    const referenceBounds = (reference.cuttingBoundary ?? reference.boundary).bounds();
    const bounds = { minX: Math.min(currentBounds.minX, referenceBounds.minX), minY: Math.min(currentBounds.minY, referenceBounds.minY),
      maxX: Math.max(currentBounds.maxX, referenceBounds.maxX), maxY: Math.max(currentBounds.maxY, referenceBounds.maxY) };
    const cellWidth = Math.max(250, bounds.maxX - bounds.minX);
    const result = { piece, x: cursor - bounds.minX, y: 115 - bounds.minY, bounds, cellLeft: cursor };
    cursor += cellWidth + 30;
    return result;
  });
  const placements = layout.filter(({ piece }) => pieceIds.includes(piece.id));
  const width = Math.max(420, cursor - 10);
  const bottom = Math.max(...layout.map(({ y, bounds }) => y + bounds.maxY));
  const height = bottom + 65;
  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${n(width)}mm" height="${n(height)}mm" viewBox="0 0 ${n(width)} ${n(height)}" role="img" aria-labelledby="pattern-title">`,
    `  <title id="pattern-title">${xml(pattern.method.name)} / ${xml(pieces.map(p => p.name).join('・'))}</title>`,
    `  <metadata>${xml(JSON.stringify({ format: 'aicad-pattern-svg', version: '0.1.0', method: { id: pattern.method.id, version: pattern.method.version },
      request: { method: pattern.method.id, body: pattern.body, design: pattern.design }, operationDocument: pattern.operationDocument,
      seamAllowanceMm: Object.fromEntries(pieces.map(p => [p.id, p.cut.seamAllowance])) }))}</metadata>`,
    '  <defs><marker id="grain-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#47696a"/></marker></defs>',
    '  <style>text{font-family:"Yu Gothic","Meiryo",sans-serif;fill:#18333e;font-size:5px} .outline{fill:none;stroke:#18333e;stroke-width:0.45;stroke-linejoin:round} .construction{fill:none;stroke:#849a9e;stroke-width:0.25;stroke-dasharray:3 2} .grain{fill:none;stroke:#47696a;stroke-width:0.4} .notch{fill:none;stroke:#bc542e;stroke-width:0.65} .muted{fill:#596d74}</style>',
    text(20, 20, pattern.method.name, 'font-weight="700" style="font-size:10px"'),
    text(20, 33, `バスト ${pattern.body.bust} mm ／ 背丈 ${pattern.body.backLength} mm ／ 袖丈 ${pattern.design.sleeveLength} mm`),
    text(20, 44, `縫い線・実寸 1:1 ／ ${pieces.some(p => p.cut.seamAllowance) ? '縫い代あり（赤破線＝裁断線）' : '縫い代なし'} ／ ${pieces.some(p => p.darts.length) ? 'ダーツあり' : 'ダーツなし'} ／ カーブは数値近似`, 'class="muted"'),
    text(20, 55, '原型の試作です。着用確認・補正後に、ダーツや開きなどの縫製設計を行ってください。', 'class="muted"'),
    svgLine(20, 67, 38, 67, 'class="outline"'), text(42, 69, '輪郭'),
    svgLine(73, 67, 91, 67, 'class="construction"'), text(95, 69, '補助線'),
    svgLine(138, 64, 138, 70, 'class="notch"'), text(145, 69, '前合印：1本 ／ 後合印：2本'),
  ];
  const highlighted = pattern.relations.find(r => r.id === highlightedRelationId);
  for (const { piece, x, y, cellLeft } of placements) {
    parts.push(`<g id="piece-${xml(piece.id)}" data-piece-id="${xml(piece.id)}"${piece.entityId ? ` data-entity-id="${xml(piece.entityId)}"` : ''}>`,
      text(cellLeft, 92, piece.name, 'font-weight="700" style="font-size:8px"'),
      text(cellLeft, 103, piece.cut.onFold ? '1枚・「わ」の辺で折る' : `${piece.cut.quantity ?? 1}枚${piece.cut.mirroredPair ? '・左右対称に裁断' : ''}`, 'class="muted"'));
    const materialOutline = [piece.boundary, ...openings(piece).map(h => h.path)].map(p => pathToSvgData(translatePath(p, x, y))).join(' ');
    parts.push(`<path id="${xml(piece.id)}-boundary" class="outline" fill-rule="evenodd" d="${materialOutline}"/>`);
    if (piece.cuttingBoundary && piece.darts.length === 1)
      parts.push(text(cellLeft, 110, 'ダーツ縫い代：戻り脚側へ片倒しする前提', 'class="muted" style="font-size:3.5px"'));
    if (piece.cuttingBoundary) parts.push(`<path id="${xml(piece.id)}-cutting-boundary" fill="none" stroke="#bc542e" stroke-width="0.4" stroke-dasharray="3 2" d="${pathToSvgData(translatePath(piece.cuttingBoundary, x, y))}"/>`);
    for (const feature of piece.features.filter(f => f.type === 'slit')) {
      for (const id of feature.edges) parts.push(`<path data-slit-id="${xml(feature.id)}" fill="none" stroke="#3267b0" stroke-width="0.8" stroke-dasharray="2 1" d="${pathToSvgData(translatePath(piece.edge(id).path, x, y))}"><title>開き ${n(feature.lengthMm)} mm</title></path>`);
    }
    for (const dart of piece.darts) {
      const a = piece.edge(dart.legA).path.start, b = piece.edge(dart.legB).path.end;
      const fold = new Path([new Line(dart.apex, a.lerp(b, 0.5))]);
      parts.push(`<path data-dart-id="${xml(dart.id)}" class="construction" d="${pathToSvgData(translatePath(fold, x, y))}"><title>ダーツ中心線</title></path>`);
      if (dart.sewingTip) {
        const sewn = new Path([new Line(a, dart.sewingTip), new Line(dart.sewingTip, b)]);
        parts.push(`<path data-dart-sewing-id="${xml(dart.id)}" fill="none" stroke="#3267b0" stroke-width="0.45" stroke-dasharray="2 1" d="${pathToSvgData(translatePath(sewn, x, y))}"><title>ダーツ縫い線（展開中心とは別）</title></path>`);
      }
    }
    // Non-rendering edge paths preserve stable semantic ids alongside the closed outline.
    parts.push(`<g fill="none" stroke="none" id="edges-${xml(piece.id)}">`);
    for (const edge of piece.edges) {
      parts.push(`<path id="${xml(piece.id)}-${xml(edge.id)}" data-role="${xml(edge.role)}"${edge.entityId ? ` data-entity-id="${xml(edge.entityId)}"` : ''} d="${pathToSvgData(translatePath(edge.path, x, y))}"><title>${xml(edge.name ?? edge.id)}</title></path>`);
    }
    parts.push('</g>');
    for (const line of piece.attachmentLines ?? []) {
      const purpose = line.role ?? 'attachment';
      const style = { attachment: ['#8b52b0', '3 2', '縫付線'], 'cut-guide': ['#bc542e', '6 2', '裁断ガイド（穴ではありません）'],
        fold: ['#3267b0', '6 2 1 2', '折り線'], construction: ['#849a9e', '2 2', '参考線'],
        opening: ['#bc542e', '3 2', `内部開口・縫い代${line.allowanceMm ?? 0}mm`], region: ['#8b52b0','4 2','取付領域'],
        interfacing: ['#287a74','2 1','芯の範囲'], buttonhole: ['#bc542e','',`ボタン穴 ${n(line.path.length())}×${n(line.widthMm ?? 0)}mm`] }[purpose] ?? ['#8b52b0', '3 2', purpose];
      if (purpose === 'opening') {
        parts.push(`<path fill="none" stroke="#bc542e" stroke-width="0.65" data-purpose="opening" d="${pathToSvgData(translatePath(openingCutPath(line), x, y))}"><title>${xml(line.name)} — ${xml(style[2])}</title></path>`);
        continue;
      }
      parts.push(`<path fill="none" stroke="${style[0]}" stroke-width="0.65" stroke-dasharray="${style[1]}" data-purpose="${xml(purpose)}" data-closed="${line.path.closed}" data-entity-id="${xml(line.entityId ?? line.id)}" d="${pathToSvgData(translatePath(purpose === 'buttonhole' ? buttonholeOutline(line) : line.path, x, y))}"><title>${xml(line.name)} — ${xml(style[2])}${line.instanceId ? `・個体 ${xml(line.instanceId)}` : ''}${line.face ? `・${line.face === 'front' ? '表' : '裏'}` : ''}</title></path>`);
    }
    if (highlighted) parts.push(renderSewingHighlight(pattern, highlighted, piece, x, y));
    if (showConstruction) {
      parts.push(`<g class="construction" id="guides-${xml(piece.id)}">`);
      for (const guide of piece.guides) parts.push(`<path d="${pathToSvgData(translatePath(guide.path, x, y))}"><title>${xml(guide.name)}</title></path>`);
      parts.push('</g>');
    }
    const grain = translatePath(piece.grainline, x, y);
    parts.push(`<path class="grain" d="${pathToSvgData(grain)}" marker-start="url(#grain-arrow)" marker-end="url(#grain-arrow)"/>`,
      text(grain.start.x + 7, (grain.start.y + grain.end.y) / 2, '地の目'));
    for (const notch of piece.notches) {
      const normal = new Vector(-notch.tangent.y, notch.tangent.x);
      for (let i = 0; i < notch.count; i++) {
        const center = notch.point.translate(notch.tangent.scale((i - (notch.count - 1) / 2) * 4)).translate(new Vector(x, y));
        const mark = new Path([new Line(center.translate(normal.scale(-3)), center.translate(normal.scale(3)))]);
        parts.push(`<path class="notch" data-notch-id="${xml(notch.id)}" d="${pathToSvgData(mark)}"/>`);
      }
    }
    parts.push('</g>');
  }
  const rulerY = bottom + 25;
  parts.push('<g id="calibration" class="outline">', svgLine(20, rulerY, 120, rulerY));
  for (let i = 0; i <= 10; i++) parts.push(svgLine(20 + i * 10, rulerY - (i % 5 === 0 ? 4 : 2), 20 + i * 10, rulerY + 2));
  parts.push('</g>', text(20, rulerY + 12, '100 mm — 印刷倍率100%で実測確認'),
    text(20, rulerY + 25, `${pattern.method.id} v${pattern.method.version} ／ ${pattern.method.curvePolicy}`, 'class="muted"'), '</svg>');
  return parts.join('\n') + '\n';
}
