'use strict';
// Women's gut health questionnaire: storage, screens and rules. Reuses the gut page styles.
const WG_KEY='know-yourself:wgut:v1';
let wg={answers:{},index:0,completed:null},wgSaveOK=true;
function wgClean(x){const out={answers:{},index:0,completed:null};if(!x||typeof x.answers!=='object')return out;for(const q of WG_QUESTIONS){const v=x.answers[q[1]],ok=q[4].map(o=>o[0]);if(q[3]==='single'&&ok.includes(v))out.answers[q[1]]=v;if(q[3]==='multi'&&Array.isArray(v)&&v.length&&v.every(a=>ok.includes(a))&&!(v.includes('none')&&v.length>1))out.answers[q[1]]=[...new Set(v)];}out.index=Math.max(0,Math.min(WG_QUESTIONS.length-1,Number.isInteger(x.index)?x.index:0));if(typeof x.completed==='string'&&WG_QUESTIONS.every(q=>out.answers[q[1]]))out.completed=x.completed;return out;}
try{wg=wgClean(JSON.parse(localStorage.getItem(WG_KEY)||'null'));}catch{wgSaveOK=false;}
function wgSave(){try{localStorage.setItem(WG_KEY,JSON.stringify(wg));wgSaveOK=true;}catch{wgSaveOK=false;}}
const wHas=(k,v)=>{const a=wg.answers[k];return Array.isArray(a)?a.includes(v):a===v};
const wAny=(k,vals)=>vals.some(v=>wHas(k,v));
const wCount=(k)=>{const a=wg.answers[k];return Array.isArray(a)?a.filter(x=>x!=='none').length:0};
const wgSource=k=>{const [name,url]=WG_SOURCES[k];return `<a href="${url}" target="_blank" rel="noopener">${name} ↗</a>`};
const WG_SHORT={chang:'Lin Chang',rossi:'Megan Rossi',ryan:'The Gut Experts (Ryan & McGowan)',moshiree:'Baha Moshiree',omahony:'Siobhain O’Mahony',guide:'Clinical guidelines'};

function wgIntro(){main.innerHTML=`<section class="gutpage"><a href="#tests">← The test bench</a><div class="guthero"><span class="eyebrow">WOMEN’S GUT HEALTH / GUIDED QUESTIONNAIRE</span><h1>Hormones, stress and the gut.<br><em>Connect the dots.</em></h1><p>${WG_QUESTIONS.length} questions on bloating, bowel habits, your cycle or menopause, the pelvic floor, food habits and the gut–brain link. You get a personal discussion guide that shows which researcher’s work informs each suggestion.</p><div class="gutstat"><b>${WG_QUESTIONS.length} questions</b><b>About 10–12 minutes</b><b>Saved on this device</b></div><div class="methodnote"><b>Scope:</b> An adult educational guide, not a diagnosis. It is built from the published work of Lin Chang, Megan Rossi, Barbara Ryan & Elaine McGowan, Baha Moshiree and Siobhain O’Mahony, plus CDC, NICE, NIDDK and gastroenterology society guidance. None of these experts wrote or endorsed it. If severe symptoms are happening now, get care instead of finishing a questionnaire.</div><div class="inlineactions"><button class="primary" data-wg="start">${Object.keys(wg.answers).length?'Continue questionnaire →':'Start questionnaire →'}</button><button class="secondary" data-wg="experts">Meet the experts behind it</button>${wg.completed?'<button class="secondary" data-wg="report">Open saved guide</button>':''}</div></div></section>`;}

