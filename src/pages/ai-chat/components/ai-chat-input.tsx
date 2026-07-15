import { Sender } from "@ant-design/x";
import { Button, Typography } from "antd";
import type { TodoItem } from "../types/todo-list";
import { TodoList } from "./todo-list";

type AiChatInputProps = {
  value: string;
  todoList: TodoItem[] | null;
  onChange: (value: string) => void;
  onSubmit: (message: string) => Promise<void>;
  loading?: boolean;
};
export const AiChatInput = (props: AiChatInputProps) => {
  const onSubmit = (message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || props.loading) {
      return;
    }
    return props.onSubmit(trimmedMessage);
  };

  return (
    <>
      <TodoList items={props.todoList || []} />
      <Sender
        value={props.value}
        loading={props.loading}
        submitType="enter"
        autoSize={{ minRows: 1, maxRows: 6 }}
        placeholder={
          props.loading ? "AI 正在生成回复..." : "Ask anything, or paste Markdown-friendly content"
        }
        prefix={<Button type="primary">发起任务</Button>}
        footer={<Typography.Text type="secondary">Enter 发送，Shift + Enter 换行</Typography.Text>}
        onChange={props.onChange}
        onSubmit={onSubmit}
        onKeyPress={() => {}}
        onFocus={() => {}}
        onBlur={() => {}}
      />
    </>
  );
};
