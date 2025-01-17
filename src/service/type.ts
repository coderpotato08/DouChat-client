import { AxiosResponse } from "axios";

export interface Result<T = any> extends AxiosResponse {
  code: number | string;
  msg: string | null | undefined;
  data: T;
}

export enum AxiosErrorCode {
  ECONNABORTED = "ECONNABORTED",
  ECONNREFUSED = "ECONNREFUSED",
  ECONNRESET = "ECONNRESET",
  ETIMEDOUT = "ETIMEDOUT",
  ENOTFOUND = "ENOTFOUND",
  ERR_NETWORK = "ERR_NETWORK",
}

export const AxiosErrorCodeMap = {
  [AxiosErrorCode.ECONNABORTED]: "请求超时, 请稍后重试",
  [AxiosErrorCode.ECONNREFUSED]: "请求被拒绝",
  [AxiosErrorCode.ECONNRESET]: "链接已被重置",
  [AxiosErrorCode.ETIMEDOUT]: "请求超时, 请稍后重试",
  [AxiosErrorCode.ENOTFOUND]: "资源未找到, 请稍后重试",
  [AxiosErrorCode.ERR_NETWORK]: "网络错误, 请稍后重试",
};