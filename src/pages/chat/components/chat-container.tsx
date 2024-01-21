import styled from "styled-components";
import ChatAvatar from "../../../components/chat-avatar";
import { Flex } from "antd";
import MessageBox from "./message-box";
import { useState, useEffect, useRef, FC } from "react";
import { useAppSelector } from "../../../store/hooks";
import { userSelector } from "../../../store";
import ChatInput from "./chat-input";
import { EventType } from "../../../constant/socket-const";
import { isEmpty } from "lodash";
import { UserMsgListParamsType } from "../../../constant/api-const";
import { ApiHelper } from "../../../helper/api-helper";
import { createUidV4 } from "../../../helper/uuid-helper"
import { useSocket } from "../../../store/context/createContext";

interface ChatContainerProps {
  selectedChat: any
}

const ChatContainer:FC<ChatContainerProps> = (props: ChatContainerProps) => {
  const { selectedChat } = props;
  const socket = useSocket();
  const scrollRef: any = useRef(null);
  const userInfo = useAppSelector(userSelector);
  const [receiveMessage, setReceiveMessage] = useState(null);
  const [messageList, setMessageList] = useState<any[]>([]);
  
  useEffect(() => {
    socket.on(EventType.RECEIVE_MESSAGE, onReceiveMessage);
    if (!isEmpty(selectedChat)) {
      loadMessageList(selectedChat.sender, selectedChat.receiver);
    }
    return () => {
      socket.off(EventType.RECEIVE_MESSAGE, onReceiveMessage);
    }
  }, [selectedChat]);

  useEffect(() => {
    receiveMessage && setMessageList((prev) => [...prev, receiveMessage])
  }, [receiveMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      block: "end",
      behaviour: "smooth",
    })
  }, [messageList])

  const loadMessageList = (from: any, to: any) => {
    const params:UserMsgListParamsType = {
      fromId: from._id,
      toId: to._id,
    }
    ApiHelper.loadUserMsgList(params)
      .then((res: any) => {
        setMessageList(res.messageList || [])
      })
  }
  
  const onSubmitMessage = (value: string) => {
    const { receiver } = selectedChat;
    const params = {
      fromId: userInfo._id,
      toId: receiver._id,
      msgType: 0,
      msgContent: value,
      time: new Date(),
    };
    socket!.emit(EventType.SEND_MESSAGE, params);
    setMessageList([...messageList, {
      ...params,
      uid: createUidV4(),
      fromId: userInfo,
      toId: receiver,
    }])
  }

  const onReceiveMessage = (msgData: any) => {
    const { receiver } = selectedChat;
    setReceiveMessage({
      ...msgData,
      fromId: receiver,
      toId: userInfo,
      uid: createUidV4(),
    })
  }

  return <ChatContainerWrapper>
    {/* 头部 */}
    <ContainerHeader>
      <div className="header-user-info">
        <ChatAvatar isGroup={false}/>
        <span>群聊1</span>
      </div>
    </ContainerHeader>
    {/* 消息部分 */}
    <ContainerContent ref={scrollRef}>
      <Flex vertical gap={10}>
        {
          messageList.map((info: any) => {
            const { fromId: sender } = info;
            const isSelt = sender._id === userInfo._id;
            return <MessageBox key={info.uid || info._id}
                               messageInfo={info} 
                               isSelf={isSelt}/>
          })
        }
      </Flex>
    </ContainerContent>
    <ChatInput onSubmit={onSubmitMessage}/>
  </ChatContainerWrapper>
}
export default ChatContainer

const ChatContainerWrapper = styled.div`
  & {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    height: 100vh;
  }
`
const ContainerHeader = styled.div`
  & {
    flex-shrink: 0;
    background-color: #fff;
    box-shadow: inset;
    align-items: center;
    display: flex;
    width: 100%;
    height: 70px;
    box-shadow: 0 10px 10px -10px rgba(0, 0, 0, .2);
    .header-user-info {
      display: flex;
      align-items: center;
      padding: 12px;
      > span {
        margin-left: 12px;
      }
    }
  }
`
const ContainerContent = styled.div`
  & {
    box-sizing: border-box;
    overflow-y: scroll;
    width: 100%;
    height: calc(100vh - 70px - 68px);
    background: #F3F3F3;
    padding: 12px; 
  }
  &::-webkit-scrollbar {
    display: none;
  }
`