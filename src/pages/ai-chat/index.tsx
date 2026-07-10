import type { GetSessionListItem } from "@constant/api/ai-chat-types";
import { ApiHelper } from "@helper/api-helper";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/userReducer";
import { message } from "antd";
import { XProvider } from "@ant-design/x";
import { DraggableLayout } from "@components/draggable-layout";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { AiChatContainer } from "./components/ai-chat-container";
import { AiChatMenu } from "./components/ai-chat-menu";


export const AiChat = () => {
  const userInfo = useAppSelector(userSelector);
  const [sessionId, setSessionId] = useState<string>("");
  const [creatingSession, setCreatingSession] = useState(false);
  const [sessionList, setSessionList] = useState<GetSessionListItem[]>([]);
  const [loadingSessionList, setLoadingSessionList] = useState(false);
  const fallbackUserIdRef = useRef(uuidv4());

  const currentUserId = userInfo?._id || fallbackUserIdRef.current;

  const loadSessionList = async () => {
    setLoadingSessionList(true);
    try {
      const result = await ApiHelper.aiGetSessionList({
        userId: currentUserId,
      });

      const sessions = result?.sessions || [];
      setSessionList(sessions);

      if (!sessionId && sessions[0]?.sessionId) {
        setSessionId(sessions[0].sessionId);
      }
    } catch (_error) {
      message.error("获取会话列表失败，请稍后重试");
    } finally {
      setLoadingSessionList(false);
    }
  };

  const handleCreateSession = async () => {
    if (creatingSession) {
      return;
    }

    setCreatingSession(true);
    try {
      const result = await ApiHelper.aiInitSession({
        userId: currentUserId,
      });

      if (result?.sessionId) {
        setSessionId(result.sessionId);
        message.success("新建会话成功");
        await loadSessionList();
        return;
      }

      message.error("新建会话失败，请稍后重试");
    } catch (_error) {
      message.error("新建会话失败，请稍后重试");
    } finally {
      setCreatingSession(false);
    }
  };

  useEffect(() => {
    void loadSessionList();
    // 仅在登录态就绪（userInfo._id 变化）时加载会话列表；
    // loadSessionList 内引用的 currentUserId/sessionId 仅作读取，不应触发重执行，
    // 否则切换会话等操作会导致列表被反复拉取
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?._id]);

  return (
    <XProvider>
      <DraggableLayout
        menuRender={
          <AiChatMenu
            sessionList={sessionList}
            sessionId={sessionId}
            loading={loadingSessionList}
            onSessionChange={setSessionId}
            onCreateSession={handleCreateSession}
            creatingSession={creatingSession}
          />
        }
        contentRender={<AiChatContainer sessionId={sessionId} onCreateSession={handleCreateSession} />}
      />
    </XProvider>
  );
};
