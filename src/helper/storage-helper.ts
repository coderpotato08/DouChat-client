export enum StorageKeys {
  ONLINE_USER = "ONLINE_USER",
  ONLINE_NUM = "ONLINE_NUM",
  USER_INFO = "USER_INFO",
  TOKEN = "TOKEN",
  IS_SHOW_DELETE_CONTACT_TIP = "IS_SHOW_DELETE_CONTACT_TIP", // 删除聊天栏 下次是否不再提醒
}

type WepperExpireData = {
  data: string;
  expireTime: number;
};

export class LocalStorageHelper {
  static getItem(key: string) {
    const res = localStorage.getItem(key);
    return res && res !== "undefined" ? JSON.parse(res) : null;
  }
  static setItem(key: string, value: any) {
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(value));
  }
  static removeItem(key: string) {
    if (LocalStorageHelper.getItem(key)) {
      localStorage.removeItem(key);
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
