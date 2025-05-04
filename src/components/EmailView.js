import React, { useState, useEffect } from 'react';
import API from '../api';
import Questionnaire from './Questionnaire';

// Company definitions
const COMPANIES = [
  { name: 'Acme Solutions, Inc.',    logo_url: '/static/img/acme-logo.png',     address: '123 Elm St, Metropolis, NY' },
  { name: 'Brightside Technologies', logo_url: '/static/img/brightside-logo.png', address: '456 Oak Ave, Sunnyvale, CA' },
  { name: 'Greenfield Co.',         logo_url: '/static/img/greenfield-logo.png',   address: '789 Pine Rd, Austin, TX' },
  { name: 'Nova Financial',         logo_url: '/static/img/nova-logo.png',         address: '321 Maple Blvd, Chicago, IL' },
];

// Behavioral principles templates: mild, firm, final
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

// Order and amounts
const PRINCIPLES_LIST = ['loss aversion', 'scarcity', 'social proof', 'urgency'];
const AMOUNTS = [700, 800, 900, 950];

export default function EmailView({
    userId,
    week,
    onPayment,
    onWeekComplete
  }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [responses, setResponses] = useState(
      COMPANIES.map(() => ({ choice: null, answered: false }))
    );
    const [stage, setStage] = useState('view');
    const [dueDateStr, setDueDateStr] = useState('');
  
    // On week change, reset everything
    useEffect(() => {
      setResponses(COMPANIES.map(() => ({ choice: null, answered: false })));
      setSelectedIndex(0);
      setStage('view');
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setDueDateStr(d.toLocaleDateString());
    }, [week]);
  
    const formatText = (template, vars) =>
      template
        .replace(/{name}/g, vars.name)
        .replace(/{invoice_id}/g, vars.invoice_id)
        .replace(/{amount}/g, vars.amount.toFixed(2))
        .replace(/{due_date}/g, vars.due_date)
        .replace(/{company}/g, vars.company);
  
    const handleChoice = async choice => {
      const principle = PRINCIPLES_LIST[selectedIndex];
      const amount = AMOUNTS[selectedIndex];
      const company = COMPANIES[selectedIndex];
      const invoiceId = `${week}-${selectedIndex + 1}`;
      const template = PRINCIPLES[principle][week - 1];
      const text = formatText(template, {
        name: 'Valued',
        invoice_id: invoiceId,
        amount,
        due_date: dueDateStr,
        company: company.name,
      });
  
      // **Deduct** if they paid
      if (choice === 'pay') {
        onPayment(amount);
      }
  
      await API.post('/email', {
        user: userId,
        week,
        emailIndex: selectedIndex,
        behaviorType: principle,
        amount,
        choice,
        timestamp: new Date(),
        emailText: text,
        companyLogo: company.logo_url,
        companyAddress: company.address,
      });
  
      // mark answered=false so questionnaire appears
      const copy = [...responses];
      copy[selectedIndex] = { choice, answered: false };
      setResponses(copy);
      setStage('question');
    };
  
    const handleQuestionnaire = async answers => {
      await API.post('/response', {
        user: userId,
        week,
        emailIndex: selectedIndex,
        questions: answers,
      });
  
      const copy = [...responses];
      copy[selectedIndex].answered = true;
      setResponses(copy);
      setStage('view');
  
      const nextUnanswered = copy.findIndex(r => !r.answered);
      if (nextUnanswered !== -1) {
        setSelectedIndex(nextUnanswered);
      } else {
        onWeekComplete();
      }
    };
  
    // prepare display
    const company = COMPANIES[selectedIndex];
    const principle = PRINCIPLES_LIST[selectedIndex];
    const amount = AMOUNTS[selectedIndex];
    const invoiceId = `${week}-${selectedIndex + 1}`;
    const rawTpl = PRINCIPLES[principle][week - 1];
    const emailText = formatText(rawTpl, {
      name: 'Valued',
      invoice_id: invoiceId,
      amount,
      due_date: dueDateStr,
      company: company.name,
    });
  
    return (
      <div className="panel email-panel split">
        <aside className="sidebar">
          {COMPANIES.map((c, i) => (
            <div
              key={i}
              className={`
                sidebar-item
                ${selectedIndex === i ? 'active' : ''}
                ${responses[i].answered ? 'answered' : ''}
              `}
              onClick={() => {
                if (!responses[i].answered) {
                  setSelectedIndex(i);
                  setStage('view');
                }
              }}
            >
              <img
                src={c.logo_url}
                alt=""
                className="sidebar-logo"
              />
              <div>Email {i + 1}</div>
            </div>
          ))}
        </aside>
  
        <section className="main-content">
          {stage === 'view' ? (
            <>
              <header className="email-header">
                <img
                  src={company.logo_url}
                  alt=""
                  className="company-logo"
                />
                <div>
                  <h3>{company.name}</h3>
                  <p>{company.address}</p>
                </div>
              </header>
  
              <article className="email-box">
                <pre>{emailText}</pre>
              </article>
  
              <div className="btn-row">
                <button onClick={() => handleChoice('pay')}>
                  Pay now
                </button>
                <button onClick={() => handleChoice('wait')}>
                  Wait a week
                </button>
              </div>
            </>
          ) : (
            <Questionnaire onSubmit={handleQuestionnaire} />
          )}
        </section>
      </div>
    );
  }