import { ToastOptions, toast } from "react-toastify";
import { message } from "antd";

type ToastType = "success" | "error" | "warning"
const defaultOptions: ToastOptions = {
    position: "bottom-right",
    autoClose: 1000,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
}

// react-toastify
export function Toastify(type: ToastType, text: string, onClose = () => {}, options = {}) {
  toast[type](text, {...defaultOptions, ...options, onClose});
}
// antd message
// export function Toast(type: , text: string)