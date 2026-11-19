import assert from 'node:assert/strict';
import {iconLayout} from '../site/desktop-icon-layout.js';
const ids=['computer','about','resume','contact','achievements','gallery'];
function verify(width,height,saved={}){
 const narrow=width<=700,w=narrow?82:110,h=narrow?98:112;
 const result=iconLayout(ids,saved,{width,height,narrow});
 const points=[...result.values()];
 for(const p of points)assert(p.x>=0&&p.y>=0&&p.x+w<=width&&p.y+h<=height,JSON.stringify({width,height,p}));
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){const a=points[i],b=points[j];assert(!(a.x<b.x+w&&a.x+w>b.x&&a.y<b.y+h&&a.y+h>b.y),JSON.stringify({width,height,a,b}));}
 return result;
}
for(const [w,h]of [[1440,970],[1280,690],[1024,570],[800,450],[390,814],[375,637],[844,360],[320,450],[320,270]])verify(w,h);
const saved={computer:{x:240,y:120},about:{x:400,y:200}};
assert.deepEqual(verify(1280,690,saved).get('computer'),saved.computer);
assert.deepEqual(verify(1280,690,saved).get('about'),saved.about);
verify(390,637,saved);assert.deepEqual(verify(1280,690,saved).get('computer'),saved.computer);
verify(1280,690,{computer:{x:29,y:31},about:{x:29,y:31},resume:{x:9999,y:9999}});
console.log('Passed 9 desktop/mobile sizes, manual-position retention, resize restoration, collisions and off-screen saved positions.');
