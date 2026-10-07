import { Point, Vector, Line, CubicBezier, Path } from '../../core/geometry.js';
import { Transform } from '../../core/transforms.js';
import { smoothThrough, locateAtY, locateAtLength, tangentAt, reversePath } from '../../core/path-tools.js';
import { intersectSegments } from '../../core/intersections.js';
import { PatternPiece, deepFreeze } from '../piece.js';
import { fitGrainline } from '../grainline.js';

const forbidden = new Set(['__proto__', 'constructor', 'prototype']);
const numeric = value => { if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError('有限の数値が必要です'); return value; };
const identifier = name => typeof name === 'string' && /^[A-Za-z][A-Za-z0-9_-]*$/.test(name) && !forbidden.has(name);
const access = (value, key) => {
  if (forbidden.has(String(key)) || value === null || value === undefined) throw new RangeError(`参照できない項目です: ${key}`);
  if (Array.isArray(value) && Number.isInteger(key)) key = key < 0 ? value.length + key : key;
  const getter = (value instanceof Path && ['start','end'].includes(key))
    || (value instanceof Vector && key === 'length')
    || ((value instanceof Line || value instanceof CubicBezier) && key === 'controlPoints');
  if (!Object.hasOwn(value, key) && !getter) throw new RangeError(`項目がありません: ${key}`);
  const result = value[key];
  if (typeof result === 'function') throw new TypeError('関数への参照はできません');
  return result;
};
const math = fn => (...args) => numeric(fn(...args.map(numeric)));
const path = (parts, closed = false) => new Path(parts.flatMap(part => part instanceof Path ? part.segments : [part]), {closed});

// These are geometry operations, not drafting-method dispatches. Formulae and
// sewing decisions live exclusively in the JSON recipes.
const operators = Object.freeze({
  add: math((a,b)=>a+b), subtract: math((a,b)=>a-b), multiply: math((a,b)=>a*b), divide: math((a,b)=>a/b),
  power: math((a,b)=>a**b), sqrt: math(Math.sqrt), sin: math(Math.sin), cos: math(Math.cos),
  atan: math(Math.atan), atan2: math(Math.atan2), asin: math(Math.asin), abs: math(Math.abs),
  min: math(Math.min), max: math(Math.max), floor: math(Math.floor), sign: math(Math.sign), hypot: math(Math.hypot),
  lt: (a,b)=>numeric(a)<numeric(b), lte: (a,b)=>numeric(a)<=numeric(b), gt:(a,b)=>numeric(a)>numeric(b),
  equal:(a,b)=>a===b, and:(...a)=>a.every(x=>x===true), or:(...a)=>a.some(x=>x===true),
  get: access, concat: (...lists)=>lists.flat(),
  merge:(...records)=>Object.assign({},...records),
  textJoin:(...parts)=>{if(parts.some(x=>typeof x!=='string'))throw new TypeError('文字列が必要です');return parts.join('');},
  boundary:edges=>new Path(edges.flatMap(e=>e.path.segments),{closed:true}),
  point:(x,y)=>new Point(x,y), vector:(x,y)=>new Vector(x,y),
  line:(a,b)=>new Path([new Line(a,b)]), cubic:(a,b,c,d)=>new CubicBezier(a,b,c,d), path,
  smooth:(points,directions)=>smoothThrough(points,directions),
  distance:(a,b)=>a.distanceTo(b), vectorTo:(a,b)=>a.vectorTo(b), normalize:v=>v.normalized(),
  scale:(v,k)=>v.scale(k), translate:(p,v)=>p.translate(v), lerp:(a,b,t)=>a.lerp(b,t),
  length:(p,tolerance=0.001)=>p.length(tolerance),
  atLength:(p,d)=>locateAtLength(p,d), atY:(p,y)=>locateAtY(p,y),
  tangent:(s,t)=>tangentAt(s,t), at:(s,t)=>s.pointAt(t), split:(s,t)=>s.split(t), reverse:reversePath,
  rotation:(angle,center)=>Transform.rotation(angle,center), inverse:t=>t.inverse(), apply:(t,x)=>t.apply(x),
  affine:(a,b,c,d,e,f)=>new Transform(a,b,c,d,e,f),
  rotatePoint:(q,c,a)=>new Point(c.x+(q.x-c.x)*Math.cos(a)-(q.y-c.y)*Math.sin(a),c.y+(q.x-c.x)*Math.sin(a)+(q.y-c.y)*Math.cos(a)),
  edge:(p,id)=>p.edge(id).path,
  fitGrain:fitGrainline, piece:definition=>new PatternPiece(definition),
  pinStart:(p,start)=>{
    const [first,...rest]=p.segments;
    if (first.start.distanceTo(start)>1e-6) throw new RangeError('丸め補正で移動できる端点の範囲を超えています');
    return new Path([first instanceof Line?new Line(start,first.end):new CubicBezier(start,first.control1,first.control2,first.end),...rest],{closed:p.closed});
  },
  rayHit:(p,apex,through)=>{
    const direction=apex.vectorTo(through).normalized();
    const reach=Math.max(...p.segments.flatMap(s=>s.controlPoints.map(q=>apex.distanceTo(q))))+1;
    const ray=new Line(apex,apex.translate(direction.scale(reach)));
    const hits=p.segments.flatMap((s,index)=>intersectSegments(s,ray,{tolerance:1e-7})
      .filter(h=>h.kind==='point').map(h=>({index,t:h.tA,point:s.pointAt(h.tA)})));
    const unique=hits.filter((h,i)=>hits.findIndex(other=>other.point.distanceTo(h.point)<1e-6)===i);
    if(unique.length!==1)throw new RangeError('曲線と作図半直線の交点を一意に決められません');
    return unique[0];
  },
  splitHit:(p,hit)=>{
    const s=p.segments[hit.index];
    const halves=s instanceof Line?[new Line(s.start,s.pointAt(hit.t)),new Line(s.pointAt(hit.t),s.end)]:s.split(hit.t);
    return [new Path([...p.segments.slice(0,hit.index),...(hit.t>1e-10?[halves[0]]:[])]),
      new Path([...(hit.t<1-1e-10?[halves[1]]:[]),...p.segments.slice(hit.index+1)])];
  },
});

