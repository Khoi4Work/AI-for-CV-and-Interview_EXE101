export class BoundedAudioChunkBuffer {
  constructor(maxChunks) {
    if (!Number.isInteger(maxChunks) || maxChunks < 1) {
      throw new RangeError('maxChunks must be a positive integer.');
    }
    this.maxChunks = maxChunks;
    this.chunks = [];
  }

  push(chunk) {
    this.chunks.push(chunk);
    if (this.chunks.length > this.maxChunks) this.chunks.shift();
  }

  drain() {
    return this.chunks.splice(0, this.chunks.length);
  }
}
