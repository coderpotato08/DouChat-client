import { APP_NANE_PREFIX, dataKeyName } from "@constant/common-types";
import type { RouterPath } from "@constant/router-types";
import { LocalStorageHelper } from "@helper/storage-helper";
import { getUuid } from "@helper/uuid-helper";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { isTauri } from "@utils/env";
import { hasObjectParam, splitObjectByPrefix } from "@utils/object";
import { getFullUrl } from "@utils/url";
import { type MutableRefObject, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import type { CallbackKeys, CallbacksConfig, OpenWebviewFuncProps, RouterMapType } from "./types";

type OpenWebviewFunc = <T extends RouterPath, R extends RouterMapType>(
  props?: OpenWebviewFuncProps<T, R>,
) => Promise<any>;

export const getFullCallbackKey = (key: CallbackKeys) => {
  return `tauri-event://${key}`;
};

export const useOpenWebview = (url: RouterPath, options?: any): OpenWebviewFunc => {
  const navigate = useNavigate();
  // 注销监听事件列表
  const unlisteners = useRef<Record<string, UnlistenFn>>({});
  const webview: MutableRefObject<WebviewWindow | null> = useRef(null);
  // 组件是否已卸载。用于处理「监听注册中组件卸载」的竞态：
  // listen() 是异步的，若在 await 期间组件卸载，cleanup 会先于赋值执行，
  // 导致刚注册的监听器永远不会被注销（泄漏）。注册 resolve 后据此判断立即丢弃。
  const disposedRef = useRef(false);

  useEffect(() => {
    return () => {
      // 先置位，确保并发进行中的 listen() resolve 后能感知到已卸载
      disposedRef.current = true;
      webview.current = null;
      const unlistenerKeys = Object.getOwnPropertyNames(unlisteners.current);
      unlistenerKeys.forEach((key) => {
        unlisteners.current[key]?.();
      });
      unlisteners.current = {};
    };
  }, []);

  const handleEventListener = async (callbacks: CallbacksConfig) => {
    if (!callbacks) return;
    const keys = Object.getOwnPropertyNames(callbacks) as CallbackKeys[];
    // forEach 不会等待 async 回调，改用 Promise.all 让注册可被追踪/等待
    await Promise.all(
      keys.map(async (key) => {
        const callbackFunc = callbacks[key];
        if (!callbackFunc) return;
        const cbFullKey = getFullCallbackKey(key);
        const unlisten = await listen(cbFullKey, (event) => {
          callbackFunc(event.payload as any);
        });
        // await 期间组件已卸载：立即注销刚注册的监听，避免泄漏
        if (disposedRef.current) {
          unlisten();
          return;
        }
        // 同 key 重复注册（如窗口销毁后再次 open）：先注销旧监听再覆盖，避免泄漏
        const prev = unlisteners.current[cbFullKey];
        if (prev) prev();
        unlisteners.current[cbFullKey] = unlisten;
      }),
    );
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
    const urlKey = `${url}${props?.id ? `/${props.id}` : ""}`;

    // 拆分出_DouChat_开头的params
    const [innerParams, inputParams] = splitObjectByPrefix(props?.params || {}, APP_NANE_PREFIX);

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
        // 先完成事件监听注册再创建窗口，避免子窗口在监听就绪前 emit 导致丢事件
        if (props?.callbacks) {
          await handleEventListener(props.callbacks);
        }
        return new Promise((resolve, reject) => {
          webview.current = initWebview({ urlKey, fullUrl });
          webview.current.once("tauri://created", () => {
            console.log("成功创建 webview 窗口");
            resolve(void 0);
          });
          webview.current.once("tauri://error", (e: any) => {
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
