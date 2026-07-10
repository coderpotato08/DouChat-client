import { AxiosRequestConfig } from "axios";
import { baseRequest } from "./core";
import { EventStreamContentType, fetchEventSource } from "@fortaine/fetch-event-source";

type SSERetryConfig = {
  initialDelayMs?: number;
  maxDelayMs?: number;
  multiplier?: number;
  maxRetries?: number;
};

type SSERequestError = Error & {
  status?: number;
  retriable?: boolean;
};

const DEFAULT_SSE_RETRY_CONFIG: Required<SSERetryConfig> = {
  initialDelayMs: 300,
  maxDelayMs: 8000,
  multiplier: 2,
  maxRetries: 4,
};

const buildSSERequestError = (
  message: string,
  retriable: boolean,
  status?: number,
): SSERequestError => {
  const error = new Error(message) as SSERequestError;
  error.status = status;
  error.retriable = retriable;
  return error;
};

const resolveRetryDelay = (
  error: unknown,
  retryCount: number,
  retryConfig?: false | SSERetryConfig,
): number | null => {
  if (retryConfig === false) {
    return null;
  }

  const mergedConfig = {
    ...DEFAULT_SSE_RETRY_CONFIG,
    ...retryConfig,
  };

  const typedError = error as SSERequestError;
  const shouldRetry = typedError.retriable ?? true;
  if (!shouldRetry) {
    return null;
  }

  if (retryCount >= mergedConfig.maxRetries) {
    return null;
  }

  const nextDelay = mergedConfig.initialDelayMs * mergedConfig.multiplier ** retryCount;
  return Math.min(nextDelay, mergedConfig.maxDelayMs);
};

export type SSEConfig = {
  signal?: AbortSignal;
  onMessage: (data: string) => void;
  onEnd: () => void;
  onError: () => void;
  onClose: () => void;
  retry?: false | SSERetryConfig;
};

export const serviceRequest = {
  get(url: string, config?: AxiosRequestConfig) {
    return baseRequest.get(url, config);
  },
  post<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return baseRequest.post(url, params, config);
  },

  async sse(url: string, params: any, config: SSEConfig): Promise<void> {
    const { signal, onMessage, onError, onEnd, onClose, retry } = config;
    const controller = new AbortController();
    let completed = false;
    let terminalErrorHandled = false;
    let retryCount = 0;

    const handleAbort = (): void => {
      controller.abort();
    };

    if (signal) {
      if (signal.aborted) {
        handleAbort();
      } else {
        signal.addEventListener("abort", handleAbort, { once: true });
      }
    }

    try {
      await fetchEventSource(
        `/api${url.indexOf("/") === 0 ? url : "/" + url}`,
        {
          signal: controller.signal,
          method: "POST",
          body: JSON.stringify(params),
          headers: {
            "Content-Type": "application/json",
          },
          async onopen(response) {
            const contentType = response.headers.get("content-type") || "";
            if (response.ok && contentType.includes(EventStreamContentType)) {
              retryCount = 0;
              return;
            }

            if (response.status >= 400 && response.status < 500 && response.status !== 429) {
              throw buildSSERequestError("SSE request failed", false, response.status);
            }

            throw buildSSERequestError("SSE request failed", true, response.status);
          },
          onmessage: (event) => {
            if (event.data === "[DONE]") {
              completed = true;
              onEnd();
              controller.abort();
              return;
            }
            onMessage(event.data);
          },
          onclose: () => {
            if (completed || controller.signal.aborted) {
              onClose();
              return;
            }

            throw buildSSERequestError("SSE connection closed unexpectedly", false);
          },
          onerror: (error) => {
            if (controller.signal.aborted) {
              return;
            }

            const delay = resolveRetryDelay(error, retryCount, retry);
            if (delay === null) {
              terminalErrorHandled = true;
              onError();
              throw error;
            }

            retryCount += 1;
            return delay;
          },
        },
      );
    } catch (error) {
      if (!controller.signal.aborted && !terminalErrorHandled) {
            onError();
        console.error({ message: "SSE 请求失败", error });
      }
    } finally {
      signal?.removeEventListener("abort", handleAbort);
    }
  },
};
