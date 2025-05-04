// src/components/FinalQuestionnaire.js
import React, { useState } from 'react';
import API from '../api';

export default function FinalQuestionnaire({ userId }) {
  const [data, setData] = useState({ q1:'', q2:'', q3:'' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    // Send final responses
    await API.post('/final', { user: userId, final: data });
    // Show thank-you screen
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="panel thank-you">
        <h2>Thank you for playing!</h2>
        <p>
          We appreciate the time and thought you invested in this experiment.
          Your responses will provide invaluable insights into how different
          invoice messaging strategies influence payment behavior.
        </p>
        <p>
          Thank you again for participating—your contribution is truly
          appreciated!
        </p>
      </div>
    );
  }

  return (
    <div className="panel final-questionnaire">
      <h2>Final Thoughts</h2>
      <textarea
        placeholder="Would sender title (CEO vs assistant) change behavior?"
        value={data.q1}
        onChange={e => handleChange('q1', e.target.value)}
      />
      <textarea
        placeholder="Which email felt most persuasive and why?"
        value={data.q2}
        onChange={e => handleChange('q2', e.target.value)}
      />
      <textarea
        placeholder="Any additional comments?"
        value={data.q3}
        onChange={e => handleChange('q3', e.target.value)}
      />
      <button onClick={submit}>
        Finish
      </button>
    </div>
  );
}
