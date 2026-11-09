import assert from 'node:assert/strict';
import test from 'node:test';
import ElevenLabsTranscriptionClient from '../src/features/interview/services/elevenLabsTranscriptionClient.js';
import { interviewService } from '../src/features/interview/services/interviewService.js';

test('preconnects the speech socket before a microphone stream is attached', async () => {
  const originalWebSocket = globalThis.WebSocket;
  const originalWindow = globalThis.window;
  const originalCreateSttToken = interviewService.createSttToken;
  let requestedSessionId;
  let socketUrl;

  class FakeWebSocket {
    static OPEN = 1;

    constructor(url) {
      socketUrl = url;
      this.readyState = 0;
      queueMicrotask(() => {
        this.readyState = FakeWebSocket.OPEN;
        this.onopen?.();
        this.onmessage?.({ data: JSON.stringify({ message_type: 'session_started' }) });
      });
    }

    close() {
      this.readyState = 3;
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  globalThis.window = {
    setTimeout,
    clearTimeout,
  };
  interviewService.createSttToken = async (sessionId) => {
    requestedSessionId = sessionId;
    return { token: 'single-use-token' };
  };

  const client = new ElevenLabsTranscriptionClient(() => {});
  try {
    await client.connect('session-123', 'vi');

    assert.equal(requestedSessionId, 'session-123');
    assert.match(socketUrl, /language_code=vi/);
    assert.equal(client.socket.readyState, FakeWebSocket.OPEN);
    assert.equal(client.processor, null);
  } finally {
    client.stop();
    interviewService.createSttToken = originalCreateSttToken;
    globalThis.WebSocket = originalWebSocket;
    globalThis.window = originalWindow;
  }
});
