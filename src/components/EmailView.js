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

// Compute dynamic placeholders
function computePlaceholders({ emailDate, dueDate, amount, emailRecords = [], responses = [] }) {
  const now = new Date();
  const due = new Date(dueDate);
  const msLeft = due - now;
  const days_left = Math.max(0, Math.floor(msLeft / 86400000));
  const hours_left = Math.max(0, Math.floor((msLeft % 86400000) / 3600000));
  const late_fee = +(amount * 0.05).toFixed(2);
  const discount_value = +(amount * 0.02).toFixed(2);

  const discountDeadline = new Date(emailDate);
  discountDeadline.setDate(emailDate.getDate() + 5);
  const discount_deadline = discountDeadline.toLocaleDateString();
  const discount_days = Math.max(0, Math.ceil((discountDeadline - now) / 86400000));
  const discount_hours = Math.max(0, Math.floor(((discountDeadline - now) % 86400000) / 3600000));

  const pays = responses.filter(r => r.choice === 'pay').length;
  const spots_left = Math.max(0, 10 - pays);

  const peer_pct = responses.length ? Math.round((pays / responses.length) * 100) : 0;
  const regional_pct = peer_pct;
  const final_pct = emailRecords.length ? Math.round((emailRecords.filter(r => r.choice === 'pay').length / emailRecords.length) * 100) : 0;
  const testimonial = '"Paid in 2 minutes—super easy!" – Jean D.';

  return { late_fee, discount_value, discount_days, discount_hours, days_left, hours_left,
           spots_left, peer_pct, regional_pct, final_pct, testimonial, discount_deadline, cutoff_timestamp: due.toLocaleString() };
}

// 1) Company list
const COMPANIES = [
    { name: 'Acme Solutions, Inc.',    logo_url: acmeLogo,       address: '123 Elm St, Metropolis, NY' },
    { name: 'Brightside Technologies', logo_url: brightsideLogo,  address: '456 Oak Ave, Sunnyvale, CA' },
    { name: 'Greenfield Co.',          logo_url: greenfieldLogo,  address: '789 Pine Rd, Austin, TX' },
    { name: 'Nova Financial',          logo_url: novaLogo,        address: '321 Maple Blvd, Chicago, IL' },
  ];
  
