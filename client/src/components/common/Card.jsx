import { motion } from 'framer-motion';

function Card({
  children,
  title,
  subtitle,
  onClick,
  hoverable = false,
  padding = 'md',
  gradient = false,
  style = {},
  ...props
}) {
  const getPadding = () => {
    switch (padding) {
      case 'sm': return '1rem';
      case 'lg': return '2.5rem';
      case 'md':
      default: return '1.75rem';
    }
  };

  const cardStyle = {
    background: gradient
      ? 'linear-gradient(135deg, #f0fdfa, var(--color-secondary-light))'
      : 'var(--color-surface-light)',
    border: '1px solid var(--color-border)',
    borderRadius: '1.25rem',
    padding: getPadding(),
    boxShadow: '0 6px 20px rgba(15, 118, 110, 0.04)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };

  return (
    <motion.div
      whileHover={hoverable || onClick ? { y: -4, borderColor: 'var(--color-primary)', boxShadow: '0 12px 30px rgba(15, 118, 110, 0.08)' } : {}}
      onClick={onClick}
      style={cardStyle}
      {...props}
    >
      {(title || subtitle) && (
        <div style={{ marginBottom: '1.25rem' }}>
          {title && <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)' }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
}

export default Card;
