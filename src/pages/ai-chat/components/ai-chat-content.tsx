import { FireOutlined, MessageOutlined } from "@ant-design/icons";
import { Bubble, Prompts, Welcome } from "@ant-design/x";
import { XMarkdown } from "@ant-design/x-markdown";
import { FC, useMemo } from "react";
import styled from "styled-components";

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

}
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

export const AiChatContent: FC<AiChatContentProps> = ({ messages, statusText, isStreaming, onPromptSelect }) => {
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

  const roleConfig = useMemo(() => ({
    assistant: {
      placement: "start" as const,
      variant: "borderless" as const,
      avatar: <RoleAvatar $tone="assistant">AI</RoleAvatar>,
      contentRender: (content: unknown, info: { status?: string }) => <AssistantCard>
        <MarkdownShell>
          <XMarkdown
            content={typeof content === "string" ? content : ""}
            openLinksInNewTab
            streaming={{
              hasNextChunk: info.status === "loading",
              enableAnimation: true,
              tail: info.status === "loading",
            }} />
        </MarkdownShell>
      </AssistantCard>,
    },
    user: {
      placement: "end" as const,
      variant: "borderless" as const,
      avatar: <RoleAvatar $tone="user">ME</RoleAvatar>,
      contentRender: (content: unknown) => <UserCard>{String(content || "")}</UserCard>,
    },
    system: {
      placement: "start" as const,
      variant: "borderless" as const,
      avatar: <RoleAvatar $tone="system">!</RoleAvatar>,
      contentRender: (content: unknown) => <SystemCard>{String(content || "")}</SystemCard>,
    },
  }), []);

  if (!messages.length) {
    return <AiChatContentWrapper>
      <EmptyState>
        <WelcomePanel>
          <HeroBadge>
            <FireOutlined />
            AI assistant workspace
          </HeroBadge>
          <Welcome
            variant="borderless"
            style={{ padding: 0, backgroundColor: "transparent" }}
            icon={null}
            title="Shape ideas into polished answers"
            description="Use the redesigned chat surface to draft, refine, and stream Markdown-ready responses with a calmer reading experience." />
          <PromptWrap>
            <Prompts
              title="Start with a prompt"
              wrap
              styles={{
                item: { borderRadius: 22, padding: 18, background: "rgba(255, 251, 245, 0.9)" },
                title: { fontSize: 13, color: "rgba(50, 39, 25, 0.56)" },
              }}
              items={promptItems}
              onItemClick={(info) => onPromptSelect(String(info.data.label || ""))} />
          </PromptWrap>
        </WelcomePanel>
      </EmptyState>
    </AiChatContentWrapper>;
  }

  return <AiChatContentWrapper>
    <ChatScrollArea>
      <BubbleListFrame>
        <Bubble.List items={bubbleItems} roles={roleConfig} autoScroll />
      </BubbleListFrame>
      {statusText ? <StatusRow>
        <StatusPill>
          <MessageOutlined />
          {statusText}
        </StatusPill>
      </StatusRow> : null}
    </ChatScrollArea>
  </AiChatContentWrapper>
}

const AiChatContentWrapper = styled.div`
  & {
    flex: 1;
    width: 100%;
    min-height: 0;
    background:
      radial-gradient(circle at top center, rgba(255, 255, 255, 0.86), transparent 32%),
      linear-gradient(180deg, #f7f2ea 0%, #f4ede2 100%);
  }
`;

const ChatScrollArea = styled.div`
  & {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 16px;
    padding: 28px 28px 16px;
    width: 100%;
    height: 100%;
    min-height: 0;
  }
`;

const EmptyState = styled.div`
  & {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    width: 100%;
    height: 100%;
  }
`;

const WelcomePanel = styled.div`
  & {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 22px;
    padding: 40px;
    width: min(860px, 100%);
    border: 1px solid rgba(99, 78, 52, 0.08);
    border-radius: 36px;
    background: rgba(255, 250, 244, 0.92);
    box-shadow: 0 28px 50px rgba(83, 65, 42, 0.08);
  }
`;

const HeroBadge = styled.div`
  & {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    width: fit-content;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #2d6049;
    background: rgba(43, 106, 80, 0.1);
  }
`;

