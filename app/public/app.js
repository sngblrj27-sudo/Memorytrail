'use strict';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const seed=MT_DATA, state={photos:structuredClone(seed.photos),records:MT.validateRecords(seed.records),clues:[],rejected:[],history:[],query:'',searched:false,live:false,health:null,token:'',events:[],results:[],task:null,baseline:false,reviewed:new Set(),skipped:new Set(),ranking:null};
const labels={express:'Express a clue',retrieve:'Retrieve candidates',recognize:'Recognize target',refine:'Refine / recover',coverage:'Library coverage',success:'Success / counterevidence',other:'Other'};
function toast(message){$('toast').textContent=message;$('toast').style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').style.display='none',4400);}
function log(type,details={}){state.events.push({at:new Date().toISOString(),type,condition:state.baseline?'toy_keyword':state.live?'live_ai':'illustrated_rules',dataset:state.photos.some(p=>p.origin==='private upload')?'private_selected':'synthetic',...details});renderTests();}
function snapshot(){state.history.push({clues:structuredClone(state.clues),rejected:[...state.rejected],skipped:[...state.skipped],ranking:state.ranking});if(state.history.length>20)state.history.shift();}
function tab(name){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===name+'View'));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));}
function modal(title,body){state.modalPrevious=document.activeElement;$('modalTitle').textContent=title;$('modalBody').innerHTML=body;$('modalBackdrop').classList.add('open');$('closeModal').focus();}
function closeModal(){$('modalBackdrop').classList.remove('open');state.modalPrevious?.focus?.();}
function exportFile(name,data,type='application/json'){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function ai(mode,input){
 const response=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json',...(state.token?{'x-reviewer-token':state.token}:{})},body:JSON.stringify({mode,input})});
 let body;try{body=await response.json();}catch{throw new Error('AI server unavailable. Open the local server or deploy the app; an HTML attachment alone has no API backend.');}
 if(!response.ok)throw new Error(body.error||'AI request failed.');return body.result;
}
function displayed(){
 const base=MT.rank(state.photos,state.query,state.clues,state.rejected,state.baseline?'keyword':'memory');
 if(!state.ranking||state.baseline)return base;
 const positions=new Map(state.ranking.map((m,i)=>[m.id,{index:i,reason:m.reason}]));
 return base.map(p=>({...p,aiReason:positions.get(p.id)?.reason,aiPosition:positions.get(p.id)?.index??999})).sort((a,b)=>a.aiPosition-b.aiPosition||b.score-a.score);
}
function renderGallery(){
 const photos=displayed();$('resultTitle').textContent=state.searched?(state.baseline?'Toy keyword results':'Possible matches'):'Your demonstration gallery';
 $('gallery').innerHTML=photos.length?photos.map(p=>`<article class="photo"><button class="imagebtn" data-open="${esc(p.id)}" aria-label="Open ${esc(p.title)}"><img src="${esc(p.image)}" alt="${esc(p.caption)}"></button><div class="photo-body"><div class="photo-title">${esc(p.title)}</div><div class="meta">${esc([p.place,p.date].filter(Boolean).join(' · ')||'Date and location not supplied')}</div><div class="reason">${esc(state.searched?(p.aiReason?'AI interpretation: '+p.aiReason:p.reasons.slice(0,2).join(' · ')||'Kept visible: your memory may be incomplete.'):'Synthetic illustration · Fictional memory metadata')}</div><div class="actions"><button class="btn" data-near="${esc(p.id)}">Nearby moment</button><button class="btn" data-reject="${esc(p.id)}">Not this one</button></div></div></article>`).join(''):'<div class="empty">Every candidate has been dismissed. Undo a dismissal or reset the search.</div>';
 $('clueArea').innerHTML=state.clues.length?'<p class="hint">Edit any assumption. “Maybe” changes ranking, not eligibility.</p><div class="clues">'+state.clues.map((c,i)=>`<div class="clue ${esc(c.confidence)}"><span>${esc(c.value)}</span><select data-clue="${i}" aria-label="Confidence in ${esc(c.value)}">${['certain','maybe','ignore'].map(x=>`<option value="${x}" ${x===c.confidence?'selected':''}>${x==='certain'?'I’m certain':x==='maybe'?'Maybe':'Ignore'}</option>`).join('')}</select></div>`).join('')+'</div>':'';
 $('undoBtn').disabled=!state.history.length;
 if(state.searched){
  let q=MT.nextQuestion(photos,state.clues);if(q&&state.skipped.has(q.kind))q=null;
  $('questionCard').innerHTML=q?`<p class="eyebrow">One useful question</p><p class="question">${esc(q.question)}</p><p class="hint">Suggested from candidate diversity—not a fact about your memory.</p><div class="chips">${q.options.map(o=>`<button data-answer="${esc(o)}" data-kind="${q.kind}">${esc(o)}</button>`).join('')}<button data-skip="${q.kind}">Not sure</button></div>`:'<p class="eyebrow">Keep the whole moment</p><p class="question">A near miss can still be a useful clue.</p><p>Open a photo, then explore its event group. You can always remove an assumption or undo a dismissal.</p>';
 }
}
async function rerankLive(){
 if(!state.live||state.baseline){state.ranking=null;renderGallery();return;}
 const input={clues:state.clues.filter(c=>c.confidence!=='ignore'),photos:state.photos.filter(p=>!state.rejected.includes(p.id)).map(({id,caption,tags,scene,color,date,place,event})=>({id,caption,tags,scene,color,date,place,event}))};
 if(!input.photos.length){state.ranking=null;renderGallery();return;}
 const output=await ai('rank',input);const known=new Set(input.photos.map(p=>p.id));
 state.ranking=output.matches.filter(m=>known.has(m.id));renderGallery();
}
async function runSearch(){
 const query=$('query').value.trim();if(!query){toast('Describe one detail you remember.');return;}
 $('searchBtn').disabled=true;$('searchNotice').innerHTML='';state.query=query;state.rejected=[];state.skipped.clear();state.history=[];state.ranking=null;
 try{
  if(state.live&&!state.baseline){
   const r=await ai('parse',{query});if(!Array.isArray(r.clues))throw new Error('Invalid clue response.');
   state.clues=r.clues.slice(0,8).filter(c=>typeof c.value==='string'&&['certain','maybe'].includes(c.confidence)).map((c,i)=>({...c,id:'c'+i}));
  }else state.clues=MT.parseDemo(query);
  state.searched=true;renderGallery();await rerankLive();
  log('search_completed',{clue_count:state.clues.length,result_count:displayed().length});
  $('searchNotice').innerHTML=state.live?'<p class="hint">Live AI ranking completed. Reasons are model interpretations of the supplied captions; verify the actual image.</p>':'<p class="hint">Illustrated demo: rule-based clue parsing and ranking. This does not measure AI or Google Photos retrieval quality.</p>';
 }catch(e){$('searchNotice').innerHTML=`<div class="notice danger-note">${esc(e.message)} No successful live search was recorded. Switch to demo explicitly in settings to continue without AI.</div>`;log('search_error');}
 finally{$('searchBtn').disabled=false;}
}
function openPhoto(id,near=false){
 const p=state.photos.find(x=>x.id===id);if(!p)return;log(near?'nearby_opened':'candidate_opened',{photo_id:id});
 const group=p.event?state.photos.filter(x=>x.event===p.event&&x.id!==id):[];
 modal(p.title,`<img class="modalimg" src="${esc(p.image)}" alt="${esc(p.caption)}"><p class="meta" style="margin-top:12px">${esc([p.place,p.date,p.event].filter(Boolean).join(' · ')||'Capture date and place are unknown')}</p><p>${esc(p.caption)}</p><div class="notice ${p.origin==='private upload'?'':'success'}">${p.origin==='private upload'?'Caption is AI-generated and may be wrong. Place, date and relationships were not inferred.':'Illustrated synthetic fixture. All dates, places and event groups are fictional.'}</div>${p.origin==='private upload'?'<details style="margin:15px 0"><summary>Add metadata you actually know</summary><p class="hint">Optional. Never guess capture metadata to make a result match.</p><label class="hint">Place <input id="metaPlace" class="field" value="'+esc(p.place)+'"></label> <label class="hint">Date <input id="metaDate" class="field" type="date" value="'+esc(p.date)+'"></label><p><label class="hint">Event label <input id="metaEvent" class="field" value="'+esc(p.event)+'" placeholder="A shared label for the same real event"></label></p><button class="btn small" data-savemeta="'+esc(id)+'">Save known metadata</button></details>':''}<div class="toolbar"><button class="btn primary" data-found="${esc(id)}">This is the one</button><button class="btn" data-rejectmodal="${esc(id)}">Not this one</button></div><h3>From the same moment</h3>${group.length?'<p class="hint">'+(p.origin==='private upload'?'User-supplied event group.':'Fictional event group for demonstrating traversal; not inferred from these illustrations.')+'</p><div class="nearby">'+group.map(x=>`<button data-open="${esc(x.id)}"><img src="${esc(x.image)}" alt="${esc(x.caption)}"><span>${esc(x.title)}</span></button>`).join('')+'</div>':'<p class="hint">No verified event metadata is available. Nearby moments are not guessed from image-upload order.</p>'}`);
}
function found(id){
 const check=MT.verifySelection(id,state.task?.target||null),elapsed=state.task?Math.round((performance.now()-state.task.started)/100)/10:null;
 const result={task_id:state.task?.id||'unstructured',dataset:state.photos.some(p=>p.origin==='private upload')?'private_selected':'synthetic',condition:state.baseline?'toy_keyword':state.live?'live_ai':'illustrated_rules',declared_found_id:id,target_id:state.task?.target||'',verified_correct:check.verified,elapsed_seconds:elapsed,within_120_seconds:check.verified===true&&elapsed!==null?elapsed<=120:null,participant_id:''};
 state.results.push(result);log('found_declared',{photo_id:id,verified:check.verified,elapsed_seconds:elapsed});
 state.task=null;$('taskBanner').innerHTML='';closeModal();
 const note=check.verified===true?'Correct synthetic target selected. This is a practice result, not a user-study finding.':check.verified===false?'That was not the predefined synthetic target. The false success is recorded.':'Selection recorded. Correctness is unverified until independently checked.';
 $('searchNotice').innerHTML='<div class="notice '+(check.verified===true?'success':'')+'">'+esc(note)+'</div>';toast(note);renderTests();
}
function startTask(){
 const target=$('taskSelect').value;
 const tasks={p01:{title:'Find the indoor cafe with green plants and a large window.',query:'That plant-filled cafe from our trip, maybe Goa'},p04:{title:'Find the cafe with blue chairs. You are unsure which city it was in.',query:'A cafe with blue chairs, maybe Goa'},p08:{title:'Find the lake with mountains behind it. You are unsure of the year.',query:'A lake from a mountain hike, maybe 2023'}};
 if(state.photos.some(p=>p.origin==='private upload')){toast('Clear private images to start a synthetic practice task.');return;}
 state.task={id:'practice-'+Date.now(),target,started:performance.now()};$('query').value=tasks[target].query;
 $('taskBanner').innerHTML='<div class="notice"><strong>Practice task:</strong> '+esc(tasks[target].title)+' <span class="hint">Choose within 120 seconds. Synthetic recognition task only.</span></div>';log('task_started',{task_id:state.task.id});runSearch();
}
function renderEvidence(){
 const rec=state.records,discussions=new Set(rec.map(r=>r.source_url)).size,stages=new Set(rec.map(r=>r.stage)).size;
 $('evidenceStats').innerHTML=[[rec.length,'Source-linked records'],[discussions,'Distinct discussion URLs'],[stages,'Retrieval stages / outcomes'],[0,'Real interviews completed']].map(([v,l])=>`<div class="stat"><strong>${v}</strong><span>${l}</span></div>`).join('');
 const filter=$('stageFilter').value;
 $('recordGrid').innerHTML=rec.filter(r=>filter==='all'||r.stage===filter).map(r=>`<article class="record"><div class="rid"><span>${esc(r.id)} · ${esc(r.source_type)}${r.source_date?' · thread '+esc(r.source_date):''}</span><span class="badge ${r.stage==='success'?'':'warn'}">${esc(labels[r.stage]||r.stage)}</span></div><blockquote>“${esc(r.verified_quote||r.text)}”</blockquote><p><strong>Tentative interpretation:</strong> ${esc(r.summary)}</p><div class="kv"><span class="muted">Remembered</span><span>${esc(r.remembered)}</span><span class="muted">Unknown</span><span>${esc(r.missing)}</span></div><div class="divider"></div><p class="hint">${esc(r.annotation_origin)} · ${esc(r.signal)}</p><div class="rid"><a href="${esc(r.source_url)}" target="_blank" rel="noopener noreferrer">Inspect original source ↗</a><label><input type="checkbox" data-review="${esc(r.id)}" ${state.reviewed.has(r.id)?'checked':''}> Reviewed</label></div></article>`).join('')||'<div class="empty">No records match this filter.</div>';
 $('officialSources').innerHTML=seed.sources.filter(s=>s.id.startsWith('O')).map(s=>`<p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.id+' · '+s.title)}</a> — ${esc(s.note)}</p>`).join('');
}
function renderTests(){
 const synthetic=state.results.filter(r=>r.dataset==='synthetic');
 $('testStats').innerHTML=[[state.events.length,'Session events'],[synthetic.length,'Synthetic practice selections'],[state.results.filter(r=>r.verified_correct===null).length,'Unverified selections'],[0,'Verified real participant results']].map(([v,l])=>`<div class="stat"><strong>${v}</strong><span>${l}</span></div>`).join('');
 $('resultsTable').innerHTML=state.results.length?'<div class="tablewrap"><table><thead><tr><th>Task</th><th>Condition</th><th>Correct?</th><th>Time</th><th>Dataset</th></tr></thead><tbody>'+state.results.map(r=>`<tr><td>${esc(r.task_id)}</td><td>${esc(r.condition)}</td><td>${r.verified_correct===null?'Unverified':r.verified_correct?'Yes':'No'}</td><td>${r.elapsed_seconds===null?'Not timed':r.elapsed_seconds+' s'}</td><td>${esc(r.dataset)}</td></tr>`).join('')+'</tbody></table></div>':'<div class="empty">No task outcomes yet. Practice outcomes will be labeled synthetic.</div>';
 $('eventsTable').innerHTML=state.events.length?'<div class="tablewrap"><table><thead><tr><th>Time</th><th>Event</th><th>Condition</th></tr></thead><tbody>'+state.events.slice(-60).reverse().map(e=>`<tr><td>${esc(e.at.slice(11,19))}</td><td>${esc(e.type)}</td><td>${esc(e.condition)}</td></tr>`).join('')+'</tbody></table></div>':'<p class="muted">The log is empty. Queries and image bytes are not included in exported events.</p>';
}
async function health(){try{const r=await fetch('/api/health');state.health=await r.json();}catch{state.health={configured:false,liveAllowed:false};}}
function settings(){
 modal('AI & privacy settings',`<div class="settings"><p>Demo mode works without an account or network. It uses illustrations and explicit ranking rules—not a hidden AI simulation.</p><div class="notice">Live AI requires the supplied backend and a server-side Gemini API key. Live provider calls were not validated in the delivered package because no credentials were available.</div><label class="switchrow"><input id="liveToggle" type="checkbox" ${state.live?'checked':''}> Enable live AI calls</label><p class="hint">Backend: ${state.health?.configured?'configured':'not configured / not reachable'} · Public live calls: ${state.health?.liveAllowed?'allowed by server configuration':'not enabled'} · Model: ${esc(state.health?.model||'configurable')}</p><label>Reviewer access token, when required (not a Gemini API key)<input id="reviewerToken" class="field" type="password" autocomplete="off" value="${esc(state.token)}"></label><p class="hint">Token stays in this page’s memory. Public model keys must never be entered into this form.</p><p>Selected images are resized, sent through the backend for captioning, and retained in this browser tab only. Captions and clues are sent for ranking. The app does not write images, queries, or logs to disk. The hosting platform and AI provider may retain request metadata or content according to their terms. Use non-sensitive test images.</p><button class="btn primary" id="saveSettings">Save settings</button></div>`);
 $('saveSettings').onclick=()=>{
  const live=$('liveToggle').checked;if(live&&!state.health?.liveAllowed){toast('Start or deploy the backend and configure its AI access first.');return;}
  state.live=live;state.token=$('reviewerToken').value;state.ranking=null;
  $('modeBadge').textContent=live?'Live AI enabled':'Illustrated demo · no AI calls';$('modeBadge').className='badge'+(live?'':' warn');
  $('searchHint').textContent=live?'Clues and selected captions go to the configured AI provider.':'Demo uses labeled illustrations and transparent rules.';closeModal();renderGallery();
 };
}
async function resizeImage(file){
 if(file.size>15000000)throw new Error('Each input image must be below 15 MB.');
 const bitmap=await createImageBitmap(file);const scale=Math.min(1,768/Math.max(bitmap.width,bitmap.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(bitmap.width*scale));c.height=Math.max(1,Math.round(bitmap.height*scale));c.getContext('2d').drawImage(bitmap,0,0,c.width,c.height);bitmap.close();return c.toDataURL('image/jpeg',.72);
}
async function uploadPhotos(files){
 if(!state.live||!$('uploadConsent').checked){toast('Enable live AI and provide upload consent before selecting images.');return;}
 if(!files.length)return;if(files.length>32){toast('Select no more than 32 images.');return;}
 const batch=[];$('uploadBtn').disabled=true;
 try{
  for(let i=0;i<files.length;i++){
   $('uploadBtn').textContent=`Captioning ${i+1}/${files.length}…`;const file=files[i];if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Only JPEG, PNG and WebP are supported.');
   const image=await resizeImage(file),r=await ai('caption',{mime:'image/jpeg',data:image.split(',')[1]});
   if(typeof r.caption!=='string'||!Array.isArray(r.tags))throw new Error('Invalid image caption returned.');
   batch.push({id:'u'+Date.now()+'-'+i,title:'Selected image '+(i+1),place:'',date:'',event:'',scene:r.scene||'',color:r.color||'',tags:r.tags.slice(0,12),caption:r.caption,image,origin:'private upload'});
  }
  state.photos=batch;state.clues=[];state.query='';state.searched=false;state.ranking=null;state.rejected=[];state.task=null;$('taskBanner').innerHTML='';renderGallery();log('private_images_captioned',{image_count:batch.length});toast('Selected images are ready. No capture dates, locations or event groups were inferred.');
 }catch(e){toast(e.message+' The previous gallery was kept.');}finally{$('uploadBtn').disabled=false;$('uploadBtn').textContent='Select images';$('photoUpload').value='';}
}
async function analyzeEvidence(){
 if(!state.live){toast('Enable live AI in settings to run extraction. Seed records remain viewable without AI.');return;}
 $('analyzeRecords').disabled=true;const original=structuredClone(state.records),accepted=[];
 try{
  const SIZE=6,CONCURRENCY=2,MAX_RETRIES=2,RETRY_DELAY=1500,batches=[];
  for(let i=0;i<original.length;i+=SIZE)batches.push(original.slice(i,i+SIZE));
  const results=new Array(batches.length);let next=0,done=0;
  // Transient = timeout/abort, OR a transient provider HTTP status surfaced in the message.
  // 429 rate-limit, 500/502/503/504 overloaded/unavailable all clear on backoff; a 400/401/403
  // (bad request / auth / access) is permanent and must fail fast, not burn retries.
  const isTransient=e=>{const m=e&&e.message||'';return /timed out|timeout|aborted/i.test(m)||/\((?:429|500|502|503|504)\)/.test(m);};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function discoverWithRetry(batch,idx){
   let attempt=0;
   for(;;){
    try{return await ai('discovery',{records:batch});}
    catch(e){
     if(!isTransient(e)||attempt>=MAX_RETRIES)throw e;
     attempt++;
     $('evidenceStatus').textContent=`Batch ${idx+1} hit a transient error; retry ${attempt} of ${MAX_RETRIES}…`;
     await sleep(RETRY_DELAY*attempt);
    }
   }
  }
  $('evidenceStatus').textContent=`Analyzing ${original.length} records in ${batches.length} batch(es); output requires review…`;
  async function worker(){
   while(next<batches.length){
    const idx=next++;const batch=batches[idx];
    const r=await discoverWithRetry(batch,idx);
    const validated=MT.validateExtraction(r.records,batch);
    if(validated.length!==batch.length)throw new Error('Missing records.');
    results[idx]=validated;done++;
    $('evidenceStatus').textContent=`Analyzed ${done} of ${batches.length} batch(es); output requires review…`;
   }
  }
  await Promise.all(Array.from({length:Math.min(CONCURRENCY,batches.length)},worker));
  for(const v of results)accepted.push(...v);
  state.records=accepted;state.reviewed.clear();renderEvidence();$('evidenceStatus').textContent=`Live extraction completed for ${accepted.length} records. Quotes were checked against supplied text. Human review and original-source verification are still required.`;log('discovery_completed',{record_count:accepted.length});
 }catch(e){$('evidenceStatus').textContent=e.message+' No batch replaced the existing evidence; rerun after correcting the issue.';}finally{$('analyzeRecords').disabled=false;}
}
document.addEventListener('click',e=>{
 const t=e.target.closest('button');if(!t)return;
 if(t.dataset.tab)tab(t.dataset.tab);
 if(t.dataset.example){$('query').value=t.dataset.example;runSearch();}
 if(t.dataset.open)openPhoto(t.dataset.open);
 if(t.dataset.near)openPhoto(t.dataset.near,true);
 if(t.dataset.reject||t.dataset.rejectmodal){snapshot();const id=t.dataset.reject||t.dataset.rejectmodal;state.rejected.push(id);log('candidate_rejected',{photo_id:id});if(t.dataset.rejectmodal)closeModal();renderGallery();}
 if(t.dataset.savemeta){const p=state.photos.find(p=>p.id===t.dataset.savemeta);if(p){p.place=$('metaPlace').value.slice(0,100);p.date=$('metaDate').value;p.event=$('metaEvent').value.slice(0,100);state.ranking=null;log('known_metadata_added',{photo_id:p.id});renderGallery();openPhoto(p.id);toast('User-supplied metadata saved in this session.');}}
 if(t.dataset.found)found(t.dataset.found);
 if(t.dataset.answer){snapshot();state.clues.push({id:'c'+Date.now(),value:t.dataset.answer,kind:t.dataset.kind,confidence:'certain'});state.ranking=null;log('clarification_answered',{kind:t.dataset.kind});renderGallery();rerankLive().catch(e=>toast(e.message));}
 if(t.dataset.skip){snapshot();state.skipped.add(t.dataset.skip);log('clarification_skipped',{kind:t.dataset.skip});renderGallery();}
});
document.addEventListener('change',e=>{if(e.target.dataset.clue!==undefined){snapshot();state.clues[Number(e.target.dataset.clue)].confidence=e.target.value;state.ranking=null;log('clue_confidence_changed');renderGallery();rerankLive().catch(e=>toast(e.message));}if(e.target.dataset.review){if(e.target.checked)state.reviewed.add(e.target.dataset.review);else state.reviewed.delete(e.target.dataset.review);}});
$('searchForm').onsubmit=e=>{e.preventDefault();runSearch();};$('startTask').onclick=startTask;$('settingsBtn').onclick=async()=>{await health();settings();};$('closeModal').onclick=closeModal;$('modalBackdrop').onclick=e=>{if(e.target===$('modalBackdrop'))closeModal();};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(e.key==='Tab'&&$('modalBackdrop').classList.contains('open')){const f=[...$('modalBackdrop').querySelectorAll('button,input,select,a[href]')].filter(x=>!x.disabled);const first=f[0],last=f.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
$('undoBtn').onclick=()=>{const p=state.history.pop();if(p){state.clues=p.clues;state.rejected=p.rejected;state.skipped=new Set(p.skipped);state.ranking=p.ranking;log('undo');renderGallery();}};
$('resetBtn').onclick=()=>{state.clues=[];state.rejected=[];state.history=[];state.ranking=null;state.query='';state.searched=false;state.skipped.clear();$('searchNotice').innerHTML='';renderGallery();log('search_reset');};
$('stageFilter').onchange=renderEvidence;$('importRecords').onclick=()=>$('evidenceFile').click();$('evidenceFile').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>3000000)throw new Error('Evidence file must be under 3 MB.');state.records=MT.validateRecords(JSON.parse(await f.text()));state.reviewed.clear();renderEvidence();$('evidenceStatus').textContent=state.records.length+' records imported and exact-text duplicates removed. Human review required.';}catch(err){toast(err.message);}e.target.value='';};
$('analyzeRecords').onclick=analyzeEvidence;$('exportRecords').onclick=()=>exportFile('memorytrail_evidence.json',JSON.stringify(state.records.map(r=>({...r,human_reviewed:state.reviewed.has(r.id)})),null,2));
$('uploadBtn').onclick=()=>{if(!state.live){toast('Enable live AI in settings first.');return;}if(!$('uploadConsent').checked){toast('Read and accept the upload consent first.');return;}$('photoUpload').click();};$('photoUpload').onchange=e=>uploadPhotos([...e.target.files]);
$('clearImages').onclick=()=>{state.photos=structuredClone(seed.photos);state.ranking=null;state.query='';state.clues=[];state.rejected=[];state.history=[];state.task=null;state.searched=false;$('taskBanner').innerHTML='';$('uploadConsent').checked=false;renderGallery();log('private_images_cleared');toast('Private images and captions removed from this app’s active state. Provider copies, if any, are governed separately.');};
$('exportLog').onclick=()=>exportFile('memorytrail_session.json',JSON.stringify({note:'Research prototype session. Synthetic practice is not participant evidence. No raw queries or image bytes are exported.',events:state.events,results:state.results},null,2));
$('exportResults').onclick=()=>{const fields=['task_id','dataset','condition','declared_found_id','target_id','verified_correct','elapsed_seconds','within_120_seconds','participant_id'];const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';exportFile('memorytrail_practice_results.csv',[fields.join(','),...state.results.map(r=>fields.map(f=>quote(r[f])).join(','))].join('\n'),'text/csv');};
$('clearLog').onclick=()=>{state.events=[];state.results=[];renderTests();toast('Session log cleared.');};$('baselineToggle').onchange=e=>{state.baseline=e.target.checked;state.ranking=null;renderGallery();log('condition_changed');};
renderGallery();renderEvidence();renderTests();health();
