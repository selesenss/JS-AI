import './style.css';
import { loadDailyRevenue } from './services/loadDailyRevenue.js';

const app = document.querySelector('#app');
app.textContent = 'Загрузка выручки…';

async function main() {
  try {
    const { total, currency } = await loadDailyRevenue();
    app.textContent = `Дневная выручка: ${total} ${currency}`;
  } catch (error) {
    console.error('Ошибка загрузки выручки:', error);
    app.textContent = `Ошибка: ${error.message}`;
  }
}

main();
