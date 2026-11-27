import apiClient from './apiClient.js';

export async function getCurrentQuota() {
  const response = await apiClient.get('/v1/payments/quota');
  return response.data?.result ?? response.data?.data ?? response.data;
}

export async function updateTesterPlans({cvPlan, interviewPlan}) {
  const response = await apiClient.patch('/quota/tester-plans', {cvPlan, interviewPlan});
  return response.data?.result ?? response.data?.data ?? response.data;
}
