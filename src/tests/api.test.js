import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchJson } from '../src/api/fetchJson.js';
import { loadDailyRevenue } from '../src/services/loadDailyRevenue.js';
import { FINANCE_URLS, API_HEADERS } from '../src/config/api.js';
import { createUsdConverter } from '../src/domain/currency.js';
const loadConverter = async () => createUsdConverter({ currencySymbols: { USD: 'US Dollar' } }, { base: 'USD', rates: { USD: '1' } });
import { source1, source2 } from './fixtures.js';

test('GET passes headers and reads JSON', async t => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, FINANCE_URLS[0]);
    assert.equal(options.method, 'GET');
    assert.deepEqual(options.headers, API_HEADERS);
    return Response.json(source1);
  });
  assert.deepEqual(await fetchJson(FINANCE_URLS[0], { headers: API_HEADERS }), source1);
});

test('HTTP failure is reported before parsing HTML', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<html>Error</html>', { status: 500 }));
  await assert.rejects(fetchJson('/api'), { kind: 'http', status: 500 });
});

test('Invalid JSON is reported', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<!doctype html>'));
  await assert.rejects(fetchJson('/api'), { kind: 'json' });
});

test('Network failure is reported', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('offline'); });
  await assert.rejects(fetchJson('/api'), { kind: 'network' });
});

test('Both requests start before either completes and feed calculation', async t => {
  const pending = [];
  t.mock.method(globalThis, 'fetch', (url, options) => {
    assert.deepEqual(options.headers, API_HEADERS);
    return new Promise(resolve => pending.push({ url, resolve }));
  });
  const result = loadDailyRevenue({ loadConverter });
  assert.deepEqual(pending.map(item => item.url), FINANCE_URLS);
  pending[0].resolve(Response.json(source1));
  pending[1].resolve(Response.json(source2));
  assert.deepEqual(await result, { total: 2160, currency: 'USD' });
});

test('One failed source rejects the complete operation', async t => {
  t.mock.method(globalThis, 'fetch', async url => url === FINANCE_URLS[0]
    ? Response.json(source1) : new Response('', { status: 403 }));
  await assert.rejects(loadDailyRevenue({ loadConverter }), { kind: 'http', status: 403 });
});

test('Invalid source structure rejects the service result', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json(null));
  await assert.rejects(loadDailyRevenue({ loadConverter }), /структуру/);
});
