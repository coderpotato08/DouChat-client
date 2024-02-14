import { FC } from 'react';
import { theme } from 'antd';

const { useToken } = theme;

interface HighlightTextProps {
  text: string
  keyword: string
}
export const HighlightText:FC<HighlightTextProps> = (props: HighlightTextProps) => {
  const {
    text,
    keyword
  } = props;
  const { token } = useToken();
  const renderHighlightedText = () => {
    const regex = new RegExp(`(${keyword})`, 'gi');  
    return text
      .split(regex)
      .map((part, index) => {
        if (index % 2 === 0) {  
          return part;  
        }
        // 否则，为关键字添加样式  
        return `<span style="color: ${token.colorPrimary}">${part}</span>`;  
      })
      .join("")
  }
  return (
    <div dangerouslySetInnerHTML={{__html: renderHighlightedText()}}/>
  )
}
