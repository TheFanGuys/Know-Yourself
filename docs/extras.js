'use strict';
// v3 additions: results for the three new tests, comparison groups, then-vs-now, and the at-a-glance summary.
// Uses helpers defined in app.js (portrait, rawBar, insight, action, escapeHTML, record, db, save, lookup, assess, wing).

const NORM_GROUPS=[['all','All ages'],['u30','Under 30'],['30to49','30–49'],['50up','50+']];
function normGroup(){return NORM_GROUPS.some(g=>g[0]===db.normGroup)?db.normGroup:'all';}
function groupLabel(){return NORM_GROUPS.find(g=>g[0]===normGroup())[1].toLowerCase();}
function groupPicker(){return `<div class="normpicker" role="group" aria-label="Comparison group"><span>Compare with:</span>${NORM_GROUPS.map(([k,l])=>`<button class="filter ${normGroup()===k?'active':''}" data-norm="${k}" aria-pressed="${normGroup()===k}">${l}</button>`).join('')}</div>`;}
function normNote(testId,scale,score){const p=percentile(testId,normGroup(),scale,score);if(!p)return '';return `<b class="pct">Higher than about ${p.pct}% of the comparison group</b> (${p.n.toLocaleString()} people, ${groupLabel()}).`;}
function ordinalBand(p){return p>=85?'well above most people':p>=60?'somewhat above average':p>40?'about average':p>15?'somewhat below average':'well below most people';}
const NORM_SOURCE='Comparison numbers come from anonymous volunteers who took the same questionnaire on the Open-Source Psychometrics Project website (raw data published at openpsychometrics.org/_rawdata). They are mostly young, English-speaking internet users, not a national sample. Treat percentages as rough.';

