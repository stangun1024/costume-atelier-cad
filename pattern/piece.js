import { Path } from '../core/geometry.js';

export function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

/** Named edges are the source of truth for both outlines and sewing relations. */
export class PatternPiece {
  constructor({ id, name, edges, grainline, guides = [], attachmentLines = [], landmarks = {}, notches = [], cut, cuttingBoundary = null, darts = [], features = [], splitFrom = null, entityId = null, drafting = {} }) {
    if (typeof id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(id)) throw new TypeError('Invalid piece id');
    if (!Array.isArray(edges) || edges.length === 0) throw new TypeError('A piece needs edges');
    const ids = new Set();
    for (const edge of edges) {
      if (!edge.id || ids.has(edge.id) || !(edge.path instanceof Path) || edge.path.closed) {
        throw new TypeError('Edges must be unique named open Paths');
      }
      ids.add(edge.id);
    }
    this.id = id;
    this.entityId = entityId;
    this.name = name;
    this.edges = edges.map(edge => ({ ...edge }));
    this.boundary = new Path(edges.flatMap(edge => edge.path.segments), { closed: true });
    this.grainline = grainline;
    this.guides = guides;
    this.attachmentLines = attachmentLines;
    this.landmarks = landmarks;
    this.notches = notches;
    this.cut = cut;
    this.cuttingBoundary = cuttingBoundary;
    this.darts = darts.map(dart => ({ ...dart, pivot: dart.apex, sewingTip: dart.sewingTip ?? null }));
    this.features = features;
    this.splitFrom = splitFrom;
    this.drafting = drafting;
    deepFreeze(this);
  }

  edge(id) {
    const edge = this.edges.find(candidate => candidate.id === id);
    if (!edge) throw new RangeError(`Unknown edge ${this.id}.${id}`);
    return edge;
  }
}
