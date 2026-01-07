import api from '../utils/api';

export const getDashboardData = async () => {
  try {
    const response = await api.get('/dashboard');
    // The API returns { success: true, data: {...} }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
