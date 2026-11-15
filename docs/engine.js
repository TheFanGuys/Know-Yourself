'use strict';
function assess(test,answers){
 if(!Array.isArray(answers)||answers.length!==test.items.length||answers.some(v=>!test.values.includes(v)))throw new Error('Complete every question before scoring.');
 if(test.id==='adhd'){
  const hits=answers.map((v,i)=>v>=test.items[i].threshold),count=hits.filter(Boolean).length;
  return {scores:[count],hits,positive:count>=4};
 }
 if(test.id==='jung'){
  const keys=[[30,[2,6,10,14,18,22,26,30],[-1,-1,-1,1,-1,1,1,-1]],[12,[3,7,11,15,19,23,27,31],[1,1,1,1,1,-1,-1,1]],[30,[1,5,9,13,17,21,25,29],[-1,1,1,-1,-1,1,-1,-1]],[18,[0,4,8,12,16,20,24,28],[1,1,-1,1,-1,1,-1,1]]];
  const scores=keys.map(([base,indices,signs])=>indices.reduce((sum,index,k)=>sum+signs[k]*answers[index],base));
  const code=(scores[0]>24?'E':'I')+(scores[1]>24?'N':'S')+(scores[2]>24?'T':'F')+(scores[3]>24?'P':'J');
  return {scores,code,close:scores.map(n=>Math.abs(n-24)<=2)};
 }
 const dimensions=test.id==='enneagram'?9:test.id==='bigfive'?5:test.id==='emotions'?2:1;
 const scores=Array(dimensions).fill(0);
 test.items.forEach((item,i)=>scores[item.scale]+=item.reverse?6-answers[i]:answers[i]);
 return {scores};
}
function wing(scores){
 const max=Math.max(...scores),top=scores.flatMap((s,i)=>s===max?[i]:[]);
 if(top.length!==1)return {type:null,wing:null,reason:'The leading type is tied.'};
 const type=top[0],neighbors=[(type+8)%9,(type+1)%9],a=scores[neighbors[0]],b=scores[neighbors[1]];
 if(a===b)return {type,wing:null,reason:'Both adjacent wing scores are equal.'};
 return {type,wing:neighbors[a>b?0:1],reason:'The higher-scoring adjacent type is a tentative wing, not a separately validated OEPS result.'};
}
function validAnswers(test,answers){return Array.isArray(answers)&&answers.length===test.items.length&&answers.every(v=>v===null||test.values.includes(v));}
if(typeof module!=='undefined')module.exports={assess,validAnswers,wing};
