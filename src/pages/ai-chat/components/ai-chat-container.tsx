import { type AgentStreamEvent, StreamEventType } from "@constant/api/ai-chat-types";
import { ApiHelper } from "@helper/api-helper";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/userReducer";
import { buildHistoryMessages, parseTodoItems } from "@utils/format";
import { Flex, message } from "antd";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { type AIChatMessage, MessageBlockType, type ToolUseBlock } from "../types";
import type { TodoItem } from "../types/todo-list";
import { AiChatContent } from "./ai-chat-content";
import { AiChatInput } from "./ai-chat-input";

type AiChatContainerProps = {
  sessionId: string;
};
export type SessionTodoMap = Record<string, TodoItem[]>;

export const AiChatContainer: FC<AiChatContainerProps> = ({ sessionId }) => {
  const userInfo = useAppSelector(userSelector);
  const requestAbortRef = useRef<AbortController | null>(null);
  const activeAssistantIdRef = useRef<string | null>(null);
  const initFinishedRef = useRef(false);
  const finishRequestRef = useRef<(() => void) | null>(null);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [draft, setDraft] = useState("");
  const [todoMap, setTodoMap] = useState<SessionTodoMap>({});

  const currentTodoList = todoMap[sessionId] || [];
  const currentUserId = userInfo?._id;

  const createMessage = useCallback(
    (
      role: AIChatMessage["role"],
      content: string,
      status: AIChatMessage["status"] = "done",
      params?: {
        messageId?: string;
      },
    ): AIChatMessage => {
      const blocks: AIChatMessage["blocks"] = role === "assistant" ? [] : undefined;
      return {
        requestId: activeAssistantIdRef.current || "",
        sessionId,
        messageId: params?.messageId || uuidv4(),
        role,
        content,
        blocks,
        status,
        statusText: "",
        createdAt: Date.now().toString(),
      };
    },
    [activeAssistantIdRef.current, sessionId],
  );

  /** 是否是当前轮次对话的AI消息 */
  const isCurAssistantMessage = (message: AIChatMessage) => {
    return message.role === "assistant" && message.requestId === activeAssistantIdRef.current;
  };

  const markAssistantMessage = (status: AIChatMessage["status"]) => {
    const assistantMessageId = activeAssistantIdRef.current;
    if (!assistantMessageId) {
      return;
    }

    setMessages((prev) =>
      prev.map((message) => {
        if (!isCurAssistantMessage(message)) {
          return message;
        }

        return {
          ...message,
          status,
        };
      }),
    );
  };

  const appendToolBlock = (block: ToolUseBlock) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (!isCurAssistantMessage(message)) {
          return message;
        }
        return { ...message, blocks: [...(message.blocks || []), block] };
      }),
    );
  };

  const updateToolBlock = (toolUseId: string, changes: Partial<ToolUseBlock>) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (!isCurAssistantMessage(message)) {
          return message;
        }
        return {
          ...message,
          blocks: (message.blocks || []).map((block) =>
            block.blockType === MessageBlockType.TOOL_USE && block.toolUseId === toolUseId
              ? { ...block, ...changes }
              : block,
          ),
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
        if (!isCurAssistantMessage(message)) {
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

    const result = await ApiHelper.aiAgentInit();
    const success = result?.success === true;

    if (success) {
      initFinishedRef.current = true;
      return true;
    }

    appendSystemMessage("AI 初始化失败，请稍后重试。");
    return false;
  };

  const handleStreamMessage = (rawMessage: string) => {
    const eventData = JSON.parse(rawMessage) as AgentStreamEvent;
    if (!eventData) {
      return;
    }
    switch (eventData.type) {
      case StreamEventType.THINKING_START:
        setStatusText("AI 正在思考...");
        return;
      case StreamEventType.TOOL_USE_START:
        if (eventData.toolName === "todo") {
          const items = parseTodoItems(eventData.data);
          if (items) {
            setTodoMap((prev) => ({ ...prev, [sessionId]: items }));
          }
        } else {
          appendToolBlock({
            messageId: activeAssistantIdRef.current || "",
            blockType: MessageBlockType.TOOL_USE,
            toolName: eventData.toolName || "",
            toolUseId: eventData.toolUseId || "",
            status: "running",
            input: eventData.data,
          });
        }
        setStatusText(
          eventData.toolName ? `调用工具 ${eventData.toolName} 中...` : "AI 正在调用工具...",
        );
        return;
      case StreamEventType.TOOL_USE_DONE:
        if (eventData.toolName === "todo") {
          const items = parseTodoItems(eventData.data);
          if (items) {
            setTodoMap((prev) => ({ ...prev, [sessionId]: items }));
          }
        } else {
          updateToolBlock(eventData.toolUseId || "", {
            status: eventData.success ? "succeeded" : "failed",
            output: eventData.data,
          });
        }
        setStatusText(eventData.toolName ? `工具 ${eventData.toolName} 已完成` : "工具调用完成");
        return;
      case StreamEventType.CONTENT_START:
        setStatusText("AI 正在回答...");
        return;
      case StreamEventType.CONTENT_DELTA:
        appendAssistantDelta(eventData.delta || "");
        return;
      case StreamEventType.CONTENT_DONE:
        markAssistantMessage("done");
        setStatusText("回答完成");
        return;
      case StreamEventType.ERROR:
        markAssistantMessage("error");
        appendSystemMessage(eventData.error || "请求失败，请稍后重试。");
        setStatusText("响应出错");
        return;
      default:
        return;
    }
  };

  const onSubmit = async (value: string) => {
    if (isStreaming) return;

    const prompt = value.trim();
    if (!prompt) {
      return;
    }

    const isReady = await ensureAgentReady();
    if (!isReady) {
      return;
    }

    const assistantMessageId = uuidv4();
    requestAbortRef.current = new AbortController();
    activeAssistantIdRef.current = assistantMessageId;
    setIsStreaming(true);
    setStatusText("Ai正在努力思考中...");
    setMessages((prev) => [
      ...prev,
      createMessage("user", prompt),
      createMessage("assistant", "", "streaming", { messageId: assistantMessageId }),
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
          requestId: uuidv4(),
          sessionId,
          userId: currentUserId,
          debug: true,
          prompt,
        },
        {
          signal: requestAbortRef.current?.signal,
          retry: false,
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
      const { messages: historyMessages, latestTodo } = buildHistoryMessages(
        result?.messages || [],
        targetSessionId,
      );
      setMessages(historyMessages);
      setTodoMap((prev) => ({ ...prev, [targetSessionId]: latestTodo ?? [] }));
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
    <Flex
      vertical
      gap="none"
      style={{ padding: "16px", height: "100%", overflow: "hidden", boxSizing: "border-box" }}
    >
      <Flex flex={1} style={{ overflow: "hidden", minHeight: 0 }}>
        <AiChatContent
          messages={messages}
          statusText={statusText}
          isStreaming={isStreaming}
          onPromptSelect={handlePromptSelect}
        />
      </Flex>
      <AiChatInput
        value={draft}
        todoList={currentTodoList}
        onChange={setDraft}
        onSubmit={onSubmit}
        loading={isStreaming}
      />
    </Flex>
  );
};
