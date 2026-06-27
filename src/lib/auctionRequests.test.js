import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRequestedChanges } from './auctionRequests.js';

test('normalizes Map-based requested changes into plain objects', () => {
  const changes = new Map([['title', 'Updated title'], ['startingPrice', 1200]]);
  assert.deepEqual(normalizeRequestedChanges(changes), {
    title: 'Updated title',
    startingPrice: 1200,
  });
});

test('returns plain objects unchanged', () => {
  const changes = { title: 'Updated title', reservePrice: 500 };
  assert.deepEqual(normalizeRequestedChanges(changes), changes);
});

test('returns an empty object for missing values', () => {
  assert.deepEqual(normalizeRequestedChanges(undefined), {});
});
