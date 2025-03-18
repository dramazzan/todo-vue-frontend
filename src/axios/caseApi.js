// src/axios.js
import axios from "axios";

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API methods
const api = {
  // Get all cases
  getCaseList: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiClient.get("/cases/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
        return { success: true, data: response.data.cases };
      
     
    } catch (error) {
      handleApiError(error)
    }
  },

  // Get a specific case by ID
  getCaseById: async (id) => {
    try {
      const response = await apiClient.get(`/cases/case/${id}`);
      return { success: true, selectedCase: response.data.selectedCase };
    } catch (error) {
      handleApiError(error)
    }
  },

  // Create a new case
  createCase: async (caseData) => {
    try {
      const response = await apiClient.post("/cases/create", caseData);
      return response.data; // Already contains { success: true, savedCase: {...} }
    } catch (error) {
      handleApiError(error)
    }
  },

  // Update an existing case
  updateCase: async (id, caseData) => {
    try {
      const response = await apiClient.put(`/cases/update/${id}`, caseData);
      return response.data; // Contains { success: true, message: '...', updateCase: {...} }
    } catch (error) {
      handleApiError(error)
    }
  },

  // Delete a case
  deleteCase: async (id) => {
    try {
      const response = await apiClient.delete(`/cases/delete/${id}`);
      return response.data; // Contains { success: true, message: '...', deletedCase: {...} }
    } catch (error) {
      handleApiError(error)
    }
  },

  // Search cases
  searchCases: async (query) => {
    try {
      const response = await apiClient.get(
        `/cases/search?q=${encodeURIComponent(query)}`
      );
      return response.data; // Contains { success: true, cases: [...] }
    } catch (error) {
      handleApiError(error)
    }
  },
};


const handleApiError = (error) => {
  if (error.response) {
    return {
      success: false,
      data: error.response.data,
    };
  } else {
    return {
      success: false,
      message: "Server is not responding",
      errors: {},
    };
  }
};

export default api;
