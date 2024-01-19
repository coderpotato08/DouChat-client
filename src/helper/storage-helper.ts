export enum StorageKeys {
  ONLINE_USER = "ONLINE_USER",
  ONLINE_NUM = "ONLINE_NUM",
  USER_INFO = "USER_INFO",
  TOKEN = "TOKEN",
}
export class LocalStorageHelper {
  static getItem(key: string) {
    const res = localStorage.getItem(key);
    return res && res !== 'undefined' ? JSON.parse(res) : null
  }
  static setItem(key: string, value:any) {
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(value));
  }
  static removeItem(key: string) {
    if (LocalStorageHelper.getItem(key)) {
      localStorage.removeItem(key)
    }
  }
}