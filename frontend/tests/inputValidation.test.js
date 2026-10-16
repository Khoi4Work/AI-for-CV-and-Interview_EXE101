import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCVData} from '../src/utils/inputValidation.js';

const validateDob = dob => validateCVData({personalInfo: {dob}});

test('CV date validation accepts valid day-first dates', () => {
    assert.deepEqual(validateDob('31/01/2000'), []);
    assert.deepEqual(validateDob('31.01.2000'), []);
});

test('CV date validation rejects impossible dates and future birthdays', () => {
    assert.ok(validateDob('31/02/2000').some(error => error.includes('ngày hợp lệ')));
    assert.ok(validateDob('01/01/2099').some(error => error.includes('không thể ở tương lai')));
});
