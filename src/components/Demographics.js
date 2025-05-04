import React, { useState } from 'react';
import API from '../api';

export default function Demographics({ onNext }) {
  const [data, setData] = useState({ age: '', gender: '', education: '', location: '' });

  const submit = async () => {
    const res = await API.post('/user', data);
    onNext(res.data.userId);
  };

  const ages = [
    '18–21', '22–25', '26–30', '31–40', '41–50', '51–65', '66+'];
  const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  const educations = ['High School', 'Bachelor’s Degree', 'Master’s Degree', 'PhD', 'Other'];
  const locations = ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania', 'Other'];

  return (
    <div className="panel">
      <h2>Demographics</h2>
      <select
        value={data.age}
        onChange={e => setData({ ...data, age: e.target.value })}
      >
        <option value="" disabled>Select your age</option>
        {ages.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <select
        value={data.gender}
        onChange={e => setData({ ...data, gender: e.target.value })}
      >
        <option value="" disabled>Select your gender</option>
        {genders.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      <select
        value={data.education}
        onChange={e => setData({ ...data, education: e.target.value })}
      >
        <option value="" disabled>Select your education</option>
        {educations.map(ed => <option key={ed} value={ed}>{ed}</option>)}
      </select>
      <select
        value={data.location}
        onChange={e => setData({ ...data, location: e.target.value })}
      >
        <option value="" disabled>Select your location</option>
        {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
      </select>
      <button
        onClick={submit}
        disabled={!data.age || !data.gender || !data.education || !data.location}
      >
        Next
      </button>
    </div>
  );
}