const PromptWrap = styled.div`
  & {
    margin-top: 6px;
  }
`;

const BubbleListFrame = styled.div`
  & {
    flex: 1;
    min-height: 0;
    overflow: hidden;

    .ant-bubble-list {
      height: 100%;
    }

    .ant-bubble {
      max-width: min(920px, 92%);
    }
  }
`;

const RoleAvatar = styled.div<{ $tone: "assistant" | "user" | "system" }>`
  & {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    min-width: 38px;
    height: 38px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 700;
    color: ${(props) => props.$tone === "user" ? "#f8f1e6" : "#fff"};
    background: ${(props) => {
    if (props.$tone === "user") {
      return "linear-gradient(135deg, #2b6a50 0%, #427b62 100%)";
    }
    if (props.$tone === "system") {
      return "linear-gradient(135deg, #9f7b52 0%, #b08c63 100%)";
    }
    return "linear-gradient(135deg, #1b1a18 0%, #44413b 100%)";
  }};
    box-shadow: 0 16px 32px rgba(46, 38, 28, 0.16);
  }
`;

const AssistantCard = styled.div`
  & {
    box-sizing: border-box;
    padding: 22px 24px;
    border: 1px solid rgba(99, 78, 52, 0.08);
    border-radius: 26px;
    color: #2f261a;
    background: rgba(255, 252, 248, 0.98);
    box-shadow: 0 22px 44px rgba(78, 61, 40, 0.1);
  }
`;

const UserCard = styled.div`
  & {
    box-sizing: border-box;
    padding: 16px 20px;
    border-radius: 24px;
    color: #fff;
    white-space: pre-wrap;
    line-height: 1.7;
    background: linear-gradient(135deg, #23583f 0%, #3f745d 100%);
    box-shadow: 0 20px 36px rgba(36, 86, 65, 0.16);
  }
`;

const SystemCard = styled.div`
  & {
    box-sizing: border-box;
    padding: 14px 18px;
    border-radius: 18px;
    color: #6b5539;
    line-height: 1.65;
    background: #f2e3cc;
  }
`;

const MarkdownShell = styled.div`
  & {
    color: #2f261a;
    font-size: 15px;
    line-height: 1.8;
  }

  p,
  ul,
  ol,
  pre,
  blockquote,
  table,
  h1,
  h2,
  h3,
  h4 {
    margin-top: 0;
    margin-bottom: 14px;
  }

  p:last-child,
  ul:last-child,
  ol:last-child,
  pre:last-child,
  blockquote:last-child,
  table:last-child {
    margin-bottom: 0;
  }

  h1,
  h2,
  h3,
  h4 {
    color: #241d14;
    line-height: 1.35;
  }

  h1 {
    font-size: 26px;
  }

  h2 {
    font-size: 22px;
  }

  h3 {
    font-size: 18px;
  }

  ul,
  ol {
    padding-left: 20px;
  }

  li + li {
    margin-top: 6px;
  }

  a {
    color: #2f6a54;
  }

  blockquote {
    padding: 10px 0 10px 16px;
    border-left: 3px solid rgba(47, 106, 84, 0.22);
    color: rgba(47, 38, 26, 0.72);
    background: rgba(243, 238, 228, 0.7);
  }

  pre {
    overflow-x: auto;
    padding: 16px;
    border-radius: 18px;
    color: #f7f1e7;
    background: #1f1d1a;
  }

  code {
    padding: 0.15em 0.35em;
    border-radius: 6px;
    font-size: 0.92em;
    background: rgba(47, 38, 26, 0.08);
  }

  pre code {
    padding: 0;
    background: transparent;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    overflow: hidden;
    border-radius: 16px;
  }

  th,
  td {
    padding: 10px 12px;
    border: 1px solid rgba(99, 78, 52, 0.08);
    text-align: left;
  }

  th {
    background: #f5efe6;
  }
`;

const StatusRow = styled.div`
  & {
    display: flex;
    justify-content: center;
  }
`;

const StatusPill = styled.div`
  & {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    color: rgba(47, 38, 26, 0.62);
    font-size: 12px;
    background: rgba(255, 251, 246, 0.9);
    border: 1px solid rgba(99, 78, 52, 0.08);
  }
`