function wgQuestion(){const q=WG_QUESTIONS[wg.index],v=wg.answers[q[1]],done=WG_QUESTIONS.filter(x=>wg.answers[x[1]]).length;main.innerHTML=`<section class="gutpage"><div class="testhead"><a href="#wgut">← About this questionnaire</a><span>${wgSaveOK?'✓ Saved on this device':'In this tab only'}</span></div><span class="label">${q[0].toUpperCase()} · QUESTION ${wg.index+1} OF ${WG_QUESTIONS.length}</span><div class="progress" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${WG_QUESTIONS.length}"><i style="width:${100*done/WG_QUESTIONS.length}%"></i></div><article class="gutquestion"><h1>${q[2]}</h1><p>${q[3]==='multi'?'Select all that apply. “None” clears the others.':'Choose the best answer.'}</p>${q[5]?`<p class="small">${q[5]}</p>`:''}<div class="gutchoices" role="group" aria-label="Answer choices">${q[4].map(([key,label])=>{const on=q[3]==='multi'?(v||[]).includes(key):v===key;return `<button class="gutchoice ${on?'picked':''}" data-wg="answer" data-value="${key}" aria-pressed="${on}">${label}</button>`;}).join('')}</div>${wg.index<2?'<p class="gutalert">If an emergency warning sign is present, get urgent medical help now. In the U.S., call 911. You can stop here.</p>':''}<div class="questionnav"><button class="secondary" data-wg="back" ${wg.index===0?'disabled':''}>← Back</button><button class="primary" data-wg="next" ${!v?'disabled':''}>${wg.index===WG_QUESTIONS.length-1?'See my guide →':'Next →'}</button></div><details class="review"><summary>Review answered questions (${done}/${WG_QUESTIONS.length})</summary><div class="reviewgrid">${WG_QUESTIONS.map((x,i)=>`<button class="${wg.answers[x[1]]?'filled':''} ${wg.index===i?'current':''}" data-wg="jump" data-index="${i}" aria-label="Question ${i+1}, ${wg.answers[x[1]]?'answered':'unanswered'}">${i+1}</button>`).join('')}</div></details></article></section>`;}

function wgUrgency(){
 const list=k=>Array.isArray(wg.answers[k])?wg.answers[k].filter(x=>x!=='none'):[];
 const emergency=list('danger'),concern=list('concerning');
 const ovarianDaily=wCount('ovarianSx')>0,newFrequent=wHas('newBloat','yes');
 const ibsLikeNow=wAny('main',['bloat','pain','constipation','diarrhea','alternating'])&&wAny('duration',['weeks','months']);
 const ovarian=(newFrequent||ovarianDaily)||(wHas('age','50up')&&ibsLikeNow&&!wHas('history','ibs'));
 return {emergency,concern,ovarian,ovarianStrong:wHas('age','50up')&&(newFrequent||ovarianDaily),vagBleed:concern.includes('vagBleed'),screen:wAny('screening',['no','unsure'])};
}

