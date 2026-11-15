// Checks scoring for the v3 tests and the comparison tables. Run: node extras-check.cjs
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={};vm.createContext(ctx);
vm.runInContext(['catalog.js','norms.js','extras-data.js','engine.js'].map(f=>fs.readFileSync('docs/'+f,'utf8')).join('\n')+'\nthis.C=CATALOG;this.assess=assess;this.percentile=percentile;this.N=NORMS;this.F=FACETS;',ctx);
const T=id=>ctx.C.find(t=>t.id===id),fill=(t,v)=>t.items.map(()=>v);

// Big Five 120
const b=T('bigfive120');
assert.strictEqual(b.items.length,120);
for(let s=0;s<30;s++)assert.strictEqual(b.items.filter(i=>i.scale===s).length,4,'facet '+s+' needs 4 items');
assert.strictEqual(b.items.filter(i=>i.reverse).length,55);
let r=ctx.assess(b,fill(b,3));assert.strictEqual([...r.domains].join(),"72,72,72,72,72");
let a=fill(b,3);a[0]=5;r=ctx.assess(b,a);assert.strictEqual(r.scores[0],14);assert.strictEqual(r.domains[0],74);
const minus=b.items.findIndex(i=>i.reverse);a=fill(b,3);a[minus]=5;r=ctx.assess(b,a);assert.strictEqual(r.scores[b.items[minus].scale],10);
assert.strictEqual(ctx.F.length,30);

// Rosenberg: SA=3..SD=0, items 2,5,6,8,9 reversed
const s=T('selfesteem');
assert.strictEqual(s.items.map((i,k)=>i.reverse?k+1:0).filter(Boolean).join(),"2,5,6,8,9");
assert.strictEqual(ctx.assess(s,fill(s,3)).scores[0],15);
assert.strictEqual(ctx.assess(s,fill(s,0)).scores[0],15);
assert.strictEqual(ctx.assess(s,s.items.map(i=>i.reverse?0:3)).scores[0],30);
assert.strictEqual(ctx.assess(s,s.items.map(i=>i.reverse?3:0)).scores[0],0);

// O*NET Interest Profiler Short Form: 10 per area, 0-4 each
const ip=T('interests');
assert.strictEqual(ip.items.length,60);
for(let k=0;k<6;k++)assert.strictEqual(ip.items.filter(i=>i.scale===k).length,10);
r=ctx.assess(ip,ip.items.map(i=>i.scale===0?4:0));assert.strictEqual(r.scores[0],40);assert.strictEqual(r.code,'RIA');assert.strictEqual(r.tied,true);
r=ctx.assess(ip,ip.items.map(i=>[1,2,4,3,0,0][i.scale]));assert.strictEqual(r.code,'ASI');assert.strictEqual(r.tied,false);

// Comparison tables: percentiles rise with score, stay within 0-100
for(const [id,scales,min,max] of [['bigfive',5,10,50],['selfesteem',1,0,30]])for(const g of ['all','u30','30to49','50up'])for(let k=0;k<scales;k++){let last=-1;for(let v=min;v<=max;v++){const p=ctx.percentile(id,g,k,v).pct;assert(p>=last&&p>=0&&p<=100,`${id} ${g} ${k} ${v}`);last=p;}}
assert(ctx.N.bigfive['50up'].n>1000&&ctx.N.selfesteem['50up'].n>1000);
console.log('PASS: Big Five 120 facets/keys, Rosenberg reverse items and 0–30 total, O*NET 60 items and code/ties, comparison tables.');
