import { message } from "antd";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HttpStatusCode,
  InternalAxiosRequestConfig,
} from "axios";

export interface Result<T = any> extends AxiosResponse {
  code: number | string;
  msg: string | null | undefined;
  data: T;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    // "Access-Control-Allow-Origin": "*"
  },
});
// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    message.error(error.message);
    return Promise.reject(error);
  }
);
// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<Result<any>>) => {
    const { code, msg, data }: Result<any> = response.data;
    if (code === 10000) {
      return data;
    } else {
      message.error(msg);
      return response.data;
    }
  },
  (error: AxiosError) => {
    let msg = "";
    const status = error.response?.status;
    switch (status) {
      case HttpStatusCode.Unauthorized:
        msg = "会话已过期，请重新登陆";
        break;
      default:
        break;
    }
    msg && message.error(msg);
    return Promise.reject(error);
  }
);

export const AxiosHelper = {
  get(url: string, config?: AxiosRequestConfig) {
    return axiosInstance.get(url, config);
  },
  post<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return axiosInstance.post(url, params, config);
  },
};
