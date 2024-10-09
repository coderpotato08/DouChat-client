export const isTauri = () => {
  return !!(window as any).__TAURI__;
}