import { suggestionPriorityLabel } from '../constants/feedbackInterviewRubric.js';

export function suggestionsForFeedback(perQuestion, skipped = false) {
  if (skipped || !perQuestion?.improvementSuggestion) return [];
  const priorityLabel = suggestionPriorityLabel(perQuestion.suggestionPriority);
  return [{
    priority: priorityLabel ? perQuestion.suggestionPriority : null,
    priorityLabel,
    text: perQuestion.improvementSuggestion,
  }];
}
