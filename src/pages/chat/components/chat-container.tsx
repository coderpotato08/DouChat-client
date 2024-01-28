import styled from "styled-components";
import ChatAvatar from "../../../components/chat-avatar";
import { Flex } from "antd";
import MessageBox from "./message-box";
import { useState, useEffect, useRef, FC } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { userSelector } from "../../../store";
import ChatInput from "./chat-input";
import { EventType } from "../../../constant/socket-types";
import { isEmpty } from "lodash";
import { UserMsgListParamsType } from "../../../constant/api-types";
import { ApiHelper } from "../../../helper/api-helper";
import { createUidV4 } from "../../../helper/uuid-helper"
import { useSocket } from "../../../store/context/createContext";
import { ContactInfoType } from "@constant/user-types";
import { useParams } from "react-router-dom";
import { addMessage, cacheMessageList, messageListSelector, pushMessageList } from "@store/messageReducer";
import { getReceiverAndSender } from "@helper/common-helper";
import dayjs from "dayjs";

const ChatContainer:FC = () => {
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const scrollRef: any = useRef(null);
  const userInfo = useAppSelector(userSelector);
  const messageList = useAppSelector(messageListSelector);
  const { id } = useParams();
  const [receiveMessage, setReceiveMessage] = useState(null);
  // const [messageList, setMessageList] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<ContactInfoType>();

  useEffect(() => {
    ApiHelper.loadUserContact({ contactId: id! })
      .then((res) => {
        setSelectedChat(res);
      })
  }, [id])

  useEffect(() => {
    socket.on(EventType.RECEIVE_MESSAGE, onReceiveMessage);
    if (!isEmpty(selectedChat)) {
      const { users } = selectedChat || {};
      loadMessageList(users[0], users[1]);
    }
    return () => {
      socket.off(EventType.RECEIVE_MESSAGE, onReceiveMessage);
      id && dispatch(cacheMessageList({contactId: id}));
    }
  }, [selectedChat]);

  useEffect(() => {
    if (receiveMessage) {
      const { fromId, toId }: { fromId: any, toId: any } = receiveMessage;
      const contactId = [fromId._id, toId._id].sort().join("_");
      if(contactId === id) {
        dispatch(addMessage({ message: receiveMessage }))
        socket.emit(EventType.READ_MESSAGE, {
          fromId: fromId._id,
          toId: toId._id
        });
      }
    }
  }, [receiveMessage]);

  useEffect(() => {
    const len = messageList.length;
    const id = messageList[len-1] ? (messageList[len-1]._id || messageList[len-1].uid) : ""
    const ele = document.getElementById(id);
    if(ele) {
      ele.scrollIntoView({
        block: "end",
        inline: "nearest", 
        behavior: "smooth",
      })
    }
  }, [messageList])

  const loadMessageList = (from: any, to: any) => {
    const params:UserMsgListParamsType = {
      fromId: from._id,
      toId: to._id,
    }
    ApiHelper.loadUserMsgList(params)
      .then((res: any) => {
        dispatch(pushMessageList({messageList: res.messageList}));
      })
  }
  
  const onSubmitMessage = (value: string) => {
    const { users } = selectedChat || {};
    const { receiver } = getReceiverAndSender(users, userInfo._id)
    const params = {
      fromId: userInfo._id,
      toId: receiver._id,
      msgType: 0,
      msgContent: value,
      time: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    socket!.emit(EventType.SEND_MESSAGE, params);
    const message = {
      ...params,
      uid: createUidV4(),
      fromId: userInfo,
      toId: receiver,
    }
    dispatch(addMessage({ message }))
  }

  const onReceiveMessage = (msgData: any) => {
    setReceiveMessage({
      ...msgData,
      uid: createUidV4(),
    })
  }

  const { users } = selectedChat || {};
  const { receiver = {}, sender = {} } = getReceiverAndSender(users, userInfo._id);
  const headerInfo = sender._id === userInfo._id ? receiver : sender
  return <ChatContainerWrapper>
    {/* 头部 */}
    <ContainerHeader>
      <div className="header-user-info">
        <ChatAvatar isGroup={false} imgUrl={headerInfo.avatarImage}/>
        <span>{headerInfo.nickname}</span>
      </div>
    </ContainerHeader>
    {/* 消息部分 */}
    <ContainerContent ref={scrollRef}>
      <Flex vertical gap={10}>
        {
          !isEmpty(messageList) && messageList.map((info: any, index) => {
            const { fromId: sender } = info;
            const isSelf = sender._id === userInfo._id;
            const prevTime = index > 0 ? messageList[index-1].time : null;
            return <MessageBox key={info.uid || info._id}
                               prevTime={prevTime}
                               messageInfo={info} 
                               isSelf={isSelf}/>
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