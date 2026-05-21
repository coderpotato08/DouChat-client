import { PlusOutlined } from "@ant-design/icons";
import { Conversations } from "@ant-design/x";
import { Avatar, Button, Flex, Typography } from "antd";
import { type FC, useState } from "react";

const conversationItems = [
  {
    key: "travel-plan",
    label: "Spring festival travel plan",
    active: true,
  },
  {
    key: "react-performance",
    label: "React performance checklist",
  },
  {
    key: "markdown-audit",
    label: "Markdown rendering audit",
  },
  {
    key: "landing-page",
    label: "Landing page rewrite",
  },
  {
    key: "meeting-summary",
    label: "Meeting summary generator",
  },
];

type AiChatMenuProps = Record<string, never>;
export const AiChatMenu: FC<AiChatMenuProps> = () => {
  const [activeKey, setActiveKey] = useState(
    conversationItems.find((item) => item.active)?.key || conversationItems[0]?.key || "",
  );

  return (
    <Flex vertical gap="middle">
      <Flex vertical gap={18}>
        <Flex align="center" gap={14}>
          <Avatar shape="square" size="large">
            AI
          </Avatar>
          <Typography.Title level={4}>Wednesday</Typography.Title>
        </Flex>
        <Button type="primary" icon={<PlusOutlined />}>
          New chat
        </Button>
      </Flex>

      <Conversations
        activeKey={activeKey}
        items={conversationItems}
        onActiveChange={setActiveKey}
      />
    </Flex>
  );
};
