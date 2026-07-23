import { CheckCircleOutlined, ClockCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { Badge, Collapse, Flex, Typography } from "antd";
import type { FC, ReactNode } from "react";
import { TaskStatus, type TodoItem } from "../types/todo-list";

type TodoListProps = {
  items: TodoItem[] | null;
};

type StatusConfig = {
  icon: ReactNode;
  color: "secondary" | "success" | undefined;
  label: string;
};

const statusConfig: Record<TaskStatus, StatusConfig> = {
  [TaskStatus.PENDING]: { icon: <ClockCircleOutlined />, color: "secondary", label: "待处理" },
  [TaskStatus.IN_PROGRESS]: { icon: <LoadingOutlined spin />, color: undefined, label: "进行中" },
  [TaskStatus.COMPLETED]: { icon: <CheckCircleOutlined />, color: "success", label: "已完成" },
};

export const TodoList: FC<TodoListProps> = ({ items }) => {
  if (!items?.length) {
    return null;
  }

  const isExpanded = items.some((item) => item.status === TaskStatus.IN_PROGRESS);
  const pendingCount = items.filter((item) => item.status !== TaskStatus.COMPLETED).length;

  return (
    <Collapse
      size="small"
      activeKey={isExpanded ? "todo" : undefined}
      style={{ width: "100%" }}
      items={[
        {
          key: "todo",
          label: (
            <Flex align="center" gap="small">
              <Typography.Text strong>任务进度</Typography.Text>
              <Badge count={pendingCount} size="small" />
            </Flex>
          ),
          children: (
            <Flex vertical gap="12">
              {items.map((item, index) => {
                const config = statusConfig[item.status];
                return (
                  <Flex key={`${item.content}-${index}`} align="center" gap="small">
                    <Typography.Text type={config.color}>{config.icon}</Typography.Text>
                    <Typography.Text delete={item.status === TaskStatus.COMPLETED}>
                      {item.content}
                    </Typography.Text>
                    {item.status === TaskStatus.IN_PROGRESS && item.activeForm ? (
                      <Typography.Text type="secondary">{item.activeForm}</Typography.Text>
                    ) : null}
                  </Flex>
                );
              })}
            </Flex>
          ),
        },
      ]}
    />
  );
};
