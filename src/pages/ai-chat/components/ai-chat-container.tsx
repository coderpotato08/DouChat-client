import type { AgentStreamEvent } from "@constant/api/ai-chat-types";
import { ApiHelper } from "@helper/api-helper";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/userReducer";
import { Flex } from "antd";
import { type FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { AiChatContent, type AiChatMessage } from "./ai-chat-content";
import { AiChatInput } from "./ai-chat-input";

type AiChatContainerProps = Record<string, never>;

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

export const AiChatContainer: FC<AiChatContainerProps> = () => {
  const userInfo = useAppSelector(userSelector);
  const fallbackUserIdRef = useRef(uuidv4());
  const requestAbortRef = useRef<AbortController | null>(null);
  const activeAssistantIdRef = useRef<string | null>(null);
  const initFinishedRef = useRef(false);
  const finishRequestRef = useRef<(() => void) | null>(null);

  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [draft, setDraft] = useState("");

  const currentUserId = useMemo(() => {
    return userInfo?._id || fallbackUserIdRef.current;
  }, [userInfo]);

  const markAssistantMessage = useCallback((status: AiChatMessage["status"]) => {
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
  }, []);

  const appendAssistantDelta = useCallback((delta: string) => {
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
  }, []);

  const appendSystemMessage = useCallback((content: string) => {
    if (!content) {
      return;
    }

    setMessages((prev) => [...prev, createMessage("system", content, "error")]);
  }, []);

  const finalizeCurrentRequest = useCallback((nextStatus = "") => {
    finishRequestRef.current?.();
    finishRequestRef.current = null;
    requestAbortRef.current = null;
    activeAssistantIdRef.current = null;
    setIsStreaming(false);
    setStatusText(nextStatus);
  }, []);

  const ensureAgentReady = useCallback(async () => {
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
  }, [appendSystemMessage]);

  const handleStreamMessage = useCallback(
    (rawMessage: string) => {
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
    },
    [appendAssistantDelta, appendSystemMessage, markAssistantMessage],
  );

  const onSubmit = useCallback(
    async (message: string) => {
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
            userId: currentUserId,
            prompt,
          },
          {
            signal: controller.signal,
            onMessage: handleStreamMessage,
            onEnd: () => {
              finalizeCurrentRequest("回答完成");
            },
            onError: () => {
              markAssistantMessage("error");
              appendSystemMessage("网络异常，请稍后重试。");
              finalizeCurrentRequest("请求失败");
            },
            onClose: () => {
              finalizeCurrentRequest(statusText || "回答完成");
            },
          },
        );
      } catch (_error) {
        markAssistantMessage("error");
        appendSystemMessage("请求发送失败，请稍后重试。");
        finalizeCurrentRequest("请求失败");
      }
    },
    [
      appendSystemMessage,
      currentUserId,
      ensureAgentReady,
      finalizeCurrentRequest,
      handleStreamMessage,
      isStreaming,
      markAssistantMessage,
      statusText,
    ],
  );

  const handlePromptSelect = useCallback((prompt: string) => {
    setDraft(prompt);
  }, []);

  useEffect(() => {
    void ensureAgentReady();
  }, [ensureAgentReady]);

  useEffect(() => {
    return () => {
      requestAbortRef.current?.abort();
    };
  }, []);

  return (
    <Flex vertical gap="middle" style={{ padding: "16px", height: "100%", overflow: "hidden" }}>
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
