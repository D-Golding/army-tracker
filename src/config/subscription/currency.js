// config/subscription/currency.js - Currency formatting and info
export const getCurrencyInfo = () => {
  return {
    symbol: '£',
    code: 'GBP',
    position: 'before'
  };
};

export const formatPrice = (amount, currency = null) => {
  const currencyInfo = currency || getCurrencyInfo();

  if (amount === 0) {
    return 'Free';
  }

  const formatted = amount.toFixed(2);

  return currencyInfo.position === 'before'
    ? `${currencyInfo.symbol}${formatted}`
    : `${formatted}${currencyInfo.symbol}`;
};