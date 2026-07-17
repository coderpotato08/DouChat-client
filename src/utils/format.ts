import type { SessionMessageItem } from "@constant/api/ai-chat-types";
import { v4 as uuidv4 } from "uuid";
import {
  type AIChatMessage,
  type AIChatMessageBlock,
  MessageBlockType,
} from "../pages/ai-chat/types";
import type { TodoItem } from "../pages/ai-chat/types/todo-list";

/** 从 todo 工具入参/输出中解析计划列表 */
export const parseTodoItems = (data: unknown): TodoItem[] | null => {
  if (
    typeof data !== "object" ||
    data === null ||
    !Array.isArray((data as { items?: unknown }).items)
  ) {
    return null;
  }
  return (data as { items: TodoItem[] }).items;
};

const parseToolInput = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

export type HistoryBuildResult = {
  messages: AIChatMessage[];
  latestTodo: TodoItem[] | null;
};

/**
 * 将后端历史消息按 requestId 聚合为一轮一条 assistant：
 * - 非 todo 的工具调用维护到该轮 assistant 的 blocks（历史无工具结果，仅恢复入参）
 * - todo 工具的 items 作为最近一轮的 todoList
 * - tool 角色消息不展示
 */
export const buildHistoryMessages = (
  history: SessionMessageItem[],
  sessionId: string,
): HistoryBuildResult => {
  const roundOrder: string[] = [];
  const rounds = new Map<string, SessionMessageItem[]>();

  for (const item of history) {
    if (!item.requestId) {
      continue;
    }
    if (!rounds.has(item.requestId)) {
      rounds.set(item.requestId, []);
      roundOrder.push(item.requestId);
    }
    rounds.get(item.requestId)!.push(item);
  }

  const messages: AIChatMessage[] = [];
  let latestTodo: TodoItem[] | null = null;

  for (const requestId of roundOrder) {
    const group = rounds.get(requestId)!;
    let userMessage: AIChatMessage | null = null;
    let assistantContent = "";
    let assistantMessageId = "";
    const blocks: AIChatMessageBlock[] = [];

    for (const item of group) {
      if (item.role === "user") {
        userMessage = {
          requestId,
          sessionId,
          messageId: item.messageId,
          role: "user",
          content: item.content ?? "",
          status: "done",
          createdAt: item.createdAt,
        };
      } else if (item.role === "assistant") {
        if (!assistantMessageId) {
          assistantMessageId = item.messageId;
        }
        if (item.content) {
          assistantContent = item.content;
        }
        if (item.tool_calls?.length) {
          for (const toolCall of item.tool_calls) {
            const toolName = toolCall.function.name;
            const input = parseToolInput(toolCall.function.arguments);
            if (toolName === "todo") {
              const items = parseTodoItems(input);
              if (items) {
                latestTodo = items;
              }
            } else {
              blocks.push({
                messageId: item.messageId,
                blockType: MessageBlockType.TOOL_USE,
                toolName,
                toolUseId: toolCall.id,
                status: "succeeded",
                input,
              });
            }
          }
        }
      }
    }

    if (userMessage) {
      messages.push(userMessage);
    }
    if (assistantContent || blocks.length) {
      messages.push({
        requestId,
        sessionId,
        messageId: assistantMessageId || uuidv4(),
        role: "assistant",
        content: assistantContent,
        status: "done",
        blocks,
        createdAt: group[0]?.createdAt,
      });
    }
  }

  return { messages, latestTodo };
};
