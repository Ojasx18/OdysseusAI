function Loader({ text = 'Planning...' }) {
  // Split the word into individual letters
  const letters = text.split('');

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
      <div className="loader-uiverse-wrapper">
        <div className="loader-uiverse-ring" />
        {letters.map((letter, idx) => (
          <span
            key={idx}
            className="loader-uiverse-letter"
            style={{
              animationDelay: `${idx * 0.08}s`,
              marginRight: letter === ' ' ? '0.35rem' : '0.02rem',
            }}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Loader;
