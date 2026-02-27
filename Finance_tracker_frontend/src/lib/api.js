// Wraps Axios to match the previous API signature for easier migration
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    let token = config.accessToken;
    if (!token) {
      try {
        const raw = localStorage.getItem("pft_auth");
        if (raw) token = JSON.parse(raw)?.state?.accessToken;
      } catch { /* ignore */ }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const triggerGlobalLogout = () => {
  try {
    import("../stores/authStore.js").then((mod) => {
      const s = mod.useAuthStore.getState();
      if (s.accessToken) s.logout().catch(() => { });
    });
  } catch { /* ignore */ }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.retry !== false) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${baseURL}/api/v1/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data?.data?.tokens?.accessToken;
        if (newToken) {
          try {
            const mod = await import("../stores/authStore.js");
            mod.useAuthStore.getState().setAccessToken(newToken);
          } catch { /* ignore */ }

          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return axiosInstance(originalRequest);
        } else {
          throw new Error("No token returned");
        }
      } catch (err) {
        processQueue(err, null);
        triggerGlobalLogout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Wrapper to match previous get/post/put/del signatures returning the data payload directly
export const api = {
  get: async (path, opts) => {
    const res = await axiosInstance.get(path, opts);
    return res.data;
  },
  post: async (path, body, opts) => {
    const res = await axiosInstance.post(path, body, opts);
    return res.data;
  },
  put: async (path, body, opts) => {
    const res = await axiosInstance.put(path, body, opts);
    return res.data;
  },
  del: async (path, opts) => {
    const res = await axiosInstance.delete(path, opts);
    return res.data;
  },
};
