import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const registerUser = async (user) => {
  try {
    const response = await api.post("/users/register", user);
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

const loginUser = async (login, password) => {
  try {
    const response = await api.post("/users/login", { login, password });

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};


const logoutUser = () => {
  localStorage.removeItem("token");
};


const getToken = () => localStorage.getItem('token');

const getUserData = async () => {
  try {
    const token = getToken();
    if (!token) throw new Error('Токен отсутствует!');

    const response = await api.get('/users/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });

    return {success: true , data: response.data};
  } catch (error) {
    return handleApiError(error)
  }
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




export default {
  registerUser,
  loginUser,
  logoutUser,
  getUserData
};
