// src/components/CircularTimer.jsx
import React, { useEffect, useState } from 'react';

export default function CircularTimer({ duration = 30, isActive = false, onExpire = ()=>{}, size=72, stroke=6 }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(()=> setTimeLeft(duration), [duration]);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id);
          onExpire();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isActive, onExpire]);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (timeLeft / duration) * circumference;

  return (
    <div style={{display:'inline-flex', alignItems:'center', gap:10}}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <g transform={`translate(${size/2},${size/2})`}>
          <circle r={radius} stroke="#0b1220" strokeWidth={stroke} fill="transparent" />
          <circle
            r={radius}
            stroke="url(#g1)"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            transform="rotate(-90)"
          />
        </g>
      </svg>
      <div style={{textAlign:'left'}}>
        <div style={{fontSize:14,fontWeight:700}}>{timeLeft}s</div>
        <div style={{fontSize:12,color:'#94a3b8'}}>{Math.round((timeLeft/duration)*100)}%</div>
      </div>
    </div>
  );
}
