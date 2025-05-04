// src/components/FinalQuestionnaire.js
import React, { useState } from 'react';
import API from '../api';

export default function FinalQuestionnaire({ userId }) {
  const [data, setData] = useState({ q1: '', q2: '', q3: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await API.post('/final', { user: userId, final: data });
    } catch (error) {
      console.error('Error submitting final responses:', error);
    } finally {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="panel thank-you">
        <h2>Thank you for playing!</h2>
        <p>
          We sincerely appreciate the time and thought you put into this
          experiment. Your feedback will help us understand how different
          invoice messages influence payment behavior.
        </p>
        <p>
          Thanks again for your participation and valuable insights!
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
      <button onClick={handleSubmit}>
        Finish
      </button>
    </div>
  );
}
