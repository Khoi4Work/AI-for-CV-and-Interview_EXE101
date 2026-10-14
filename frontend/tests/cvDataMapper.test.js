import test from 'node:test';
import assert from 'node:assert/strict';
import { mapMockDataToCVContext } from '../src/features/cv/mapper/cv-data-mapper.js';

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
