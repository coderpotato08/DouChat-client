import { useCallback, useEffect, useState } from "react";
import styled from "styled-components"
import { EventType } from "@constant/socket-types";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { 
  addUser,
  recentSubmitMessageSelector,
  userSelector 
} from "@store/index";
import { UserContactsParamsType } from "../../constant/api-types";
import { ApiHelper } from "@helper/api-helper";
import { SocketProvider, useSocket } from "@store/context/createContext";
import ChatTitle from "./components/chat-title";
import ChatGroup from "./components/chat-group";
import { ContainerWrapper, GroupWrapper } from "@components/custom-styles";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { createUidV4 } from "@helper/uuid-helper";
import { cloneDeep, isEmpty } from "lodash";

const Message = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(userSelector);
  const recentSubmitMessage = useAppSelector(recentSubmitMessageSelector);
  const { id } = useParams();
  const [selectedChat, setSelectedChat] = useState<any>({});
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    socket.emit(EventType.ADD_USER, userInfo);
    dispatch(addUser({
      [userInfo.username]: userInfo
    }));
    loadUserChatList();
  }, []);

  useEffect(() => {
    socket.on(EventType.RECEIVE_MESSAGE, onReceiveMessage);
    return () => {
      socket.off(EventType.RECEIVE_MESSAGE, onReceiveMessage);
    }
  }, [selectedChat])

  useEffect(() => {
    if(!isEmpty(recentSubmitMessage)) {
      const newChatList = cloneDeep(chatList);
      newChatList.forEach((chat: any) => {
        if(chat.contactId === id) {
          chat.recentMessage = recentSubmitMessage
        }
      })
      setChatList(newChatList);
    }
  }, [recentSubmitMessage])

  const onReceiveMessage = (msgData: any) => {
    const { fromId, toId } = msgData;
    const receiveContactId = [fromId._id, toId._id].sort().join("_");
    if(receiveContactId !== selectedChat.contactId) {
      const newChatList = cloneDeep(chatList)
      newChatList.forEach((chat: any) => {
        if(chat.contactId === receiveContactId) {
          chat.recentMessage = {
            ...msgData,
            uid: createUidV4(),
          }
          chat.unreadNum += 1
        }
      })
      setChatList(newChatList);
    }
  }

  const onClickContact = (item: any) => {
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
    navigate(`/chat/message/${item.contactId}`)
  }

  const loadUserChatList = () => {
    const params:UserContactsParamsType = {
      userId: userInfo._id
    }
    ApiHelper.loadUserContactList(params)
      .then((res: any) => {
        const { contactList } = res;
        setChatList(contactList)
        if(id) {
          const selected = contactList.find((contact: any) => contact.contactId === id);
          setSelectedChat(selected || {})
        }
      })
  }

  return <SocketProvider>
    <Wrapper>
      <GroupWrapper>
        <ChatTitle/>
        <ChatGroup
          list={chatList}
          selectedId={selectedChat.contactId || ""}
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