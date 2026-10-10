import test from 'node:test';
import assert from 'node:assert/strict';
import {interviewPayload,interviewFingerprint,normalizeInterviewType} from '../src/features/interview/services/interviewConfiguration.js';
const config=(type='HR')=>({cvId:'cv-id',experienceLevel:'fresher',interviewConfig:{type,duration:5,language:'vi',jd:'Java API requirements'}});
test('STAR and both enum spellings map to BEHAVIORAL instead of HR',()=>{
    for(const type of ['STAR','Behavioral','BEHAVIORAL']) assert.equal(normalizeInterviewType(type),'BEHAVIORAL');
    assert.equal(normalizeInterviewType('Technical'),'TECHNICAL');assert.throws(()=>normalizeInterviewType('unknown'));
});
test('changing interview configuration invalidates reuse while exact configuration stays stable',()=>{
    const baseline=interviewFingerprint(config());
    assert.equal(interviewFingerprint(config()),baseline);
    assert.notEqual(interviewFingerprint(config('Behavioral')),baseline);
    for(const change of [{duration:10},{language:'en'},{jd:'SQL requirements'}]) {
        const input=config();Object.assign(input.interviewConfig,change);assert.notEqual(interviewFingerprint(input),baseline);
    }
    const changedCV=config();changedCV.cvId='new-cv';assert.notEqual(interviewFingerprint(changedCV),baseline);
});
test('request preserves selected JD identity and selected level without sending company presets',()=>{
    const input=config('STAR');input.interviewConfig.jdId='saved-jd';input.interviewConfig.company={name:'FPT Software'};
    const payload=interviewPayload(input);
    assert.equal(payload.jdId,'saved-jd');assert.ok(!('jdText' in payload));assert.ok(!('company' in payload));
    assert.equal(payload.experienceLevel,'FRESHER');assert.equal(payload.interviewType,'BEHAVIORAL');assert.equal(payload.adaptiveMode,false);
});
