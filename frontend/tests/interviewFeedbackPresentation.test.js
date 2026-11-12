import test from 'node:test';
import assert from 'node:assert/strict';
import { suggestionsForFeedback } from '../src/features/interview/utils/interviewFeedbackPresentation.js';
const feedback = (suggestionPriority) => ({ improvementSuggestion: 'Explain the result', suggestionPriority });

test('returned priorities map to localized labels without score-based defaults', () => {
    const focus = suggestionsForFeedback(feedback('FOCUS_FIRST'))[0];
    assert.equal(focus.priority, 'FOCUS_FIRST');
    assert.equal(focus.priorityLabel, 'Ưu tiên luyện trước');
    const next = suggestionsForFeedback(feedback('NEXT_STEP'))[0];
    assert.equal(next.priorityLabel, 'Có thể cải thiện thêm');
    assert.equal(suggestionsForFeedback(feedback(null))[0].priorityLabel, null);
    assert.equal(suggestionsForFeedback(feedback('UNKNOWN'))[0].priorityLabel, null);
    assert.ok(!JSON.stringify(focus).includes('must-have'));
});

test('skipped answer has no suggestion and legacy feedback remains safe', () => {
    assert.deepEqual(suggestionsForFeedback(feedback('FOCUS_FIRST'), true), []);
    assert.deepEqual(suggestionsForFeedback({ improvementSuggestion: '' }), []);
    const legacy = suggestionsForFeedback({ improvementSuggestion: 'Legacy suggestion' })[0];
    assert.ok(legacy);
    assert.equal(legacy.priorityLabel, null);
});
