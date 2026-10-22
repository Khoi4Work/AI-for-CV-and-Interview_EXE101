import test from 'node:test';
import assert from 'node:assert/strict';
import {replaceCvSectionItems} from '../src/features/cv/utils/cvSectionState.js';

test('editing populated content reveals only the matching hidden section', () => {
    const previous = {projects: [], editorLayout: {hiddenSections: ['projects', 'awards'], mainOrder: ['projects']}};
    const result = replaceCvSectionItems(previous, 'projects', [{name: 'Portfolio'}]);

    assert.deepEqual(result.editorLayout.hiddenSections, ['awards']);
    assert.deepEqual(previous.editorLayout.hiddenSections, ['projects', 'awards']);
    assert.deepEqual(result.projects, [{name: 'Portfolio'}]);
});

test('a blank draft does not reveal its section', () => {
    const previous = {editorLayout: {hiddenSections: ['projects']}};
    const result = replaceCvSectionItems(previous, 'projects', [{name: '', details: ['  ']}]);

    assert.deepEqual(result.editorLayout.hiddenSections, ['projects']);
});

test('reveals skill content while preserving imported skill categories and unrelated hidden sections', () => {
    const previous = {editorLayout: {hiddenSections: ['skills', 'certificates']}};
    const skill = {name: 'SQL', category: 'Data Analysis', level: null, custom: true};
    const result = replaceCvSectionItems(previous, 'skills', [skill]);

    assert.deepEqual(result.skills, [skill]);
    assert.deepEqual(result.editorLayout.hiddenSections, ['certificates']);
});
