import React, { useState } from 'react';

const Input = React.forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  placeholder,
  disabled = false,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = {
    marginBottom: '1.25rem',
    width: '100%',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '0.4rem',
    textAlign: 'left',
  };

  const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  };

  const inputStyle = {
    width: '100%',
    padding: `0.75rem 0.75rem 0.75rem ${Icon ? '2.75rem' : '1rem'}`,
    backgroundColor: disabled ? 'var(--color-surface-lighter)' : 'var(--color-surface-light)',
    border: error
      ? '1px solid var(--color-error)'
      : isFocused
        ? '1px solid var(--color-primary)'
        : '1px solid var(--color-border)',
    borderRadius: '0.85rem', // ~14px
    color: 'var(--color-text)',
    fontSize: '0.95rem',
    outline: 'none',
    boxShadow: error
      ? '0 0 0 3px rgba(220, 68, 68, 0.08)'
      : isFocused
        ? '0 0 0 3px rgba(15, 118, 110, 0.08)'
        : '0 1px 2px rgba(0, 0, 0, 0.01)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const errorStyle = {
    color: 'var(--color-error)',
    fontSize: '0.8rem',
    marginTop: '0.35rem',
    textAlign: 'left',
    fontWeight: 500,
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={inputWrapperStyle}>
        {Icon && (
          <Icon
            size={18}
            color={isFocused ? 'var(--color-primary)' : 'var(--color-text-muted)'}
            style={{
              position: 'absolute',
              left: '0.95rem',
              pointerEvents: 'none',
              transition: 'color 0.2s',
            }}
          />
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={inputStyle}
          {...props}
        />
      </div>
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
