// src/components/FinalQuestionnaire.js
import React, { useState, useEffect } from 'react';
import API from '../api';
import '../styles.css';

// Badge icons
import quickIcon   from '../img/badges/quick.png';
import trustIcon   from '../img/badges/trust.png';
import riskIcon    from '../img/badges/risk.png';
import socialIcon  from '../img/badges/social.png';
import authIcon    from '../img/badges/auth.png';
import budgetIcon  from '../img/badges/budget.png';
import finalIcon   from '../img/badges/final.png';

export default function FinalQuestionnaire({ userId, sessionId }) {
  const [data, setData] = useState({
    countdownText: '',
    q1: '',
    q2: '',
    q3: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [badges, setBadges] = useState([]);

  // Badge definitions
  const badgeDefinitions = [
    { key: 'quickPayer',        icon: quickIcon,   title: 'Quick Payer',       desc: 'Answered an invoice in under 10 seconds!' },
    { key: 'trustBuilder',      icon: trustIcon,   title: 'Trust Builder',      desc: 'Rated trust ≥ 4 on every email!' },
    { key: 'riskTaker',         icon: riskIcon,    title: 'Risk Taker',         desc: 'Chose “Wait” on 3 or more invoices!' },
    { key: 'socialConformist',  icon: socialIcon,  title: 'Social Conformist',  desc: 'Paid when peers did (social proof)!' },
    { key: 'authorityAdherent', icon: authIcon,    title: 'Authority Adherent',  desc: 'Paid at least one “loss aversion” invoice!' },
    { key: 'balancedBudgeter',  icon: budgetIcon,  title: 'Balanced Budgeter',  desc: 'Kept at least 25% of budget each week!' },
    { key: 'finalFrontier',     icon: finalIcon,   title: 'Final Frontier',     desc: 'Completed all 3 weeks + final quiz!' }
  ];

  // Update text inputs
  const handleInput = key => e => setData(prev => ({ ...prev, [key]: e.target.value }));

  // Submit final questionnaire
  const handleFinish = async () => {
    try {
      await API.post('/final', { user: userId, sessionId, final: data, awards: metrics });
    } catch (err) {
      console.error('Final post failed, proceeding', err);
    }
    setSubmitted(true);
  };

  // Compute badges after submission
  useEffect(() => {
    if (!submitted) return;
    const fetchBadges = async () => {
      try {
        const res = await API.get(`/user/${userId}/data`);
        const { emailRecords, responses } = res.data;

        const qp = emailRecords.some(r => r.responseTime < 10000);
        const tb = responses.every(r => Array.isArray(r.questions) && r.questions[3] >= 4);
        const rt = emailRecords.filter(r => r.choice === 'wait').length >= 3;
        const sc = emailRecords.some(r => r.behaviorType === 'social proof' && r.choice === 'pay');
        const aa = emailRecords.some(r => r.behaviorType === 'loss aversion' && r.choice === 'pay');

        const weekly = [1000, 1000, 1000];
        emailRecords.forEach(r => {
          if (r.choice === 'pay' && typeof r.week === 'number') {
            weekly[r.week - 1] -= r.amount;
          }
        });
        let carry = 1000;
        const ends = weekly.map((spent, i) => {
          const end = carry - spent;
          carry = end + (i < 2 ? 1000 : 0);
          return end;
        });
        const bb = ends.every(e => e >= 250);
        const ff = true;

        // Map computed flags to badge keys
        const metrics = {
          quickPayer:        qp,
          trustBuilder:      tb,
          riskTaker:         rt,
          socialConformist:  sc,
          authorityAdherent: aa,
          balancedBudgeter:  bb,
          finalFrontier:     ff
        };
        const earned = badgeDefinitions.filter(b => metrics[b.key] || metrics[b.key === 'finalFrontier' ? 'ff' : b.key]);
        setMetrics(metricsObj); 
        setBadges(earned);
      } catch (err) {
        console.error('Badge compute failed', err);
        setBadges(badgeDefinitions.filter(b => b.key === 'finalFrontier'));
      }
    };
    fetchBadges();
  }, [submitted, userId]);

  if (!submitted) {
    return (
      <div className="panel final-questionnaire">
        <h2>Final Thoughts</h2>
        <textarea placeholder="Would you have paid faster if the email had a countdown timer?" value={data.countdownText} onChange={handleInput('countdownText')} />
        <textarea placeholder="Would sender title (CEO vs assistant) change behavior?" value={data.q1} onChange={handleInput('q1')} />
        <textarea placeholder="Which email felt most persuasive and why?" value={data.q2} onChange={handleInput('q2')} />
        <textarea placeholder="Any additional comments?" value={data.q3} onChange={handleInput('q3')} />
        <button type="button" onClick={handleFinish}>Finish</button>
      </div>
    );
  }

  return (
    <div className="panel badge-screen">
      <div className="thankyou-box">
        <h2>Thank you for playing!</h2>
        <p>We sincerely appreciate the time and thought you put into this experiment.</p>
        <p>Thanks again for your participation and valuable insights!</p>
      </div>
      <div className="awards-box">
        <h3>Awards Won!</h3>
        <div className="badge-grid horizontal">
          {badges.length > 0 ? (
            badges.map((b, i) => (
              <div key={i} className="badge-card">
                {b.icon && <img src={b.icon} className="badge-icon" alt={b.title} />}
                <strong>{b.title}</strong>
                <p>{b.desc}</p>
              </div>
            ))
          ) : (
            <p>No awards earned this time.</p>
          )}
        </div>
      </div>
    </div>
  );
}
