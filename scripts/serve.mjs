import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
const port=4173;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    if(!(await stat(file)).isFile()){res.writeHead(404);res.end();return;}
    const bytes=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(bytes);
  }catch{res.writeHead(404);res.end('Not found');}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'4173 端口已占用。如果拾光英语已启动，请访问 http://127.0.0.1:4173；否则请关闭占用此端口的程序后重试。':error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{console.log('\n拾光英语已启动：http://127.0.0.1:4173\n关闭此窗口或按 Ctrl+C 可停止服务。\n');if(process.argv.includes('--open')&&process.platform==='darwin')spawn('open',['http://127.0.0.1:4173'],{stdio:'ignore'});});
