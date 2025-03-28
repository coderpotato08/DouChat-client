import styled from "styled-components";
import ChatAvatar from "@components/chat-avatar";
import { Flex } from "antd";
import MessageBox from "../message/_compt/message-box";
import { useEffect, useRef, FC, useCallback, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { messageListSelector, selectedChatSelector, setSelectedChat, userSelector } from "@store/index";
import ChatInput from "../message/_compt/chat-input";
import { EventType } from "@constant/socket-types";
import { isEmpty } from "lodash";
import { LoadGroupMsgListParamsType } from "@constant/api-types";
import { ApiHelper } from "@helper/api-helper";
import { createUidV4 } from "@helper/uuid-helper"
import { useSocket } from "@store/context/createContext";
import { MessageInfoType } from "@constant/user-types";
import { useParams } from "react-router-dom";
import {
  addMessage,
  addTipMessage,
  cacheMessageList,
  pushMessageList
} from "@store/index";
import { getReceiverAndSender } from "@helper/common-helper";
import dayjs from "dayjs";

const ChatContainer: FC = () => {
  const socket = useSocket();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const scrollRef: any = useRef(null);
  const selectedChat = useAppSelector(selectedChatSelector);
  const userInfo = useAppSelector(userSelector);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const messageList = useAppSelector(messageListSelector);
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const isGroup = useMemo(() => id!.indexOf("_") === -1, [id]);

  const handleSocketEvent = (type: "on" | "off") => {
    socket[type](EventType.NEW_GROUP_USER_JOIN, onReceiveTipMessage);
    socket[type](EventType.GROUP_USER_QUIT, onReceiveTipMessage)
    socket[type](EventType.RECEIVE_MESSAGE, onReceiveMessage);
    socket[type](EventType.RECEIVE_GROUP_MESSAGE, onReceiveMessage);
  }

  const loadUserMessageList = (msgPageIndex: number) => {
    const { users = [] } = selectedChat || {};
    const [from, to] = users;
    if (!from || !to) return;
    const params = {
      pageIndex: msgPageIndex,
      fromId: from._id,
      toId: to._id,
      limitTime: selectedChat.createTime
    };
    setIsLoading(true);
    ApiHelper.loadUserMsgList(params)
      .then((res: any) => {
        setIsLoading(false);
        setPageIndex(preIndex => preIndex + 1);
        setHasMore(res.length >= 20)
        dispatch(pushMessageList({ messageList: res.reverse() }));
      })
  }

  const loadGroupMessageList = (msgPageIndex: number) => {
    if (!selectedChat.groupId) return;
    const params: LoadGroupMsgListParamsType = {
      pageIndex: msgPageIndex,
      groupId: id!,
      limitTime: selectedChat.createTime
    };
    setIsLoading(true);
    ApiHelper.loadGroupMsgList(params)
      .then((res: any[]) => {
        setIsLoading(false);
        setPageIndex(preIndex => preIndex + 1);
        setHasMore(res.length >= 20)
        dispatch(pushMessageList({ messageList: res.reverse() }));
      })
  }

  const onReceiveTipMessage = useCallback((message: any) => {
    const { groupId } = message;
    if (isGroup && id === groupId) {
      dispatch(addTipMessage({ message }))
    }
  }, [isGroup])

  const onSubmitMessage = (messages: Array<MessageInfoType> | MessageInfoType) => {
    const { users = [] } = selectedChat || {};
    const { receiver } = getReceiverAndSender(users, userInfo._id);
    const curTime = new Date();
    const baseParams: any = {
      fromId: userInfo._id,
    }
    const message: any = {
      ...baseParams,
      uid: createUidV4(),
      fromId: userInfo,
    }
    if (isGroup) {
      baseParams['groupId'] = id;
      message['groupId'] = id;
    } else {
      baseParams['toId'] = receiver._id;
      message['toId'] = receiver;
    }
    if (Array.isArray(messages)) {
      messages.forEach(({ value, type }) => {
        const messageInfo = {
          msgType: type,
          msgContent: value,
          time: curTime,
        };
        socket.emit(isGroup ? EventType.SEND_GROUP_MESSAGE : EventType.SEND_MESSAGE, {
          ...baseParams,
          ...messageInfo,
        });
        dispatch(addMessage({
          message: {
            ...message,
            ...messageInfo,
            time: dayjs(curTime).format('YYYY-MM-DD HH:mm:ss')
          }
        }))
      })
    } else {
      const messageInfo = {
        msgType: messages.type,
        msgContent: messages.value,
        time: curTime,
      };
      socket.emit(isGroup ? EventType.SEND_GROUP_MESSAGE : EventType.SEND_MESSAGE, {
        ...baseParams,
        ...messageInfo,
      });
      dispatch(addMessage({
        message: {
          ...message,
          ...messageInfo,
          time: dayjs(curTime).format('YYYY-MM-DD HH:mm:ss')
        }
      }))
    }
  }

  const onReceiveMessage = useCallback((msgData: any) => {
    const receiveMessage = { ...msgData, uid: createUidV4() }
    const {
      groupId,
      fromId = {},
      toId = {}
    } = receiveMessage as any;
    const contactId = isGroup ? groupId : [toId._id, fromId._id].join("_");
    if (contactId === id) {
      dispatch(addMessage({ message: receiveMessage }))
      socket.emit(isGroup ? EventType.READ_GROUP_MESSAGE : EventType.READ_MESSAGE, {
        fromId: fromId._id,
        toId: toId._id
      });
    }
  }, [isGroup])

  const onScroll = () => {
    if (scrollRef.current.scrollTop <= 0 && !isLoading && hasMore) {
      console.log("加载更多")
      if (isGroup) {
        loadGroupMessageList(pageIndex);
      } else {
        loadUserMessageList(pageIndex);
      }
    }
  }

  useEffect(() => {
    if (!id) return;
    if (isGroup) {
      ApiHelper.loadGroupContact({
        userId: userInfo._id,
        groupId: id,
      })
        .then(async (res) => {
          dispatch(setSelectedChat(res))
        })
    } else {
      ApiHelper.loadUserContact({ contactId: id })
        .then((res) => {
          dispatch(setSelectedChat(res))
        })
    }
  }, [id])

  useEffect(() => {
    if (!isEmpty(selectedChat)) {
      setPageIndex(0);
      if (isGroup) {
        loadGroupMessageList(0);
      } else {
        loadUserMessageList(0);
      }
    }
    handleSocketEvent("on");
    return () => {
      handleSocketEvent("off");
      dispatch(cacheMessageList({ contactId: id || "" }));
    }
  }, [selectedChat]);

  useEffect(() => {
    const len = messageList.length;
    const id = messageList[len - 1] ? (messageList[len - 1]._id || messageList[len - 1].uid) : ""
    const ele = document.getElementById(id);
    if (ele) {
      ele.scrollIntoView({
        block: "end",
        inline: "nearest",
        behavior: "smooth",
      })
    }
  }, [messageList])

  const { users, groupInfo = {} } = selectedChat || {};
  const { usersAvaterList = [], groupName } = groupInfo;
  const { receiver = {}, sender = {} } = getReceiverAndSender(users, userInfo._id);
  const headerInfo = sender._id === userInfo._id ? receiver : sender;
  return <ChatContainerWrapper>
    {/* 头部 */}
    <ContainerHeader>
      <div className="header-user-info">
        <ChatAvatar
          isGroup={isGroup}
          groupImgList={usersAvaterList}
          imgUrl={headerInfo.avatarImage} />
        <span>{isGroup ? groupName : headerInfo.nickname}</span>
      </div>
    </ContainerHeader>
    {/* 消息部分 */}
    <ContainerContent ref={scrollRef} onScroll={onScroll}>
      <Flex vertical>
        {
          !isEmpty(messageList) && messageList.length > 0 &&
          messageList.map((info: any, index) => {
            const { fromId: sender = {} } = info;
            const isSelf = sender._id === userInfo._id;
            const prevTime = index > 0 ? messageList[index - 1].time : null;
            return <MessageBox key={info.uid || info._id}
              isGroup={isGroup}
              prevTime={prevTime}
              messageInfo={info}
              isSelf={isSelf} />
          })
        }
      </Flex>
    </ContainerContent>
    <ChatInput onSubmit={onSubmitMessage} />
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