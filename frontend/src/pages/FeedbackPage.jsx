// src/pages/FeedbackPage.jsx
import React from 'react';
import FeedbackCard from '../components/FeedbackCard.jsx';

export default function FeedbackPage({ feedback, onContinue, onRetake }) {
  return (
    <div style={{maxWidth:800, margin:'20px auto'}}>
      <div className="card" style={{padding:16}}>
        <h3>Task Feedback</h3>
        <FeedbackCard feedback={feedback} />
        <div style={{marginTop:12, display:'flex', gap:8}}>
          <button onClick={onContinue} style={{padding:'8px 12px'}}>Next Task</button>
          <button onClick={onRetake} style={{padding:'8px 12px'}}>Retake</button>
        </div>
      </div>
    </div>
  );
}
