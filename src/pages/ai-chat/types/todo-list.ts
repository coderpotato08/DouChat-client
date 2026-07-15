export enum TodoStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed"
}

export type TodoItem = {
  content: string;
  status: TodoStatus;
  activeForm: string;
};