function wgAvenues(){const a=[];const push=(id,title,experts,fit,check,care,habits,sources)=>a.push({id,title,experts,fit,check,care,habits,sources});
 const isPeriod=wAny('stage',['regular','peri']);
 // 1. Cycle-linked symptoms
 if(isPeriod&&(wAny('cycleLink',['clear','some'])||wCount('cycleWhich')>0))
  push('cycle','Gut symptoms that follow your cycle',['chang','rossi'],
   'You noticed gut changes around your period. That is common: when estrogen and progesterone drop just before a period, many women, especially those with IBS, get more pain, bloating and looser stools. Chemicals released during a period (prostaglandins) also speed up the gut, which explains the “period poop” effect.',
   'Track two full cycles: day of cycle, stool type, bloating and pain. Bring the log to a doctor. If symptoms are severe or only happen with your period, ask whether endometriosis or another gynecological cause should be checked.',
   'A doctor may suggest timing pain relief or anti-diarrhea medicine to the days you know are bad, or discuss hormonal options that smooth out the cycle. IBS treatments still apply if IBS is confirmed.',
   'In the days before your period, keep meals regular and avoid stacking big trigger foods. Rossi’s team points to colorful fruit and vegetables, regular fruit, and gut–brain tools such as mindfulness for PMS symptoms.',
   ['changScore','rossiPms','mensesMeta']);
 // 2. Endometriosis
 const endoCount=wCount('endo');
 if(wHas('history','endo')||wHas('endo','painBM')&&wAny('cycleLink',['clear','some'])||endoCount>=2)
  push('endo',wHas('history','endo')?'Endometriosis and the gut':'Ask about endometriosis',['omahony','guide'],
   wHas('history','endo')?'Endometriosis can involve the bowel and often overlaps with IBS, so both may need attention.':'You marked several signs that overlap with endometriosis, such as painful periods, painful bowel movements during your period or pain with sex. Endometriosis is often mistaken for IBS for years.',
   'Ask a gynecologist, ideally one experienced with endometriosis, about a pelvic exam and imaging (specialist ultrasound or MRI). Mention every symptom together, since gut, bladder and period pain are often seen by different doctors who don’t connect them.',
   'Treatment can include hormonal medicine, pain management and sometimes surgery. Gut symptoms may still need their own plan.',
   'A symptom diary that lines up your cycle with bowel symptoms is the most useful thing to bring.',
   ['endo','endoMiss']);
 // 3. Perimenopause / menopause
 if(wAny('stage',['peri','post'])&&(wCount('meno')>0||wAny('main',['bloat','constipation','reflux'])))
  push('meno','Perimenopause, menopause and your gut',['chang','rossi','ryan'],
   'Falling progesterone and estrogen can slow the gut, which can mean more bloating, constipation and reflux. Research from Chang’s group found postmenopausal women with IBS report more severe symptoms than younger women.',
   'Do not assume every new symptom is “just menopause.” New bloating or a new bowel pattern after 50 needs a doctor’s check first (see the safety section above).',
   'Ask your doctor whether hormone therapy is right for you overall; it is decided on whole-body risks and benefits, not gut symptoms alone. Reflux and constipation have standard treatments that work at any age.',
   'Keep plant variety high and build it up slowly, stay active, and protect sleep. Ryan and McGowan’s TEAMS reminder fits here: whole-body health, exercise, less alcohol, mental health and sleep.',
   ['changMeno','rossiMeno','gutExpertsPod']);
 // 4. Pregnancy / postpartum
 if(wHas('stage','pregnant'))
  push('pregnancy','Pregnancy or after birth',['guide'],
   'Hormones in pregnancy slow the gut, so constipation and reflux are very common. After birth, the pelvic floor can make it harder to empty the bowel or hold stool.',
   'Check every medicine and supplement with your OB or midwife before using it. Leaking stool after birth is common and treatable, so ask about it.',
   'Your OB can recommend pregnancy-safe options for constipation and reflux. A pelvic-floor physical therapist can help after birth.',
   'Fluids, gentle movement and fiber added slowly usually help constipation. Smaller meals and not lying down after eating help reflux.',
   ['constipation','reflux']);
 // 5. Pelvic floor
 if(wAny('pelvic',['strain','incomplete','splint','leakStool'])||(wAny('main',['constipation','bloat'])&&wHas('pelvic','birth')))
  push('pelvic','Check the pelvic floor',['moshiree','guide'],
   'Straining even with soft stool, feeling you can’t empty, or needing to press or change position to pass stool can mean the pelvic-floor muscles aren’t relaxing at the right time. Laxatives alone often don’t fix this. It is more common in women and can also cause bloating.',
   'Ask a gastroenterologist about anorectal testing, such as anorectal manometry and a balloon expulsion test. The 2023 AGA practice update that Moshiree led recommends this kind of testing when bloating comes with constipation or difficult evacuation.',
   'If testing shows a pelvic-floor problem, biofeedback therapy or pelvic-floor physical therapy is the main treatment and can improve bloating too.',
   'A footstool under your feet on the toilet, not rushing, and not straining hard are simple starting points while you arrange an assessment.',
   ['moshireeAga','constipation']);
 // 6. Bloating and belly swelling
 if(wAny('main',['bloat','gas'])||wAny('distension',['yes','sometimes']))
  push('bloat','Bloating and belly swelling',['moshiree','rossi'],
   'Bloating is one of the most common gut complaints in women. Women tend to have slower gut transit, which gives gas more time to build. A belly that swells through the day and goes down overnight is often due to sensitive gut nerves or a reflex in the belly and diaphragm muscles, not extra gas.',
   'A doctor should first rule out constipation, celiac disease and, where it fits, a carbohydrate intolerance (a breath test may help). The AGA update advises against routine stomach-emptying tests for bloating unless nausea or vomiting are present.',
   'Options include treating constipation, dietitian-guided diet changes, gut-directed hypnotherapy or cognitive behavioral therapy, and in some cases a low-dose “neuromodulator” medicine. The AGA update does not recommend probiotics for bloating.',
   'Try diaphragmatic (belly) breathing for a few minutes after meals. It is one of the tools the AGA update suggests for belly swelling.',
   ['moshireeAga','sibo']);
 // 7. Too much fiber, too fast
 if(wHas('fiberChange','lot')||wHas('fiberChange','bit')&&wAny('main',['bloat','gas']))
  push('fiber','Too much of a good thing: fiber',['ryan','rossi'],
   'You recently added more fiber. Ryan and McGowan often see women whose bloating comes from “healthy” changes like loading up on fiber, fruit, beans or gut powders. Fiber feeds your gut microbes, but too much too fast can backfire.',
   'If bloating started or got worse after the change, that timing is worth mentioning to your doctor or dietitian.',
   'A dietitian can work out the right amount and type of fiber for your gut.',
   'Go “low and slow”: drop back to a moderate amount (the Gut Experts suggest starting around 20 grams a day), then add more gradually as your gut settles. Rossi gives the same advice about building up slowly.',
   ['gutExpertsFiber','gutExpertsPod']);
 // 8. Plant variety
 if(wAny('plants',['u10','10to20','unsure'])&&!wHas('fiberChange','lot'))
  push('plants','More plant variety, added slowly',['rossi'],
   'Rossi’s research team points to variety over volume: people who eat about 30 different plant foods a week tend to have a more diverse gut microbiome than those eating around 10, whether or not they are vegan.',
   'If you have a gut condition such as IBS, change one thing at a time so you can tell what helps.',
   'A dietitian can help you add variety without setting off symptoms.',
   'Count “plant points”: each different fruit, vegetable, whole grain, bean, nut, seed, herb or spice is one point a week. Add a few new ones each week instead of eating a lot more at once. Mixed nuts, seed blends, frozen vegetable mixes and herbs are easy wins.',
   ['rossiPlants']);
 // 9. Self-imposed restriction
 if(wCount('restrict')>0)
  push('restrict','Food rules you set yourself',['ryan','guide'],
   'Cutting out foods without testing or guidance is one of the most common reasons the Gut Experts see ongoing gut trouble. It can also hide conditions like celiac disease.',
   wHas('restrict','gluten')?'If you went gluten-free without a celiac blood test, ask about testing. The test only works while you are eating gluten, so a doctor may ask you to eat it again first.':'Ask a doctor or dietitian before cutting out more foods.',
   'A registered dietitian can run a proper elimination and reintroduction (such as low-FODMAP), which is meant to be short-term.',
   wHas('restrict','skip')?'Regular meals usually settle the gut better than skipping meals or long fasts.':'Bring foods back one at a time to find your real triggers and keep your diet as broad as possible.',
   wHas('restrict','gluten')?['gutExpertsFiber','celiac']:['gutExpertsFiber']);
 // 10. Gut-brain
 if(wHas('stress','clear')||wCount('beyond')>=2||wHas('earlyLife','yes')&&wAny('stress',['clear','some']))
  push('gutbrain','The gut–brain connection',['chang','omahony'],
   'Your answers point to a strong link between stress and your gut, or symptoms beyond the gut. Chang’s UCLA team found that symptoms outside the gut in women with IBS are tied to stress reactivity and the gut microbiome. O’Mahony’s lab studies how stress, including early-life stress, changes gut–brain signaling differently in women and men.',
   'This does not mean symptoms are “in your head.” The gut and brain signal each other both ways, and that signaling can be treated.',
   'Brain–gut therapies, such as gut-directed cognitive behavioral therapy and gut-directed hypnotherapy (including app-based programs), have good evidence for IBS. Some medicines work on gut nerves as well as mood. Ask your doctor for a referral.',
   'Daily breathing exercises or mindfulness, regular movement and steady sleep all calm the stress response. Pick one and keep it up for a few weeks.',
   ['changLab','omahonyStress','omahony']);
 // 11. IBS-like pattern
 if(wAny('main',['pain','bloat','constipation','diarrhea','alternating'])&&wAny('painStool',['relief','worse'])&&wAny('duration',['months','years']))
  push('ibs','An IBS-like pattern',['chang','guide'],
   'Belly pain linked to bowel movements, with changes in stool, over months fits an IBS-like pattern. IBS is about twice as common in women.',
   wHas('age','50up')&&!wHas('history','ibs')?'IBS rarely starts for the first time after 50. UK guidance tells doctors to check for ovarian causes first in women 50+ with new IBS-like symptoms.':'A doctor will check for warning signs and may order a few tests matched to your stool pattern (for example, celiac testing if you have diarrhea).',
   'IBS treatment is matched to your main symptom (constipation, diarrhea or pain) and can include medicine, diet guidance and brain–gut therapy.',
   'A two-week food and symptom log, regular meals and gradual fiber changes are good first steps.',
   ['ibs','changLab']);
 // 12. Reflux
 if(wAny('main',['reflux'])||wHas('meno','reflux'))
  push('reflux','Heartburn and reflux',['rossi','guide'],
   'Reflux is common and can start or get worse around perimenopause, when the gut slows down.',
   'See a doctor if you have trouble swallowing, vomiting, weight loss or reflux that does not respond to treatment.',
   'Antacids and acid reducers are standard. Use acid reducers as directed and review long-term use with your doctor.',
   'Smaller meals, not eating within about 3 hours of bed, raising the head of the bed and cutting back on alcohol often help.',
   ['reflux','rossiMeno']);
 // 13. Everyday habits
 if(wCount('habits')>0||wAny('triggers',['drinks','sweeteners','large']))
  push('habits','Everyday habits that stir up the gut',['ryan'],
   'The Gut Experts still see plenty of everyday habits behind gut symptoms: eating fast, fizzy drinks, chewing gum and exercising hard right after eating.',
   'Simple changes like these are worth trying before more restrictive diets.',
   'Not usually a medical issue, but tell your doctor if symptoms continue after these changes.',
   [wHas('habits','fast')?'Slow down and chew well':'',wAny('habits',['fizzy','gum'])||wAny('triggers',['drinks','sweeteners'])?'cut back on fizzy drinks, gum and sugar-free sweeteners':'',wHas('habits','exercise')?'leave an hour between a meal and hard exercise':'',wHas('habits','water')?'drink more fluids through the day':'',wHas('triggers','large')?'move to smaller, earlier dinners':''].filter(Boolean).join('; ').replace(/^./,c=>c.toUpperCase())+'.',
   ['gutExpertsFiber']);
 // 14. Medicines
 if(wAny('meds',['iron','opioid','glp','magnesium','nsaid','antibiotics']))
  push('meds','Medicines that can affect the gut',['guide'],
   'Iron, opioids and GLP-1 medicines often cause constipation or nausea. Magnesium and vitamin C can loosen stool. Frequent anti-inflammatory painkillers can irritate the stomach. Recent antibiotics can upset the gut balance and sometimes cause infection.',
   wHas('meds','antibiotics')&&wAny('main',['diarrhea'])?'New diarrhea during or after antibiotics should be checked by a doctor, as it may need a stool test.':'Bring a full list of medicines and supplements to your appointment.',
   'Do not stop a prescribed medicine on your own; ask whether a different form, dose or timing would help.',
   'Ask your pharmacist about gentler forms, such as different iron types or every-other-day dosing.',
   ['constipation','diarrhea']);
 return a;
}

