import { intersectPaths } from '../core/intersections.js';
import { flattenPath } from '../core/path-tools.js';
import { inside } from './validation.js';
import { panelGrain } from './operations-split.js';

/** An annotation must fit entirely, including narrow dart mouths between samples. */
export function grainlineFits(boundary, grainline) {
  return grainline.segments.length === 1 && grainline.length() >= 1
    && inside(grainline.start, flattenPath(boundary, 0.01))
    && intersectPaths(grainline, boundary, { tolerance: 0.0001 }).length === 0;
}

/** Relocate only the annotation; never alter pattern geometry or grain direction. */
export function fitGrainline(boundary, grainline) {
  if (grainlineFits(boundary, grainline)) return grainline;
  const placed = panelGrain(boundary, grainline);
  if (!grainlineFits(boundary, placed)) throw new RangeError('地の目線を型紙内部に配置できません。ダーツの位置・深さを調整してください');
  return placed;
}
