'use strict';
const crypto=require('node:crypto');
const {callModel,prepare}=require('../lib/provider');
const {validateExtraction}=require('../public/core');
const windows=new Map();
function send(res,status,body){res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(body));}
function equal(a,b){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y);}
module.exports=async function(req,res){
 if(req.method!=='POST')return send(res,405,{error:'Use POST.'});
 if(!process.env.GEMINI_API_KEY)return send(res,503,{error:'Live AI is not configured. Use the clearly labeled demo or configure the server.'});
 if(process.env.VERCEL&&!process.env.REVIEWER_TOKEN&&process.env.ALLOW_PUBLIC_AI!=='true')return send(res,503,{error:'Public AI calls are disabled until deployment access and spending controls are configured.'});
 const expected=process.env.REVIEWER_TOKEN;
 if(expected&&!equal(String(req.headers['x-reviewer-token']||''),expected))return send(res,401,{error:'A reviewer token is required for live AI. It is separate from the provider API key.'});
 // Best-effort, per-instance throttling; NOT a distributed production spending control.
 const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0];
 const now=Date.now(),window=windows.get(ip)||{start:now,count:0};
 if(now-window.start>60000){window.start=now;window.count=0;}
 if(++window.count>30)return send(res,429,{error:'Please wait a minute before making more live AI requests.'});
 windows.set(ip,window);if(windows.size>1000)for(const [k,v]of windows)if(now-v.start>60000)windows.delete(k);
 let body=req.body;
 try{
  if(typeof body==='string')body=JSON.parse(body);
  if(!body||typeof body!=='object'||JSON.stringify(body).length>1500000)throw new Error('Invalid or oversized request.');
  prepare(body.mode,body.input||{});
 }catch(e){return send(res,400,{error:e.message});}
 try{
  const result=await callModel(body.mode,body.input);
  if(body.mode==='discovery'){
   const rows=validateExtraction(result.records,body.input.records);
   if(rows.length!==body.input.records.length)throw new Error('The model omitted evidence. This batch was not accepted.');
  }
  if(body.mode==='rank'){
   const known=new Set(body.input.photos.map(p=>p.id)),seen=new Set();
   if(!Array.isArray(result.matches))throw new Error('Invalid ranking response.');
   result.matches=result.matches.filter(m=>{if(!known.has(m.id)||seen.has(m.id))return false;seen.add(m.id);return typeof m.reason==='string';});
   if(!result.matches.length)throw new Error('No verified photo IDs returned.');
  }
  return send(res,200,{result,model:process.env.GEMINI_MODEL||'gemini-2.5-flash'});
 }catch(e){return send(res,e.status||502,{error:e.name==='TimeoutError'?'The model timed out. No success was recorded.':e.message});}
};
