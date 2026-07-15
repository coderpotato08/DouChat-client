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
  TOOL_USE_START = "tool_use_start",
  TOOL_USE_DONE = "tool_use_done",
  PERMISSION_REQUEST = "permission_request",
  ERROR = "error",
}
type ChatMessageBlockBase = {
  messageId: string;
};

export type ToolUseStartBlock = ChatMessageBlockBase & {
  blockType: MessageBlockType.TOOL_USE_START;
  toolName: string;
  toolUseId: string;
  data: unknown;
};

export type ToolUseDoneBlock = ChatMessageBlockBase & {
  blockType: MessageBlockType.TOOL_USE_DONE;
  toolName: string;
  toolUseId: string;
  success: boolean;
  data: unknown;
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
  | ToolUseStartBlock
  | ToolUseDoneBlock
  | PermissionRequestBlock
  | ErrorBlock;
