// src/components/FeedbackCard.jsx
import React from 'react';

export default function FeedbackCard({ feedback }) {
  if (!feedback) return null;
  // feedback expected shape: { fluency, grammar, pronunciation, coherence, score, notes }
  return (
    <div className="card" style={{padding:12}}>
      <h4 style={{margin:0}}>AI Feedback</h4>
      <div style={{marginTop:8, fontSize:13, color:'#cbd5e1'}}>Overall Score: <strong>{feedback.score ?? 'N/A'}</strong></div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:10}}>
        <div style={{fontSize:13}}>Fluency: <b>{feedback.fluency ?? '-'}</b></div>
        <div style={{fontSize:13}}>Pronunciation: <b>{feedback.pronunciation ?? '-'}</b></div>
        <div style={{fontSize:13}}>Grammar: <b>{feedback.grammar ?? '-'}</b></div>
        <div style={{fontSize:13}}>Coherence: <b>{feedback.coherence ?? '-'}</b></div>
      </div>

      {feedback.notes && <div style={{marginTop:10, fontSize:13}}><strong>Notes:</strong><div style={{marginTop:6, color:'#9aa4b2'}}>{feedback.notes}</div></div>}
    </div>
  );
}
