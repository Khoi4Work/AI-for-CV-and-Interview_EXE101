import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEditorPayload, createEditorWriter, getAllowedEditorTemplate } from '../src/features/cv/services/editorSave.js';

test('catalog fails closed for paid, missing and unspecified access flags', () => {
    const catalog = [{ id: 'free', locked: false }, { id: 'paid', locked: true }, { id: 'unknown' }];
    assert.equal(getAllowedEditorTemplate(catalog, 'free').id, 'free');
    for (const id of ['paid', 'unknown', 'missing']) assert.throws(() => getAllowedEditorTemplate(catalog, id));
});

test('payload preserves photo, title and template without sharing mutable state', () => {
    const data = { profilePhoto: 'data:image/jpeg;base64,AA', professionalTitle: 'Developer', selectedTemplateId: 'free', experiences: [{ details: ['A'] }] };
    const payload = buildEditorPayload(' My CV ', data);
    data.experiences[0].details[0] = 'B';
    assert.equal(payload.name, 'My CV');
    assert.equal(payload.templateId, 'free');
    assert.equal(payload.content.profilePhoto, 'data:image/jpeg;base64,AA');
    assert.equal(payload.content.professionalTitle, 'Developer');
    assert.equal(payload.content.experiences[0].details[0], 'A');
    assert.throws(() => buildEditorPayload(' ', data));
    assert.throws(() => buildEditorPayload('a'.repeat(101), data));
});

test('double click creates once; later save updates returned ID', async () => {
    let finish;
    let creates = 0;
    let updates = 0;
    let savedId;
    const writer = createEditorWriter({
        createCV: async () => { creates++; return new Promise(resolve => { finish = resolve; }); },
        updateCV: async id => { updates++; assert.equal(id, 'saved'); return { id }; },
    });
    const args = { payload: { templateId: 'free' }, validate: async () => {}, onSaved: result => { savedId = result.id; } };
    const first = writer(args);
    assert.equal(await writer(args), null);
    finish({ id: 'saved' });
    await first;
    await writer({ ...args, id: savedId });
    assert.equal(creates, 1);
    assert.equal(updates, 1);
});

test('expired entitlement prevents persistence; failed save remains retryable', async () => {
    let requests = 0;
    let saved = 0;
    const writer = createEditorWriter({ createCV: async () => { requests++; if (requests === 1) throw new Error('network'); return { id: 'ok' }; } });
    const args = { payload: { templateId: 'paid' }, validate: async () => {}, onSaved: () => saved++ };
    await assert.rejects(writer({ ...args, validate: async () => { throw new Error('expired'); } }));
    assert.equal(requests, 0);
    await assert.rejects(writer(args));
    assert.equal(saved, 0);
    await writer(args);
    assert.equal(saved, 1);
});
