'use strict';
module.exports=async function(req,res){
 const configured=!!process.env.GEMINI_API_KEY;
 const liveAllowed=configured&&(!process.env.VERCEL||!!process.env.REVIEWER_TOKEN||process.env.ALLOW_PUBLIC_AI==='true');
 res.setHeader('Cache-Control','no-store');
 res.statusCode=200;res.setHeader('Content-Type','application/json');
 res.end(JSON.stringify({configured,liveAllowed,requiresToken:!!process.env.REVIEWER_TOKEN,model:process.env.GEMINI_MODEL||'gemini-2.5-flash'}));
};
