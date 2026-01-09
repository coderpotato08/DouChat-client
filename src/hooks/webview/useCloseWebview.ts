import { emit } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import type { CallbackKeys, CallbackParams } from "./types";
import { getFullCallbackKey } from "./useOpenWebview";

const appWindow = getCurrentWebviewWindow();

type CloseWebviewFunc = (callbackKey?: CallbackKeys, params?: CallbackParams[CallbackKeys]) => void;
export const useCloseWebview = (): CloseWebviewFunc => {
  return (callbackKey, params) => {
    if (callbackKey) {
      emit(getFullCallbackKey(callbackKey), params || {});
    }
    appWindow.close();
  };
};
