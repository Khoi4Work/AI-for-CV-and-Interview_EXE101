import assert from 'node:assert/strict';
import test from 'node:test';
import { canAcceptInterviewAnswer, getInterviewRoomPrompt, isTranscriptChanging } from '../src/features/interview/services/interviewRoomStatus.js';

test('keeps the answer timer paused while speech recognition is connecting', () => {
  assert.equal(canAcceptInterviewAnswer({ phase: 'recording', sttStatus: 'connecting' }), false);
  assert.equal(getInterviewRoomPrompt({ phase: 'recording', sttStatus: 'connecting' }), 'Đang kết nối nhận diện giọng nói…');
  assert.equal(getInterviewRoomPrompt({ phase: 'recording', sttStatus: 'idle' }), 'Đang kết nối nhận diện giọng nói…');
});

test('does not mistake the transcript reset between questions for new speech', () => {
  assert.equal(isTranscriptChanging('Câu trả lời cũ', ''), false);
  assert.equal(isTranscriptChanging('', 'Tôi có thể giải quyết vấn đề này'), true);
  assert.equal(isTranscriptChanging('Tôi có thể giải quyết', 'Tôi có thể giải quyết'), false);
});

test('keeps the no-answer timer lifecycle active while the reminder pauses speech recognition', () => {
  assert.equal(canAcceptInterviewAnswer({ phase: 'recording', sttStatus: 'idle', isReminderActive: true }), true);
  assert.equal(getInterviewRoomPrompt({ phase: 'recording', sttStatus: 'paused' }), 'AI đang nhắc lại, vui lòng chờ…');
});

test('allows answering and starts the timer only after speech recognition is ready', () => {
  assert.equal(canAcceptInterviewAnswer({ phase: 'recording', sttStatus: 'ready' }), true);
  assert.equal(getInterviewRoomPrompt({ phase: 'recording', sttStatus: 'ready' }), 'Hãy trả lời hoặc nói "xin hết"');
});

test('reports recognition failure without inviting the user to speak', () => {
  assert.equal(canAcceptInterviewAnswer({ phase: 'recording', sttStatus: 'unavailable' }), false);
  assert.equal(getInterviewRoomPrompt({ phase: 'recording', sttStatus: 'unavailable' }), 'Không kết nối được nhận diện giọng nói. Hãy kiểm tra micro hoặc mạng.');
});
import { BoundedAudioChunkBuffer } from '../src/features/interview/services/boundedAudioChunkBuffer.js';

test('buffers speech chunks in order while STT connects and keeps only the latest bounded window', () => {
  const buffer = new BoundedAudioChunkBuffer(3);
  buffer.push('first');
  buffer.push('second');
  buffer.push('third');
  buffer.push('fourth');

  assert.deepEqual(buffer.drain(), ['second', 'third', 'fourth']);
  assert.deepEqual(buffer.drain(), []);
});
