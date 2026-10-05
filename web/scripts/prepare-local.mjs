import {writeFileSync,existsSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
// Local-only development secrets. Never overwrite an existing configuration.
if(!existsSync('.env.local'))writeFileSync('.env.local',`DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55437/postgres\nLOCAL_CATALOG_PREVIEW=1\nPAYMENT_PROVIDER=MOCK\nENABLE_MOCK_PAYMENTS=true\nADMIN_SESSION_SECRET=${randomBytes(32).toString('hex')}\nADMIN_PASSWORD=${randomBytes(16).toString('base64url')}\nPAYMENT_WEBHOOK_SECRET=${randomBytes(32).toString('hex')}\n`,{mode:0o600});
console.log('Local-only configuration ready; secrets not printed.');
