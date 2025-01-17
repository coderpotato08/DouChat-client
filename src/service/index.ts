import { AxiosRequestConfig } from "axios";
import { baseRequest } from "./core";

export const AxiosHelper = {
  get(url: string, config?: AxiosRequestConfig) {
    return baseRequest.get(url, config);
  },
  post<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return baseRequest.post(url, params, config);
  },
};