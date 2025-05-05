// src/components/ProgressBar.js
import React from 'react';
import '../styles.css';

export default function ProgressBar({ week, emailIndex }) {
  // weeks: 1–3, emails per week: 0–3
  const totalWeeks = 3;
  const totalEmails = 4;
  
  const weekPercent = (week - 1) / (totalWeeks - 1) * 100;
  const emailPercent = (emailIndex) / (totalEmails - 1) * 100;
  
  return (
    <div className="progress-container">
      <div className="label">Week {week} of {totalWeeks}</div>
      <div className="progress-track">
        <div
          className="progress-bar week-bar"
          style={{ width: `${weekPercent}%` }}
        />
      </div>
      <div className="label small">Email {emailIndex + 1} of {totalEmails}</div>
      <div className="progress-track">
        <div
          className="progress-bar email-bar"
          style={{ width: `${emailPercent}%` }}
        />
      </div>
    </div>
  );
}
