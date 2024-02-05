export interface BaseModalProps {
  visible: boolean,
  onCancel: () => void,
  confirmCallback?: () => void,
}

export enum YNEnum {
  YES = "yes",
  NO = "no"
}