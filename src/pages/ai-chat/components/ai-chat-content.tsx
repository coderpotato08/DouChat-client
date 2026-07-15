import { FireOutlined } from "@ant-design/icons";
import { Bubble, type BubbleProps, Prompts, Welcome } from "@ant-design/x";
import type { RolesType } from "@ant-design/x/es/bubble/BubbleList";
import { XMarkdown } from "@ant-design/x-markdown";
import { Avatar, Card, Flex, Typography } from "antd";
import { type FC, useMemo } from "react";
import type { AIChatMessage } from "../types";

type AiChatContentProps = {
  messages: AIChatMessage[];
  statusText?: string;
  isStreaming: boolean;
  onPromptSelect: (prompt: string) => void;
};
const promptItems = [
  {
    key: "prompt-1",
    label: "生成一篇以我想下班为主题的200字小短文写入data/temp.txt中",
    description: "生成小作文",
  },
  {
    key: "prompt-2",
    label: "阅读data/temp.txt中的内容，从不同角度分析这篇小短文的优缺点，并给出改进建议",
    description: "分析文本",
  },
  {
    key: "prompt-3",
    label:
      "请按照以下顺序执行任务：1. 在data目录创建test.py 2. 在test.py中写入一段python代码 3. 在data目录创建__init__.py",
    description: "todo展示测试",
  },
];

const mapMessageStatus = (status?: AIChatMessage["status"]) => {
  if (status === "streaming") {
    return "loading" as const;
  }
  if (status === "error") {
    return "error" as const;
  }
  return "success" as const;
};
const bubbleStyles: BubbleProps["styles"] = {
  content: {
    maxWidth: "85%",
  },
};

export const AiChatContent: FC<AiChatContentProps> = ({
  messages,
  isStreaming,
  onPromptSelect,
}) => {
  console.log(messages);
  const bubbleItems = useMemo<BubbleProps[]>(() => {
    return messages.map((message) => ({
      key: `${message.role}_${message.requestId}`,
      role: message.role,
      content: message.content,
      status: mapMessageStatus(message.status),
      streaming: message.status === "streaming",
      loading: message.status === "streaming" && !message.content,
    }));
  }, [messages]);

  const roleConfig = useMemo<RolesType>(
    () => ({
      assistant: {
        styles: bubbleStyles,
        placement: "start" as const,
        variant: "filled" as const,
        avatar: <Avatar>AI</Avatar>,
        messageRender: (content: unknown) => {
          return (
            <XMarkdown
              content={typeof content === "string" ? content : ""}
              openLinksInNewTab
              streaming={{
                hasNextChunk: isStreaming,
                enableAnimation: true,
                tail: isStreaming,
              }}
            />
          );
        },
      },
      user: {
        styles: bubbleStyles,
        placement: "end" as const,
        variant: "filled" as const,
        avatar: <Avatar>ME</Avatar>,
      },
    }),
    [isStreaming],
  );

  const messageRender = (message: AIChatMessage) => {};

  if (!messages.length) {
    return (
      <Card
        style={{ width: "fit-content", margin: "0 auto auto" }}
        styles={{ body: { padding: "16px" } }}
      >
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
    <Flex vertical gap="16" style={{ width: "100%", overflow: "auto" }}>
      <Bubble.List items={bubbleItems} roles={roleConfig} autoScroll />
    </Flex>
  );
};
