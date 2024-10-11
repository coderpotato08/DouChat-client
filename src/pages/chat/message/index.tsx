import { useCallback, useEffect, useMemo } from "react";
import { EventType } from "@constant/socket-types";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  addChat,
  addTotalUnreadNum,
  addUser,
  chatListSelector,
  deleteChat,
  recentSubmitMessageSelector,
  setChatList as setStoreChatList,
  subTotalUnreadNum,
  userSelector
} from "@store/index";
import { SocketProvider, useSocket } from "@store/context/createContext";
import ChatTitle from "../components/chat-title";
import ChatGroup from "./_compt/chat-group";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { createUidV4 } from "@helper/uuid-helper";
import { isEmpty } from "lodash";
import { DraggableLayout } from "@components/draggable-layout";

const Message = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(userSelector);
  const chatList = useAppSelector(chatListSelector)
  const recentSubmitMessage = useAppSelector(recentSubmitMessageSelector);
  const { id: selectedChatId } = useParams();

  const isGroup = useMemo(() => selectedChatId && selectedChatId.indexOf("_") === -1, [selectedChatId])

  const onReceiveMessage = useCallback((msgData: any) => {
    const { fromId, toId, groupId } = msgData;
    const isReceiveGroup = !isEmpty(groupId);
    const receiveContactId = isReceiveGroup ? groupId : [toId._id, fromId._id].join("_");
    if (receiveContactId !== selectedChatId) { // 非当前选中的聊天栏的消息，需要未读+1
      const index = chatList.findIndex((chat) => (chat.groupId || chat.contactId) === receiveContactId);
      const newChatList = chatList.map((chat: any) => {
        const newChat = { ...chat };
        const curContactId = isReceiveGroup ? chat.groupId : chat.contactId
        if (curContactId === receiveContactId) {
          newChat.recentMessage = { ...msgData, uid: createUidV4() }
          if (!isReceiveGroup) {
            newChat.unreadNum += 1;
            dispatch(addTotalUnreadNum());
          }
          return newChat
        }
        return chat;
      })
      const receiveMsgChat = newChatList.splice(index, 1)[0] // 将该聊天栏置为第一条
      newChatList.unshift(receiveMsgChat);
      dispatch(setStoreChatList(newChatList));
    }
  }, [selectedChatId, chatList])

  const onGroupMessageUnread = useCallback(({ groupId, messageId }: { groupId: string, messageId: string }) => {
    const newChatList = chatList.map((chat: any) => {
      const newChat = { ...chat }
      if (chat.groupId && chat.groupId === groupId) {
        if (selectedChatId === groupId) { // 将消息置为已读
          socket.emit(EventType.READ_GROUP_MESSAGE, { userId: userInfo._id, groupId, messageId })
        } else {
          newChat.unreadNum += 1;
          dispatch(addTotalUnreadNum());
        }
      }
      return newChat;
    })
    dispatch(setStoreChatList(newChatList))
  }, [selectedChatId, chatList])

  const onDeleteChat = (index: number) => {
    dispatch(deleteChat(index));
  }

  const onAddChat = (chat: any) => {
    dispatch(addChat(chat))
  }

  const onClickChat = (chatId: string) => {
    const item: any = chatList.find((i) => (i.groupId || i.contactId) === chatId);
    const { groupId, contactId, unreadNum } = item;
    let socketParams;
    if (groupId) {
      socket.emit(EventType.ADD_GROUOP_USER, { groupId, userId: userInfo._id });
      socketParams = { userId: userInfo._id, groupId };
    } else {
      const users = item.contactId.split("_");
      const fromId = users[0] === userInfo._id ? users[1] : users[0];
      const toId = users[0] !== userInfo._id ? users[1] : users[0];
      socketParams = { fromId, toId };
    }
    if (unreadNum > 0) {  // 消息已读
      socket.emit(groupId ? EventType.READ_GROUP_MESSAGE : EventType.READ_MESSAGE, socketParams);
    }
    dispatch(setStoreChatList(chatList.map((chat: any) => { // 本地处理消息已读
      const newChat = { ...chat }
      const { unreadNum } = chat;
      const itemId = item.groupId || item.contactId;
      const chatId = chat.groupId || chat.contactId;
      if (chatId === itemId && unreadNum > 0) {
        dispatch(subTotalUnreadNum({ num: unreadNum }));
        newChat.unreadNum = 0
      }
      return newChat
    })))
    navigate(`/chat/message/${groupId || contactId}?type=${groupId ? "group" : "user"}`)
  }

  useEffect(() => {
    socket.emit(EventType.ADD_USER, userInfo);
    dispatch(addUser({
      [userInfo.username]: userInfo
    }));
  }, []);

  useEffect(() => {
    socket.on(EventType.RECEIVE_GROUP_MESSAGE, onReceiveMessage);
    socket.on(EventType.RECEIVE_MESSAGE, onReceiveMessage);
    socket.on(EventType.GROUP_MESSAGE_UNREAD, onGroupMessageUnread);
    return () => {
      socket.off(EventType.RECEIVE_GROUP_MESSAGE, onReceiveMessage);
      socket.off(EventType.RECEIVE_MESSAGE, onReceiveMessage);
      socket.off(EventType.GROUP_MESSAGE_UNREAD, onGroupMessageUnread);
    }
  }, [onReceiveMessage, onGroupMessageUnread]);

  useEffect(() => {
    if (!isEmpty(recentSubmitMessage)) {
      dispatch(setStoreChatList(chatList.map((chat: any) => {
        const newChat = { ...chat }
        const contactId = isGroup ? chat.groupId : chat.contactId
        if (contactId === selectedChatId) {
          newChat.recentMessage = recentSubmitMessage
        }
        return newChat;
      })))
    }
  }, [recentSubmitMessage])

  return <SocketProvider>
    <DraggableLayout
      menuRender={<>
        <ChatTitle />
        <ChatGroup
          list={chatList}
          onChangeChat={onClickChat}
          onDeleteChat={onDeleteChat}
          onAddChat={onAddChat} />
      </>}
      contentRender={<Outlet />} />
  </SocketProvider>
}

export default Message;