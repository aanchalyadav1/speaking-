// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';

export default function AdminDashboard({ auth }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchList(); }, []);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/results`, {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
      const data = await res.json();
      setItems(data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load admin data');
    }
    setLoading(false);
  }

  return (
    <div style={{maxWidth:1100, margin:'20px auto'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <h2>Admin Results</h2>
        <button onClick={fetchList} style={{padding:'8px 12px'}}>Refresh</button>
      </div>

      <div style={{display:'grid', gap:10}}>
        {loading && <div>Loading...</div>}
        {items.map((it, idx) => (
          <div key={it.id || idx} className="card" style={{padding:12}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:14, fontWeight:700}}>{it.user?.email || it.user?.name || 'Unknown'}</div>
                <div style={{fontSize:12, color:'#94a3b8'}}>Task {it.taskIndex} • {new Date(it.createdAt||it.ts||Date.now()).toLocaleString()}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:14}}>Score: <b>{it.score ?? 'N/A'}</b></div>
                <a href={it.audioUrl} target="_blank" rel="noreferrer" style={{fontSize:12, color:'#06b6d4'}}>Play audio</a>
              </div>
            </div>

            {it.feedback && <pre style={{marginTop:10, maxHeight:120, overflow:'auto'}}>{JSON.stringify(it.feedback,null,2)}</pre>}
          </div>
        ))}
      </div>
    </div>
  );
}
