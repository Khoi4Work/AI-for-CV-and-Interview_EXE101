import apiClient from "../../../service/apiClient.js";

export const importCV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/cv/import', formData);
    const result = response.data?.result;
    const extractedData = result?.extractedData;
    if (!extractedData || typeof extractedData !== 'object') {
        throw new Error('API không trả về dữ liệu CV hợp lệ.');
    }

    return result;
};

export const extractCV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/cv/extract', formData);
    const extractedData = response.data?.result;
    if (!extractedData || typeof extractedData !== 'object') {
        throw new Error('API không trả về dữ liệu CV hợp lệ.');
    }
    return extractedData;
};
