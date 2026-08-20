import { motion } from 'framer-motion';

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const getStyles = () => {
    let base = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontWeight: 600,
      borderRadius: '9999px', // Rounded pill shape matches primary
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease-in-out',
      border: 'none',
      outline: 'none',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled || loading ? 0.6 : 1,
    };

    // Variant Styles
    let variants = {
      primary: {
        background: 'var(--color-primary)',
        color: 'white',
        boxShadow: '0 4px 14px rgba(15, 118, 110, 0.25)',
      },
      secondary: {
        background: 'var(--color-surface-light)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text)',
        boxShadow: '0 2px 6px rgba(15, 118, 110, 0.02)',
      },
      danger: {
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.25)',
        color: 'var(--color-error)',
      },
      outline: {
        background: 'transparent',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--color-text-muted)',
      },
    };

    // Size Styles
    let sizes = {
      sm: {
        padding: '0.4rem 0.9rem',
        fontSize: '0.85rem',
      },
      md: {
        padding: '0.65rem 1.4rem',
        fontSize: '0.95rem',
      },
      lg: {
        padding: '0.85rem 1.85rem',
        fontSize: '1.05rem',
      },
    };

    return { ...base, ...variants[variant], ...sizes[size] };
  };

  // If it's a primary active button (not loading or disabled), render the Uiverse sweep button
  if (variant === 'primary' && !disabled && !loading) {
    const isLg = size === 'lg';
    const isSm = size === 'sm';
    const paddingVal = isLg ? '0.85rem 1.85rem' : isSm ? '0.4rem 0.9rem' : '0.65rem 1.4rem';
    const fontVal = isLg ? '1.05rem' : isSm ? '0.85rem' : '0.95rem';
    
    return (
      <motion.button
        whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(15, 118, 110, 0.35)' }}
        whileTap={{ scale: 0.98 }}
        className="button-uiverse"
        style={{
          width: fullWidth ? '100%' : 'auto',
          padding: paddingVal,
          fontSize: fontVal,
          ...props.style
        }}
        disabled={disabled}
        onClick={onClick}
        type={type}
        {...props}
      >
        <span className="button-uiverse-bg">
          <span className="button-uiverse-layers">
            <span className="button-uiverse-layer button-uiverse-layer-1 -purple" />
            <span className="button-uiverse-layer button-uiverse-layer-2 -turquoise" />
            <span className="button-uiverse-layer button-uiverse-layer-3 -yellow" />
          </span>
        </span>
        <span className="button-uiverse-inner">
          {Icon && iconPosition === 'left' && <Icon size={18} />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={18} />}
        </span>
      </motion.button>
    );
  }

  // Standard Button (Secondary, ghost, outline, danger or disabled primary)
  const getClassName = () => {
    let classes = [props.className || ''];
    if (variant === 'outline') {
      classes.push('btn-outline-hover');
    }
    return classes.filter(Boolean).join(' ');
  };

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.01 }}
      whileTap={disabled || loading ? {} : { scale: 0.99 }}
      style={getStyles()}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      className={getClassName()}
      {...props}
    >
      {loading && (
        <motion.div
          style={{
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            marginRight: '0.25rem'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon size={18} />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon size={18} />}
    </motion.button>
  );
}

export default Button;
