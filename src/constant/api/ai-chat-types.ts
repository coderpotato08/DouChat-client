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
};

// ==================== 会话管理 ====================

/** 获取会话消息 — 请求参数 */
export interface GetSessionParams {
  sessionId: string;
  userId: string;
}

/** 会话摘要（不含消息列表） */
export interface SessionSummary {
  sessionId: string;
  title: string;
  status: "active" | "archived";
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
