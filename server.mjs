// Optional loopback relay. No credentials are persisted or logged.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
const allowed=process.env.PLANNER_WEBHOOK_URL||'';
const port=Number(process.env.PORT||4320);
http.createServer(async(req,res)=>{
  const reply=(status,message)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:{message}}));};
  try{
    if(req.url==='/api/agent'){
      if(req.headers.host!==`127.0.0.1:${port}`||req.headers.origin!==`http://127.0.0.1:${port}`)return reply(403,'Only the local planner may use this relay.');
      if(req.method!=='POST')return reply(405,'POST required.');
      if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return reply(415,'JSON required.');
      let body='',size=0;for await(const chunk of req){size+=chunk.length;if(size>1048576)return reply(413,'Plan exceeds the 1 MB relay limit.');body+=chunk;}
      let data,target;try{data=JSON.parse(body);target=new URL(data.webhookUrl);}catch{return reply(400,'Invalid publishing request.');}
      if(!allowed)return reply(400,'Set PLANNER_WEBHOOK_URL when starting the relay, as described in README.md.');
      if(target.href!==new URL(allowed).href||target.protocol!=='https:'||target.username||target.password||target.hash)return reply(400,'Webhook must match the HTTPS URL approved when starting the relay.');
      if(typeof data.webhookKey!=='string'||!data.webhookKey.trim()||/[\r\n]/.test(data.webhookKey))return reply(400,'Add a valid webhook key in Settings.');
      if(typeof data.payload?.account!=='string'||!Array.isArray(data.payload.posts)||!data.payload.posts.length)return reply(400,'Invalid plan.');
      try{
        const upstream=await fetch(target,{method:'POST',headers:{Authorization:'Bearer '+data.webhookKey,'Content-Type':'application/json'},body:JSON.stringify(data.payload),redirect:'error',signal:AbortSignal.timeout(30000)});
        const text=await upstream.text();res.writeHead(upstream.status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(text);
      }catch{return reply(502,'Agent connection failed or timed out. Delivery is unconfirmed; check your agent before retrying.');}
      return;
    }
    if(!['GET','HEAD'].includes(req.method))return reply(405,'Method not allowed.');
    if(!['/','/planner.html'].includes(req.url))return reply(404,'Not found.');
    const page=await readFile(new URL('./planner.html',import.meta.url));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:page);
  }catch{return reply(500,'Local request failed.');}
}).listen(port,'127.0.0.1',()=>console.log(`Planner ready at http://127.0.0.1:${port}/planner.html`));
