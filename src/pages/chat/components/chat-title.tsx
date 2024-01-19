import { FC } from "react";
import styled from 'styled-components';
import ToolList from "./tool-list";

const ChatTitle:FC = () => {
  return <ChatTitleWrapper>
    <div className="title">DouChat</div>
    <ToolList/>
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
    padding: 18px;
    height: 60px;
    .title {
      user-select: none;
      font-size: 20px;
      font-weight: bold;
    }
  }
`