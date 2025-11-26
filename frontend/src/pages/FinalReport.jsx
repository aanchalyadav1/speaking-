// src/pages/FinalReport.jsx
import React from 'react';

export default function FinalReport({ results }) {
  const total = results.length;
  const avgScore = results.length ? (results.reduce((s,r)=>s + (r.score||0),0) / results.length).toFixed(1) : 'N/A';

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(results,null,2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'speaking_test_results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{maxWidth:900, margin:'24px auto'}}>
      <div className="card" style={{padding:16}}>
        <h2>Final Report</h2>
        <div style={{marginTop:8}}>Tasks completed: <b>{total}</b></div>
        <div style={{marginTop:8}}>Average Score: <b>{avgScore}</b></div>

        <div style={{marginTop:12}}>
          <button onClick={exportJSON} style={{padding:'8px 12px'}}>Download JSON</button>
        </div>

        <div style={{marginTop:14}}>
          <pre style={{maxHeight:300, overflow:'auto'}}>{JSON.stringify(results, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
