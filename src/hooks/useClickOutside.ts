import { MutableRefObject, useCallback, useEffect } from "react";
/**
 * 
 * @param ref 绑定点击展开区域ref
 * @param isFocus 目标展开元素是否聚焦
 * @param callback 点击外部区域收起时回调
 */
export const useClickOutside = (
  ref: MutableRefObject<any>,
  isFocus: boolean = false,
  callback: () => void,
) => {

  const handleClickOutside = useCallback((event: any) => {
    if (ref.current && !ref.current.contains(event.target)) {
      callback();
    }
  }, [ref.current]);

  useEffect(() => {
    if (isFocus) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    }
  }, [isFocus]);
}