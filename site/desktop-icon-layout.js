// Responsive placement is transient. Only deliberate icon drags are persisted.
export function iconLayout(ids,saved,{width,height,narrow}){
 const w=narrow?82:110,h=narrow?98:112,left=narrow?12:29,top=narrow?15:31;
 const dx=w+12,dy=narrow?106:130;
 const rows=Math.max(1,Math.floor((height-top-h)/dy)+1);
 const columns=Math.max(1,Math.floor((width-left-w)/dx)+1);
 const placed=new Map(),occupied=[];
 const intersects=p=>occupied.some(q=>p.x<q.x+w&&p.x+w>q.x&&p.y<q.y+h&&p.y+h>q.y);
 const accept=(id,p)=>{placed.set(id,p);occupied.push(p);};
 // Reserve valid manual positions first so default shortcuts flow around them.
 for(const id of ids){const p=saved[id];if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x+w<=width&&p.y+h<=height&&!intersects(p))accept(id,{x:p.x,y:p.y});}
 for(const id of ids){
  if(placed.has(id))continue;
  let candidate;
  for(let i=0;i<rows*columns;i++){
   const p={x:Math.min(Math.max(0,width-w),left+Math.floor(i/rows)*dx),y:Math.min(Math.max(0,height-h),top+(i%rows)*dy)};
   if(!intersects(p)){candidate=p;break;}
  }
  // Manual positions can straddle grid cells. Search the remaining free space.
  if(!candidate)outer:for(let x=0;x+w<=width;x+=4)for(let y=0;y+h<=height;y+=4){const p={x,y};if(!intersects(p)){candidate=p;break outer;}}
  // Extremely small viewports may have less room than the icon hit areas.
  if(!candidate)candidate={x:left+Math.floor(placed.size/rows)*dx,y:Math.max(0,Math.min(height-h,top+(placed.size%rows)*dy))};
  accept(id,candidate);
 }
 return placed;
}
