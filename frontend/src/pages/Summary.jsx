import React from 'react';
export default function Summary({ final }) {
  if (!final) return null;
  return (
    <div className="card">
      <h2>Final Results</h2>
      <p>Average Band: {final.avg_band} / 9</p>
      <p>Percentage: {final.percentage}%</p>
      <p>Descriptor: {final.descriptor}</p>
    </div>
  );
}