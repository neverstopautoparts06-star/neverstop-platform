import net from 'node:net';
import {spawn} from 'node:child_process';
const children=[];
const listening=port=>new Promise(resolve=>{const s=net.connect({host:'127.0.0.1',port});s.once('connect',()=>{s.destroy();resolve(true);});s.once('error',()=>resolve(false));});
function launch(args){const child=spawn(process.execPath,args,{stdio:'inherit',env:{...process.env,WATCHPACK_POLLING:'true'}});children.push(child);return child;}
if(!await listening(55437)){
 const db=launch(['scripts/local-db.mjs']);
 for(let i=0;i<100&&!await listening(55437);i++){if(db.exitCode!==null)throw new Error('Local database failed to start');await new Promise(r=>setTimeout(r,100));}
 if(!await listening(55437))throw new Error('Local database did not become ready');
}
if(await listening(3006)){console.log('NEVERSTOP preview is already running: http://127.0.0.1:3006/zh');}
else {const web=launch(['node_modules/next/dist/bin/next','dev','--webpack','--hostname','127.0.0.1','--port','3006']);web.on('exit',()=>{for(const c of children)if(c!==web)c.kill('SIGINT');});}
function stop(){for(const c of children)c.kill('SIGINT');}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