// ---------- result builders for the new tests ----------
function extraResult(t,a,res){
 if(t.id==='bigfive120'){
  const d=res.domains;
  const hi=res.scores.map((s,i)=>[s,i]).filter(x=>x[0]>=16).sort((x,y)=>y[0]-x[0]).slice(0,4),lo=res.scores.map((s,i)=>[s,i]).filter(x=>x[0]<=8).sort((x,y)=>x[0]-y[0]).slice(0,4);
  const body=`<div class="resultsplit"><article class="characterpanel compact">${portrait(2)}<div><span class="label">IPIP-NEO-120 / 5 TRAITS · 30 FACETS</span><p class="joke">${t.joke}</p><p>Each trait is the sum of six facets. Two people with the same trait score can have a very different mix inside it, which is where this test earns its length.</p></div></article><article class="scorepanel"><h2>Your five traits</h2><p class="small">Each trait ranges from 24 to 120. Bars show position within that range, not rank among other people.</p>${d.map((v,i)=>rawBar(DOMAINS[i][0],v,24,120,DOMAINS[i][1],DOMAINS[i][2])).join('')}</article></div>
  <section class="facetsection"><div class="sectionlabel">THE 30 FACETS · TAP A TRAIT TO OPEN IT</div>${DOMAINS.map((dm,di)=>`<details class="facetgroup" ${di===0?'open':''}><summary><b>${dm[0]}</b><span>${d[di]} / 120</span></summary>${res.scores.slice(di*6,di*6+6).map((v,k)=>{const f=FACETS[di*6+k];return rawBar(f[0],v,4,20,f[1],f[2]);}).join('')}</details>`).join('')}</section>`;
  const facetList=x=>x.map(([s,i])=>`${FACETS[i][0]} (${s}/20)`).join(', ');
  const cards=insight('Strongest facets',hi.length?`These facets sit near the top of their range: ${facetList(hi)}. Strong facets are usually the ones other people notice first.`:'None of your facets sit near the top of the range (16+). Your profile is fairly moderate across the board.')
   +insight('Lowest facets',lo.length?`These sit near the bottom of their range: ${facetList(lo)}. Low is not bad; it is the other end of the same dial.`:'None of your facets sit near the bottom of the range (8 or less).')
   +insight('Mixed signals inside a trait',mixedNote(res),'Look at the trait where your facets disagree most. That tension often explains why a single trait label never quite fit.')
   +(res.scores[2]>=16?insight('About the low-mood facet','Your Depression (low mood) facet is high. That is a personality tendency, not a diagnosis, but if you have felt down most days for two weeks or more, talking with a doctor or counselor is worth it. In the U.S. you can call or text 988 any time.'):'');
  return {headline:'Thirty facets. One you.',lead:'The five big traits, broken into the smaller pieces that make them up.',body,cards,art:2};
 }
 if(t.id==='selfesteem'){
  const s=res.scores[0],p=percentile('selfesteem',normGroup(),0,s);
  const body=`<div class="resultsplit"><article class="clinicalsummary"><div class="label">ROSENBERG SELF-ESTEEM SCALE</div><div class="screenCount">${s}<span> / 30</span></div><h2>${p?'Higher than about '+p.pct+'% of people':'Your total score'}</h2><p>${p?`Compared with ${p.n.toLocaleString()} people (${groupLabel()}), your score is ${ordinalBand(p.pct)}.`:''}</p><p class="small">The scale's publisher says there is no official cut-off for "high" or "low" self-esteem.</p></article><article class="scorepanel"><h2>Your score, in context</h2>${groupPicker()}${rawBar('Self-esteem',s,0,30,'More self-critical','More self-accepting',normNote('selfesteem',0,s))}<p class="small">${NORM_SOURCE}</p></article></div>`;
  const low=p?p.pct<25:s<15;
  const cards=insight('What this measures','How you feel about yourself overall right now: worth, competence and self-acceptance. It moves with stress, health, work and relationships, so a retake in a few months can look different.')
   +insight(low?'Go easy on yourself':'Keep what works',low?'Your answers lean self-critical. That is common during hard stretches and it is not a verdict on who you are.':'Your answers lean self-accepting. That steadiness is worth protecting when life gets busy.',low?'Write down three things you handled well this week, however small. Read them back before bed for a week.':'Notice what supports this: work you are proud of, people who know you, rest. Guard those on hard weeks.')
   +(low?insight('If it feels heavier than this','If you have been feeling worthless or hopeless most days, talk with someone you trust or a doctor or counselor. In the U.S. you can call or text 988 any time to reach the Suicide & Crisis Lifeline.'):insight('One honest check','High self-esteem and being open to feedback can go together. Ask one person you trust what you could do better, and just listen.'));
  return {headline:low?'Be as fair to yourself as you are to others.':'A solid footing.',lead:'Ten statements, one overall score, and how it compares with other people.',body,cards,art:8};
 }
 if(t.id==='interests'){
  const sc=res.scores,top=res.order.slice(0,3);
  const body=`<div class="resultsplit"><article class="characterpanel compact">${portrait(7)}<div><span class="label">YOUR INTEREST CODE</span><h2 class="bigcode">${res.code}</h2><p>${top.map(i=>`<b>${RIASEC[i][1]}</b> (${RIASEC[i][2]})`).join(' · ')}</p>${res.tied?'<p class="resultnotice">Some of your top scores are tied, so the order of those letters is a coin flip. Read both areas.</p>':''}</div></article><article class="scorepanel"><h2>Your six interest areas</h2><p class="small">Each area ranges from 0 to 40 (ten activities, 0–4 each).</p>${res.order.map(i=>rawBar(RIASEC[i][0]+' · '+RIASEC[i][1],sc[i],0,40,'Not for me','Sounds great')).join('')}</article></div>`;
  const cards=top.map((i,k)=>insight(`${k+1}. ${RIASEC[i][1]} — ${RIASEC[i][2]}`,RIASEC[i][3],'Work that often fits: '+RIASEC[i][4]+'.')).join('')
   +insight('Explore real careers',`The U.S. Department of Labor's My Next Move site lists careers for each interest area, with pay, outlook and training. Pick your top area, ${RIASEC[top[0]][1]}, to start.`,`<a href="https://www.mynextmove.org/explore/ip" target="_blank" rel="noopener">Open My Next Move ↗</a>`)
   +insight('Interests are not skills','This shows what you would enjoy, not what you are good at or trained for. The best fits usually combine an interest you have with skills you already use.');
  return {headline:`Your interest code: ${res.code}.`,lead:'What kinds of work sound good to you, from the O*NET Interest Profiler.',body,cards,art:7};
 }
 return null;
}
function mixedNote(res){let best=null;for(let d=0;d<5;d++){const f=res.scores.slice(d*6,d*6+6),hi=Math.max(...f),lo=Math.min(...f);if(!best||hi-lo>best.gap)best={d,gap:hi-lo,hi:f.indexOf(hi),lo:f.indexOf(lo)};}
 if(best.gap<6)return 'Your facets are fairly consistent within each trait, so the five trait scores describe you well.';
 return `Inside ${DOMAINS[best.d][0]}, your ${FACETS[best.d*6+best.hi][0]} facet is much higher than your ${FACETS[best.d*6+best.lo][0]} facet (a ${best.gap}-point gap). The trait average hides that difference.`;}

