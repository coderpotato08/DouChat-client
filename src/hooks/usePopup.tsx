import { useState } from "react";

export function usePopup(initialState = false): [boolean, () => void] {
  const [open, setOpen] = useState(initialState);

  const togglePopup = () => {
    setOpen(!open);
  }

  return [open, togglePopup]
}