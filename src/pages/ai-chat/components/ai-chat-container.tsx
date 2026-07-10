import type { AgentStreamEvent, SessionMessageItem } from "@constant/api/ai-chat-types";
import { ApiHelper } from "@helper/api-helper";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/userReducer";
import { Flex, message } from "antd";
import { type FC, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { AiChatContent, type AiChatMessage } from "./ai-chat-content";
import { AiChatInput } from "./ai-chat-input";

type AiChatContainerProps = {
  sessionId: string;
  onCreateSession: () => Promise<void>;
};

const createMessage = (
  role: AiChatMessage["role"],
  content: string,
  status: AiChatMessage["status"] = "done",
): AiChatMessage => ({
  id: uuidv4(),
  role,
  content,
  status,
});

const parseStreamEvent = (rawMessage: string): AgentStreamEvent | null => {
  try {
    return JSON.parse(rawMessage) as AgentStreamEvent;
  } catch (_error) {
    return {
      type: "content_delta",
      delta: rawMessage,
    };
  }
};

/** 将后端历史消息转换为界面消息；tool 角色消息不直接展示 */
const fromSessionMessage = (item: SessionMessageItem): AiChatMessage | null => {
  if (item.role === "tool") {
    return null;
  }
  return {
    id: item.messageId,
    role: item.role,
    content: item.content ?? "",
    status: item.messageStatus === "failed" ? "error" : "done",
  };
};

export const AiChatContainer: FC<AiChatContainerProps> = ({ sessionId, onCreateSession }) => {
  const userInfo = useAppSelector(userSelector);
  const requestAbortRef = useRef<AbortController | null>(null);
  const activeAssistantIdRef = useRef<string | null>(null);
  const initFinishedRef = useRef(false);
  const finishRequestRef = useRef<(() => void) | null>(null);

  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [draft, setDraft] = useState("");

  const currentUserId = userInfo?._id;

  const markAssistantMessage = (status: AiChatMessage["status"]) => {
    const assistantMessageId = activeAssistantIdRef.current;
    if (!assistantMessageId) {
      return;
    }

    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== assistantMessageId) {
          return message;
        }

        return {
          ...message,
          status,
        };
      }),
    );
  };

  const appendAssistantDelta = (delta: string) => {
    const assistantMessageId = activeAssistantIdRef.current;
    if (!assistantMessageId || !delta) {
      return;
    }

    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== assistantMessageId) {
          return message;
        }

        return {
          ...message,
          content: `${message.content}${delta}`,
        };
      }),
    );
  };

  const appendSystemMessage = (content: string) => {
    if (!content) {
      return;
    }

    setMessages((prev) => [...prev, createMessage("system", content, "error")]);
  };

  const onCompletionEnd = (nextStatus = "") => {
    finishRequestRef.current?.();
    finishRequestRef.current = null;
    requestAbortRef.current = null;
    activeAssistantIdRef.current = null;
    setIsStreaming(false);
    setStatusText(nextStatus);
  };

  const ensureAgentReady = async () => {
    if (initFinishedRef.current) {
      return true;
    }

    setStatusText("正在初始化 AI Agent...");
    const result = await ApiHelper.aiAgentInit();
    const success = result?.success === true;

    if (success) {
      initFinishedRef.current = true;
      setStatusText("初始化完成，开始对话吧");
      return true;
    }

    appendSystemMessage("AI 初始化失败，请稍后重试。");
    setStatusText("AI 初始化失败");
    return false;
  };

  const ensureSessionReady = async () => {
    if (sessionId) {
      return sessionId;
    }

    await onCreateSession();
    return null;
  };

  const handleStreamMessage = (rawMessage: string) => {
    const event = parseStreamEvent(rawMessage);
    if (!event) {
      return;
    }

    switch (event.type) {
      case "thinking_start":
        setStatusText("AI 正在思考...");
        return;
      case "tool_use_start":
        setStatusText(event.toolName ? `调用工具 ${event.toolName} 中...` : "AI 正在调用工具...");
        return;
      case "tool_use_done":
        setStatusText(event.toolName ? `工具 ${event.toolName} 已完成` : "工具调用完成");
        return;
      case "content_start":
        setStatusText("AI 正在回答...");
        return;
      case "content_delta":
        appendAssistantDelta(event.delta || "");
        return;
      case "content_done":
        markAssistantMessage("done");
        setStatusText("回答完成");
        return;
      case "error":
        markAssistantMessage("error");
        appendSystemMessage(event.error || "请求失败，请稍后重试。");
        setStatusText("响应出错");
        return;
      default:
        return;
    }
  };

  const onSubmit = async (message: string) => {
    if (isStreaming) {
      return;
    }

    const prompt = message.trim();
    if (!prompt) {
      return;
    }

    const isReady = await ensureAgentReady();
    if (!isReady) {
      return;
    }

    const activeSessionId = await ensureSessionReady();
    if (!activeSessionId) {
      appendSystemMessage("会话初始化失败，请稍后重试。");
      return;
    }

    const assistantMessageId = uuidv4();
    const controller = new AbortController();
    requestAbortRef.current = controller;
    activeAssistantIdRef.current = assistantMessageId;
    setIsStreaming(true);
    setStatusText("已连接，等待 AI 响应...");
    setMessages((prev) => [
      ...prev,
      createMessage("user", prompt),
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        status: "streaming",
      },
    ]);
    setDraft("");

    let finished = false;
    finishRequestRef.current = () => {
      if (finished) {
        return;
      }

      finished = true;
      markAssistantMessage("done");
    };

    try {
      await ApiHelper.aiCompletion(
        {
          sessionId: activeSessionId,
          userId: currentUserId,
          prompt,
        },
        {
          signal: controller.signal,
          retry: {
            initialDelayMs: 1000,
            maxDelayMs: 8000,
            multiplier: 2,
            maxRetries: 4,
          },
          onMessage: handleStreamMessage,
          onEnd: () => {
            onCompletionEnd("回答完成");
          },
          onError: () => {
            markAssistantMessage("error");
            appendSystemMessage("网络异常，请稍后重试。");
            onCompletionEnd("请求失败");
          },
          onClose: () => {
            onCompletionEnd(statusText || "回答完成");
          },
        },
      );
    } catch (_error) {
      markAssistantMessage("error");
      appendSystemMessage("请求发送失败，请稍后重试。");
      onCompletionEnd("请求失败");
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setDraft(prompt);
  };

  const loadSessionHistory = async (targetSessionId: string) => {
    if (!targetSessionId) {
      setMessages([]);
      return;
    }
    try {
      const result = await ApiHelper.aiGetSession({
        sessionId: targetSessionId,
        userId: currentUserId,
      });
      const history = (result?.messages || [])
        .map(fromSessionMessage)
        .filter((message): message is AiChatMessage => message !== null);
      setMessages(history);
    } catch (_error) {
      message.error("加载历史消息失败，请稍后重试");
    }
  };

  useEffect(() => {
    // 切换会话时中断进行中的流式请求，避免旧会话输出污染新会话历史
    if (isStreaming) {
      requestAbortRef.current?.abort();
      onCompletionEnd("切换会话中");
    }
    void loadSessionHistory(sessionId);
    // 仅在 sessionId 变化时执行；isStreaming/currentUserId/onCompletionEnd 仅作读取，不应触发重执行
  }, [sessionId]);

  useEffect(() => {
    void ensureAgentReady();
    // 仅在挂载时初始化一次 AI Agent；ensureAgentReady 内部用 initFinishedRef 防重复
  }, []);

  useEffect(() => {
    return () => {
      requestAbortRef.current?.abort();
    };
  }, []);

  return (
    <Flex vertical gap="none" style={{ padding: "16px", height: "100%", overflow: "hidden", boxSizing: "border-box" }}>
      <Flex flex={1} style={{ overflow: "hidden", minHeight: 0 }}>
        <AiChatContent
          messages={messages}
          statusText={statusText}
          isStreaming={isStreaming}
          onPromptSelect={handlePromptSelect}
        />
      </Flex>
      <Flex flex="none">
        <AiChatInput value={draft} onChange={setDraft} onSubmit={onSubmit} loading={isStreaming} />
      </Flex>
    </Flex>
  );
};