// ---------- shared summaries (change panel + at-a-glance page) ----------
function scaleSummary(t,res){
 const row=(name,v,min,max)=>({name,v,min,max});
 if(t.id==='enneagram')return res.scores.map((s,i)=>row(`Type ${i+1} · ${TYPES[i].name.replace('The ','')}`,s,4,20));
 if(t.id==='jung')return [['I ↔ E'],['S ↔ N'],['F ↔ T'],['J ↔ P']].map((n,i)=>row(n[0],res.scores[i],8,40));
 if(t.id==='adhd')return [row('Answers in shaded boxes',res.scores[0],0,6)];
 if(ADVICE[t.id])return ADVICE[t.id].map((d,i)=>row(d[0],res.scores[i],10,50));
 if(t.id==='bigfive120')return res.domains.map((v,i)=>row(DOMAINS[i][0],v,24,120));
 if(t.id==='selfesteem')return [row('Self-esteem',res.scores[0],0,30)];
 if(t.id==='interests')return res.scores.map((v,i)=>row(RIASEC[i][1],v,0,40));
 return [];
}
function oneLine(t,res){
 if(t.id==='enneagram'){const max=Math.max(...res.scores),top=res.scores.flatMap((v,i)=>v===max?[i]:[]),w=wing(res.scores);return top.length>1?'Tied: '+top.map(i=>'Type '+(i+1)).join(', '):`Type ${top[0]+1}${w.wing!==null?'w'+(w.wing+1):''} · ${TYPES[top[0]].name}`;}
 if(t.id==='jung')return 'Four letters: '+res.code;
 if(t.id==='adhd')return `${res.scores[0]} of 6 shaded · ${res.positive?'positive screen':'below threshold'}`;
 if(t.id==='selfesteem'){const p=percentile('selfesteem',normGroup(),0,res.scores[0]);return `${res.scores[0]}/30${p?' · higher than ~'+p.pct+'% ('+groupLabel()+')':''}`;}
 if(t.id==='interests')return `Interest code ${res.code} · ${res.order.slice(0,3).map(i=>RIASEC[i][1]).join(', ')}`;
 if(t.id==='bigfive120'){const f=res.scores.map((s,i)=>[s,i]).sort((a,b)=>b[0]-a[0]);return 'Top facets: '+f.slice(0,3).map(x=>FACETS[x[1]][0]).join(', ');}
 if(ADVICE[t.id]){const rows=scaleSummary(t,res),hi=rows.reduce((a,b)=>b.v>a.v?b:a);return 'Highest: '+hi.name+' '+hi.v+'/50';}
 return '';
}
function miniBars(rows){return `<div class="minibars">${rows.map(r=>`<div><span>${escapeHTML(r.name)}</span><i><b style="width:${(r.v-r.min)/(r.max-r.min)*100}%"></b></i><em>${r.v}</em></div>`).join('')}</div>`;}
function previousResult(t){const r=record(t);return db.history.find(h=>h.id===t.id&&(!r.completed||h.date<r.completed))||null;}
function changePanel(t,res){
 const prev=previousResult(t);if(!prev)return '';
 let before;try{before=assess(t,prev.answers);}catch{return '';}
 const now=scaleSummary(t,res),then=scaleSummary(t,before);
 const rows=now.map((r,i)=>{const d=r.v-then[i].v,big=Math.abs(d)>=(r.max-r.min)*0.1;return `<div class="changerow ${big?'big':''}"><span>${escapeHTML(r.name)}</span><span class="was">${then[i].v}</span><span class="arrow">${d>0?'▲':d<0?'▼':'='}</span><b>${r.v}</b><span class="delta">${d>0?'+':''}${d}</span></div>`;}).join('');
 const moved=now.filter((r,i)=>Math.abs(r.v-then[i].v)>=(r.max-r.min)*0.1).length;
 return `<section class="changepanel"><div class="sectionlabel">THEN VS. NOW</div><h2>Since ${new Date(prev.date).toLocaleDateString()}</h2><p class="small">${moved?moved+' score'+(moved>1?'s':'')+' moved by 10% of the range or more (highlighted). Small moves are normal from one day to the next.':'Nothing moved by 10% of the range or more. Small changes are normal from one day to the next.'}</p><div class="changehead"><span></span><span>Before</span><span></span><span>Now</span><span>Change</span></div>${rows}</section>`;
}

