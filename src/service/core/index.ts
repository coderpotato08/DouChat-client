import { message } from "antd";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { Result } from "@service/type";
import { handleAxiosErrorCode } from "./common";

export const baseRequest: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 30000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});
// base 请求拦截器
baseRequest.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    message.error(error.message);
    return Promise.reject(error);
  }
);
// base 响应拦截器
baseRequest.interceptors.response.use(
  (response: AxiosResponse<Result<any>>) => {
    const { code, msg, data }: Result<any> = response.data;
    if (code === 10000) {
      return data;
    } else {
      message.error(msg);
      return response.data;
    }
  },
  async (error: AxiosError) => {
    handleAxiosErrorCode(error);
    return Promise.resolve();
  }
);
