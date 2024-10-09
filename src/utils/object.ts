
/**
 * 变量是否是对象
 * @param value
 * @returns true or false
 */
export const isObject = (value: any) => (value && typeof value === 'object') || false

/**
 * 检验params是否包含对象变量
 * @param data
 * @returns true or false
 */
export const hasObjectParam = (data: Record<string, any>) => {
  if (data) {
    return Object.keys(data).some((key) => {
      return isObject(data[key]);
    });
  }
  return false;
};
/**
 * Split object by prefix
 * 根据前缀拆分对象
 * @param obj
 * @param prefix
 * @returns [innerParams, normalParams] => [内部参数，普通参数]
 */
export const splitObjectByPrefix = (obj: Record<string, any>, prefix: string) => {
  const innerParams: Record<string, any> = {};
  const normalParams: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (key.startsWith(prefix)) {
      innerParams[key] = obj[key];
    } else {
      normalParams[key] = obj[key];
    }
  });
  return [innerParams, normalParams];
}