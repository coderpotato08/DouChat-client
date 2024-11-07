import EmojiPicker from "@components/emoji-picker";
import { MeetingMessageData, MeetingMessageTypeEnum } from "@constant/meeting-types";
import { createUidV4 } from "@helper/uuid-helper";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/userReducer";
import { Input, InputRef } from "antd";
import { FC, useEffect, useRef, useState } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import styled from "styled-components";

type MeetingChatBoxProps = {
  offset?: {
    left?: number,
    bottom?: number,
  }
  messageList: MeetingMessageData[]
  onSend: (data: MeetingMessageData) => void
}
export const MeetingChatBox: FC<MeetingChatBoxProps> = (props) => {
  const inputRef = useRef<InputRef | null>(null)
  const userInfo = useAppSelector(userSelector);
  const [focus, setFocus] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { messageList, onSend } = props;

  const submitMessage = () => {
    if (inputValue) {
      const messageData: MeetingMessageData = {
        mid: createUidV4(),
        type: MeetingMessageTypeEnum.TEXT,
        content: inputValue,
        name: userInfo?.nickname as string,
      };
      onSend(messageData);
      setInputValue("");
    }
  }

  const onExpandOrShrink = () => {

  }

  useEffect(() => {
    const len = messageList.length;
    const id = messageList[len - 1] ? messageList[len - 1]?.mid : "";
    const ele = document.getElementById(id as string);
    if (ele) {
      ele.scrollIntoView({
        block: "end",
        inline: "nearest",
        behavior: "smooth",
      })
    }
  }, [messageList]);

  return <MeetingChatWrapper $offset={props.offset}>
    <BarrageBox>
      <TransitionGroup>
        {
          messageList.map((item, index) => (
            <CSSTransition key={item.mid as any} timeout={300} classNames='message'>
              <BarrageWrapper key={index}>
                <span className="name">{item.name}：</span>
                <span className="content">{item.content}</span>
              </BarrageWrapper>
            </CSSTransition>
          ))
        }
      </TransitionGroup>
    </BarrageBox>
    <InputWrapper $isExpand={focus}>
      <EmojiPicker onSelect={(emoji: any) => {
        setInputValue(pre => pre + emoji.native);
      }} />
      <Input
        ref={inputRef}
        value={inputValue}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={(e) => setInputValue(e.target.value)}
        onPressEnter={submitMessage}
        placeholder="说点什么..." />
      <div className="expand-btn" onClick={() => setFocus(pre => !pre)}>
        {focus ? '收起' : '展开'}
      </div>
    </InputWrapper>
  </MeetingChatWrapper>
}

const MeetingChatWrapper = styled.div<{
  $offset?: { left?: number, bottom?: number }
}>`
  & {
    position: absolute;
    bottom: ${props => (props.$offset?.bottom || 0) + 12 + 'px'};
    left: ${props => (props.$offset?.left || 0) + 12 + 'px'};
  }
`
const BarrageWrapper = styled.div`
  & {
    padding: 8px 12px;
    background: rgba(0, 0, 0, .7);
    border-radius: 4px;
    font-size: 12px;
    color: #fff;
    width: fit-content;
    max-width: 250px;
    margin-bottom: 12px;
    transition: all .4s;
    word-break: break-all;

    .name {
      color: #dd9700;
    }
    .content {

    }
  }
`
const BarrageBox = styled.div`
  & {
    max-height: 50vh;
    overflow-y: scroll;
    .message {
      transition: all 300s;
    }
    .message-enter {
      transform: translateX(-100%);
      opacity: 0;
    }
    .message-enter-active {
      opacity: 0.5;
    }
    .message-exit {
      opacity: 0.5;
    }
    .message-exit-active {
      opacity: 0;
    }
  }
`
const InputWrapper = styled.div<{
  $isExpand?: boolean
}>`
  & {
    display: flex;
    width: fit-content;
    height: 35px;
    border-radius: 4px;
    background: #666;
    position: relative;
    padding-left: 35px;
    .ant-input {
      transition: all .4s;
      color: #fff;
      border: none;
      width: ${props => (props.$isExpand ? '300px' : '100px')};
      background-color: transparent;
      &::placeholder {
        color: #999
      }
    }
    .ant-input-outlined:focus {
      border: none;
    }
    .expand-btn {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      font-size: 12px;
      color: #fff;
    }
  }
`