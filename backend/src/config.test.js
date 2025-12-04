import assert from 'node:assert/strict';
import test from 'node:test';
import { loadConfig, toNumber } from './config.js';

test('toNumber returns fallback when value is not numeric', () => {
  assert.equal(toNumber('abc', 5), 5);
  assert.equal(toNumber(undefined, 7), 7);
});

test('toNumber parses numeric strings', () => {
  assert.equal(toNumber('12', 0), 12);
  assert.equal(toNumber('0', 3), 0);
});

test('loadConfig uses defaults when env is empty', () => {
  const config = loadConfig({});

  assert.equal(config.port, 4000);
  assert.deepEqual(config.allowedOrigins, []);
  assert.deepEqual(config.trendLimits, { free: 10, starter: 50, pro: 500 });
  assert.equal(config.mockProductCount, 40);
});

test('loadConfig parses env overrides', () => {
  const config = loadConfig({
    PORT: '8080',
    ALLOWED_ORIGINS: 'http://one.com, http://two.com ',
    WATCHLIST_FREE_LIMIT: '1',
    WATCHLIST_STARTER_LIMIT: '2',
    WATCHLIST_PRO_LIMIT: '3',
    MOCK_PRODUCT_COUNT: '15'
  });

  assert.equal(config.port, 8080);
  assert.deepEqual(config.allowedOrigins, ['http://one.com', 'http://two.com']);
  assert.deepEqual(config.trendLimits, { free: 1, starter: 2, pro: 3 });
  assert.equal(config.mockProductCount, 15);
});