function wgReport(){if(!WG_QUESTIONS.every(q=>wg.answers[q[1]])){wg.index=WG_QUESTIONS.findIndex(q=>!wg.answers[q[1]]);wgQuestion();return;}
 const u=wgUrgency(),av=wgAvenues(),urgent=u.emergency.length>0;
 const chips=ex=>`<div class="wgchips">${ex.map(k=>`<span>${WG_SHORT[k]}</span>`).join('')}</div>`;
 main.innerHTML=`<section class="gutpage gutreport"><a href="#tests">← The test bench</a><span class="eyebrow">WOMEN’S GUT HEALTH / PERSONAL DISCUSSION GUIDE</span><h1>Your gut, your hormones,<br><em>your next questions.</em></h1><p class="pageintro">These are topics to explore with a doctor or dietitian, not diagnoses. Each one shows which expert’s work informs it. Several can apply at once.</p>
 <div class="guttriage ${urgent?'emergency':u.concern.length?'caution':''}"><h2>${urgent?'Get urgent medical care now':u.concern.length?'Book a prompt doctor visit':'No emergency warning sign selected'}</h2><p>${urgent?'You selected something that can be an emergency. Get care now (in the U.S., call 911) and do not rely on the rest of this guide.':u.concern.length?'You selected bleeding, weight loss, anemia, night symptoms, swallowing trouble, fever, unusual vaginal bleeding or a family history. See a doctor soon, before trying diets or assuming IBS.':'A questionnaire cannot rule out serious problems. See a doctor if symptoms are severe, getting worse or not going away.'}</p>${u.vagBleed?'<p><b>Unusual vaginal bleeding, especially after menopause, should be checked by a doctor right away.</b></p>':''}${wgSource('urgent')}</div>
 ${u.ovarian?`<div class="guttriage caution"><h2>Ask about an ovarian check</h2><p>${u.ovarianStrong?'You are 50 or older and marked new, frequent bloating or symptoms like feeling full quickly, pelvic pain or needing to pee more.':'You marked new, frequent bloating, daily symptoms like feeling full quickly, pelvic pain or needing to pee more, or IBS-like symptoms starting after 50.'} Most of the time these have a gut cause, but they are also the main early signs of ovarian cancer, which is easy to miss. The CDC says to see a doctor if any of these last two weeks or more and are not normal for you. UK guidance tells doctors to offer a CA-125 blood test, and an ultrasound if needed, to women 50+ with these symptoms on a frequent basis.</p><p><b>What to say:</b> “I’ve had new bloating most days for [how long]. Can we rule out an ovarian cause?”</p><div class="gutsources">${wgSource('ovarianCdc')}${wgSource('ovarianNice')}</div></div>`:''}
 ${u.screen?`<div class="guttriage caution"><h2>Colon cancer screening</h2><p>You are not sure you are up to date. Adults 45–75 at average risk are advised to screen. Symptoms like bleeding need a diagnostic check, not just a routine screening test.</p>${wgSource('screen')}</div>`:''}
 <div class="sectionlabel">TOPICS TO DISCUSS, NOT DIAGNOSES</div>
 ${av.length?av.map((x,i)=>`<article class="gutavenue"><div class="gutnumber">${String(i+1).padStart(2,'0')}</div><div><h2>${x.title}</h2>${chips(x.experts)}<p><b>Why it showed up:</b> ${x.fit}</p><div class="gutcolumns"><div><h3>Ask your doctor</h3><p>${x.check}</p><p>${x.care}</p></div><div><h3>Food & daily habits</h3><p>${x.habits}</p></div></div><div class="gutsources">${x.sources.map(wgSource).join('')}</div></div></article>`).join(''):'<article class="gutavenue"><div><h2>No strong pattern from these answers</h2><p>That does not mean your symptoms don’t matter. Bring your history to a doctor, especially if things change.</p></div></article>'}
 <div class="gutbottom"><h2>Bring this to your appointment</h2><p>Tell the doctor when it started, your stool pattern, how it lines up with your cycle or menopause, your medicines, family history and what you have tried. The download includes every answer. Change one thing at a time so you can tell what works.</p><p><b>Evidence boundary:</b> These experts don’t always agree. Rossi encourages more plant variety, while Ryan and McGowan warn that too much fiber too fast causes bloating. Both say to build up slowly, and this guide uses your answers to lean one way. Probiotics are not recommended for bloating in the AGA update. Hormone therapy is a whole-body decision. Nothing here replaces an exam.</p><div class="inlineactions"><button class="primary" data-wg="download">Download answers & guide ↧</button><button class="secondary" data-wg="review">Review my answers</button><button class="secondary" data-wg="experts">The experts & sources</button><button class="textbtn danger" data-wg="reset">Start over</button></div></div></section>`;}

