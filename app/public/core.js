/* MemoryTrail: deterministic, inspectable demo mechanics. Not a substitute for live AI. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MT=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const normalize=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
const stop=new Set('a an the i we it was were is of from my our in on at to and or but that this with had went during after before remember maybe perhaps think photo picture small some last not sure'.split(' '));
const tokens=s=>normalize(s).split(' ').filter(x=>x&&!stop.has(x));
const aliases={cafe:['cafe','coffee shop','café'],coffee:['coffee','cup','latte','espresso'],beach:['beach','ocean','sea','sand'],mountain:['mountain','hike','hiking','peak'],lake:['lake'],forest:['forest','trees','trail'],restaurant:['restaurant','dinner','food'],green:['green','plants','plant-filled'],blue:['blue'],red:['red'],orange:['orange','sunset'],goa:['goa'],mumbai:['mumbai','bombay'],paris:['paris'],seattle:['seattle'],manali:['manali']};
function parseDemo(query){
 const q=normalize(query), clues=[];
 for(const [value,variants] of Object.entries(aliases)){
  let pos=-1;for(const a of variants){const p=q.indexOf(normalize(a));if(p>=0&&(pos<0||p<pos))pos=p;}
  if(pos<0)continue;
  let kind=['goa','mumbai','paris','seattle','manali'].includes(value)?'place':['green','blue','red','orange'].includes(value)?'color':'scene';
  const before=q.slice(Math.max(0,pos-28),pos);
  const maybe=/(maybe|perhaps|possibly|think|not sure|might)(?:\s+\w+){0,3}\s*$/.test(before);
  clues.push({id:'c'+clues.length,value,kind,confidence:maybe?'maybe':'certain'});
 }
 for(const yr of q.match(/\b20\d{2}\b/g)||[])clues.push({id:'c'+clues.length,value:yr,kind:'date',confidence:'maybe'});
 if(!clues.length)tokens(query).slice(0,5).forEach(t=>clues.push({id:'c'+clues.length,value:t,kind:'detail',confidence:'maybe'}));
 return clues;
}
function textFor(p){return normalize([p.title,p.caption,p.place,p.date,p.event,p.scene,p.color,...(p.tags||[])].join(' '));}
function match(p,clue){const v=normalize(clue.value);if(!v)return false;let hay=textFor(p);const vars=aliases[v]||[v];return vars.some(a=>hay.includes(normalize(a)));}
function rank(photos,query,clues=[],rejected=[],mode='memory'){
 const reject=new Set(rejected),ts=tokens(query);
 return photos.filter(p=>!reject.has(p.id)).map(p=>{
  const hay=textFor(p);let score=0,reasons=[];
  if(mode==='keyword'){score=ts.reduce((s,t)=>s+(hay.includes(t)?1:0),0);reasons=ts.filter(t=>hay.includes(t)).slice(0,4).map(t=>'Keyword: '+t);}
  else for(const c of clues){if(c.confidence==='ignore')continue;if(match(p,c)){score+=c.confidence==='certain'?3:0.75;reasons.push((c.confidence==='certain'?'Certain clue: ':'Possible clue: ')+c.value);}}
  return {...p,score,reasons};
 }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
function nextQuestion(results,clues){
 const top=results.slice(0,8);let best=null;
 for(const kind of ['scene','color','place']){
  if(clues.some(c=>c.kind===kind&&c.confidence==='certain'))continue;
  const counts={};for(const p of top){if(p[kind])counts[p[kind]]=(counts[p[kind]]||0)+1;}
  const vals=Object.keys(counts);if(vals.length<2)continue;
  const n=Object.values(counts).reduce((a,b)=>a+b,0);
  const entropy=Object.values(counts).reduce((s,c)=>s-c/n*Math.log2(c/n),0);
  if(!best||entropy>best.entropy)best={kind,entropy,question:{scene:'What sort of scene do you recognize?',color:'Does a color stand out in your memory?',place:'Do any of these places feel familiar?'}[kind],options:vals.sort((a,b)=>counts[b]-counts[a]).slice(0,3)};
 }
 return best;
}
function validateRecords(records){
 if(!Array.isArray(records)||!records.length||records.length>500)throw new Error('Import an array of 1–500 records.');
 const ids=new Set(),texts=new Set(),out=[];
 for(const r of records){
  if(!r||typeof r.id!=='string'||typeof r.text!=='string'||!r.id.trim()||!r.text.trim())throw new Error('Every record needs a nonempty id and text.');
  if(r.id.length>80||r.text.length>5000)throw new Error('Record id/text exceeds the allowed length.');
  if(ids.has(r.id))throw new Error('Duplicate record ID: '+r.id);ids.add(r.id);
  let u;try{u=new URL(r.source_url);}catch{throw new Error('Invalid source_url for '+r.id);}
  if(!['http:','https:'].includes(u.protocol))throw new Error('Only HTTP(S) source links are allowed.');
  const key=normalize(r.text);if(texts.has(key))continue;texts.add(key);
  out.push({id:r.id,text:r.text,source_url:u.href,source_type:String(r.source_type||'Imported'),source_date:String(r.source_date||''),source_id:String(r.source_id||u.href),stage:r.stage||'other',summary:r.summary||'Not analyzed',remembered:r.remembered||'Not stated',missing:r.missing||'Not stated',signal:r.signal||'Unreviewed',review_status:r.review_status||'unreviewed',annotation_origin:r.annotation_origin||'imported'});
 }
 return out;
}
function validateExtraction(rows,input){
 if(!Array.isArray(rows))throw new Error('The model did not return records.');const originals=new Map(input.map(r=>[r.id,r])),seen=new Set();
 const stages=new Set(['express','retrieve','recognize','refine','coverage','success','other']);
 return rows.map(r=>{
  if(!originals.has(r.id)||seen.has(r.id))throw new Error('Unknown or duplicate evidence ID returned by AI.');seen.add(r.id);
  const source=originals.get(r.id);
  if(typeof r.quote!=='string'||!r.quote.trim()||!source.text.includes(r.quote))throw new Error('Unverifiable quote for '+r.id+'. Nothing from this batch was accepted.');
  if(!stages.has(r.stage))throw new Error('Invalid stage for '+r.id);
  return {...source,stage:r.stage,summary:String(r.summary||'').slice(0,600),remembered:String(r.remembered||'Not stated').slice(0,600),missing:String(r.missing||'Not stated').slice(0,600),verified_quote:r.quote,signal:r.stage==='success'?'Counterevidence / success':'AI hypothesis',review_status:'quote verified; human review pending',annotation_origin:'live Gemini extraction'};
 });
}
function verifySelection(found,target){return target?{declared:!!found,verified:found===target}:{declared:!!found,verified:null};}
return {normalize,tokens,parseDemo,rank,nextQuestion,validateRecords,validateExtraction,verifySelection};
});
