import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { WebviewWindow, WindowOptions } from "@tauri-apps/api/window";
import { MutableRefObject, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { isTauri } from "@utils/env";
import {
  CallbackKeys,
  CallbacksConfig,
  OpenWebviewFuncProps,
  RouterMapType,
} from "./types";
import { RouterPath } from "@constant/router-types";
import { hasObjectParam, splitObjectByPrefix } from "@utils/object";
import { APP_NANE_PREFIX, dataKeyName } from "@constant/common-types";
import { getUuid } from "@helper/uuid-helper";
import { LocalStorageHelper } from "@helper/storage-helper";
import { getFullUrl } from "@utils/url";

type OpenWebviewFunc = <T extends RouterPath, R extends RouterMapType>(
  props?: OpenWebviewFuncProps<T, R>
) => Promise<any>;

export const getFullCallbackKey = (key: CallbackKeys) => {
  return `tauri-event://${key}`;
};

export const useOpenWebview = (
  url: RouterPath,
  options?: WindowOptions
): OpenWebviewFunc => {
  const navigate = useNavigate();
  // 注销监听事件列表
  const unlisteners = useRef<Record<string, UnlistenFn>>({});
  const webview: MutableRefObject<WebviewWindow | null> = useRef(null);

  useEffect(() => {
    return () => {
      webview.current = null;
      const unlistenerKeys = Object.getOwnPropertyNames(unlisteners.current);
      unlistenerKeys.forEach((key) => {
        const unlistener = unlisteners.current[key];
        unlistener();
      });
      unlisteners.current = {};
    };
  }, []);

  const handleEventListener = (callbacks: CallbacksConfig) => {
    if (callbacks) {
      Object.getOwnPropertyNames(callbacks).forEach(async (key) => {
        const callbackFunc = callbacks[key as CallbackKeys];
        const cbFullKey = getFullCallbackKey(key as CallbackKeys);
        unlisteners.current[cbFullKey] = await listen(cbFullKey, (event) => {
          const { payload } = event;
          callbackFunc?.(payload as any);
        });
      });
    }
  };

  const initWebview = (initOptions: {
    urlKey: string; // 带/:id的url，用作WebviewWindow的唯一标识
    fullUrl: string; // 带/:id和query的完整url
  }): WebviewWindow => {
    const { urlKey, fullUrl } = initOptions;
    return new WebviewWindow(`tarui-page:/${urlKey}`, {
      url: fullUrl,
      ...(options || {}),
    });
  };

  return async (props?) => {
    // url与query前置处理
    const urlKey = `${url}${props?.id ? "/" + props.id : ""}`;

    // 拆分出_DouChat_开头的params
    const [innerParams, inputParams] = splitObjectByPrefix(
      props?.params || {},
      APP_NANE_PREFIX
    );

    let params: Record<string, any> = {};
    const dataJson = JSON.stringify(inputParams || {});
    if (dataJson.length > 255 || hasObjectParam(inputParams)) {
      const dataKey = "input_key_" + getUuid();
      LocalStorageHelper.setLocalData(dataKey, inputParams, 60);
      params = { [dataKeyName]: dataKey, innerParams };
    } else {
      params = { ...innerParams, ...inputParams };
    }

    const fullUrl = getFullUrl(urlKey, params);

    if (isTauri()) {
      if (!webview.current) {
        if (props?.callbacks) {
          handleEventListener(props.callbacks);
        }
        return new Promise((resolve, reject) => {
          webview.current = initWebview({ urlKey, fullUrl });
          webview.current.once("tauri://created", function () {
            console.log("成功创建 webview 窗口");
            resolve(void 0);
          });
          webview.current.once("tauri://error", function (e: any) {
            console.log("创建webview窗口时发生错误", e);
            reject(e);
          });
          webview.current.listen("tauri://destroyed", () => {
            console.log("webview 窗口销毁");
            webview.current = null;
          });
        });
      } else {
        return webview.current.show();
      }
    } else {
      // 浏览器调试兜底
      navigate(fullUrl);
      return Promise.resolve(void 0);
    }
  };
};
