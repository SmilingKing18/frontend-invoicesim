/// src/components/EmailView.js
import React, { useState, useEffect, useMemo } from 'react';
import API from '../api';
import Questionnaire from './Questionnaire';
import '../styles.css';

// Logos
import acmeLogo        from '../img/businesslogo.png';
import brightsideLogo  from '../img/corplogo.png';
import greenfieldLogo  from '../img/globalcorp.png';
import novaLogo        from '../img/xcorplogo.png';

// Fisher–Yates shuffle helper
function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


// 1) Company list
const COMPANIES = [
    { name: 'Acme Solutions, Inc.',    logo_url: acmeLogo,       address: '123 Elm St, Metropolis, NY' },
    { name: 'Brightside Technologies', logo_url: brightsideLogo,  address: '456 Oak Ave, Sunnyvale, CA' },
    { name: 'Greenfield Co.',          logo_url: greenfieldLogo,  address: '789 Pine Rd, Austin, TX' },
    { name: 'Nova Financial',          logo_url: novaLogo,        address: '321 Maple Blvd, Chicago, IL' },
  ];
  
// 2) Behavioral templates (mild / firm / final)
const PRINCIPLES = {
  'loss aversion': [
    `Dear {name} Customer,\n\nPlease find attached invoice #{invoice_id} for €{amount}, due on {due_date}.\n\nWe kindly remind you that settling this amount by the due date will help you avoid any late fees. Timely payments ensure uninterrupted service and protect your credit standing.\n\nIf you need any assistance or wish to discuss payment options, please reach out at your earliest convenience.\n\nBest regards,\n{company} Billing Team`,
    `Dear {name} Customer,\n\nThis is a reminder that invoice #{invoice_id} for €{amount}, due on {due_date}, has not yet been paid.\n\nPlease note that a late fee of 5% will be applied if payment is not received within 48 hours. To prevent any additional charges, we urge you to remit payment promptly.\n\nWe appreciate your prompt attention to this matter and are available to help if you encounter any issues.\n\nSincerely,\n{company} Billing Team`,
    `Dear {name} Customer,\n\nFINAL NOTICE: Invoice #{invoice_id} for €{amount}, originally due on {due_date}, remains outstanding.\n\nImmediate payment is required to avoid suspension of your account and referral to collections. Please make payment today to prevent further action.\n\nThank you for your urgent attention.\n\nRegards,\n{company} Billing Team`
  ],
  'scarcity': [
    `Dear {name} Customer,\n\nYour invoice #{invoice_id} for €{amount}, due on {due_date}, is ready for payment.\n\nAs a token of appreciation, we’re offering a 2% early-payment discount for those who settle within 5 days. This limited-time offer helps you save and supports our operations.\n\nDon’t miss out—take advantage of this benefit by paying early.\n\nWarm regards,\n{company} Billing Team`,
    `Dear {name} Customer,\n\nInvoice #{invoice_id} for €{amount} is due on {due_date}.\n\nOnly 10 spots remain for our early-bird discount—act quickly to secure your savings. Once those spots are gone, the standard amount applies.\n\nWe value your business and encourage you to pay now to enjoy this exclusive rate.\n\nBest,\n{company} Billing Team`,
    `Dear {name} Customer,\n\nURGENT: Invoice #{invoice_id} for €{amount}, due on {due_date}, is pending.\n\nThis is your last chance to qualify for our 2% early-payment discount. After today, that opportunity expires and late fees will apply.\n\nPlease remit payment immediately to lock in your savings.\n\nThank you,\n{company} Billing Team`
  ],
  'social proof': [
    `Dear {name} Customer,\n\nInvoice #{invoice_id} for €{amount} is due on {due_date}.\n\nAlready, over 60% of our clients have paid on time—join them to keep your account in good standing. Early payments help us serve you and your peers better.\n\nWe appreciate your timely action.\n\nCheers,\n{company} Billing Team`,
    `Dear {name} Customer,\n\nYour invoice #{invoice_id} for €{amount}, due on {due_date}, is outstanding.\n\nLast week, 80% of customers in your region settled their bills promptly. To maintain that community standard, please pay yours today.\n\nThank you for being part of our valued customer network.\n\nRegards,\n{company} Billing Team`,
    `Dear {name} Customer,\n\nFINAL REMINDER: Invoice #{invoice_id} for €{amount}, due on {due_date}, remains unpaid.\n\nNearly 95% of your peers have already completed their payments—don’t be left behind. Please pay immediately to align with the majority and avoid late fees.\n\nSincerely,\n{company} Billing Team`
  ],
  'urgency': [
    `Dear {name} Customer,\n\nInvoice #{invoice_id} for €{amount} is due on {due_date}.\n\nWe encourage you to pay as soon as possible to keep everything on schedule. Prompt action ensures no disruption to your service.\n\nFeel free to contact us if you need extra time.\n\nAll the best,\n{company} Billing Team`,
    `Dear {name} Customer,\n\nYour invoice #{invoice_id} for €{amount}, due on {due_date}, needs your attention.\n\nA late fee will be added if payment is not received within 2 days. Please act now to prevent extra charges.\n\nWe’re here to help if you require assistance.\n\nThank you,\n{company} Billing Team`,
    `Dear {name} Customer,\n\nFINAL ALERT: Invoice #{invoice_id} for €{amount}, originally due {due_date}, is now severely overdue.\n\nImmediate payment is mandatory to avoid service interruption and further penalties. Please settle your account within 24 hours.\n\nThank you for your prompt action.\n\nBest regards,\n{company} Billing Team`
  ]
};

