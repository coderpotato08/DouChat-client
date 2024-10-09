import { isEmpty } from "lodash"

export const getFullUrl = (baseUrl: string, params?: Record<string, any>) => {
  if (!isEmpty(params)) {
    const queryStr = `?${Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&")}`;
    return `${baseUrl}${queryStr}`;
  }
  return baseUrl
}