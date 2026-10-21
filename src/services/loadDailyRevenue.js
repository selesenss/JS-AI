import { FINANCE_URLS, API_HEADERS } from '../config/api.js';
import { fetchJson } from '../api/fetchJson.js';
import { calculateDailyRevenue } from '../domain/revenue.js';

export async function loadDailyRevenue({ signal } = {}) {
  const sources = await Promise.all(
    FINANCE_URLS.map(url => fetchJson(url, { headers: API_HEADERS, signal })),
  );
  const revenue = calculateDailyRevenue(...sources);
  if (revenue === null) {
    throw new Error('Сервер вернул неподдерживаемую структуру данных.');
  }
  return revenue;
}
