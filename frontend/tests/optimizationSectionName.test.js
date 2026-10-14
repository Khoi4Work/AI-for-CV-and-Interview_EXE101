import test from 'node:test';
import assert from 'node:assert/strict';
import { formatOptimizationSectionName } from '../src/features/cv/utils/optimizationSectionName.js';

test('formats nested CV data paths as readable section labels', () => {
    assert.equal(formatOptimizationSectionName('experiences[0].details[0]'), 'Kinh nghiệm làm việc 1 · Mô tả 1');
    assert.equal(formatOptimizationSectionName('projects[1].details[2]'), 'Dự án 2 · Mô tả 3');
    assert.equal(formatOptimizationSectionName('personalInfo.email'), 'Thông tin cá nhân · Email');
});

test('preserves natural labels and handles missing or unknown sections', () => {
    assert.equal(formatOptimizationSectionName('Kinh nghiệm làm việc'), 'Kinh nghiệm làm việc');
    assert.equal(formatOptimizationSectionName('CV hiện tại. Bản mới.'), 'CV hiện tại. Bản mới.');
    assert.equal(formatOptimizationSectionName(''), 'Nội dung CV 1');
    assert.equal(formatOptimizationSectionName('custom_section[0].value'), 'Custom section 1 · Value');
});
