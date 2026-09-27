import apiClient from "../../../service/apiClient.js";

export const importCV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/cv/import', formData);
    const extractedData = response.data?.result?.extractedData;
    if (!extractedData || typeof extractedData !== 'object') {
        throw new Error('API không trả về dữ liệu CV hợp lệ.');
    }

    return extractedData;
};
