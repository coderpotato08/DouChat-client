import { FireOutlined, MessageOutlined } from "@ant-design/icons";
import { Bubble, Prompts, Welcome } from "@ant-design/x";
import { XMarkdown } from "@ant-design/x-markdown";
import { Avatar, Card, Flex, Typography } from "antd";
import { type FC, useMemo } from "react";

export type AiChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  status?: "streaming" | "done" | "error";
};

type AiChatContentProps = {
  messages: AiChatMessage[];
  statusText?: string;
  isStreaming: boolean;
  onPromptSelect: (prompt: string) => void;
};
const promptItems = [
  {
    key: "prompt-1",
    label: "Plan a four-day city break with local food stops",
    description: "Travel planning",
  },
  {
    key: "prompt-2",
    label: "Rewrite this product intro with a warmer tone and clearer CTA",
    description: "Marketing copy",
  },
  {
    key: "prompt-3",
    label: "Summarise meeting notes into decisions, owners, and deadlines",
    description: "Operations",
  },
];

const mapMessageStatus = (status?: AiChatMessage["status"]) => {
  if (status === "streaming") {
    return "loading" as const;
  }
  if (status === "error") {
    return "error" as const;
  }
  return "success" as const;
};

export const AiChatContent: FC<AiChatContentProps> = ({
  messages,
  statusText,
  isStreaming,
  onPromptSelect,
}) => {
  const bubbleItems = useMemo(() => {
    return messages.map((message) => ({
      key: message.id,
      role: message.role,
      content: message.content,
      status: mapMessageStatus(message.status),
      streaming: message.status === "streaming",
      loading: message.status === "streaming" && !message.content,
    }));
  }, [messages]);

  const roleConfig = useMemo(
    () => ({
      assistant: {
        placement: "start" as const,
        variant: "borderless" as const,
        avatar: <Avatar>AI</Avatar>,
        messageRender: (content: unknown) => (
          <XMarkdown
            content={typeof content === "string" ? content : ""}
            openLinksInNewTab
            streaming={{
              hasNextChunk: isStreaming,
              enableAnimation: true,
              tail: isStreaming,
            }}
          />
        ),
      },
      user: {
        placement: "end" as const,
        variant: "filled" as const,
        avatar: <Avatar>ME</Avatar>,
      },
      system: {
        placement: "start" as const,
        variant: "outlined" as const,
        avatar: <Avatar>!</Avatar>,
      },
    }),
    [isStreaming],
  );

  if (!messages.length) {
    return (
      <Card style={{ width: "fit-content", margin: "0 auto auto" }} styles={{ body: { padding: "16px" } }}>
        <Flex vertical gap="middle">
          <Typography.Text type="secondary">
            <FireOutlined /> AI assistant workspace
          </Typography.Text>
          <Welcome
            variant="borderless"
            icon={null}
            title="Shape ideas into polished answers"
            description="Use the redesigned chat surface to draft, refine, and stream Markdown-ready responses with a calmer reading experience."
          />
          <Prompts
            title="Start with a prompt"
            wrap
            items={promptItems}
            onItemClick={(info) => onPromptSelect(String(info.data.label || ""))}
          />
        </Flex>
      </Card>
    );
  }

  return (
    <Flex vertical gap="middle">
      <Bubble.List items={bubbleItems} roles={roleConfig} autoScroll />
      {statusText ? (
        <Typography.Text type="secondary">
          <MessageOutlined /> {statusText}
        </Typography.Text>
      ) : null}
    </Flex>
  );
};
