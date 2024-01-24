import { useEffect, useState } from "react";
import styled from "styled-components"
import { EventType } from "../../constant/socket-const";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { userSelector } from "../../store";
import { addUser } from "../../store/userReducer";
import { UserContactsParamsType } from "../../constant/api-const";
import { ApiHelper } from "../../helper/api-helper";
import { SocketProvider, useSocket } from "../../store/context/createContext";
import ChatTitle from "./components/chat-title";
import ChatGroup from "./components/chat-group";
import ChatContainer from "./components/chat-container";
import { ContainerWrapper, GroupWrapper } from "@components/custom-styles";

const Message = () => {
  const socket = useSocket();
  
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(userSelector);
  const [selectedChat, setSelectedChat] = useState<any>({});
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    socket.emit(EventType.ADD_USER, userInfo);
    dispatch(addUser({
      [userInfo.username]: userInfo
    }));
    loadUserChatList();
  }, []);

  const loadUserChatList = () => {
    const params:UserContactsParamsType = {
      userId: userInfo._id
    }
    ApiHelper.loadUserContacts(params)
      .then((res: any) => {
        const { contactList } = res;
        setChatList(contactList)
      })
  }
  
  return <SocketProvider>
    <Wrapper>
      <GroupWrapper>
        <ChatTitle/>
        <ChatGroup
          list={chatList}
          selectedId={selectedChat._id}
          onChangeChat={setSelectedChat}/>
      </GroupWrapper>
      <ContainerWrapper>
        {
          selectedChat._id && <ChatContainer selectedChat={selectedChat}/>
        }
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