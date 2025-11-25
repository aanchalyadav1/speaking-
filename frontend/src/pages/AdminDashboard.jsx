import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard({ auth }){
  const [rows,setRows]=useState([]);
  useEffect(()=>{
    if(!auth) return;
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin/tests`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    }).then(r=>setRows(r.data)).catch(e=>console.error(e));
  },[auth]);

  return (
    <div>
      <h2>Admin — Recent Tests</h2>
      <div style={{display:'grid', gap:10}}>
        {rows.map(r=>(
          <div key={r.id} className="card" style={{padding:12}}>
            <div>User: {r.user_id} • Score: {r.overall}</div>
            <details><summary>Transcript & Analysis</summary><pre>{r.transcript}</pre><pre>{JSON.stringify(r.analysis,null,2)}</pre></details>
            {r.audio_url && <a href={r.audio_url} target="_blank" rel="noreferrer">Play audio</a>}
          </div>
        ))}
      </div>
    </div>
  );
}