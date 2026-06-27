import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhoneNumber, isSuccessfulSmsResponse } from '../src/lib/sms.js';

test('normalizePhoneNumber converts Bangladeshi local numbers to international format', () => {
  assert.equal(normalizePhoneNumber('01712345678'), '8801712345678');
  assert.equal(normalizePhoneNumber('+8801712345678'), '8801712345678');
});

test('isSuccessfulSmsResponse recognizes provider success payloads', () => {
  assert.equal(isSuccessfulSmsResponse({ status: 'success' }), true);
  assert.equal(isSuccessfulSmsResponse({ success: true }), true);
  assert.equal(isSuccessfulSmsResponse('100'), true);
  assert.equal(isSuccessfulSmsResponse('OK'), true);
  assert.equal(isSuccessfulSmsResponse('failed'), false);
});
