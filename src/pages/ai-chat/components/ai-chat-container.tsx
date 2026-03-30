import { FC } from "react";
import styled from "styled-components";
import { AiChatInput } from "./ai-chat-input";
import { AiChatContent } from "./ai-chat-content";
import { useCallbackRef } from "@hooks/useCallbackRef";
import { ApiHelper } from "@helper/api-helper";

type AiChatContainerProps = {

}
export const AiChatContainer: FC<AiChatContainerProps> = () => {

  const onSubmit = useCallbackRef(async (message: string) => {
    console.log(message);
    ApiHelper.aiCompletion({
      chatSessionId: '@@@',
      prompt: message,
      thinkingEnable: false,
    }, {
      onMessage: (message) => {
        console.log(message)
      },
      onEnd: () => {
        console.log('end')
      },
      onError: () => { },
      onClose: () => { },
    })
  })
  return <AiChatContainerWrapper>
    <AiChatContent />
    <AiChatInput onSubmit={onSubmit} />
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