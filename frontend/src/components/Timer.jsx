import React, { useEffect, useState } from 'react';
export default function Timer({ start, duration, onExpire }){
  const [t, setT] = useState(duration);
  useEffect(()=>{ if(!start) return; setT(duration); const id=setInterval(()=>{ setT(s=>{ if(s<=1){ clearInterval(id); onExpire(); return 0 } return s-1 }); },1000); return ()=>clearInterval(id); },[start]);
  return <div style={{fontSize:18,fontWeight:600}}>{t}s</div>
}