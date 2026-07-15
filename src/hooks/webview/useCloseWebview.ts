import { emit } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { isTauri } from "@utils/env";
import type { CallbackKeys, CallbackParams } from "./types";
import { getFullCallbackKey } from "./useOpenWebview";

type CloseWebviewFunc = (callbackKey?: CallbackKeys, params?: CallbackParams[CallbackKeys]) => void;

export const useCloseWebview = (): CloseWebviewFunc => {
  return (callbackKey, params) => {
    // 非Tauri环境（浏览器调试）兜底：尝试关闭当前标签
    if (!isTauri()) {
      window.close();
      return;
    }

    if (callbackKey) {
      emit(getFullCallbackKey(callbackKey), params || {});
    }
    getCurrentWebviewWindow().close();
  };
};
