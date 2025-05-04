import React, { useState } from 'react';
import Demographics from './components/Demographics';
import Rules from './components/Rules';
import EmailView from './components/EmailView';
import FinalQuestionnaire from './components/FinalQuestionnaire';

function App() {
  const [stage, setStage] = useState('demographics');
  const [userId, setUserId] = useState(null);
  const [week, setWeek] = useState(1);
  const [budget, setBudget] = useState(1000);

  const handleDemographicsNext = id => {
    setUserId(id);
    setStage('rules');
  };

  const handleRulesNext = () => {
    setStage('emails');
  };

  const handlePayment = amount => {
    setBudget(prev => prev - amount);
  };

  const handleWeekComplete = () => {
    if (week < 3) {
      setWeek(week + 1);
    } else {
      setStage('final');
    }
  };

  return (
    <div className="app-container">
      {stage === 'demographics' && (
        <Demographics onNext={handleDemographicsNext} />
      )}
      {stage === 'rules' && <Rules onNext={handleRulesNext} />}
      {stage === 'emails' && (
        <>
          <div className="budget-display">
            Total Money left: {budget}€
          </div>
          <EmailView
            userId={userId}
            week={week}
            onPayment={handlePayment}
            onWeekComplete={handleWeekComplete}
          />
        </>
      )}
      {stage === 'final' && (
        <FinalQuestionnaire userId={userId} />
      )}
    </div>
  );
}

export default App;
