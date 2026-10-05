import {PGlite} from '@electric-sql/pglite';
import {PGLiteSocketServer} from '@electric-sql/pglite-socket';
if(process.env.NODE_ENV==='production')throw new Error('Local development only');
const db=await PGlite.create(process.env.LOCAL_DB_DIR||'./.local-commerce-db');
const server=new PGLiteSocketServer({db,host:'127.0.0.1',port:55437,maxConnections:64});await server.start();console.log('Local development database ready.');
process.on('SIGINT',async()=>{await server.stop();await db.close();process.exit(0);});