// 2) Behavioral templates (mild / firm / final)
export const PRINCIPLES = {
  'loss aversion': [
    // Mild: frame purely as loss, quantify pain
    `Subject: Avoid a €{late_fee} Late Fee by {due_date}

Dear {name} Customer,

Invoice #{invoice_id} for €{amount} is due {due_date}.  
If you don’t pay by {due_date}, you will incur a €{late_fee} late fee.  

<strong>Pay before {due_date} to avoid losing €{late_fee}.</strong>

[ PAY NOW ]

Best regards,  
{company} Billing Team`,

    // Firm: countdown + explicit loss
    `Subject: Only {days_left} Days Left to Avoid €{late_fee}

Dear {name} Customer,

Your invoice #{invoice_id} for €{amount} was due {due_date} and remains unpaid.  
You have <strong>{days_left} days, {hours_left} hours</strong> to pay before a €{late_fee} fee is added automatically.

Failure to pay by {cutoff_timestamp} will cost you €{late_fee}.

[ PAY NOW ]

Sincerely,  
{company} Billing Team`,

    // Final: urgent single sentence, immediate action
    `Subject: FINAL NOTICE – €{late_fee} Fee Imminent

Dear {name} Customer,

FINAL ALERT: Invoice #{invoice_id} (€{amount}), due {due_date}, remains unpaid.  
Pay within <strong>12 hours</strong> or incur a €{late_fee} fee immediately and risk service suspension.

[ PAY NOW ]

Regards,  
{company} Billing Team`
  ],

  'scarcity': [
    // Mild: limited-time discount with countdown
    `Subject: 2% Discount Expires in {discount_days} Days

Dear {name} Customer,

Invoice #{invoice_id} for €{amount}, due {due_date}, qualifies for a 2% early-payment discount.  
Offer expires in <strong>{discount_days} days, {discount_hours} hours</strong>.

<strong>Lock in your savings of €{discount_value} by paying before {discount_deadline}.</strong>

[ PAY NOW ]

Warm regards,  
{company} Billing Team`,

    // Firm: dynamic slots remaining
    `Subject: Only {spots_left} Discount Spots Remain

Dear {name} Customer,

Invoice #{invoice_id} (€{amount}) is due {due_date}.  
We are down to the last <strong>{spots_left} early-bird spots</strong> for 2% off.

Once these are gone, you’ll pay the full amount. Save €{discount_value} by acting now.

[ SECURE MY DISCOUNT ]

Best,  
{company} Billing Team`,

    // Final: true last-chance final notice
    `Subject: LAST CHANCE – Final Discount Expires Today

Dear {name} Customer,

URGENT: Invoice #{invoice_id} (€{amount}), due {due_date}, is pending.  
This is your very last chance to get 2% off (€{discount_value}). After today, that offer is gone forever.

<strong>Pay now to lock in your savings.</strong>

[ PAY NOW ]

Thank you,  
{company} Billing Team`
  ],

  'social proof': [
    // Mild: show current % paid
    `Subject: Join the {peer_pct}% Who Paid on Time

Dear {name} Customer,

Invoice #{invoice_id} for €{amount} is due {due_date}.  
Already, <strong>{peer_pct}% of our customers</strong> have paid on time—join them now to keep your account in good standing.

[ PAY NOW ]

Cheers,  
{company} Billing Team`,

    // Firm: regional stat + testimonial
    `Subject: {regional_pct}% of Peers Paid Last Week

Dear {name} Customer,

Your invoice #{invoice_id} (€{amount}), due {due_date}, is outstanding.  
Last week, <strong>{regional_pct}% of customers in your area</strong> settled their bills promptly.

“Paid in 2 minutes—super easy!” – {testimonial}

Maintain your place in the majority.

[ PAY NOW ]

Regards,  
{company} Billing Team`,

    // Final: near-unanimous final reminder
    `Subject: FINAL REMINDER – {final_pct}% Have Paid

Dear {name} Customer,

FINAL NOTICE: Invoice #{invoice_id} (€{amount}) is unpaid.  
Nearly <strong>{final_pct}% of your peers</strong> have already paid. Don’t be the outlier—pay immediately to avoid late fees.

[ PAY NOW ]

Sincerely,  
{company} Billing Team`
  ],

  'urgency': [
    // Mild: simple prompt with time-bound phrase
    `Subject: Please Pay by {due_date}

Dear {name} Customer,

Invoice #{invoice_id} for €{amount} is due {due_date}.  
We encourage you to pay as soon as possible to avoid any disruption.

[ PAY NOW ]

All the best,  
{company} Billing Team`,

    // Firm: explicit 48-hour countdown + fee warning
    `Subject: 48 Hours Left Before a Late Fee

Dear {name} Customer,

Your invoice #{invoice_id} (€{amount}), due {due_date}, still needs your attention.  
You have <strong>48 hours</strong> before a late fee of €{late_fee} applies. Act now to prevent extra charges.

[ PAY NOW ]

Thank you,  
{company} Billing Team`,

    // Final: immediate action required
    `Subject: FINAL ALERT – Service Suspension in 24 Hours

Dear {name} Customer,

FINAL ALERT: Invoice #{invoice_id} (€{amount}), originally due {due_date}, is severely overdue.  
Immediate payment is mandatory within <strong>24 hours</strong> to avoid service interruption and further penalties.

[ PAY NOW ]

Best regards,  
{company} Billing Team`
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
  // calculate weekly progress percent
  const weekPercent = ((week) / 3) * 100;

  const order = useMemo(() => shuffle([0,1,2,3]), []);
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState('view');
  const [answered, setAnswered] = useState(order.map(() => false));
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    setIdx(0); setStage('view'); setAnswered(order.map(() => false));
    const dt = new Date(); dt.setDate(dt.getDate()+7);
    setDueDate(dt.toLocaleDateString());
  }, [week, order]);

  const formatText = (tpl, { name, invoice_id, amount, due_date, company, placeholders }) => {
    let txt = tpl.replace(/\{name\}/g,name)
                 .replace(/\{invoice_id\}/g,invoice_id)
                 .replace(/\{amount\}/g,amount.toFixed(2))
                 .replace(/\{due_date\}/g,due_date)
                 .replace(/\{company\}/g,company);
    Object.entries(placeholders).forEach(([k,v])=>{
      txt = txt.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
    return txt;
  };

  const handleChoice = async choice => {
    const slot = order[idx]; const comp = COMPANIES[slot];
    const principle = PRINCIPLES_LIST[slot]; const amt = AMOUNTS[week-1][slot];
    const invoiceId = `${week}-${idx+1}`;
    const tpl = PRINCIPLES[principle][week-1];
    const placeholders = computePlaceholders({ emailDate:new Date(), dueDate:new Date(new Date().setDate(new Date().getDate()+7)), amount:amt, emailRecords:[], responses:[] });
    const emailText = formatText(tpl,{ name:'Valued',invoice_id:invoiceId,amount:amt,due_date:dueDate,company:comp.name,placeholders });
    if(choice==='pay') onPayment(amt);
    setStage('question');
    try{ await API.post('/email',{ user:userId,week,emailIndex:idx,behaviorType:principle,amount:amt,choice,timestamp:new Date(),emailText,companyLogo:comp.logo_url,companyAddress:comp.address }); }catch(e){console.error(e)}
  };

  const handleQuestionnaire = async answers => {
    try{ await API.post('/response',{ user:userId,week,emailIndex:idx,questions:answers }); }catch(e){console.error(e)};
    setAnswered(prev=>prev.map((a,i)=>i===idx?true:a));
    if(idx<order.length-1){ setIdx(idx+1); setStage('view'); } else onWeekComplete();
  };

  const slot = order[idx]; const comp = COMPANIES[slot];
  const amt = AMOUNTS[week-1][slot];
  const rawTpl = PRINCIPLES[PRINCIPLES_LIST[slot]][week-1];
  const emailText = formatText(rawTpl,{ name:'Valued',invoice_id:`${week}-${idx+1}`,amount:amt,due_date:dueDate,company:comp.name,placeholders:computePlaceholders({ emailDate:new Date(),dueDate:new Date(new Date().setDate(new Date().getDate()+7)),amount:amt,emailRecords:[],responses:[] }) });

  
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
