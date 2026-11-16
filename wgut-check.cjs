// Checks the women's gut questionnaire rules. Run: node wgut-check.cjs
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={localStorage:{getItem:()=>null,setItem:()=>{}},document:{addEventListener:()=>{}},console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('docs/wgut-data.js','utf8')+'\n'+fs.readFileSync('docs/wgut.js','utf8')+'\nthis.Q=WG_QUESTIONS;this.S=WG_SOURCES;this.E=WG_EXPERTS;this.set=a=>{wg.answers=a};this.av=()=>wgAvenues().map(x=>x.id).join();this.urg=()=>wgUrgency();this.clean=wgClean;',ctx);
const Q=ctx.Q;
// structure
const keys=Q.map(q=>q[1]);assert.strictEqual(new Set(keys).size,keys.length,'duplicate keys');
for(const q of Q){assert(['single','multi'].includes(q[3]));const vals=q[4].map(o=>o[0]);assert.strictEqual(new Set(vals).size,vals.length,q[1]);}
for(const e of ctx.E)for(const s of e.sources)assert(ctx.S[s],'missing source '+s);
// baseline: every question answered with a neutral choice
const base=()=>Object.fromEntries(Q.map(q=>[q[1],q[3]==='multi'?[q[4].some(o=>o[0]==='none')?'none':q[4][0][0]]:q[4][q[4].length-1][0]]));
const run=(changes)=>{const a=Object.assign(base(),changes);ctx.set(a);return {ids:ctx.av().split(',').filter(Boolean),u:ctx.urg()};};
let r=run({age:'u40',stage:'regular',plants:'30up',fiberChange:'no',stress:'no',distension:'no',screening:'na',duration:'days'});
assert.strictEqual(r.u.emergency.length,0);assert.strictEqual(r.u.ovarian,false);assert.strictEqual(r.ids.length,0,'neutral answers should give no topics: '+r.ids);
// emergency
r=run({danger:['heavyBleed']});assert.deepStrictEqual([...r.u.emergency],['heavyBleed']);
// 52, postmenopause, new daily bloating → ovarian check (strong), menopause + bloating topics
r=run({age:'50up',stage:'post',newBloat:'yes',main:['bloat'],meno:['bloat'],plants:'30up',fiberChange:'no',stress:'no',distension:'yes',screening:'yes'});
assert(r.u.ovarian&&r.u.ovarianStrong);assert(r.ids.includes('meno')&&r.ids.includes('bloat'),r.ids);
// IBS-like symptoms starting after 50 without IBS diagnosis → ovarian prompt even without "new bloating"
r=run({age:'50up',stage:'post',newBloat:'old',main:['pain','constipation'],duration:'weeks',plants:'30up',stress:'no',distension:'no'});assert(r.u.ovarian&&!r.u.ovarianStrong);
// 30, cycle-linked loose stools + painful BMs and periods → cycle and endometriosis topics
r=run({age:'u40',stage:'regular',cycleLink:'clear',cycleWhich:['loose'],endo:['painPeriods','painBM'],plants:'30up',stress:'no',distension:'no'});
assert(r.ids.includes('cycle')&&r.ids.includes('endo'),r.ids);assert(!r.u.ovarian);
// no periods → no cycle topic even if cycle answer set
r=run({stage:'post',cycleLink:'clear',plants:'30up',stress:'no',distension:'no'});assert(!r.ids.includes('cycle'));
// pelvic floor signs → pelvic topic
r=run({pelvic:['strain','splint'],plants:'30up',stress:'no',distension:'no'});assert(r.ids.includes('pelvic'),r.ids);
// lots of new fiber + bloating → fiber topic, and no "add more plants" advice
r=run({fiberChange:'lot',main:['bloat'],plants:'u10',stress:'no',distension:'no'});assert(r.ids.includes('fiber')&&!r.ids.includes('plants'),r.ids);
// low variety without a fiber surge → plants topic
r=run({fiberChange:'no',plants:'u10',stress:'no',distension:'no'});assert(r.ids.includes('plants')&&!r.ids.includes('fiber'),r.ids);
// gluten cut without test → restriction topic citing celiac testing
r=run({restrict:['gluten'],plants:'30up',stress:'no',distension:'no'});assert(r.ids.includes('restrict'));
// gut-brain
r=run({stress:'clear',plants:'30up',distension:'no'});assert(r.ids.includes('gutbrain'));
r=run({stress:'no',beyond:['migraine','fatigue'],plants:'30up',distension:'no'});assert(r.ids.includes('gutbrain'));
// unusual vaginal bleeding flagged
r=run({concerning:['vagBleed']});assert(r.u.vagBleed&&r.u.concern.length===1);
// saved-data cleaning rejects bad values
const c=ctx.clean({answers:{age:'99',danger:['none','blood'],stage:'post'},index:500,completed:'x'});assert.strictEqual(c.answers.age,undefined);assert.strictEqual(c.answers.danger,undefined);assert.strictEqual(c.answers.stage,'post');assert.strictEqual(c.index,Q.length-1);assert.strictEqual(c.completed,null);
console.log(`PASS: ${Q.length} women's gut questions; emergency, ovarian (incl. new IBS-like after 50), vaginal bleeding, cycle, endometriosis, menopause, pelvic floor, fiber vs. plant variety, restriction, gut–brain rules; saved-data cleaning.`);
