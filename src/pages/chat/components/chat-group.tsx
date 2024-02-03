import ChatAvatar from "@components/chat-avatar";
import { formatShowMessage, formatMessageTime } from "@helper/common-helper";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/userReducer";
import { Avatar, Badge, GlobalToken, Input, theme } from "antd";
import { isEmpty } from "lodash";
import React, { FC, ReactNode } from "react";
import styled from 'styled-components';

const { useToken } = theme;
interface ChatGroupProps {
  list: any[]
  selectedId: any,
  onChangeChat: (chatItem: any) => void
}

const ChatGroup:FC<ChatGroupProps> = (props: ChatGroupProps) => {
  const { 
    list,
    selectedId,
    onChangeChat 
  } = props;
  const { token } = useToken();
  const userInfo = useAppSelector(userSelector);
  const renderGroupItem = (item: any): ReactNode => {
    const {  
      contactId, 
      groupId, 
      users = [],
      recentMessage = {}, 
      unreadNum = 0,
      groupInfo = {},
    } = item;
    const {
      groupName,
      usersAvaterList = [], 
    } = groupInfo
    const { 
      time, 
      msgContent = ""
    } = recentMessage;
    const isGroup = !isEmpty(groupId);
    const chatId = isGroup ? groupId : contactId;
    const receiver = (users[0] || {})._id === userInfo._id ? (users[1] || {}) : (users[0] || {})
    return <div key={chatId}
                className={selectedId === chatId ? "group-item active" : "group-item"}
                onClick={() => onChangeChat(item)}>
      <ChatAvatar 
        isGroup={isGroup} 
        groupImgList={usersAvaterList} 
        imgUrl={receiver.avatarImage}/>
      <div className="info">
        <div className="name-line">
          <span className="name">{isGroup ? groupName : receiver.nickname}</span>
          <span className="date">{formatMessageTime(time)}</span>
        </div>
        <div className="msg-line">
          <div className="msg">{formatShowMessage(msgContent)}</div>
          <Badge size="small" count={unreadNum}/>
        </div>
      </div>
    </div>
  }

  return <ChatGroupWrapper>
    <SearchWrapper>
      <Input placeholder="Search Message"/>
    </SearchWrapper>
    <GroupWrapper $token={token}>
      {
        list.map((item) => renderGroupItem(item))
      }
    </GroupWrapper>
  </ChatGroupWrapper>
}

export default React.memo(ChatGroup)

const ChatGroupWrapper = styled.div`
  & {
    width: 100%;
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
    flex: 1;
  }
`
const SearchWrapper = styled.div`
  & {
    box-sizing: border-box;
    padding: 8px 18px 12px;
    width: 100%;
    height: 45px;
  }
`
const GroupWrapper = styled.div<{
  $token: GlobalToken
}>`
  & {
    flex: 1;
    overflow-y: scroll;
    .group-item {
      cursor: pointer;
      position: relative;
      display: flex;
      padding: 12px 18px;
      transition: all .4s;
      background: #fff;
      .info {
        margin-left: 12px;
        flex: 1;
        overflow: hidden;
        .name-line {
          display: flex;
          height: 24px;
          align-items: center;
          .name {
            font-size: 16px;
            font-weight: 500;
            flex: 1;
          }
          .date {
            font-size: 12px;
            color: #666;
            margin-left: auto;
          }
        }
        .msg-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 24px;
          color: #666;
          line-height: 24px;
          font-size: 14px;
          .msg {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
        }
      }
    }
    .group-item:hover {
      background: #f2f2f2;
    }
    .active, .active:hover  {
      background: ${props => props.$token.colorPrimaryBg};
    }
    .active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: ${props => props.$token.colorPrimary};
    }
  }
`