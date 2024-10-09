// inner param prefix
export const APP_NANE_PREFIX = '_DouChat_';
// url query key
export const dataKeyName = `${APP_NANE_PREFIX}dataKey`;

export interface BaseModalProps {
  visible: boolean,
  onCancel: () => void,
  confirmCallback?: () => void,
}

export enum YNEnum {
  YES = "yes",
  NO = "no"
}
