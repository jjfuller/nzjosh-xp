import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../site/',import.meta.url));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.pdf':'application/pdf','.wav':'audio/wav','.mp3':'audio/mpeg'};
export const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(path.relative(root,file).startsWith('..')||!(await stat(file)).isFile())throw Error();const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};res.writeHead(200,headers);res.end(await readFile(file));}catch{res.writeHead(404);res.end('Not found');}});
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4173);
 if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT must be 1 to 65535');
 server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is in use. Stop the other preview or choose PORT.`:error.message);process.exitCode=1;});
 server.listen(port,'127.0.0.1',()=>console.log(`NZJOSH preview: http://127.0.0.1:${port}/`));
}
