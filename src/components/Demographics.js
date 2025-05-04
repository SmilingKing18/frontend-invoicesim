import React, { useState } from 'react';
import API from '../api';
import '../styles.css';

export default function Demographics({ onNext }) {
  const [data, setData] = useState({
    age: '', gender: '', education: '', location: ''
  });

  const ageRanges = [
    '18–21', '22–25', '26–30', '31–40', '41–50', '51–65', '66+'
  ];
  const genders = [
    'Male', 'Female', 'Non-binary', 'Prefer not to say'
  ];
  const educations = [
    'High School', 'Bachelor’s Degree',
    'Master’s Degree', 'PhD', 'Other'
  ];
  const locations = [
    'North America', 'South America',
    'Europe', 'Asia', 'Africa', 'Oceania', 'Other'
  ];

  const submit = async () => {
    const res = await API.post('/user', data);
    onNext(res.data.userId);
  };

  return (
    <div className="panel demographics">
      <h2>Demographics</h2>

      <div className="dem-grid">
        <select
          value={data.age}
          onChange={e => setData({...data, age: e.target.value})}
        >
          <option value="" disabled>Age range</option>
          {ageRanges.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          value={data.gender}
          onChange={e => setData({...data, gender: e.target.value})}
        >
          <option value="" disabled>Gender</option>
          {genders.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select
          value={data.education}
          onChange={e => setData({...data, education: e.target.value})}
        >
          <option value="" disabled>Education</option>
          {educations.map(e => <option key={e} value={e}>{e}</option>)}
        </select>

        <select
          value={data.location}
          onChange={e => setData({...data, location: e.target.value})}
        >
          <option value="" disabled>Location</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <button
        className="dem-next-button"
        onClick={submit}
        disabled={!data.age || !data.gender || !data.education || !data.location}
      >
        Next
      </button>
    </div>
  );
}