export const draftingExpressionContract = deepFreeze({
  format:'aicad-drafting-recipe', version:1, unit:'mm', angleUnit:'radian',
  expressions:['$ref','$op/args','$call/args','$if/then/else','$solve'],
  operators:Object.keys(operators), limits:{depth:80,evaluations:150000,steps:1000,solverIterations:64},
  rules:['参照は既に定義された値だけ。テンプレート引数は名前で明示する。',
    '条件は遅延評価。数値解法は有限区間の二分法のみ。再帰・任意コード・外部アクセスなし。',
    '手順中のrequireは成立条件。失敗時は手順名を含むエラーを返し、採寸を補正しない。'],
});

function exact(value, allowed, required=allowed) {
  if (!value || typeof value!=='object' || Array.isArray(value)
    || Object.keys(value).some(k=>!allowed.includes(k)) || required.some(k=>!Object.hasOwn(value,k))) throw new TypeError(`レシピ項目が不正です: ${allowed.join(', ')}`);
}

/** Evaluate data only: there is no eval, Function constructor, import or I/O. */
export function evaluateDraftingRecipe(recipe, inputs, libraries = []) {
  exact(recipe,['format','version','method','templates','steps','result','description','validation'],['format','version','method','templates','steps','result']);
  if(recipe.format!=='aicad-drafting-recipe'||recipe.version!==1)throw new RangeError('未対応の作図レシピです');
  if(JSON.stringify(recipe).length>2000000)throw new RangeError('作図レシピは2MB以内です');
  const templates=Object.create(null);
  for(const source of [...libraries,recipe.templates])for(const [name,value] of Object.entries(source)){
    if(!identifier(name)||Object.hasOwn(templates,name))throw new TypeError(`テンプレート名が重複または不正です: ${name}`);
    templates[name]=value;
    if(Object.keys(templates).length>200)throw new RangeError('テンプレートは200件以内です');
  }
  const base=Object.freeze({...inputs,method:recipe.method});
  let budget=150000;
  const stack=[];
  function evaluate(value,env,depth=0){
    if(--budget<0||depth>80)throw new RangeError('作図レシピの計算上限を超えました');
    if(value===null||typeof value==='string'||typeof value==='boolean')return value;
    if(typeof value==='number')return numeric(value);
    if(Array.isArray(value))return value.map(x=>evaluate(x,env,depth+1));
    if(!value||typeof value!=='object')throw new TypeError('JSON値が必要です');
    const ev=x=>evaluate(x,env,depth+1);
    if(Object.hasOwn(value,'$ref')){
      exact(value,['$ref']);if(typeof value.$ref!=='string')throw new TypeError('参照名が必要です');
      return value.$ref.split('.').reduce((a,k)=>access(a,k),env);
    }
    if(Object.hasOwn(value,'$op')){
      exact(value,['$op','args']);
      if(!Object.hasOwn(operators,value.$op)||!Array.isArray(value.args))throw new TypeError(`未対応の共通操作: ${value.$op}`);
      const result=operators[value.$op](...value.args.map(ev));
      if(Array.isArray(result)&&result.length>4096)throw new RangeError('作図配列は4096件以内です');
      if(result instanceof Path&&result.segments.length>4096)throw new RangeError('曲線区間は4096件以内です');
      return result;
    }
    if(Object.hasOwn(value,'$if')){
      exact(value,['$if','then','else']);const condition=ev(value.$if);
      if(typeof condition!=='boolean')throw new TypeError('条件には真偽値が必要です');
      return ev(condition?value.then:value.else);
    }
    if(Object.hasOwn(value,'$call')){
      exact(value,['$call','args']);const name=value.$call;
      if(!Object.hasOwn(templates,name)||stack.includes(name))throw new RangeError(`未定義または再帰するテンプレート: ${name}`);
      const definition=templates[name];exact(definition,['parameters','steps','result']);
      if(!Array.isArray(definition.parameters)||definition.parameters.some(x=>!identifier(x))||new Set(definition.parameters).size!==definition.parameters.length)throw new TypeError('テンプレート引数が不正です');
      exact(value.args,definition.parameters);
      stack.push(name);
      try{return run(definition,{...base,...ev(value.args)},depth+1);}finally{stack.pop();}
    }
    if(Object.hasOwn(value,'$solve')){
      exact(value,['$solve']);const s=value.$solve;exact(s,['variable','lower','upper','target','value','iterations']);
      if(!identifier(s.variable)||!Number.isInteger(s.iterations)||s.iterations<1||s.iterations>64)throw new TypeError('二分法の変数または回数が不正です');
      let lo=numeric(ev(s.lower)),hi=numeric(ev(s.upper));const target=numeric(ev(s.target));
      if(lo>=hi)throw new RangeError('二分法の下限は上限より小さくしてください');
      const f=x=>numeric(evaluate(s.value,{...env,[s.variable]:x},depth+1));
      const low=f(lo),high=f(hi),increasing=high>low;
      if(low===high||target<Math.min(low,high)||target>Math.max(low,high))throw new RangeError('指定区間で目標値に到達できません');
      for(let i=0;i<s.iterations;i++){const mid=(lo+hi)/2;if((f(mid)<target)===increasing)lo=mid;else hi=mid;}
      return (lo+hi)/2;
    }
    if(Object.keys(value).some(k=>k.startsWith('$')||forbidden.has(k)))throw new TypeError('予約済みまたは未対応のJSON項目です');
    return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,ev(v)]));
  }
  function run(program, initial, depth=0){
    if(!Array.isArray(program.steps)||program.steps.length>1000)throw new TypeError('作図手順は1000件以内です');
    const env={...initial};
    for(const step of program.steps){
      exact(step,['id','value','require','message'],['id']);
      if(!identifier(step.id)||Object.hasOwn(env,step.id)||Object.hasOwn(step,'value')===Object.hasOwn(step,'require'))throw new TypeError(`手順IDまたは式が不正です: ${step.id}`);
      try{
        if(Object.hasOwn(step,'require')){
          if(evaluate(step.require,env,depth+1)!==true)throw new RangeError(step.message??'作図条件が成立しません');
          env[step.id]=true;
        }else env[step.id]=evaluate(step.value,env,depth+1);
      }catch(cause){throw Object.assign(new RangeError(`${recipe.method.id}/${[...stack,step.id].join('/')}: ${cause.message}`,{cause}),{recipeStep:step.id});}
    }
    return evaluate(program.result,env,depth+1);
  }
  return deepFreeze(run(recipe,base));
}
