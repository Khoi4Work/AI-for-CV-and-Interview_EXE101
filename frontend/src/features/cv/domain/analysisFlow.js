export const terminalAnalysis = status => ['COMPLETED', 'FAILED', 'INSUFFICIENT_EVIDENCE'].includes(status);

export function createRequestGuard() {
    let version = 0;
    return { next: () => ++version, current: token => token === version, cancel: () => { version++; } };
}

export function analysisSelection(selectedJD, draft) {
    if (selectedJD?.id) return { jdId: selectedJD.id };
    if (draft?.trim()) return { jdText: draft.trim() };
    throw new Error('Hãy chọn hoặc nhập JD.');
}

export async function pollAnalysis(read, id, { signal, onUpdate = () => {}, wait = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
    let delay = 1000;
    while (!signal?.aborted) {
        const result = await read(id, signal);
        if (signal?.aborted) throw new DOMException('Đã hủy', 'AbortError');
        onUpdate(result);
        if (terminalAnalysis(result.status)) return result;
        await wait(delay);
        delay = Math.min(5000, delay * 1.5);
    }
    throw new DOMException('Đã hủy', 'AbortError');
}
