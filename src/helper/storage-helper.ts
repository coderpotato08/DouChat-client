export enum StorageKeys {
  ONLINE_USER = "ONLINE_USER",
  ONLINE_NUM = "ONLINE_NUM",
  USER_INFO = "USER_INFO",
  TOKEN = "TOKEN",
  IS_SHOW_DELETE_CONTACT_TIP = "IS_SHOW_DELETE_CONTACT_TIP", // 删除聊天栏 下次是否不再提醒
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