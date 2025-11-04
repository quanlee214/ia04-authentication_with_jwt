import axios from "axios";

declare global {
  interface Window {
    __accessToken?: string | null;
  }
}

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    // Lấy accessToken từ AuthContext
    // Vì không thể dùng hook ở đây, nên sẽ lấy từ window (giải pháp tạm thời)
    const accessToken = window.__accessToken;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Lấy refreshToken từ localStorage
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/refresh`, { refreshToken });
          const { accessToken } = res.data;
          // Lưu accessToken vào window (giải pháp tạm thời)
          window.__accessToken = accessToken;
          // Gắn lại accessToken vào header và retry request
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Nếu refresh thất bại, logout và chuyển về login
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("email");
          window.__accessToken = null;
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
