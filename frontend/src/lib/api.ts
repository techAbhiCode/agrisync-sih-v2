import axios from 'axios';
import { auth } from './firebase';

// Setup base instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Interceptor: Har request se pehle yeh function chalega
api.interceptors.request.use(
  async (config) => {
    // Wait for Firebase to initialize its auth state
    await auth.authStateReady();
    
    // Agar Firebase mein user logged in hai, toh uska fresh token nikalo
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getNearbyMandis = async (lat: number, lng: number) => {
  try {
    const response = await api.get(`/logistics/nearby?lat=${lat}&lng=${lng}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby mandis', error);
    throw error;
  }
};

export const createBooking = async (bookingData: any) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking', error);
    throw error;
  }
};

export const getUserBookings = async () => {
  try {
    const response = await api.get('/bookings');
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings', error);
    throw error;
  }
};

export const syncUserProfile = async (userData: { name?: string, email?: string, role?: string, mandiId?: string, profileData?: any }) => {
  try {
    const response = await api.post('/users/sync', userData);
    return response.data;
  } catch (error) {
    console.error('Error syncing user profile', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData: any) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile', error);
    throw error;
  }
};

export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications', error);
    throw error;
  }
};

export const markNotificationRead = async (id: string) => {
  try {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification read', error);
    throw error;
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications read', error);
    throw error;
  }
};

export const clearAllNotifications = async () => {
  try {
    const response = await api.delete('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error clearing notifications', error);
    throw error;
  }
};

export const scanBooking = async (virtualToken: string, newStatus?: string) => {
  try {
    const response = await api.put('/bookings/status', { virtualToken, newStatus });
    return response.data;
  } catch (error) {
    console.error('Error scanning booking', error);
    throw error;
  }
};

export const verifyBookingTime = async (virtualToken: string) => {
  try {
    const response = await api.post('/bookings/verify', { virtualToken });
    return response.data;
  } catch (error) {
    console.error('Error verifying booking time', error);
    throw error;
  }
};

export const reportDelay = async (virtualToken: string, delayReason: string, currentLocation?: any) => {
  try {
    const response = await api.post('/bookings/report-delay', { virtualToken, delayReason, currentLocation });
    return response.data;
  } catch (error) {
    console.error('Error reporting delay', error);
    throw error;
  }
};

export const getMandiDashboardStats = async () => {
  try {
    const response = await api.get('/bookings/mandi/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching mandi dashboard stats', error);
    throw error;
  }
};

export const getSlotAvailability = async (mandiId: string, date?: string) => {
  try {
    let url = `/bookings/slots/availability?mandiId=${encodeURIComponent(mandiId)}`;
    if (date) {
      url += `&date=${encodeURIComponent(date)}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching slot availability', error);
    throw error;
  }
};

export const getAdvisoryHistory = async () => {
  try {
    const response = await api.get('/advisory/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching advisory history', error);
    throw error;
  }
};

export const askAdvisory = async (question: string) => {
  try {
    const response = await api.post('/advisory/ask', { question });
    return response.data;
  } catch (error) {
    console.error('Error asking advisory', error);
    throw error;
  }
};

export const getMarketInsights = async (timeframe: 'yearly' | 'monthly') => {
  try {
    const response = await api.get(`/insights/market?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching market insights', error);
    throw error;
  }
};

export const getLatestMandiPrices = async (state: string, district: string) => {
  try {
    const response = await api.get(`/insights/mandi-prices?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mandi prices', error);
    throw error;
  }
};

export const bookTruck = async (bookingData: any) => {
  try {
    const response = await api.post('/logistics/book-truck', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error booking truck', error);
    throw error;
  }
};

export const getMyTruckBookings = async () => {
  try {
    const response = await api.get('/logistics/my-trucks');
    return response.data;
  } catch (error) {
    console.error('Error fetching truck bookings', error);
    throw error;
  }
};

export const updateTruckStatus = async (bookingId: string, status: string) => {
  try {
    const response = await api.put(`/logistics/book-truck/${bookingId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating truck status', error);
    throw error;
  }
};

export const submitMandiRequest = async (requestData: any) => {
  try {
    const response = await api.post('/admin/mandi-request', requestData);
    return response.data;
  } catch (error) {
    console.error('Error submitting mandi request', error);
    throw error;
  }
};

export const getPendingMandiRequests = async () => {
  try {
    const response = await api.get('/admin/mandi-requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching mandi requests', error);
    throw error;
  }
};

export const approveMandiRequest = async (id: string) => {
  try {
    const response = await api.put(`/admin/mandi-requests/${id}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving mandi request', error);
    throw error;
  }
};

export const rejectMandiRequest = async (id: string, comment: string = '') => {
  try {
    const response = await api.put(`/admin/mandi-requests/${id}/reject`, { comment });
    return response.data;
  } catch (error) {
    console.error('Error rejecting mandi request', error);
    throw error;
  }
};

export const initSuperAdmin = async () => {
  try {
    const response = await api.post('/admin/init-super-admin');
    return response.data;
  } catch (error) {
    console.error('Error initializing super admin', error);
    throw error;
  }
};

export const getCropRecommendations = async (location: string) => {
  try {
    const response = await api.get(`/advisory/recommend-crops?location=${encodeURIComponent(location)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching crop recommendations', error);
    throw error;
  }
};

export default api;