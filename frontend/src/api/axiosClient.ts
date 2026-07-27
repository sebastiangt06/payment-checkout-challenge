// src/api/axiosClient.ts
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://payment-checkout-challenge-api.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos max de espera
});

export default axiosClient;