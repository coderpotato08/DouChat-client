import { RouterDefine, RouterPath } from '@constant/router-types';

export enum CallbackKeys {
  CLOSE_PAGE_B = "closePageB",
  REFRESH_PAGE_B = "refreshPageB",
}

export type CallbackParams = {
  [CallbackKeys.CLOSE_PAGE_B]: { data: any };
  [CallbackKeys.REFRESH_PAGE_B]: { data_1: any };
};

export type CallbacksConfig = {
  [K in CallbackKeys]?: (params: CallbackParams[K]) => void;
};

export type RouterMapType = {
  [K in RouterDefine[number]['path']]: Extract<
    RouterDefine[number],
    { path: K }
  >['params'];
};

export type OpenWebviewFuncProps<T extends RouterPath, R extends RouterMapType> = {
  id?: string | number,
  params?: R[T] extends undefined ? undefined : R[T];
  callbacks?: CallbacksConfig 
}