// 3) Order of principles for invoice slots
const PRINCIPLES_LIST = [
  'loss aversion',
  'scarcity',
  'social proof',
  'urgency'
];

// 4) AMOUNTS matrix: ensures only 2–3 can be paid per week
const AMOUNTS = [
  [200, 250, 300, 350],   // Week 1
  [300, 350, 400, 500],   // Week 2
  [400, 500, 600, 800]    // Week 3
];


export default function EmailView({ userId, week, budget, onPayment, onWeekComplete }) {
  // Randomize slot order once per mount
  const order = useMemo(() => shuffle([0,1,2,3]), []);

  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState('view'); // 'view' or 'question'
  const [dueDate, setDueDate] = useState('');
  const [answered, setAnswered] = useState(() => order.map(() => false));

  // Reset on week change
  useEffect(() => {
    setIdx(0);
    setStage('view');
    setAnswered(order.map(() => false));
    const dt = new Date(); dt.setDate(dt.getDate()+7);
    setDueDate(dt.toLocaleDateString());
  }, [week, order]);

  // Weekly progress percent
  const weekPercent = (week / 3) * 100;

  // Format template text
  const formatText = (tpl, vars) =>
    tpl.replace(/\{name\}/g, vars.name)
       .replace(/\{invoice_id\}/g, vars.invoice_id)
       .replace(/\{amount\}/g, vars.amount.toFixed(2))
       .replace(/\{due_date\}/g, vars.due_date)
       .replace(/\{company\}/g, vars.company);

  // Handle Pay/Wait choice
  const handleChoice = async choice => {
    const slot      = order[idx];
    const comp      = COMPANIES[slot];
    const principle = PRINCIPLES_LIST[slot];
    const amt       = AMOUNTS[week-1][slot];
    const invoiceId = `${week}-${idx+1}`;
    const tpl       = PRINCIPLES[principle][week-1];
    const emailText = formatText(tpl, {
      name: 'Valued', invoice_id: invoiceId,
      amount: amt, due_date: dueDate,
      company: comp.name
    });

    if (choice === 'pay') onPayment(amt);
    setStage('question');

    try {
      await API.post('/email', {
        user: userId,
        week,
        emailIndex: idx,
        behaviorType: principle,
        amount: amt,
        choice,
        timestamp: new Date(),
        emailText,
        companyLogo: comp.logo_url,
        companyAddress: comp.address
      });
    } catch (err) {
      console.error('Email post failed', err);
    }
  };

  // Handle questionnaire submission
  const handleQuestionnaire = async answers => {
    try {
      await API.post('/response', {
        user: userId,
        week,
        emailIndex: idx,
        questions: answers
      });
    } catch (err) {
      console.error('Response post failed', err);
    }

    setAnswered(prev => {
      const copy = [...prev];
      copy[idx] = true;
      return copy;
    });

    if (idx < order.length - 1) {
      setIdx(idx + 1);
      setStage('view');
    } else {
      onWeekComplete();
    }
  };

  // Derive current email
  const slot      = order[idx];
  const comp      = COMPANIES[slot];
  const principle = PRINCIPLES_LIST[slot];
  const amt       = AMOUNTS[week-1][slot];
  const rawTpl    = PRINCIPLES[principle][week-1];
  const emailText = formatText(rawTpl, {
    name: 'Valued', invoice_id: `${week}-${idx+1}`,
    amount: amt, due_date: dueDate,
    company: comp.name
  });

  return (
    <div className="panel email-panel split">
      <aside className="sidebar">
        {order.map((slotIdx, i) => (
          <div
            key={i}
            className={`sidebar-item ${i===idx?'active':''} ${answered[i]?'answered':''}`}
            onClick={() => stage==='view' && !answered[i] && setIdx(i)}
          >
            <img
              src={COMPANIES[slotIdx].logo_url}
              className="sidebar-logo"
              alt={COMPANIES[slotIdx].name}
            />
            <div>Email {i+1}</div>
          </div>
        ))}
      </aside>
      <section className="main-content">
        {/* Weekly progress bar */}
        <div className="progress-container">
          <div className="label">Week {week} of 3</div>
          <div className="progress-track">
            <div
              className="progress-bar week-bar"
              style={{ width: `${weekPercent}%` }}
            />
          </div>
        </div>

        {stage==='view' ? (
          <>
            <header className="email-header">
              <img
                src={comp.logo_url}
                className="company-logo"
                alt={comp.name}
              />
              <div>
                <h3>{comp.name}</h3>
                <p>{comp.address}</p>
              </div>
            </header>
            <article className="email-box"><pre>{emailText}</pre></article>
            {!answered[idx] ? (
              <div className="btn-row">
                <button onClick={()=>handleChoice('pay')} disabled={amt>budget}>Pay now</button>
                <button onClick={()=>handleChoice('wait')}>Wait a week</button>
              </div>
            ) : (
              <div className="answered-note">You have already answered this invoice.</div>
            )}
          </>
        ) : (
          <Questionnaire onSubmit={handleQuestionnaire} />
        )}
      </section>
    </div>
  );
}
