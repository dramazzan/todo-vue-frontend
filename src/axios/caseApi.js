// src/axios.js
import axios from 'axios';

// Create axios instance with base URL
const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
      "Content-Type": "application/json",
    },
  });

// Add request interceptor to include authentication token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// API methods
const api = {
  // Get all cases
  getCaseList: async () => {
    try {
      const response = await apiClient.get('/cases/all');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching cases:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch cases' 
      };
    }
  },

  // Get a specific case by ID
  getCaseById: async (id) => {
    try {
      const response = await apiClient.get(`/cases/case/${id}`);
      return { success: true, selectedCase: response.data.selectedCase };
    } catch (error) {
      console.error(`Error fetching case ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch case' 
      };
    }
  },

  // Create a new case
  createCase: async (caseData) => {
    try {
      const response = await apiClient.post('/cases/create', caseData);
      return response.data; // Already contains { success: true, savedCase: {...} }
    } catch (error) {
      console.error('Error creating case:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create case',
        errors: error.response?.data?.errors
      };
    }
  },

  // Update an existing case
  updateCase: async (id, caseData) => {
    try {
      const response = await apiClient.put(`/cases/update/${id}`, caseData);
      return response.data; // Contains { success: true, message: '...', updateCase: {...} }
    } catch (error) {
      console.error(`Error updating case ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update case',
        errors: error.response?.data?.errors
      };
    }
  },

  // Delete a case
  deleteCase: async (id) => {
    try {
      const response = await apiClient.delete(`/cases/delete/${id}`);
      return response.data; // Contains { success: true, message: '...', deletedCase: {...} }
    } catch (error) {
      console.error(`Error deleting case ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete case' 
      };
    }
  },

  // Search cases
  searchCases: async (query) => {
    try {
      const response = await apiClient.get(`/cases/search?q=${encodeURIComponent(query)}`);
      return response.data; // Contains { success: true, cases: [...] }
    } catch (error) {
      console.error('Error searching cases:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to search cases' 
      };
    }
  }
};

export default api;