function wgExperts(){main.innerHTML=`<section class="gutpage"><a href="#wgut">← Questionnaire</a><span class="eyebrow">WHO INFORMED THIS GUIDE</span><h1>The experts<br><em>and what we used.</em></h1><p class="pageintro">Each summary below is written in plain English from the expert’s public work: research papers, clinical guidance, articles and interviews. These experts did not create, review or endorse this questionnaire. It is an original educational guide, not a validated test, and it does not reproduce any of their questionnaires.</p>${WG_EXPERTS.map(e=>`<article class="gutavenue"><div><h2>${e.name}</h2><p class="small">${e.role}</p><p><b>Key ideas used:</b> ${e.used}</p><p><b>Where it shows up:</b> ${e.shows}</p><div class="gutsources">${e.sources.map(wgSource).join('')}</div></div></article>`).join('')}<h2>Clinical guidance used for safety checks</h2><ul class="gutsourcelist">${['ovarianCdc','ovarianNice','endo','endoMiss','mensesMeta','ibs','constipation','reflux','celiac','diarrhea','sibo','screen','urgent'].map(k=>`<li>${wgSource(k)}</li>`).join('')}</ul><p>Last reviewed for this build: November 2026. Guidance changes; check the linked sources and talk with a clinician about your situation.</p></section>`;}

