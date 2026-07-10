export interface AgentCompletionParams {
  sessionId: string;
  userId: string;
  prompt: string;
}

export interface AgentApprovalStartTaskParams {
  taskId: string;
  taskContent: string;
}

export interface AgentApprovalStartTaskResult {
  threadId: string;
  status: "interrupted" | "running";
}

export interface AgentApprovalApproveTaskParams {
  threadId: string;
  approved: boolean;
  remark?: string;
}

export interface AgentApprovalApproveTaskResult {
  status: "completed";
  result: unknown;
}

export type AgentStreamEvent = {
  type: string;
  delta?: string;
  error?: string;
  toolName?: string;
  toolUseId?: string;
  data?: unknown;
  success?: boolean;
};

// ==================== 会话管理 ====================

/** 会话状态 */
export type AiSessionStatus = "active" | "archived" | "deleted";

/** 获取会话消息 — 请求参数 */
export interface GetSessionParams {
  sessionId: string;
  userId: string;
}

/** 会话摘要（不含消息列表） */
export interface SessionSummary {
  sessionId: string;
  title: string;
  status: AiSessionStatus;
  modelProvider: string;
  messageCount: number;
  lastMessagePreview: string;
  createdAt: string;
  updatedAt: string;
}

/** 单条会话消息 */
export interface SessionMessageItem {
  messageId: string;
  sessionId: string;
  requestId?: string | null;
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  contentType?: "text" | "json" | "tool_call" | "tool_result";
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string | null;
  sortIndex: number;
  messageStatus?: "pending" | "success" | "failed";
  tokenUsage?: { inputToken?: number; outputToken?: number; totalToken?: number };
  createdAt: string;
  isCompressed?: boolean;
}

export interface GetSessionListParams {
  userId: string;
  /** 按状态过滤，支持单值或数组；不传则默认排除软删除会话 */
  status?: AiSessionStatus | AiSessionStatus[];
}

export interface GetSessionListItem {
  sessionId: string;
  userId: string;
  title: string;
  status: AiSessionStatus;
  modelProvider?: string;
  messageCount: number;
  lastMessagePreview: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetSessionListResult {
  sessions: GetSessionListItem[];
}

/** 获取会话消息 — 响应 */
export interface GetSessionResult {
  session: SessionSummary;
  messages: SessionMessageItem[];
}

/** 新建会话 — 请求参数 */
export interface InitSessionParams {
  userId: string;
  modelProvider?: "DOUBAO" | "QWEN";
}

/** 新建会话 — 响应 */
export interface InitSessionResult {
  sessionId: string;
}
