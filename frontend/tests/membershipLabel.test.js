import test from 'node:test';
import assert from 'node:assert/strict';
import { getHighestMembershipLabel } from '../src/features/auth/utils/membershipLabel.js';

test('profile badge uses the highest of the separate CV and interview plans', () => {
    assert.equal(getHighestMembershipLabel({ membershipType: 'Middle', interviewMembershipType: 'Enhance' }), 'Enhance');
    assert.equal(getHighestMembershipLabel({ membershipType: 'Enhance', interviewMembershipType: 'Middle' }), 'Enhance');
    assert.equal(getHighestMembershipLabel({ membershipType: 'Free', interviewMembershipType: 'Middle' }), 'Middle');
    assert.equal(getHighestMembershipLabel({ membershipType: 'Middle', interviewMembershipType: 'Free' }), 'Middle');
    assert.equal(getHighestMembershipLabel({ membershipType: 'Free', interviewMembershipType: 'Free' }), 'Free');
});

test('label handles casing and legacy missing fields without changing entitlement data', () => {
    const profile = { membershipType: 'middle', interviewMembershipType: ' ENHANCE ' };
    assert.equal(getHighestMembershipLabel(profile), 'Enhance');
    assert.equal(profile.membershipType, 'middle');
    assert.equal(getHighestMembershipLabel({ membershipType: 'Middle' }), 'Middle');
    assert.equal(getHighestMembershipLabel({ interviewMembershipType: 'ENHANCE' }), 'Enhance');
    assert.equal(getHighestMembershipLabel(undefined), 'Free');
});
