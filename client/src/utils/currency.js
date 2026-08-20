/**
 * Formats a numeric amount into a currency string representation.
 * Supports en-IN locale grouping (e.g., ₹1,25,000) for INR by default.
 *
 * @param {number|string} amount - The numeric amount to format.
 * @param {string} [currency='INR'] - The ISO currency code.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount, currency = 'INR') => {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
  const upperCurrency = String(currency).toUpperCase();

  if (upperCurrency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numericAmount);
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: upperCurrency,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch (error) {
    // Safe fallback if currency formatting fails or currency code is invalid
    return `${upperCurrency} ${numericAmount.toLocaleString()}`;
  }
};
