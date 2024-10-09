import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
});

// Add an interceptor to include the token in requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Check if the response status is 401 (Unauthorized)
    if (response && response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
