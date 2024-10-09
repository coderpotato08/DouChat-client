import { v4 as uuidV4 } from 'uuid';

export const createUidV4 = () => {
  return uuidV4();
}

/**
 * We can create an cache seed instance.
 * @param prefix the cache group name.
 * @param start The number that seed id start at
 */
export const cache = (prefix = 'cache_unique_', start: (() => number) | number = 1) => {
  // start with 1
  const uniqueMap: any = {};
  return () => {
    if (!uniqueMap[prefix]) {
      uniqueMap[prefix] = typeof start === 'function' ? start() : start;
    }
    return `${prefix}${++uniqueMap[prefix]}`;
  };
};

const uuidFactory = (() => {
  const now = `${Date.now()}`;
  return cache(`uuid-${now.substring(now.length - 4, now.length)}-`, 100);
})();

export const getUuid = () => {
  return uuidFactory();
};