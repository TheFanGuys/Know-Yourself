const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const ctx={localStorage:{getItem:()=>null},document:{addEventListener:()=>{}},main:{},location:{},download:()=>{},Blob,console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('docs/gut-data.js','utf8')+'\n'+fs.readFileSync('docs/gut.js','utf8')+'\nthis.q=GUT_QUESTIONS;this.g=gut;this.av=gutAvenues;this.urg=gutUrgency;',ctx);
assert.equal(ctx.q.length,33);assert.equal(new Set(ctx.q.map(q=>q[1])).size,33);
for(const q of ctx.q){assert.ok(q[4].length>=3);assert.equal(new Set(q[4].map(x=>x[0])).size,q[4].length);ctx.g.answers[q[1]]=q[3]==='multi'?['none']:({meaning:'unclear',earlyFull:'rarely',lateFull:'none',postNausea:'rarely',vomitTiming:'never',solidsLiquids:'no',visibleFood:'none',duration:'days',course:'gradual',site:'none',stool:'normal',frequency:'daily',painStool:'noPain',meal:'random',dairy:'no',wheat:'no',fat:'no',reflux:'no',hPylori:'negative',celiac:'negative',antibiotics:'no',nsaid:'never',travel:'no',screening:'yes',impact:'mild'})[q[1]]||q[4][0][0];}
assert.equal(ctx.av().length,0);assert.equal(ctx.urg().emergency.length,0);
ctx.g.answers.danger=['blackStool'];assert.equal(ctx.urg().emergency[0],'blackStool');ctx.g.answers.danger=['none'];
ctx.g.answers.main=['upper'];ctx.g.answers.hPylori='treatedNoCure';assert.ok(ctx.av().some(x=>x.id==='upper'&&x.check.includes('test of cure')));
ctx.g.answers.main=['lower','diarrhea'];ctx.g.answers.painStool='relief';ctx.g.answers.duration='months';ctx.g.answers.stool='loose';assert.ok(ctx.av().some(x=>x.id==='ibs'));
ctx.g.answers.antibiotics='yes';assert.ok(ctx.av().some(x=>x.id==='cdiff'));
ctx.g.answers.wheat='yes';assert.ok(ctx.av().some(x=>x.id==='celiac'));
ctx.g.answers.meaning='sits';ctx.g.answers.earlyFull='often';ctx.g.answers.lateFull='hours';assert.ok(ctx.av().some(x=>x.id==='emptying'&&x.check.includes('gastric-emptying')));
ctx.g.answers.visibleFood='greasy';assert.ok(ctx.av().some(x=>x.id==='epi'));
ctx.g.answers.visibleFood='fiber';assert.ok(ctx.av().some(x=>x.id==='visible'));
console.log('PASS: 33 distinct questions, baseline/urgent triage and pattern pathways.');