function wgDownload(){const u=wgUrgency(),av=wgAvenues(),ans=q=>{const v=wg.answers[q[1]];return Array.isArray(v)?v.map(x=>q[4].find(o=>o[0]===x)?.[1]||x).join('; '):q[4].find(o=>o[0]===v)?.[1]||'Unanswered';};
 const lines=['WOMEN’S GUT HEALTH — DISCUSSION GUIDE',new Date(wg.completed||Date.now()).toLocaleString(),'Educational guide, not a diagnosis or treatment plan. Informed by published work of Lin Chang, Megan Rossi, Barbara Ryan & Elaine McGowan, Baha Moshiree and Siobhain O’Mahony; none of them wrote or endorsed it.','',
  u.emergency.length?'EMERGENCY WARNING SIGNS SELECTED — GET URGENT CARE':'No emergency warning sign selected.',u.concern.length?'Concerning features selected — book a prompt doctor visit.':'',u.ovarian?'ASK ABOUT AN OVARIAN CHECK: new/frequent bloating or related symptoms'+(u.ovarianStrong?' at age 50+':'')+'. CDC: see a doctor if symptoms last 2+ weeks. NICE: CA-125 for women 50+ with frequent symptoms.':'',u.screen?'Colon cancer screening: not up to date or unsure.':'','','YOUR ANSWERS',...WG_QUESTIONS.flatMap((q,i)=>[`${i+1}. ${q[2]}`,`   ${ans(q)}`]),'','TOPICS TO DISCUSS',...av.flatMap(x=>[x.title.toUpperCase(),'Informed by: '+x.experts.map(k=>WG_SHORT[k]).join(', '),'Why: '+x.fit,'Ask your doctor: '+x.check+' '+x.care,'Food & habits: '+x.habits,...x.sources.map(k=>'  '+WG_SOURCES[k][0]+': '+WG_SOURCES[k][1]),'']),'This rule set is not a validated diagnostic instrument.'].filter((l,i,arr)=>!(l===''&&arr[i-1]===''));
 download(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}),'Know-Yourself-Womens-Gut-Guide.txt');}

