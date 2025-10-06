import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token for request:', error);
    }
    
    console.log('Making request to:', config.url);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Add a lock to prevent multiple simultaneous refresh attempts
      if (api.isRefreshing) {
        return new Promise((resolve) => {
          api.refreshSubscribers.push(() => {
            resolve(api(originalRequest));
          });
        });
      }
      
      api.isRefreshing = true;
      api.refreshSubscribers = api.refreshSubscribers || [];
      
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/refresh/`, {
            refresh: refreshToken
          });
          
          if (response.data.status === 'success') {
            const { access, refresh } = response.data.tokens;
            await AsyncStorage.setItem('access_token', access);
            await AsyncStorage.setItem('refresh_token', refresh);
            
            // Update the Authorization header for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            
            // Retry all queued requests
            api.refreshSubscribers.forEach(callback => callback());
            api.refreshSubscribers = [];
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
        console.error('Token refresh failed:', refreshError);
        
        // Notify all queued requests that refresh failed
        api.refreshSubscribers.forEach(callback => callback());
        api.refreshSubscribers = [];
      } finally {
        api.isRefreshing = false;
      }
    }
    
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

api.isRefreshing = false;
api.refreshSubscribers = [];

export const apiService = {
  testConnection: () => api.get('/test/'),
  
  // API Calls for User Auth
  createUser: (name, heightFeet, heightInches, weight, activityLevel, email, password) => 
    api.post('/create_user/', {
      name,
      height_feet: heightFeet,
      height_inches: heightInches,
      weight,
      activity_level: activityLevel,
      email,
      password
    }),
  
  loginUser: (email, password) => 
    api.post('/login/', {
      email,
      password
    }),
  
  getCurrentUser: () => api.get('/me/'),
  
  refreshToken: (refreshToken) =>
    api.post('/refresh/', {
      refresh: refreshToken
    }),

  // API Calls for Chat Bot
  chatWithAI: (message) => 
  api.post('/chat/', {
    message
  }),

  // API Calls for Workouts
  createWorkout: (workoutData) =>
    api.post('/create-workout/', workoutData),
  
  updateWorkoutProgress: (workoutId, progressData) =>
    api.put(`/update-workout-progress/${workoutId}/`, progressData),
  
  completeWorkout: (workoutId) =>
    api.post(`/complete-workout/${workoutId}/`),

  getWorkouts: () => api.get('/get-workouts/'),

  // API Calls for Food
  createFood: (foodData) => 
    api.post('/create-food/', foodData),

  getFood: (params) => api.get('/get-food/', { params }),
};

export default api;