export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export type TodoItem = {
  content: string;
  status: TaskStatus;
  activeForm: string;
};
