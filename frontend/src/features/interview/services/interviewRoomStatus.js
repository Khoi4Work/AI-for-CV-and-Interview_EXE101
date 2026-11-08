export function canAcceptInterviewAnswer({ phase, sttStatus, isCodeEditorOpen = false, isReminderActive = false }) {
  return phase === 'recording' && (sttStatus === 'ready' || isCodeEditorOpen || isReminderActive);
}

export function getInterviewRoomPrompt({ phase, sttStatus }) {
  if (phase !== 'recording') return '';
  if (sttStatus === 'paused') return 'AI đang nhắc lại, vui lòng chờ…';
  if (sttStatus === 'idle' || sttStatus === 'connecting') return 'Đang kết nối nhận diện giọng nói…';
  if (sttStatus === 'unavailable') return 'Không kết nối được nhận diện giọng nói. Hãy kiểm tra micro hoặc mạng.';
  return 'Hãy trả lời hoặc nói "xin hết"';
}

export function isTranscriptChanging(previousTranscript, currentTranscript) {
  const current = currentTranscript?.trim() || '';
  return current.length > 0 && current !== previousTranscript;
}
