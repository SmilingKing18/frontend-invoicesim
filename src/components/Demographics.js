import React, { useState } from 'react';
import API from '../api';
import '../styles.css';

export default function Demographics({ onNext }) {
  const [data, setData] = useState({
    age: '', gender: '', education: '', location: ''
  });

  const ageRanges   = ['18–21','22–25','26–30','31–40','41–50','51–65','66+'];
  const genders     = ['Male','Female','Non-binary','Prefer not to say'];
  const educations  = ['High School','Bachelor’s Degree','Master’s Degree','PhD','Other'];
  const locations   = ['North America','South America','Europe','Asia','Africa','Oceania','Other'];

  const handleChange = field => e =>
    setData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const { age, gender, education, location } = data;
    if (!age || !gender || !education || !location) return;
    const res = await API.post('/user', data);
    onNext(res.data.userId);
  };

  return (
    <div className="panel demographics">
      <h2>Demographics</h2>
      <form className="dem-form" onSubmit={handleSubmit}>
        <div className="dem-grid">
          <select value={data.age} onChange={handleChange('age')} required>
            <option value="" disabled>Age range</option>
            {ageRanges.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select value={data.gender} onChange={handleChange('gender')} required>
            <option value="" disabled>Gender</option>
            {genders.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select value={data.education} onChange={handleChange('education')} required>
            <option value="" disabled>Education</option>
            {educations.map(ed => <option key={ed} value={ed}>{ed}</option>)}
          </select>

          <select value={data.location} onChange={handleChange('location')} required>
            <option value="" disabled>Location</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <button type="submit" className="dem-next-button">
          Next
        </button>
      </form>
    </div>
  );
}
