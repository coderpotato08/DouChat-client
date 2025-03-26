import { message } from "antd";
import { AxiosError } from "axios";
import { AxiosErrorCode, AxiosErrorCodeMap } from "@service/type";

export const handleAxiosErrorCode = (error: AxiosError) => {
  const { code } = error;
  const errMessage = AxiosErrorCodeMap[code as AxiosErrorCode];
  message.error(errMessage || '网络异常，请稍后重试');
};

export const getBaseUrl = () => {
  const env = import.meta.env.MODE;
  if (env === "development") {
    return window.location.origin;
  }
  return window.location.origin;
}
