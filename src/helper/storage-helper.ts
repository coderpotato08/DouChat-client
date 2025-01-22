const keyPrefix = "__DouChat_"
export enum StorageKeys {
  ONLINE_USER = "online_user",
  ONLINE_NUM = "online_num",
  USER_INFO = "user_info",
  TOKEN = "token",
  IS_SHOW_DELETE_CONTACT_TIP = "is_show_delete_contact_tip", // 删除聊天栏 下次是否不再提醒
  MENU_LOCAL_WIDTH = "menu_local_width",
  LOGIN_THIRD_PLATFORM = "login_third_platform" // 缓存outh2.0登陆的第三方平台
}

type WepperExpireData = {
  data: string;
  expireTime: number;
};

export class LocalStorageHelper {
  static getItem(key: string) {
    const fullKey = keyPrefix + key;
    const res = localStorage.getItem(fullKey);
    return res && res !== "undefined" ? JSON.parse(res) : null;
  }
  static setItem(key: string, value: any) {
    if (!key) return;
    const fullKey = keyPrefix + key;
    localStorage.setItem(fullKey, JSON.stringify(value));
  }
  static removeItem(key: string) {
    const fullKey = keyPrefix + key;
    if (LocalStorageHelper.getItem(key)) {
      localStorage.removeItem(fullKey);
    }
  }
  /**
   * 设置代缓存时间的数据
   * @param dataKey
   * @param data
   * @param expire 过期时间，单位秒
   */
  static setLocalData(key: string, value: any, expire: number) {
    const wrapper: WepperExpireData = {
      data: value,
      expireTime: new Date().getTime() + parseInt(expire.toString()) * 1000,
    };
    localStorage.setItem(key, JSON.stringify(wrapper));
  }

  /**
   * 获取数据，如果数据过期则返回null
   * @param dataKey
   * @returns
   */
  static getLocalData = (dataKey: string) => {
    const wapper = localStorage.getItem(dataKey);
    if (wapper) {
      const curTime = new Date().getTime();
      const { data, expireTime }: WepperExpireData = JSON.parse(wapper);
      if (expireTime < curTime) {
        localStorage.removeItem(dataKey);
        return null;
      }
      return data;
    }
    return null;
  };
}
