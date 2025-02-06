export const textHtmlFormat = (content: string): string => {
  // content 即粘贴过来的内容(html 或 纯文本), 将样式清除
  if (!content) return "";
  let str = content;
  return str
    .replace(/<span[^>]*>/gi, "<span>") // 去除所有span的style
    .replace(/<div[^>]*>/gi, "<div>") // 去除所有div的style
    .replace(/<meta[^>]*>/g, ""); // 去除所有meta标签
};

export const textAndImageHtmlFormat = (content: string): string[] => {
  // content 即粘贴过来的内容(html 或 纯文本), 将样式清除
  if (!content) return [""];
  let str = content;
  str = textHtmlFormat(str);
  const strArr = str.split(/<img[^>]*>/gi); // 根据img标签分割
  return strArr;
};

/**
 * 可编辑div中第一个未换行输入内容未被div包裹
 */
export const completeFirstDiv = (content: string): string => {
  // 可编辑div中第一个未换行输入内容未被div包裹
  if (!content) return "";
  let index = content.indexOf("<div>");
  if (index === -1) {
    return `<div>${content}</div>`;
  } else {
    const firstStr = content.slice(0, index);
    return `<div>${firstStr}</div>${content.slice(index)}`;
  }
};

/**
 * 补全标签 如<div>123 、 123</div>
 */
export const completePiecesHtml = (content: string): string => {
  if (!content) return "";
  const start = content.match(/^<([a-zA-Z]+)[^>]*>/)?.[1]; // 匹配开始标签
  const end = content.match(/<\/([a-zA-Z]+)>$/)?.[1]; // 匹配结束标签
  if (start && end) return content;
  if (start) return `${content}</${start}>`;
  if (end) return `<${end}>${content}`;
  return `<div>${content}</div>`;
}

export const removeExtraHtml = (content: string): string => {
  // 取出输入框中复制黏贴出来的html 中 样式，meta标签
  if (!content) return "";
  let str = content;
  return str
    .replace(/\sstyle="([^"]*)"/g, "")
    .replace(/<meta[^>]*>/g, "");
};
