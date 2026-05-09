import { PlusOutlined } from "@ant-design/icons";
import { Conversations } from "@ant-design/x";
import { Button } from "antd";
import { type FC, useState } from "react";
import styled from "styled-components";

const conversationItems = [
  {
    key: "travel-plan",
    title: "Spring festival travel plan",
    summary: "Create a 4-day itinerary with food and hotel tips",
    active: true,
  },
  {
    key: "react-performance",
    title: "React performance checklist",
    summary: "Audit a slow dashboard and prioritise fixes",
  },
  {
    key: "markdown-audit",
    title: "Markdown rendering audit",
    summary: "Compare code block themes for AI replies",
  },
  {
    key: "landing-page",
    title: "Landing page rewrite",
    summary: "Rewrite hero copy for a B2B AI product",
  },
  {
    key: "meeting-summary",
    title: "Meeting summary generator",
    summary: "Turn long notes into a compact action list",
  },
];

type AiChatMenuProps = {};
export const AiChatMenu: FC<AiChatMenuProps> = () => {
  const [activeKey, setActiveKey] = useState(
    conversationItems.find((item) => item.active)?.key || conversationItems[0]?.key || "",
  );

  return (
    <AiChatMenuWrapper>
      <SidebarTop>
        <BrandBlock>
          <BrandMark>AI</BrandMark>
          <BrandTitle>Wednesday</BrandTitle>
        </BrandBlock>
        <Button type="primary" icon={<PlusOutlined />}>
          New chat
        </Button>
      </SidebarTop>

      <ConversationList>
        <Conversations
          activeKey={activeKey}
          items={conversationItems.map((item) => ({
            key: item.key,
            label: (
              <ConversationLabel $active={item.key === activeKey}>
                <ConversationTitle>{item.title}</ConversationTitle>
                <ConversationSummary>{item.summary}</ConversationSummary>
              </ConversationLabel>
            ),
          }))}
          styles={{
            item: {
              marginBottom: 8,
              padding: 0,
              background: "transparent",
              border: 0,
              boxShadow: "none",
            },
          }}
          onActiveChange={setActiveKey}
        />
      </ConversationList>

      <SidebarFooter>
        <FooterLabel>Current workspace</FooterLabel>
        <FooterCard>
          <FooterTitle>AI Chat Redesign</FooterTitle>
          <FooterText>Static conversation list with a Markdown-ready answer area.</FooterText>
        </FooterCard>
      </SidebarFooter>
    </AiChatMenuWrapper>
  );
};

const AiChatMenuWrapper = styled.aside`
  & {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 28px 20px 20px;
    width: 100%;
    height: 100%;
    color: #352a1d;
    background: #f5f5f5;
  }
`;

const SidebarTop = styled.div`
  & {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
`;

const BrandBlock = styled.div`
  & {
    display: flex;
    align-items: center;
    gap: 14px;
  }
`;

const BrandMark = styled.div`
  & {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.08em;
    background: linear-gradient(135deg, #1f5f47 0%, #35765d 100%);
    box-shadow: 0 18px 34px rgba(31, 95, 71, 0.22);
  }
`;

const BrandTitle = styled.div`
  & {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
  }
`;

const ConversationList = styled.div`
  & {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-right: 4px;
  }
`;

const ConversationLabel = styled.div<{ $active: boolean }>`
  & {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 14px 14px 14px 16px;
    border: 1px solid ${(props) => (props.$active ? "rgba(42, 106, 80, 0.18)" : "transparent")};
    border-radius: 18px;
    background: ${(props) => (props.$active ? "rgba(255, 252, 248, 0.96)" : "rgba(255, 249, 241, 0.48)")};
    box-shadow: ${(props) => (props.$active ? "0 18px 30px rgba(74, 58, 37, 0.1)" : "none")};
    transition: all 0.2s ease;
  }

  &:hover {
    background: rgba(255, 252, 248, 0.86);
  }
`;

const ConversationTitle = styled.div`
  & {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }
`;

const ConversationSummary = styled.div`
  & {
    font-size: 12px;
    line-height: 1.55;
    color: rgba(53, 42, 29, 0.58);
  }
`;

const SidebarFooter = styled.div`
  & {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

const FooterLabel = styled.div`
  & {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(53, 42, 29, 0.42);
  }
`;

const FooterCard = styled.div`
  & {
    padding: 16px;
    border-radius: 20px;
    background: rgba(255, 251, 245, 0.84);
    border: 1px solid rgba(85, 66, 44, 0.08);
  }
`;

const FooterTitle = styled.div`
  & {
    font-size: 14px;
    font-weight: 600;
  }
`;

const FooterText = styled.div`
  & {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: rgba(53, 42, 29, 0.58);
  }
`;
