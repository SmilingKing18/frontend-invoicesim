import React from 'react';

export default function Rules({ onNext }) {
  return (
    <div className="panel">
      <h2>THE RULES</h2>
      <div className="rules-box">
        <p>You start with 1000&nbsp;€.</p>
        <p>4 invoices per week for 3 weeks.</p>
        <p>
          Read each invoice carefully, invoice amounts are based so that you 
          can only pay ~2–3 per week.
          </p>
        <p>
          Choose the invoices you pay based on which ones you feel you should pay first.</p>  
        <p>
         Which ones you pay first vs last are taken into account.</p>  
        <p>
          At the bottom of each invoice: “Pay now” (deducts from your budget)
          or “Wait a week.”
        </p>
        <p>
          After each choice: questionnaire on urgency, arousal, persuasion,
          and trust (scale of 1–5).
        </p>
        <p>
          Weeks 2 &amp; 3 use new invoice amounts and adapt based on your
          prior payments.
        </p>
        <p>Final questionnaire at the very end. You'll gain badges based on how you played
        </p>
      </div>
      <button onClick={onNext}>Start</button>
    </div>
  );
}
