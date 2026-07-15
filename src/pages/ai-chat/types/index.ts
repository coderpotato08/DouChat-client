export type AIChatMessage = {
  sessionId: string;
  requestId: string;
  role: "assistant" | "user" | "system";
  messageId: string;
  content?: string;
  status: "streaming" | "done" | "error";
  statusText?: string;
  createdAt?: string;
  todoList?: Array<any>;
  blocks?: AIChatMessageBlock[];
};

export enum MessageBlockType {
  TOOL_USE = "tool_use",
  PERMISSION_REQUEST = "permission_request",
  ERROR = "error",
}
type ChatMessageBlockBase = {
  messageId: string;
};

export type ToolUseBlock = ChatMessageBlockBase & {
  blockType: MessageBlockType.TOOL_USE;
  toolName: string;
  toolUseId: string;
  status: "running" | "succeeded" | "failed";
  input?: unknown;
  output?: unknown;
};

export type PermissionRequestBlock = ChatMessageBlockBase & {
  blockType: MessageBlockType.PERMISSION_REQUEST;
  requestId: string;
  data: unknown;
};

export type ErrorBlock = ChatMessageBlockBase & {
  blockType: MessageBlockType.ERROR;
  error: string;
};

export type AIChatMessageBlock =
  | ToolUseBlock
  | PermissionRequestBlock
  | ErrorBlock;
