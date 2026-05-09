import { PaperClipOutlined } from "@ant-design/icons";
import { Sender } from "@ant-design/x";
import { FC } from "react";
import styled from "styled-components";

type AiChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => Promise<void>;
  loading?: boolean;
}
export const AiChatInput: FC<AiChatInputProps> = (props) => {
  const onSubmit = (message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || props.loading) {
      return;
    }
    return props.onSubmit(trimmedMessage);
  }

  return <AiChatInputWrapper>
    <InputFrame>
      <Sender
        value={props.value}
        loading={props.loading}
        submitType="enter"
        autoSize={{ minRows: 1, maxRows: 6 }}
        placeholder={props.loading ? "AI 正在生成回复..." : "Ask anything, or paste Markdown-friendly content"}
        prefix={<ActionChip>
          <PaperClipOutlined />
          Attach
        </ActionChip>}
        footer={<InputHint>Enter 发送，Shift + Enter 换行</InputHint>}
        styles={{
          input: {
            fontSize: 15,
            lineHeight: 1.65,
            color: "#2f261a",
            padding: 0,
          },
        }}
        style={{ background: "transparent", boxShadow: "none", border: 0 }}
        onChange={props.onChange}
        onSubmit={onSubmit}
        onKeyPress={() => { }}
        onFocus={() => { }}
        onBlur={() => { }} />
    </InputFrame>
  </AiChatInputWrapper>
}

const AiChatInputWrapper = styled.div`
  & {
    box-sizing: border-box;
    padding: 20px 28px 28px;
    width: 100%;
    background: linear-gradient(180deg, rgba(246, 240, 231, 0.3) 0%, #f3ede3 100%);
    border-top: 1px solid rgba(114, 92, 61, 0.08);
  }
`;

const InputFrame = styled.div`
  & {
    box-sizing: border-box;
    padding: 14px 18px 12px;
    border: 1px solid rgba(109, 88, 59, 0.08);
    border-radius: 28px;
    background: rgba(255, 252, 247, 0.96);
    box-shadow:
      0 24px 44px rgba(76, 59, 37, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.92);
  }
`;

const ActionChip = styled.div`
  & {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-right: 12px;
    padding: 8px 12px;
    border-radius: 999px;
    color: rgba(47, 38, 26, 0.6);
    font-size: 12px;
    font-weight: 600;
    background: #f6efe5;
  }
`;

const InputHint = styled.div`
  & {
    padding-top: 10px;
    font-size: 11px;
    color: rgba(47, 38, 26, 0.48);
  }
`;