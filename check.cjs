const vm=require('vm'),fs=require('fs'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('docs/catalog.js','utf8')+'\n'+fs.readFileSync('docs/engine.js','utf8')+'\nthis.tests=CATALOG;this.score=assess;this.valid=validAnswers;this.wing=wing;',ctx);
const get=id=>ctx.tests.find(t=>t.id===id),score=(id,a)=>JSON.parse(JSON.stringify(ctx.score(get(id),a)));
assert.deepEqual(ctx.tests.map(t=>t.items.length).join(','),'36,32,6,50,20,10');
assert.deepEqual(score('enneagram',Array(36).fill(3)).scores,Array(9).fill(12));
for(let i=0;i<9;i++){let a=Array(36).fill(1);[i,i+9,i+18,i+27].forEach(k=>a[k]=5);const r=score('enneagram',a);assert.equal(r.scores[i],20);assert.equal(r.scores.indexOf(Math.max(...r.scores)),i);}
const wing=scores=>JSON.parse(JSON.stringify(ctx.wing(scores)));
assert.equal(wing([5,5,5,20,17,5,5,5,5]).wing,4); // Type 4w5
assert.equal(wing([18,5,5,5,5,5,5,5,17]).wing,8); // 1w9 wraparound
assert.equal(wing([5,5,17,20,17,5,5,5,5]).wing,null);
assert.equal(wing([5,5,5,20,20,5,5,5,5]).wing,null);
const baseline=score('jung',Array(32).fill(3));assert.deepEqual(baseline.scores,[24,24,24,24]);assert.equal(baseline.code,'ISFJ');
const intj=Array(32).fill(3);intj[3]=5;intj[1]=1;assert.equal(score('jung',intj).code,'INTJ');
assert.equal(score('jung',Array(32).fill(1)).code,'ESTJ');
assert.equal(score('jung',Array(32).fill(5)).code,'INFP');
// ADHD original first-three / last-three shading and exactly-four boundary.
assert.equal(score('adhd',[2,2,2,2,2,2]).scores[0],3);
assert.equal(score('adhd',[2,2,2,3,0,0]).positive,true);
assert.equal(score('adhd',[1,1,1,2,2,2]).scores[0],0);
assert.equal(score('adhd',[0,0,0,3,3,3]).positive,false);
assert.equal(score('adhd',[4,4,4,4,4,4]).scores[0],6);
assert.deepEqual(score('bigfive',Array(50).fill(5)).scores,[30,34,34,18,38]);
assert.deepEqual(score('bigfive',Array(50).fill(3)).scores,[30,30,30,30,30]);
for(const id of ['bigfive','emotions','empathy']){
 const t=get(id),positive=t.items.map(q=>q.reverse?1:5),negative=t.items.map(q=>q.reverse?5:1);
 assert.ok(score(id,positive).scores.every(s=>s===50));assert.ok(score(id,negative).scores.every(s=>s===10));
 assert.throws(()=>score(id,Array(t.items.length).fill(null)));
 assert.equal(ctx.valid(t,Array(t.items.length).fill(null)),true);
 assert.equal(ctx.valid(t,Array(t.items.length).fill(9)),false);
}
assert.equal(get('emotions').items.filter(i=>i.scale===0).length,10);assert.equal(get('emotions').items.filter(i=>i.scale===1).length,10);
assert.equal(get('empathy').items.filter(i=>i.reverse).length,5);
console.log('PASS: six instruments; all nine Enneagram keys; wings and OEJTS equations; ADHD item thresholds and 3/4 boundary; all IPIP reverse keys; incomplete/invalid responses.');
