import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const partsDir='frontend_parts';
const b64=readdirSync(partsDir).filter(f=>f.endsWith('.b64')).sort().map(f=>readFileSync(`${partsDir}/${f}`,'utf8')).join('');
writeFileSync('frontend.tgz',Buffer.from(b64,'base64'));
mkdirSync('public',{recursive:true});
execFileSync('tar',['-xzf','frontend.tgz','-C','public'],{stdio:'inherit'});
console.log('QC_V831_FULL_VISUAL_BUILD_READY');
