import { AxiosRequestConfig } from "axios";
import { baseRequest } from "./core";
import { fetchEventSource } from "@fortaine/fetch-event-source";

export type SSEConfig = {
  signal?: AbortSignal;
  onMessage: (data: string) => void;
  onEnd: () => void;
  onError: () => void;
  onClose: () => void;
};

export const serviceRequest = {
  get(url: string, config?: AxiosRequestConfig) {
    return baseRequest.get(url, config);
  },
  post<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return baseRequest.post(url, params, config);
  },

  async sse(url: string, params: any, config: SSEConfig): Promise<void> {
    const { signal, onMessage, onError, onEnd, onClose } = config;
    try {
      await fetchEventSource(
        `/api${url.indexOf("/") === 0 ? url : "/" + url}`,
        {
          method: "POST",
          body: JSON.stringify(params),
          headers: {
            "Content-Type": "application/json",
          },
          onmessage: (event) => {
            if (event.data === "[DONE]") {
              onEnd();
              return;
            }
            onMessage(event.data);
          },
          onerror: () => {
            onError();
          },
          onclose: () => {
            onClose();
          },
        }
      );
    } catch (_) {
      console.error({ message: `请求失败` });
    }
  },
};
