import { MessageTypeEnum } from "@constant/user-types";
import { formatMessageTime } from "@helper/common-helper";
import { Avatar, Flex } from "antd"
import dayjs from "dayjs";
import React, { useMemo, CSSProperties, FC } from "react";
import styled from "styled-components"

interface MessageBoxProps {
  isGroup: boolean,
  prevTime: string
  messageInfo: any,
  isSelf: boolean,
}

const formatTime = (prevTime: string | null, curTime: string) => {
  const preDate = dayjs(prevTime), curDate = dayjs(curTime);
  if(curDate.diff(preDate, "minute") < 5) return "";
  return formatMessageTime(curTime)
}

const lineStyle: CSSProperties = {width: "100%"}
const MessageBox:FC<MessageBoxProps> = (props: MessageBoxProps) => {
  const { 
    isSelf, 
    isGroup,
    messageInfo 
  } = props;
  const { fromId: sender } = messageInfo;

  const boxStyle: CSSProperties = useMemo(() => ({
    background: isSelf ? "#1677ff" : "#fff",
    color: isSelf ? "#fff" : "#000",
    marginLeft: isSelf ? "auto" : "0",
    marginRight: 0,
  }), [isSelf]);
  
  const showTime = formatTime(props.prevTime, messageInfo.time);
  return messageInfo.msgType !== MessageTypeEnum.TIPS ? 
    <Wrapper id={messageInfo._id || messageInfo.uid}>
      {showTime && <div className="time">{showTime}</div>}
      <Flex style={lineStyle} justify={isSelf ? "flex-end" : "flex-start"} gap={15}>
        {!isSelf && <Avatar src={sender.avatarImage} size={48}/>}
        <div>
          {isGroup && <div className={"nickname"}
                          style={{marginLeft: isSelf ? "auto" : 0}}>
            {sender.nickname}
          </div>}
          <MessageBoxWrapper style={boxStyle} theme={{isSelf}}>
            <div style={{width: "fit-content"}} dangerouslySetInnerHTML={{ __html: messageInfo.msgContent }} />  
          </MessageBoxWrapper>
        </div>
        {isSelf && <Avatar src={sender.avatarImage} size={48}/>}
      </Flex>
    </Wrapper> : 
    <TipMessage key={messageInfo.uid || messageInfo._id}>
      {showTime && <div className="time">{showTime}</div>}
      <div className="tip">{messageInfo.msgContent}</div>
    </TipMessage>
}

export default React.memo(MessageBox)

const Wrapper = styled.div`
  & {
    padding-bottom: 14px;
    .time {
      width: 100%;
      font-size: 12px;
      text-align: center;
      color: #666;
      margin-bottom: 8px;
    }
    .nickname {
      width: fit-content;
      font-size: 12px;
    }
    .ant-avatar {
      flex-shrink: 0;
    }
  }
`
const MessageBoxWrapper = styled.div<any>`
  & {
    box-sizing: border-box;
    margin-top: 4px;
    position: relative;
    max-width: 55vw;
    padding: 12px;
    font-size: 16px;
    min-height: 42px;
    border-radius: 4px;
    word-break: break-all;
    color: ${prop => prop.theme.isSelf ? "#fff" : "#000"};
  }
  &::after {
    content: '';
    position: absolute;
    top: 11px;
    left: ${prop => prop.theme.isSelf ? "unset" : "-20px"};
    right: ${prop => prop.theme.isSelf ? "-20px" : "unset"};
    border-width: 8px 10px 8px 10px;
    border-style: solid;
    border-color: ${prop => prop.theme.isSelf ? "transparent transparent transparent #1677ff" : "transparent #fff transparent transparent"};
  }
`
const TipMessage = styled.div`
  & {
    width: 100%;
    font-size: 12px;
    color: #666;
    text-align: center;
    .tip {
      width: 100%;
      margin: 8px 0;
    }
  }
`
