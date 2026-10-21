// Educational browser setup only: VITE_* values are public.
export const CURRENCY_API_KEY = import.meta.env?.VITE_CURRENCYFREAKS_API_KEY ?? '';
export const CURRENCY_SYMBOLS_URL = 'https://api.currencyfreaks.com/v2.0/currency-symbols';
export const CURRENCY_RATES_URL = 'https://api.currencyfreaks.com/v2.0/rates/latest';
