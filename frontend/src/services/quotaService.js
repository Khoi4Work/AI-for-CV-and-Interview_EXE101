import apiClient from './apiClient.js';

export async function getCurrentQuota() {
  const response = await apiClient.get('/v1/payments/quota');
  return response.data?.result ?? response.data?.data ?? response.data;
}
