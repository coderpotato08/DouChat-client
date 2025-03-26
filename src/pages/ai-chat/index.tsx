import { DraggableLayout } from "@components/draggable-layout";
import { AiChatMenu } from "./components/ai-chat-menu";
import { AiChatContainer } from "./components/ai-chat-container";

export const AiChat = () => {
  return <DraggableLayout 
    menuRender={<AiChatMenu />}
    contentRender={<AiChatContainer />}/>;
}