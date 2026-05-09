import { XProvider } from "@ant-design/x";
import { DraggableLayout } from "@components/draggable-layout";
import styled from "styled-components";
import { AiChatContainer } from "./components/ai-chat-container";
import { AiChatMenu } from "./components/ai-chat-menu";

export const AiChat = () => {
  return <XProvider>
    <AiChatLayout
      menuClassName="ai-chat-layout__menu"
      contentClassName="ai-chat-layout__content"
      dividerClassName="ai-chat-layout__divider"
      menuRender={<AiChatMenu />}
      contentRender={<AiChatContainer />} />
  </XProvider>;
}

const AiChatLayout = styled(DraggableLayout)`
  & {
    height: 100vh;
  }

  .ai-chat-layout__menu {
    height: 100vh;
    border: 0;
    box-shadow: none;
    background: #f5f5f5;
  }

  .ai-chat-layout__content {
    height: 100vh;
    overflow: hidden;
    background: transparent;
  }

  .ai-chat-layout__divider {
    right: -3px;
    width: 8px;
  }
`;