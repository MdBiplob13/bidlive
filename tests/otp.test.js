import test from 'node:test';
import assert from 'node:assert/strict';
import { generateOtpCode, hashOtpCode, compareOtpCode } from '../src/lib/otp.js';

test('generateOtpCode returns a 6 digit code', () => {
  const code = generateOtpCode();
  assert.match(code, /^\d{6}$/);
});

test('hashOtpCode and compareOtpCode round-trip correctly', async () => {
  const code = '123456';
  const hash = await hashOtpCode(code);
  assert.notEqual(hash, code);
  assert.equal(await compareOtpCode(code, hash), true);
  assert.equal(await compareOtpCode('654321', hash), false);
});
