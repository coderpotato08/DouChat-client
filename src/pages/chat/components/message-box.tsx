import { Avatar, Flex } from "antd"
import React, { useMemo, CSSProperties, FC } from "react";
import styled from "styled-components"

interface MessageBoxProps {
  messageInfo: any,
  isSelf: boolean,
}
const lineStyle: CSSProperties = {width: "100%"}
const MessageBox:FC<MessageBoxProps> = (props: MessageBoxProps) => {
  const { isSelf, messageInfo } = props;
  const { fromId: sender } = messageInfo;
  const boxStyle: CSSProperties = useMemo(() => ({
    background: isSelf ? "#1677ff" : "#fff",
    color: isSelf ? "#fff" : "#000",
    marginLeft: isSelf ? "64px" : "0",
    marginRight: isSelf ? "0" : "64px",
  }), [isSelf]);
 
  return <Wrapper>
    <Flex style={lineStyle} justify={isSelf ? "flex-end" : "flex-start"} gap={15}>
      {!isSelf && <Avatar src={sender.avatarImage} size={48}/>}
      <MessageBoxWrapper style={boxStyle} theme={{isSelf}}>
        <div dangerouslySetInnerHTML={{ __html: messageInfo.msgContent }} />  
      </MessageBoxWrapper>
      {isSelf && <Avatar src={sender.avatarImage} size={48}/>}
    </Flex>
  </Wrapper>
}

export default React.memo(MessageBox)

const Wrapper = styled.div`
  & {
    .ant-avatar {
      flex-shrink: 0;
    }
  }
`
const MessageBoxWrapper = styled.div<any>`
  & {
    position: relative;
    max-width: 83%;
    padding: 12px;
    font-size: 16px;
    line-height: 18px;
    border-radius: 4px;
    word-break: break-all;
    color: ${prop => prop.theme.isSelf ? "#fff" : "#000"};
  }
  &::after {
    content: '';
    position: absolute;
    top: 15px;
    left: ${prop => prop.theme.isSelf ? "unset" : "-20px"};
    right: ${prop => prop.theme.isSelf ? "-20px" : "unset"};
    border-width: 8px 10px 8px 10px;
    border-style: solid;
    border-color: ${prop => prop.theme.isSelf ? "transparent transparent transparent #1677ff" : "transparent #fff transparent transparent"};
  }
`
