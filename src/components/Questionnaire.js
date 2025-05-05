// src/components/Questionnaire.js
import React, { useState } from 'react';
import '../styles.css';

export default function Questionnaire({ onSubmit }) {
  // Questions to ask after each email
  const questions = [
    { key: 'urgency',    label: 'How urgent did you feel this email was?' },
    { key: 'arousal',    label: 'How emotionally arousing was the message?' },
    { key: 'persuasion', label: 'How persuasive was the email?' },
    { key: 'trust',      label: 'How much did you trust the sender?' }
  ];

  // Initialize each to 1
  const [answers, setAnswers] = useState(
    questions.reduce((acc, q) => ({ ...acc, [q.key]: 1 }), {})
  );

  const handleSelect = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Convert answers object to array in question order
    const result = questions.map(q => answers[q.key]);
    onSubmit(result);
  };

  return (
    <form className="panel questionnaire" onSubmit={handleSubmit}>
      <h2>Rate this email</h2>
      {questions.map(q => (
        <div key={q.key} className="q-row">
          <p>{q.label}</p>
          <div className="scale">
            {[1,2,3,4,5].map(n => (
              <span
                key={n}
                className={answers[q.key] === n ? 'dot selected' : 'dot'}
                onClick={() => handleSelect(q.key, n)}
              >{n}</span>
            ))}
          </div>
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}
