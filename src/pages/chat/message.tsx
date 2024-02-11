import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components"
import { EventType } from "@constant/socket-types";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { 
  addTotalUnreadNum,
  addUser,
  recentSubmitMessageSelector,
  setSelectedId,
  subTotalUnreadNum,
  userSelector 
} from "@store/index";
import { LoadGroupContactListParamsType, UserContactsParamsType } from "../../constant/api-types";
import { ApiHelper } from "@helper/api-helper";
import { SocketProvider, useSocket } from "@store/context/createContext";
import ChatTitle from "./components/chat-title";
import ChatGroup from "./components/chat-group";
import { ContainerWrapper, GroupWrapper } from "@components/custom-styles";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { createUidV4 } from "@helper/uuid-helper";
import { isEmpty } from "lodash";
import dayjs from "dayjs";

const Message = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(userSelector);
  const recentSubmitMessage = useAppSelector(recentSubmitMessageSelector);
  const { id: selectedChatId } = useParams();
  const [chatList, setChatList] = useState<any[]>([]);

  const isGroup = useMemo(() => selectedChatId && selectedChatId.indexOf("_") === -1, [selectedChatId])

  const onReceiveMessage = useCallback((msgData: any) => {
    const { fromId, toId, groupId } = msgData;
    const isReceiveGroup = !isEmpty(groupId);
    const receiveContactId = isReceiveGroup ? groupId : [toId._id, fromId._id].join("_");
    if(receiveContactId !== selectedChatId) { // 非当前选中的聊天栏的消息，需要未读+1
      setChatList(preChatList => preChatList.map((chat: any) => {
        const curContactId = isReceiveGroup ? chat.groupId : chat.contactId
        if(curContactId === receiveContactId) {
          chat.recentMessage = {
            ...msgData,
            uid: createUidV4(),
          }
          if(!isReceiveGroup) {
            chat.unreadNum += 1;
            dispatch(addTotalUnreadNum());
          }
        }
        return chat;
      }));
    }
  }, [selectedChatId, chatList])

  const onGroupMessageUnread = useCallback(({groupId, messageId}: {groupId: string, messageId: string}) => {
    setChatList(preChatList => preChatList.map((chat: any) => {
      if(chat.groupId && chat.groupId === groupId) {
        if (selectedChatId === groupId) { // 将消息置为已读
          socket.emit(EventType.READ_GROUP_MESSAGE, {userId: userInfo._id, groupId, messageId})
        } else {
          chat.unreadNum += 1;
          dispatch(addTotalUnreadNum());
        }
      }
      return chat;
    }))
  }, [selectedChatId, chatList])

  const onClickContact = (chatId: string) => {
    const item: any = chatList.find((i) => (i.groupId || i.contactId) === chatId);
    const { groupId, contactId, unreadNum } = item;
    let socketParams;
    if (groupId) {
      socket.emit(EventType.ADD_GROUOP_USER, {groupId, userId: userInfo._id});
      socketParams = {userId: userInfo._id, groupId};
    } else {
      const users = item.contactId.split("_");
      const fromId = users[0] === userInfo._id ? users[1] : users[0];
      const toId = users[0] !== userInfo._id ? users[1] : users[0];
      socketParams = { fromId, toId };
    }
    if (unreadNum > 0) {  // 消息已读
      socket.emit(groupId ? EventType.READ_GROUP_MESSAGE : EventType.READ_MESSAGE, socketParams);
    }
    setChatList(preChatList => preChatList.map((chat: any) => { // 本地处理消息已读
      const { unreadNum } = chat;
      const itemId = item.groupId || item.contactId;
      const chatId = chat.groupId || chat.contactId;
      if(chatId === itemId && unreadNum > 0) {
        dispatch(subTotalUnreadNum({num: unreadNum}));
        chat.unreadNum = 0
      }
      return chat
    }))
    dispatch(setSelectedId({
      selectedId: groupId || contactId,
      isGroup: !!groupId,
    }))
    navigate(`/chat/message/${groupId || contactId}?type=${groupId ? "group" : "user"}`)
  }

  const loadUserChatList = async () => {
    const params: UserContactsParamsType = {
      userId: userInfo._id
    }
    const contactList = await ApiHelper.loadUserContactList(params)
    return contactList
  }

  const loadGroupChatList = async () => {
    const params: LoadGroupContactListParamsType = {
      userId: userInfo._id
    }
    const groupContactList = await ApiHelper.loadGroupContactList(params);
    return groupContactList;
  }

  const loadAllContactList = async () => {
    const [userChatList, groupChatList] = await Promise.all([
      loadUserChatList(),
      loadGroupChatList(),
    ])
    const chatList = [...userChatList, ...groupChatList]
      .sort((a, b) => dayjs(b.createTime).diff(dayjs(a.createTime)))
    setChatList(chatList);
    if(selectedChatId) {
      const selected: any = chatList.find((chat: any) => (chat.contactId || chat.groupId) === selectedChatId);
      !isEmpty(selected) && dispatch(setSelectedId({
        selectedId: selected.groupId || selected.contactId,
        isGroup: !!selected.groupId,
      }))
    }
  }

  useEffect(() => {
    socket.emit(EventType.ADD_USER, userInfo);
    dispatch(addUser({
      [userInfo.username]: userInfo
    }));
    loadAllContactList()
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
    if(!isEmpty(recentSubmitMessage)) {
      setChatList(preChatList => preChatList.map((chat: any) => {
        const contactId = isGroup ? chat.groupId : chat.contactId
        if(contactId === selectedChatId) {
          chat.recentMessage = recentSubmitMessage
        }
        return chat;
      }));
    }
  }, [recentSubmitMessage])

  return <SocketProvider>
    <Wrapper>
      <GroupWrapper>
        <ChatTitle/>
        <ChatGroup
          list={chatList}
          onChangeChat={onClickContact}
          refreshChatList={loadAllContactList}/>
      </GroupWrapper>
      <ContainerWrapper>
        <Outlet/>
      </ContainerWrapper>
    </Wrapper>
  </SocketProvider>
}

export default Message;

const Wrapper = styled.div`
  & {
    display: flex;
    width: 100%;
    height: 100vh;
  }
`