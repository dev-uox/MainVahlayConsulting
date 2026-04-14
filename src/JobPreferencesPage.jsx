import React from 'react';

const JobPreferencesPage = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2>Job Preferences</h2>
      <select
        name="position"
        value={formData.position}
        onChange={handleChange}
        required
      >
        <option value="">Position Applying For</option>
        <option value="Tele Sales - Executive">Tele Sales - Executive</option>
        {/* Additional options */}
      </select>
      {/* Additional fields for job experience, shifts, and interest */}
    </div>
  );
};

export default JobPreferencesPage;
