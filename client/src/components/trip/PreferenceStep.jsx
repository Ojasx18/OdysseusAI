function PreferenceStep({ register, errors }) {
  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    textAlign: 'left',
  };

  const selectGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.25rem',
  };

  const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '0.4rem',
  };

  const selectStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--color-surface-light)',
    border: '1px solid var(--color-border)',
    borderRadius: '0.85rem',
    color: 'var(--color-text)',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.01)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
        What are your preferences?
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Tailor your daily journey styles, hotels, transit options, and dining styles.
      </p>

      <div style={containerStyle}>
        {/* Travel Style */}
        <div style={selectGroupStyle}>
          <label style={labelStyle}>Travel Style</label>
          <select style={selectStyle} {...register('travelStyle', { required: 'Travel style is required' })}>
            <option value="balanced">Balanced (Mix of activity and rest)</option>
            <option value="relaxed">Relaxed (Slow paced, lots of leisure)</option>
            <option value="fast-paced">Fast-paced (Cover max spots daily)</option>
          </select>
        </div>

        {/* Accommodation */}
        <div style={selectGroupStyle}>
          <label style={labelStyle}>Accommodation</label>
          <select style={selectStyle} {...register('accommodation', { required: 'Accommodation is required' })}>
            <option value="Hotel">Hotel (Standard room)</option>
            <option value="Airbnb">Airbnb (Local apartments)</option>
            <option value="Hostel">Hostel (Shared backpackers)</option>
            <option value="Resort">Resort (All-inclusive luxury)</option>
          </select>
        </div>

        {/* Food Preferences */}
        <div style={selectGroupStyle}>
          <label style={labelStyle}>Food Preference</label>
          <select style={selectStyle} {...register('foodPreferences', { required: 'Food preference is required' })}>
            <option value="local">Local Cuisine (No restrictions)</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="halal">Halal</option>
            <option value="kosher">Kosher</option>
          </select>
        </div>

        {/* Transportation */}
        <div style={selectGroupStyle}>
          <label style={labelStyle}>Preferred Transport</label>
          <select style={selectStyle} {...register('transportation', { required: 'Transportation is required' })}>
            <option value="Metro">Metro & Public Transit</option>
            <option value="Walking">Walking only</option>
            <option value="Rental Car">Rental Car</option>
            <option value="Taxi">Taxi & Rideshare</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default PreferenceStep;
