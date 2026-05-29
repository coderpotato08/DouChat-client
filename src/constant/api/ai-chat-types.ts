export interface AgentCompletionParams {
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
