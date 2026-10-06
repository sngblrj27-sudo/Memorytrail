'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'public');
const handlers={'/api/ai':require('./api/ai'),'/api/health':require('./api/health')};
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer(async(req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Invalid URL');}
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 if(handlers[pathname]){
  let body='',oversized=false;
  for await(const chunk of req){body+=chunk;if(body.length>1500000){oversized=true;break;}}
  if(oversized){res.writeHead(413);return res.end('Request too large');}
  req.body=body;
  return handlers[pathname](req,res);
 }
 if(req.method!=='GET'){res.writeHead(405);return res.end('Method not allowed');}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end('Not found');}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);});
});
const port=Number(process.env.PORT||3000);server.listen(port,'127.0.0.1',()=>console.log('MemoryTrail: http://127.0.0.1:'+port));