// ---------- at-a-glance summary page ----------
function summaryPage(){
 const done=CATALOG.filter(t=>record(t).completed);
 main.innerHTML=`<section class="notes summary"><a href="#notes">← My results</a><span class="eyebrow">ALL MY RESULTS</span><h1>Everything<br><em>at a glance.</em></h1><p class="pageintro">Each test answers a different question, so nothing is added up into one score. Write down what fits and what doesn't; your notes save on this device and go into your backup file.</p>${done.length?groupPicker():''}${done.length?`<div class="summarygrid">${done.map(t=>{const res=assess(t,record(t).answers);return `<article class="summarycard"><div class="summaryhead"><span class="label">${t.category} · ${new Date(record(t).completed).toLocaleDateString()}</span><h3>${t.title}</h3><p class="headline">${escapeHTML(oneLine(t,res))}</p></div>${t.id==='adhd'?'':miniBars(t.id==='bigfive120'?scaleSummary(t,res):scaleSummary(t,res).slice(0,t.id==='enneagram'?9:6))}${t.id==='bigfive'?`<p class="small">${scaleSummary(t,res).map((r,i)=>{const p=percentile('bigfive',normGroup(),i,r.v);return p?r.name+': ~'+p.pct+'%':''}).filter(Boolean).join(' · ')} (higher than, ${groupLabel()})</p>`:''}<label class="notelabel">My notes<textarea data-note="${t.id}" rows="3" placeholder="What fits? What doesn't?">${escapeHTML((db.notes||{})[t.id]||'')}</textarea></label><div class="inlineactions">${action('Open full report ↗','result','textbtn',`data-id="${t.id}"`)}</div></article>`;}).join('')}</div>`:'<div class="emptyboard"><h2>Nothing here yet.</h2><p>Finish a test and it will show up here.</p><a class="primary" href="#tests">Explore the tests →</a></div>'}${typeof gut!=='undefined'&&gut.completed?'<div class="gutfeature"><div><span class="label">GUT HEALTH</span><h3>Your gut discussion guide is ready.</h3></div><a class="primary" href="#gut-result">Open gut guide ↗</a></div>':''}${typeof wg!=='undefined'&&wg.completed?'<div class="gutfeature wgfeature"><div><span class="label">WOMEN’S GUT HEALTH</span><h3>Your women’s gut guide is ready.</h3></div><a class="primary" href="#wgut-result">Open guide ↗</a></div>':''}${done.length?`<div class="endnote">Want a copy? ${action('Download all reports ↧','export-all','textbtn')}</div>`:''}</section>`;
}
function allReportsText(){return CATALOG.filter(t=>record(t).completed).map(t=>reportText(t,record(t).answers,record(t).completed)+((db.notes||{})[t.id]?'\n\nMY NOTES\n'+db.notes[t.id]:'')).join('\n\n'+'='.repeat(60)+'\n\n');}

// ---------- text report lines ----------
function extraReport(t,res){
 if(t.id==='bigfive120')return ['TRAITS (24–120)',...res.domains.map((v,i)=>`${DOMAINS[i][0]}: ${v}/120`),'','FACETS (4–20)',...res.scores.map((v,i)=>`${DOMAINS[Math.floor(i/6)][0].split(' (')[0]} — ${FACETS[i][0]}: ${v}/20`)];
 if(t.id==='selfesteem'){const p=percentile('selfesteem',normGroup(),0,res.scores[0]);return [`Total: ${res.scores[0]}/30`,p?`Higher than about ${p.pct}% of ${p.n} volunteers (${groupLabel()}). ${NORM_SOURCE}`:'','No official cut-off for high or low self-esteem exists.'];}
 if(t.id==='interests')return ['Interest code: '+res.code+(res.tied?' (includes tied scores)':''),'AREAS (0–40)',...res.order.map(i=>`${RIASEC[i][1]} (${RIASEC[i][0]}): ${res.scores[i]}/40`),'','Explore careers: https://www.mynextmove.org/explore/ip'];
 return null;
}
function bigFivePctLines(res){return ['','COMPARISON ('+groupLabel()+')',...ADVICE.bigfive.map((d,i)=>{const p=percentile('bigfive',normGroup(),i,res.scores[i]);return p?`${d[0]}: higher than about ${p.pct}% of ${p.n} volunteers`:'';}),NORM_SOURCE];}

document.addEventListener('input',e=>{const id=e.target.dataset&&e.target.dataset.note;if(!id)return;db.notes=db.notes||{};const v=e.target.value.slice(0,4000);if(v)db.notes[id]=v;else delete db.notes[id];clearTimeout(window.__noteTimer);window.__noteTimer=setTimeout(save,400);});
