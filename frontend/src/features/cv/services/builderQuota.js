export const CV_CREATION_QUOTA_MESSAGE = 'Bạn đã hết lượt tạo CV. Vui lòng nâng cấp gói để tiếp tục.';

export async function checkBuilderQuota(getQuota) {
    const quota = await getQuota();
    const count = quota?.remainingCvCount;
    if (!Number.isInteger(count) || count < 0) {
        throw new Error('Không xác định được lượt tạo CV còn lại. Vui lòng thử lại.');
    }
    if (count === 0) {
        const error = new Error(CV_CREATION_QUOTA_MESSAGE);
        error.code = 'CV_CREATION_QUOTA_EXCEEDED';
        throw error;
    }
    return quota;
}
