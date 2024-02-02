export interface BaseModalProps {
  visible: boolean,
  onCancel: () => void,
  confirmCallback?: () => void,
}