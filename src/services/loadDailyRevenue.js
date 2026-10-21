import { FINANCE_URLS, API_HEADERS } from '../config/api.js';
import { fetchJson } from '../api/fetchJson.js';
import { calculateDailyRevenue } from '../domain/revenue.js';
import { convertSourceToUsd } from '../domain/currency.js';
import { loadCurrencyConverter } from './loadCurrencyConverter.js';

export async function loadDailyRevenue({ signal, loadConverter = loadCurrencyConverter } = {}) {
  const [sources, converter] = await Promise.all([
    Promise.all(FINANCE_URLS.map(url => fetchJson(url, { headers: API_HEADERS, signal }))),
    loadConverter({ signal }),
  ]);
  const normalized = sources.map(source => convertSourceToUsd(source, converter));
  const revenue = calculateDailyRevenue(...normalized);
  if (revenue === null) {
    throw new Error('Сервер вернул неподдерживаемую структуру данных.');
  }
  if (!Number.isFinite(revenue.total)) throw new Error('Итоговая сумма слишком велика.');
  return revenue;
}
