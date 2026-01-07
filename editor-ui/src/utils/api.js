// frontend/src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const url = (config.url || "").toLowerCase();
  if (!/\/auth\/login$/.test(url)) {
    const token = localStorage.getItem("pos-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  if (import.meta.env.DEV) {
    console.log(
      "[API] →",
      config.method?.toUpperCase(),
      config.baseURL + config.url,
      {
        hasToken: !!config.headers.Authorization,
      }
    );
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    const url = (err?.config?.url || "").toLowerCase();
    if (status === 401 && !/\/auth\/login$/.test(url)) {
      localStorage.removeItem("pos-token");
      localStorage.removeItem("pos-user");
      if (window.location.pathname !== "/login")
        window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
