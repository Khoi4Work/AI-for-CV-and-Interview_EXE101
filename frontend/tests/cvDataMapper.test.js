import test from 'node:test';
import assert from 'node:assert/strict';
import {mapImportedCVData, mapMockDataToCVContext} from '../src/features/cv/mapper/cv-data-mapper.js';

test('preserves arbitrary skill categories when template data is converted back to CV data', () => {
    const mapped = mapMockDataToCVContext({
        skills: {
            'Business Analysis': ['SRS Documentation'],
            Programming: ['HTML/CSS'],
        },
    });

    assert.deepEqual(mapped.skills, [
        { name: 'SRS Documentation', level: null, category: 'Business Analysis' },
        { name: 'HTML/CSS', level: null, category: 'Programming' },
    ]);
});

test('preserves imported skill fields outside the builder form contract', () => {
    const source = {skills: [{name: 'Java', category: 'Programming', level: 'ADVANCED', source: 'resume-parser'}]};

    assert.deepEqual(mapImportedCVData(source).skills, source.skills);
});

test('keeps imported hidden sections hidden until the corresponding section is edited', () => {
    const imported = mapImportedCVData({editorLayout: {hiddenSections: ['projects', 'awards']}});

    assert.deepEqual(imported.editorLayout.hiddenSections, ['projects', 'awards']);
});
