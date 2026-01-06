import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";

export const AXIOS_INSTANCE = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

AXIOS_INSTANCE.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    const shouldExcludeToken = config.url === "/auth/signin" || config.url === "/auth/signup";

    if (token && !shouldExcludeToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

AXIOS_INSTANCE.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const shouldSkipRedirect = error.config?.url === "/auth/signin" || error.config?.url === "/auth/signup";
    if (error.response?.status === 401 && !shouldSkipRedirect) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/auth/signin";
    }
    return Promise.reject(error);
  }
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  return AXIOS_INSTANCE({
    ...config,
    ...options,
  }).then((response: AxiosResponse<T>) => response.data);
};
