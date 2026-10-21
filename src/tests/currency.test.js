import test from 'node:test';
import assert from 'node:assert/strict';
import { createUsdConverter, convertSourceToUsd } from '../src/domain/currency.js';
import { calculateDailyRevenue } from '../src/domain/revenue.js';
import { loadDailyRevenue } from '../src/services/loadDailyRevenue.js';
import { FINANCE_URLS } from '../src/config/api.js';
const symbols = { currencySymbols: { USD: 'Dollar', EUR: 'Euro', JPY: 'Yen', BTC: 'Bitcoin' } };
const rates = { base: 'USD', rates: { USD: '1', EUR: '0.8', JPY: '150', BTC: '0.00001' } };
const converter = createUsdConverter(symbols, rates);

test('Converts by dividing USD-base rates and accepts mixed case', () => {
  assert.equal(converter.convertToUsd(200, 'eur'), 250);
  assert.equal(converter.convertToUsd(1500, 'JPY'), 10);
  assert.equal(converter.convertToUsd(300, 'UsD'), 300);
  assert.ok(Math.abs(converter.convertToUsd(0.001, 'BTC') - 100) < 1e-10);
});
test('Unknown currency gives requested error', () => {
  for (const code of ['XYZ', '', null, 'toString']) {
    assert.throws(() => converter.convertToUsd(100, code), { message: 'Валюта указана не верно' });
  }
});
test('Known currency without a usable rate is a different error', () => {
  for (const value of [undefined, '0', '-1', 'bad', '', null, Infinity]) {
    const c = createUsdConverter(symbols, { base: 'USD', rates: { EUR: value } });
    assert.throws(() => c.convertToUsd(100, 'EUR'), /получить курс EUR/);
  }
});
test('Malformed provider responses and wrong base are rejected', () => {
  assert.throws(() => createUsdConverter({}, rates), /справочник/);
  assert.throws(() => createUsdConverter(symbols, { ...rates, base: 'EUR' }), /база USD/);
});
test('Both source formats are converted before calculation; only paid counts', () => {
  const source1 = { transactions: [
    { type: 'paid', amount: 100, currency: 'usd' },
    { type: 'paid', amount: 200, currency: 'EUR' },
    { type: 'pending', amount: 400, currency: 'EUR' },
    { type: 'rejected', amount: 800, currency: 'EUR' },
  ] };
  const sources = [source1, ['1500 jpy', '200 eur', '300 USD']];
  assert.deepEqual(calculateDailyRevenue(...sources.map(s => convertSourceToUsd(s, converter))),
    { total: 910, currency: 'USD' });
  assert.equal(source1.transactions[1].currency, 'EUR');
});
test('Unknown currency in either source stops conversion', () => {
  assert.throws(() => convertSourceToUsd(['10 xyz'], converter), /Валюта указана не верно/);
  assert.throws(() => convertSourceToUsd({ transactions: [
    { type: 'paid', amount: 10, currency: 'XYZ' },
  ] }, converter), /Валюта указана не верно/);
});
test('Malformed amounts remain excluded', () => {
  const sources = [convertSourceToUsd(['invalid', '3 EUR', 'NaN USD'], converter),
    convertSourceToUsd({ transactions: [{ type: 'paid', amount: -10, currency: 'EUR' }] }, converter)];
  assert.deepEqual(calculateDailyRevenue(...sources), { total: 3.75, currency: 'USD' });
});
test('Service integrates conversion into the total', async t => {
  t.mock.method(globalThis, 'fetch', async url => Response.json(url === FINANCE_URLS[0]
    ? { transactions: [{ type: 'paid', amount: 200, currency: 'EUR' }] }
    : ['1500 JPY']));
  assert.deepEqual(await loadDailyRevenue({ loadConverter: async () => converter }),
    { total: 260, currency: 'USD' });
});
test('Rate loading failure rejects revenue', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json([]));
  await assert.rejects(loadDailyRevenue({ loadConverter: async () => { throw new Error('quota'); } }), /quota/);
});
