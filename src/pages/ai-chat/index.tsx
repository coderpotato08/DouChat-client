import { XProvider } from "@ant-design/x";
import { DraggableLayout } from "@components/draggable-layout";
import { AiChatContainer } from "./components/ai-chat-container";
import { AiChatMenu } from "./components/ai-chat-menu";

export const AiChat = () => {
  return (
    <XProvider>
      <DraggableLayout menuRender={<AiChatMenu />} contentRender={<AiChatContainer />} />
    </XProvider>
  );
};
