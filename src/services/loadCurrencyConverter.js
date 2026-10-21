import { fetchJson } from '../api/fetchJson.js';
import { CURRENCY_API_KEY, CURRENCY_SYMBOLS_URL, CURRENCY_RATES_URL } from '../config/currency.js';
import { createUsdConverter } from '../domain/currency.js';

export async function loadCurrencyConverter({ signal } = {}) {
  if (!CURRENCY_API_KEY.trim()) {
    throw new Error('Укажите VITE_CURRENCYFREAKS_API_KEY в .env.local и перезапустите Vite.');
  }
  const url = new URL(CURRENCY_RATES_URL);
  url.searchParams.set('apikey', CURRENCY_API_KEY);
  const [symbols, rates] = await Promise.all([
    fetchJson(CURRENCY_SYMBOLS_URL, { signal }),
    fetchJson(url.toString(), { signal }),
  ]);
  if (rates?.error) throw new Error('Сервис курсов вернул ошибку. Проверьте ключ и лимит запросов.');
  return createUsdConverter(symbols, rates);
}
