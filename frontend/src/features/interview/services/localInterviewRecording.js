const DB_NAME = 'smartfolio-local-recordings';
const STORE_NAME = 'interview-recordings';

function openDatabase() {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject(new Error('Trình duyệt không hỗ trợ lưu bản ghi cục bộ.'));
            return;
        }

        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, {keyPath: 'sessionId'});
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Không mở được kho bản ghi cục bộ.'));
    });
}

export async function saveLocalInterviewRecording(sessionId, blob) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).put({sessionId, blob, savedAt: Date.now()});
        transaction.oncomplete = () => { database.close(); resolve(); };
        transaction.onerror = () => { database.close(); reject(transaction.error || new Error('Không lưu được bản ghi.')); };
        transaction.onabort = () => { database.close(); reject(transaction.error || new Error('Lưu bản ghi đã bị hủy.')); };
    });
}

export async function getLocalInterviewRecording(sessionId) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
        const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(sessionId);
        request.onsuccess = () => { database.close(); resolve(request.result?.blob || null); };
        request.onerror = () => { database.close(); reject(request.error || new Error('Không đọc được bản ghi.')); };
    });
}
