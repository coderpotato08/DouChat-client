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
import { LoadGroupMsgListParamsType, UserMsgListParamsType } from "../../../constant/api-types";
import { ApiHelper } from "../../../helper/api-helper";
import { createUidV4 } from "../../../helper/uuid-helper"
import { useSocket } from "../../../store/context/createContext";
import { MessageTypeEnum } from "@constant/user-types";
import { useParams } from "react-router-dom";
import { addMessage, cacheMessageList, messageListSelector, pushMessageList } from "@store/messageReducer";
import { getQuery, getReceiverAndSender } from "@helper/common-helper";
import dayjs from "dayjs";

const ChatContainer:FC = () => {
  const socket = useSocket();
  const { id } = useParams();
  const { type } = getQuery();
  const isGroup = type === "group";
  const dispatch = useAppDispatch();
  const scrollRef: any = useRef(null);
  const userInfo = useAppSelector(userSelector);
  const messageList = useAppSelector(messageListSelector);
  const [receiveMessage, setReceiveMessage] = useState(null);
  const [selectedChat, setSelectedChat] = useState<any>();

  useEffect(() => {
    if (isGroup) {
      ApiHelper.loadGroupContact({
        userId: userInfo._id,
        groupId: id!, 
      })
        .then((res) => {
          setSelectedChat(res);
        })
    } else {
      ApiHelper.loadUserContact({ contactId: id! })
        .then((res) => {
          setSelectedChat(res);
        })
    }
  }, [id])

  const handleSocketEvent = (type: "on" | "off", isGroup: boolean) => {
    socket[type](EventType.RECEIVE_MESSAGE, onReceiveMessage);
    socket[type](EventType.RECEIVE_GROUP_MESSAGE, onReceiveMessage);
  }

  useEffect(() => {
    handleSocketEvent("on", isGroup);
    if (!isEmpty(selectedChat)) {
      if(isGroup) {
        loadGroupMessageList(selectedChat.groupId);
      } else {
        const { users } = selectedChat || {};
        loadMessageList(users[0], users[1]);
      } 
    }
    return () => {
      handleSocketEvent("off", isGroup);
      id && dispatch(cacheMessageList({contactId: id}));
    }
  }, [selectedChat]);

  useEffect(() => {
    if (!receiveMessage) return;
    const { 
      groupId,
      fromId = {},
      toId = {}
    } = receiveMessage as any;
    const contactId = isGroup ? groupId : [toId._id, fromId._id].join("_");
    if(contactId === id) {
      dispatch(addMessage({ message: receiveMessage }))
      socket.emit(isGroup ? EventType.READ_GROUP_MESSAGE : EventType.READ_MESSAGE, {
        fromId: fromId._id,
        toId: toId._id
      });
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
    };
    ApiHelper.loadUserMsgList(params)
      .then((res: any) => {
        dispatch(pushMessageList({messageList: res}));
      })
  }

  const loadGroupMessageList = (groupId: string) => {
    const params: LoadGroupMsgListParamsType = {
      groupId: id!,
    };
    ApiHelper.loadGroupMsgList(params)
      .then((res: any) => {
        dispatch(pushMessageList({messageList: res}));
      })
  }
  
  const onSubmitMessage = (value: string) => {
    const { users = [] } = selectedChat || {};
    const { receiver } = getReceiverAndSender(users, userInfo._id);
    const params: any = {
      fromId: userInfo._id,
      msgType: MessageTypeEnum.TEXT,
      msgContent: value,
      time: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    const message: any = {
      ...params,
      uid: createUidV4(),
      fromId: userInfo,
    }
    if (isGroup) {
      params['groupId'] = id;
      message['groupId'] = id;
    } else {
      params['toId'] = receiver._id;
      message['toId'] = receiver;
    }
    socket.emit(isGroup ? EventType.SEND_GROUP_MESSAGE : EventType.SEND_MESSAGE, params);
    dispatch(addMessage({ message }))
  }

  const onReceiveMessage = (msgData: any) => {
    setReceiveMessage({
      ...msgData,
      uid: createUidV4(),
    })
  }

  const { users, groupInfo = {} } = selectedChat || {};
  const { usersAvaterList = [], groupName } = groupInfo;
  const { receiver = {}, sender = {} } = getReceiverAndSender(users, userInfo._id);
  const headerInfo = sender._id === userInfo._id ? receiver : sender
  return <ChatContainerWrapper>
    {/* 头部 */}
    <ContainerHeader>
      <div className="header-user-info">
        <ChatAvatar 
          isGroup={isGroup} 
          groupImgList={usersAvaterList}
          imgUrl={headerInfo.avatarImage}/>
        <span>{isGroup ? groupName : headerInfo.nickname}</span>
      </div>
    </ContainerHeader>
    {/* 消息部分 */}
    <ContainerContent ref={scrollRef}>
      <Flex vertical>
        {
          !isEmpty(messageList) && messageList.map((info: any, index) => {
            const { fromId: sender } = info;
            const isSelf = sender._id === userInfo._id;
            const prevTime = index > 0 ? messageList[index-1].time : null;
            return <MessageBox key={info.uid || info._id}
                               isGroup={isGroup}
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