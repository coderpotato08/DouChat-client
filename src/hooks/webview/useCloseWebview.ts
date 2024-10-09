import { appWindow } from '@tauri-apps/api/window';
import { CallbackKeys, CallbackParams } from './types';
import { emit } from '@tauri-apps/api/event';
import { getFullCallbackKey } from './useOpenWebview';

type CloseWebviewFunc = (
  callbackKey?: CallbackKeys,
  params?: CallbackParams[CallbackKeys]
) => void;
export const useCloseWebview = ():CloseWebviewFunc => {

  return (callbackKey, params) => {
    if(callbackKey) {
      emit(getFullCallbackKey(callbackKey), params || {});
    }
    appWindow.close();
  }
}