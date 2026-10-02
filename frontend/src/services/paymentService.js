import axios from 'axios';
import apiClient from '../service/apiClient.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const paymentService = {
    async getCurrentQuota() {
        const response = await apiClient.get('/v1/payments/quota');
        return response.data?.result || response.data?.data;
    },

    async getPaymentServices() {
        try {
            const response = await axios.get(`${API_BASE_URL}/v1/payments/services`);
            console.log("DEBUG: RAW AXIOS RESPONSE:", response);
            return response.data?.result || response.data?.data || [];
        } catch (error) {
            console.error('Error fetching payment services:', error);
            throw error;
        }
    },

    async createCheckoutOrder(serviceId, paymentMethod) {
        try {
            const response = await apiClient.post('/v1/payments/checkout', {
                serviceId,
                paymentMethod,
            });
            return response.data?.result || response.data?.data;
        } catch (error) {
            console.error('Error creating checkout order:', error);
            throw error;
        }
    }
};

