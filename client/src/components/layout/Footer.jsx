function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-surface-light)',
      padding: '1.5rem',
      textAlign: 'center',
    }}>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        © {new Date().getFullYear()} OdysseusAI. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
