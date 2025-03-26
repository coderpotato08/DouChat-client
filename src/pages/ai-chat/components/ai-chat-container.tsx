import { FC } from "react";
import styled from "styled-components";
import { AiChatInput } from "./ai-chat-input";
import { AiChatContent } from "./ai-chat-content";

type AiChatContainerProps = {
  
}
export const AiChatContainer: FC<AiChatContainerProps> = () => {
  return <AiChatContainerWrapper>
    <AiChatContent/>
    <AiChatInput/>
  </AiChatContainerWrapper>
}

const AiChatContainerWrapper = styled.div`
  & {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: relative;
  }
`