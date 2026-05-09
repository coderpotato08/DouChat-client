export interface AgentCompletionParams {
  userId: string;
  prompt: string;
}

export type AgentStreamEvent = {
  type: string;
  delta?: string;
  error?: string;
  toolName?: string;
};