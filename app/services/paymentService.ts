import axios from 'axios';

const API_URL = 'http://localhost:8081/api'; // Spring Boot của bạn

export const paymentService = {
  // Thanh toán Stripe
  createStripePayment: async (orderId: string, amount: number) => {
    try {
      const response = await axios.post(`${API_URL}/payments/stripe/create`, {
        orderId,
        amount,
        currency: 'vnd'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Thanh toán PayOS
  createPayOSPayment: async (orderId: string, amount: number, description: string) => {
    try {
      const response = await axios.post(`${API_URL}/payments/payos/create`, {
        orderId,
        amount,
        description
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Thanh toán Momo
  createMomoPayment: async (orderId: string, amount: number) => {
    try {
      const response = await axios.post(`${API_URL}/payments/momo/create`, {
        orderId,
        amount,
        orderInfo: `Thanh toán đơn hàng ${orderId}`
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xác nhận thanh toán
  verifyPayment: async (orderId: string) => {
    try {
      const response = await axios.get(`${API_URL}/payments/verify/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};