// src/components/FinalQuestionnaire.js
import React, { useState, useEffect } from 'react';
import API from '../api';
import '../styles.css';

import quickIcon   from '../img/badges/quick.png';
import trustIcon   from '../img/badges/trust.png';
import riskIcon    from '../img/badges/risk.png';
import socialIcon  from '../img/badges/social.png';
import authIcon    from '../img/badges/auth.png';
import budgetIcon  from '../img/badges/budget.png';
import finalIcon   from '../img/badges/final.png';

export default function FinalQuestionnaire({ userId, sessionId, metrics }) {
  const [data, setData] = useState({
    countdownText: '',
    q1: '',
    q2: '',
    q3: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [badges, setBadges] = useState([]);

  // Compute badges once submitted
  useEffect(() => {
    if (!submitted) return;
    (async () => {
      const { data: { emailRecords, responses } } = await API.get(`/user/${userId}/data`);
      const qp = emailRecords.some(r => r.responseTime < 10000);
      const tb = responses.every(r => r.questions[3] >= 4);
      const rt = emailRecords.filter(r => r.choice === 'wait').length >= 3;
      const sc = emailRecords.some(r => r.behaviorType === 'social proof' && r.choice === 'pay');
      // Authority Adherent: paid at least one 'loss aversion' invoice
      const aa = emailRecords.some(r => r.behaviorType === 'loss aversion' && r.choice === 'pay');
      // Balanced Budgeter: ended each week with ≥25% of budget left
      const weeklyBudgets = [1000, 1000, 1000];
      emailRecords.forEach(r => {
        if (r.choice === 'pay') {
          weeklyBudgets[r.week - 1] -= r.amount;
        }
      });
      // add the 1000 rollover per week
      let carry = 1000;
      const budgets = weeklyBudgets.map((spent, i) => {
        const end = carry - spent;
        carry = end + (i < 2 ? 1000 : 0);
        return end;
      });
      const bb = budgets.every(b => b >= 250);
      // Final Frontier: completed all 3 weeks + final quiz
      const ff = true;

      setBadges([
        { earned: qp, icon: quickIcon,  title: 'Quick Payer',       desc: 'You answered an invoice in under 10 seconds!' },
        { earned: tb, icon: trustIcon,  title: 'Trust Builder',     desc: 'You rated trust ≥ 4 on every email!' },
        { earned: rt, icon: riskIcon,   title: 'Risk Taker',        desc: 'You chose “Wait” 3 or more times!' },
        { earned: sc, icon: socialIcon, title: 'Social Conformist', desc: 'You paid when peers did (social proof)!' },
        { earned: aa, icon: authIcon,   title: 'Authority Adherent', desc: 'You paid all CEO-signed invoices!' },
        { earned: bb, icon: budgetIcon, title: 'Balanced Budgeter', desc: 'You kept a healthy budget all weeks!' },
        { earned: ff, icon: finalIcon,  title: 'Final Frontier',    desc: 'You completed all 3 weeks + questionnaire!' }
      ]);
    })();
  }, [submitted]);

  const handleInput = key => e =>
    setData(d => ({ ...d, [key]: e.target.value }));

  const submit = async () => {
    console.log('🔔 Final submit triggered:', data);
    try {
      await API.post('/final', { user: userId, sessionId, final: data });
    } catch (err) {
      console.error('Final post failed, still proceeding', err);
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

        <button
          type="button"
          onClick={submit}
        >
          Finish
        </button>
      </div>
    );
  }

  return (
    <div className="panel badge-screen">
      <h2>Thank you for playing!</h2>
      <p>
        We sincerely appreciate the time and thought you put into this
        experiment. Your feedback will help us understand how different
        invoice messages influence payment behavior.
      </p>
      <p>
        Thanks again for your participation and valuable insights!
      </p>

      <div className="badge-grid">
        {badges.filter(b => b.earned).map((b,i) => (
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

