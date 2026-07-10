import type { GetSessionListItem } from "@constant/api/ai-chat-types";
import { PlusOutlined } from "@ant-design/icons";
import { Conversations } from "@ant-design/x";
import { Avatar, Button, Flex, Spin, Typography } from "antd";
import { type FC, useMemo } from "react";

type AiChatMenuProps = {
  sessionList: GetSessionListItem[];
  sessionId: string;
  loading?: boolean;
  onSessionChange: (sessionId: string) => void;
  onCreateSession: () => Promise<void>;
  creatingSession?: boolean;
};
export const AiChatMenu: FC<AiChatMenuProps> = ({
  sessionList,
  sessionId,
  loading = false,
  onSessionChange,
  onCreateSession,
  creatingSession = false,
}) => {
  const conversationItems = useMemo(() => {
    return sessionList.map((item) => ({
      key: item.sessionId,
      label: item.title,
    }));
  }, [sessionList]);

  return (
    <Flex vertical gap="middle" style={{ padding: "12px", minWidth: "240px" }}>
      <Flex vertical gap={18}>
        <Flex align="center" gap={14}>
          <Avatar shape="square" size="large">
            AI
          </Avatar>
          <Typography.Title level={4}>Wednesday</Typography.Title>
        </Flex>
        <Button type="primary" icon={<PlusOutlined />} loading={creatingSession} onClick={() => void onCreateSession()}>
          新建会话
        </Button>
      </Flex>

      <Spin spinning={loading}>
        <Conversations
          style={{ padding: 0 }}
          activeKey={sessionId}
          items={conversationItems}
          onActiveChange={(key) => onSessionChange(String(key || ""))}
        />
      </Spin>
    </Flex>
  );
};
