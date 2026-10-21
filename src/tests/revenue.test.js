import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDailyRevenue } from '../src/domain/revenue.js';
import { source1, source2 } from './fixtures.js';

const cases = [
  ['Valid data', [source1, source2], 2160],
  ['Missing Source 1', [undefined, source2], null],
  ['Missing Source 2', [source1, undefined], null],
  ['Invalid structure', [{ transactions: 'not an array' }, source2], null],
  ['Invalid transaction', [{ transactions: [
    { type: 'paid', amount: 100, currency: 'USD' },
    { type: 'paid', amount: '500', currency: 'USD' },
    { type: 'paid', amount: 200, currency: 'USD' },
  ] }, source2], 1350],
  ['Invalid Source 2 item', [source1, ['300 USD', 'invalid value', '200 USD']], 1610],
  ['Empty transactions', [{ transactions: [] }, source2], 1050],
  ['Empty Source 2', [source1, []], 1110],
];
for (const [name, sources, total] of cases) {
  test(name, () => assert.deepEqual(calculateDailyRevenue(...sources),
    total === null ? null : { total, currency: 'USD' }));
}

 test('Currency accepts mixed case in both sources and normalizes output', () => {
  const transactions = ['usd', 'USD', 'UsD'].map(currency => ({
    type: 'paid', amount: 100, currency,
  }));
  assert.deepEqual(calculateDailyRevenue(
    { transactions }, ['300 usd', '150 USD', '200 UsD'],
  ), { total: 950, currency: 'USD' });
});

test('Other currencies and non-string currency remain invalid', () => {
  assert.deepEqual(calculateDailyRevenue({ transactions: [
    { type: 'paid', amount: 100, currency: 'EUR' },
    { type: 'paid', amount: 100, currency: null },
    { type: 'paid', amount: 100, currency: 123 },
  ] }, ['300 eur', '50 usd']), { total: 50, currency: 'USD' });
});
