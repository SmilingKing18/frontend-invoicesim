import React, { useState } from 'react';
import API from '../api';
import '../styles.css';

import quickIcon   from '../img/badges/quick.png';
import trustIcon   from '../img/badges/trust.png';
import riskIcon    from '../img/badges/risk.png';
import socialIcon  from '../img/badges/social.png';
import authIcon    from '../img/badges/auth.png';
import budgetIcon  from '../img/badges/budget.png';
import finalIcon   from '../img/badges/final.png';

export default function FinalQuestionnaire({ userId, sessionId, metrics = {} }) {
  const [data, setData] = useState({
    countdownText: '',
    q1: '',
    q2: '',
    q3: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Badge definitions
  const badgeDefinitions = [
    { key: 'quickPayer',        icon: quickIcon,   title: 'Quick Payer',       desc: 'Answered an invoice in under 10 seconds!' },
    { key: 'trustBuilder',      icon: trustIcon,   title: 'Trust Builder',      desc: 'Rated trust ≥ 4 on every email!' },
    { key: 'riskTaker',         icon: riskIcon,    title: 'Risk Taker',         desc: 'Chose “Wait” on 3 or more invoices!' },
    { key: 'socialConformist',  icon: socialIcon,  title: 'Social Conformist',  desc: 'Paid when peers did (social proof)!' },
    { key: 'authorityAdherent', icon: authIcon,    title: 'Authority Adherent',  desc: 'Paid at least one “loss aversion” invoice!' },
    { key: 'balancedBudgeter',  icon: budgetIcon,  title: 'Balanced Budgeter',  desc: 'Kept ≥25% of budget each week!' },
    { key: 'finalFrontier',     icon: finalIcon,   title: 'Final Frontier',     desc: 'Completed all 3 weeks + final quiz!' }
  ];

  const handleInput = key => e => {
    setData(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleFinish = async () => {
    try {
      await API.post('/final', { user: userId, sessionId, final: data });
    } catch (err) {
      console.error('Final post failed, proceeding anyway', err);
    }
    setSubmitted(true);
  };

  if (!submitted) {
    return (
      <div className="panel final-questionnaire">
        <h2>Final Thoughts</h2>

        <textarea
          placeholder="Would you have paid faster if the email had a countdown timer?"
          value={data.countdownText}
          onChange={handleInput('countdownText')}
        />

        <textarea
          placeholder="Would sender title (CEO vs assistant) change behavior?"
          value={data.q1}
          onChange={handleInput('q1')}
        />

        <textarea
          placeholder="Which email felt most persuasive and why?"
          value={data.q2}
          onChange={handleInput('q2')}
        />

        <textarea
          placeholder="Any additional comments?"
          value={data.q3}
          onChange={handleInput('q3')}
        />

        <button type="button" onClick={handleFinish}>
          Finish
        </button>
      </div>
    );
  }

  return (
    <div className="panel badge-screen">
      <h2>Thank you for playing!</h2>
      <p>We sincerely appreciate the time and thought you put into this experiment.</p>
      <p>Thanks again for your participation and valuable insights!</p>

      <div className="badge-grid">
        {badgeDefinitions
          .filter(b => metrics && metrics[b.key])
          .map((b, i) => (
            <div key={i} className="badge-card">
              <img src={b.icon} className="badge-icon" alt={b.title} />
              <strong>{b.title}</strong>
              <p>{b.desc}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
