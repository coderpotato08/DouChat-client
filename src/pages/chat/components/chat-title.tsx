import { FC } from "react";
import styled from 'styled-components';
import ToolList, { ToolListProps } from "./tool-list";
const potato_image = require('@assets/imgs/potato.png');

interface ChatTitleProps extends ToolListProps {

}
const ChatTitle:FC<ChatTitleProps> = (props: ChatTitleProps) => {
  const {
    ...callbacks
  } = props;
  return <ChatTitleWrapper>
    <div className="title">
      <img src={potato_image} alt="🥔"/>
      DouChat
    </div>
    <ToolList {...callbacks}/>
  </ChatTitleWrapper>
}

export default ChatTitle

const ChatTitleWrapper = styled.div`
  & {
    box-sizing: border-box;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    display: flex;
    padding: 18px 18px 18px 0;
    height: 60px;
    .title {
      position: relative;
      padding-left: 48px;
      display: flex;
      align-items: center;
      user-select: none;
      font-size: 20px;
      font-weight: bold;
      > img {
        position: absolute;
        left: 0;
        width: 48px;
        height: 48px;
        animation: potato 3s linear infinite;
      }
    }

    @keyframes potato {
      0% {
        transform: scale(1) rotate(0deg);
      }
      50% {
        transform: scale(1.3) rotate(180deg);
      }
      100% {
        transform: scale(1) rotate(360deg);
      }
    }
  }
`