function wgRender(page){document.body.classList.toggle('testing',page==='wgut-test');if(page==='wgut-test')wgQuestion();else if(page==='wgut-result')wgReport();else if(page==='wgut-experts')wgExperts();else wgIntro();}

document.addEventListener('click',e=>{const b=e.target.closest('[data-wg]');if(!b)return;const cmd=b.dataset.wg;
 if(cmd==='start'){const miss=WG_QUESTIONS.findIndex(q=>!wg.answers[q[1]]);wg.index=miss>=0?miss:0;wgSave();location.hash='#wgut-test';}
 else if(cmd==='answer'){const q=WG_QUESTIONS[wg.index],key=b.dataset.value;if(q[3]==='single')wg.answers[q[1]]=key;else{let a=[...(wg.answers[q[1]]||[])];if(key==='none')a=['none'];else{a=a.filter(x=>x!=='none');a=a.includes(key)?a.filter(x=>x!==key):[...a,key];}if(a.length)wg.answers[q[1]]=a;else delete wg.answers[q[1]];}wg.completed=null;wgSave();wgQuestion();}
 else if(cmd==='next'){if(!wg.answers[WG_QUESTIONS[wg.index][1]])return;if(wg.index===WG_QUESTIONS.length-1){if(WG_QUESTIONS.every(q=>wg.answers[q[1]])){wg.completed=new Date().toISOString();wgSave();location.hash='#wgut-result';}else{wg.index=WG_QUESTIONS.findIndex(q=>!wg.answers[q[1]]);wgSave();wgQuestion();}}else{wg.index++;wgSave();wgQuestion();if(typeof showQuestion==='function')showQuestion();}}
 else if(cmd==='back'){wg.index=Math.max(0,wg.index-1);wgSave();wgQuestion();}
 else if(cmd==='jump'||cmd==='review'){wg.index=cmd==='review'?0:Number(b.dataset.index);wgSave();location.hash='#wgut-test';wgQuestion();}
 else if(cmd==='report')location.hash='#wgut-result';
 else if(cmd==='experts')location.hash='#wgut-experts';
 else if(cmd==='download')wgDownload();
 else if(cmd==='reset'){if(confirm('Start over and replace your saved women’s gut answers on this device?')){wg={answers:{},index:0,completed:null};wgSave();location.hash='#wgut-test';wgQuestion();}}
});
if(typeof module!=='undefined')module.exports={wgClean};
