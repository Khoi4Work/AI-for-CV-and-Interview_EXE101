import test from 'node:test';
import assert from 'node:assert/strict';
import { mapCVDataToTemplate, mapMockDataToCVContext } from '../src/features/cv/mapper/cv-data-mapper.js';

test('maps skills using the category values supplied by CV data', () => {
    const mapped = mapCVDataToTemplate({
        skills: [
            { name: 'Requirement Elicitation', category: 'Business Analysis' },
            { name: 'SRS Documentation', category: 'Business Analysis' },
            { name: 'Figma', category: 'Tools' },
            { name: 'HTML/CSS', category: 'Programming' },
            { name: 'MySQL', category: 'Database' },
            { name: 'English', category: 'English' },
            { name: 'Uncategorized skill', category: null },
        ],
    });

    assert.deepEqual(mapped.skills, {
        'Business Analysis': ['Requirement Elicitation', 'SRS Documentation'],
        Tools: ['Figma'],
        Programming: ['HTML/CSS'],
        Database: ['MySQL'],
        English: ['English'],
        Other: ['Uncategorized skill'],
    });
});

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

test('does not display a language again when it is also present in the skills list', () => {
    const mapped = mapCVDataToTemplate({
        skills: [
            { name: 'English', category: 'English' },
            { name: 'Java', category: 'Programming' },
        ],
        languages: [{ name: 'English', level: 'Fluent' }],
    });

    assert.deepEqual(mapped.skills, { Programming: ['Java'] });
    assert.deepEqual(mapped.languages, [{ name: 'English', level: 'Fluent' }]);
});

