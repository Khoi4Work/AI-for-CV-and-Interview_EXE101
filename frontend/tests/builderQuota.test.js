import test from 'node:test';
import assert from 'node:assert/strict';
import { checkBuilderQuota, CV_CREATION_QUOTA_MESSAGE } from '../src/features/cv/services/builderQuota.js';

test('builder blocks exhausted CV creation quota even when AI and interview quota remain', async () => {
    await assert.rejects(checkBuilderQuota(async () => ({ remainingCvCount: 0, remainingAiCvCnt: 10, remainingInterviewMinutes: 60 })),
        error => error.code === 'CV_CREATION_QUOTA_EXCEEDED' && error.message === CV_CREATION_QUOTA_MESSAGE);
});

test('builder rechecks current quota before proceeding without consuming a creation', async () => {
    let calls = 0;
    const getQuota = async () => ({ remainingCvCount: ++calls === 1 ? 1 : 0 });
    assert.equal((await checkBuilderQuota(getQuota)).remainingCvCount, 1);
    await assert.rejects(checkBuilderQuota(getQuota), { code: 'CV_CREATION_QUOTA_EXCEEDED' });
    assert.equal(calls, 2);
});

test('builder fails closed for unavailable or invalid quota and can retry', async () => {
    for (const quota of [undefined, {}, { remainingCvCount: null }, { remainingCvCount: -1 }]) {
        await assert.rejects(checkBuilderQuota(async () => quota));
    }
    const networkError = new Error('network');
    await assert.rejects(checkBuilderQuota(async () => { throw networkError; }), error => error === networkError);
    assert.equal((await checkBuilderQuota(async () => ({ remainingCvCount: 2 }))).remainingCvCount, 2);
});
