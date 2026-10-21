export const FINANCE_URLS = Object.freeze([
  'https://cpa-server-vtel.onrender.com/api/finance1',
  'https://cpa-server-vtel.onrender.com/api/finance2',
]);
export const API_KEY_HEADER = 'x-api-key';
// Public browser credential. Use a backend proxy to protect a real secret.
export const API_KEY = 'prodcpakey333';
export const API_HEADERS = Object.freeze({
  Accept: 'application/json',
  [API_KEY_HEADER]: API_KEY,
});
