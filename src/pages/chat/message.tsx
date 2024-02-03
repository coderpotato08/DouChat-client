import { useCallback, useEffect, useState } from "react";
import styled from "styled-components"
import { EventType } from "@constant/socket-types";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { 
  addUser,
  recentSubmitMessageSelector,
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
import { cloneDeep, isEmpty } from "lodash";
import dayjs from "dayjs";
import { getQuery } from "@helper/common-helper";

const Message = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(userSelector);
  const recentSubmitMessage = useAppSelector(recentSubmitMessageSelector);
  const { id } = useParams();
  const { type } = getQuery();
  const isGroup = type === "group";
  const [selectedChat, setSelectedChat] = useState<any>({});
  const [chatList, setChatList] = useState<any[]>([]);

  const onReceiveMessage = useCallback((msgData: any) => {
    const { fromId, toId, groupId } = msgData;
    const isReceiveGroup = !isEmpty(groupId);
    const receiveContactId = isReceiveGroup ? groupId : [toId._id, fromId._id].join("_");
    const selectedChatId = isGroup ? selectedChat.groupId : selectedChat.contactId;
    console.log(receiveContactId, selectedChatId);
    if(receiveContactId !== selectedChatId) {
      const newChatList = cloneDeep(chatList);
      newChatList.forEach((chat: any) => {
        const curContactId = isReceiveGroup ? chat.groupId : chat.contactId
        if(curContactId === receiveContactId) {
          chat.recentMessage = {
            ...msgData,
            uid: createUidV4(),
          }
          chat.unreadNum += 1
        }
      })
      setChatList(newChatList);
    }
  }, [selectedChat, chatList])

  const onClickContact = (item: any) => {
    const { groupId } = item;
    if (groupId) {
      socket.emit(EventType.ADD_GROUOP_USER, {groupId, userId: userInfo._id})
      setSelectedChat(item);
      navigate(`/chat/message/${groupId}?type=group`)
    } else {
      const users = item.contactId.split("_");
      const fromId = users[0] === userInfo._id ? users[1] : users[0];
      const toId = users[0] !== userInfo._id ? users[1] : users[0];
      socket.emit(EventType.READ_MESSAGE, {
        fromId,
        toId,
      });
      const newChatList = cloneDeep(chatList);
      newChatList.forEach((chat: any) => {
        if(chat.contactId === item.contactId) {
          chat.unreadNum = 0
        }
      });
      setChatList(newChatList)
      setSelectedChat(item);
      navigate(`/chat/message/${item.contactId}?type=user`)
    }
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

  useEffect(() => {
    socket.emit(EventType.ADD_USER, userInfo);
    dispatch(addUser({
      [userInfo.username]: userInfo
    }));
    Promise.all([
      loadUserChatList(),
      loadGroupChatList(),
    ]).then((res) => {
      const [userChatList, groupChatList] = res;
      const chatList = [...userChatList, ...groupChatList]
        .sort((a, b) => dayjs(b.createTime).diff(dayjs(a.createTime)))
      // console.log(chatList)
      setChatList(chatList);
      if(id) {
        const selected = chatList.find((chat: any) => (chat.contactId || chat.groupId) === id);
        setSelectedChat(selected || {})
      }
    })
  }, []);

  useEffect(() => {
    socket.on(EventType.RECEIVE_MESSAGE, onReceiveMessage);
    return () => {
      socket.off(EventType.RECEIVE_MESSAGE, onReceiveMessage);
    }
  }, [onReceiveMessage])

  useEffect(() => {
    if(!isEmpty(recentSubmitMessage)) {
      const newChatList = cloneDeep(chatList);
      newChatList.forEach((chat: any) => {
        const contactId = isGroup ? chat.groupId : chat.contactId
        if(contactId === id) {
          chat.recentMessage = recentSubmitMessage
        }
      })
      setChatList(newChatList);
    }
  }, [recentSubmitMessage])

  return <SocketProvider>
    <Wrapper>
      <GroupWrapper>
        <ChatTitle/>
        <ChatGroup
          list={chatList}
          selectedId={selectedChat.contactId || selectedChat.groupId || ""}
          onChangeChat={onClickContact}/>
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