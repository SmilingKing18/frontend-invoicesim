// src/components/EmailView.js
import acmeLogo        from '../img/businesslogo.png';
import brightsideLogo  from '../img/corplogo.png';
import greenfieldLogo  from '../img/globalcorp.png';
import novaLogo        from '../img/xcorplogo.png';
import React, { useState, useEffect } from 'react';
import API from '../api';
import Questionnaire from './Questionnaire';
import '../styles.css';

// 1) Company list
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
    const [idx, setIdx] = useState(0);
    const [stage, setStage] = useState('view'); // view or question
    const [responses, setResponses] = useState([]);
    const [dueDate, setDueDate] = useState('');
  
    useEffect(() => {
      setResponses(COMPANIES.map(() => ({ choice: null, answered: false })));
      setIdx(0);
      setStage('view');
      const d = new Date(); d.setDate(d.getDate()+7);
      setDueDate(d.toLocaleDateString());
    }, [week]);
  
    const formatText = (tpl, vars) => tpl.replace(/\{([^}]+)\}/g, (_,key)=>(vars[key]));
  
    const handleChoice = choice => {
      // immediately switch to questionnaire
      setStage('question');
      // record choice state
      setResponses(rs=>{
        const c=[...rs]; c[idx]={choice,answered:false}; return c;
      });
      // deduct budget
      const amt=AMOUNTS[week-1][idx];
      if(choice==='pay') onPayment(amt);
      // async fire-and-forget POST
      (async()=>{
        const principle=PRINCIPLES_LIST[idx];
        const comp=COMPANIES[idx];
        const invoiceId=`${week}-${idx+1}`;
        const tpl=PRINCIPLES[principle][week-1];
        const emailText=tpl
          .replace('{name}','Valued')
          .replace('{invoice_id}',invoiceId)
          .replace('{amount}',amt.toFixed(2))
          .replace('{due_date}',dueDate)
          .replace('{company}',comp.name);
        await API.post('/email',{user:userId,week,emailIndex:idx,behaviorType:principle,amount:amt,choice,timestamp:new Date(),emailText,companyLogo:comp.logo_url,companyAddress:comp.address});
      })();
    };
  
    const handleQuestionnaire = answers => {
      // mark answered
      setResponses(rs=>{
        const c=[...rs]; c[idx].answered=true; return c;
      });
      // async POST
      API.post('/response',{user:userId,week,emailIndex:idx,questions:answers});
      // after state update, advance
      setStage('view');
      setTimeout(()=>{
        const next=responses.findIndex((r,i)=>i>idx&&r.choice!==null&&!r.answered);
        if(next!==-1) setIdx(next);
        else if(responses.every(r=>r.choice!==null&&r.answered)) onWeekComplete();
      },0);
    };
  
    const comp=COMPANIES[idx];
    const amt=AMOUNTS[week-1][idx];
    const principle=PRINCIPLES_LIST[idx];
    const tpl=PRINCIPLES[principle][week-1];
    const emailText=tpl
      .replace('{name}','Valued')
      .replace('{invoice_id}',`${week}-${idx+1}`)
      .replace('{amount}',amt.toFixed(2))
      .replace('{due_date}',dueDate)
      .replace('{company}',comp.name);
  
    return (
      <div className="panel email-panel split">
        <aside className="sidebar">
          {COMPANIES.map((c,i)=>(
            <div key={i} className={`sidebar-item ${idx===i?'active':''}`} onClick={()=>stage==='view'&&responses[i].choice===null&&setIdx(i)}>
              <img src={c.logo_url} className="sidebar-logo" alt=""/><div>Email {i+1}</div>
            </div>
          ))}
        </aside>
        <section className="main-content">
          {stage==='view'&&(
            <>
              <header className="email-header"><img src={comp.logo_url} className="company-logo" alt=""/><div><h3>{comp.name}</h3><p>{comp.address}</p></div></header>
              <article className="email-box"><pre>{emailText}</pre></article>
              <div className="btn-row">
                <button onClick={()=>handleChoice('pay')} disabled={amt>budget}>Pay now</button>
                <button onClick={()=>handleChoice('wait')}>Wait a week</button>
              </div>
            </>
          )}
          {stage==='question'&&<Questionnaire onSubmit={handleQuestionnaire}/>}
        </section>
      </div>
    );
  }
  