import { Avatar, Input, Badge } from "antd";
import React, { FC, ReactNode, useCallback } from "react";
import styled from 'styled-components';

interface ChatGroupProps {
  list: any[]
  selectedId: any,
  onChangeChat: (chatId: string) => void
}

const ChatGroup:FC<ChatGroupProps> = (props: ChatGroupProps) => {
  const { list, selectedId, onChangeChat } = props;
  
  const renderGroupItem = (item: any): ReactNode => {
    const { receiver, unreadNum, _id: chatId } = item;
    return <div key={chatId}
                className={selectedId === chatId ? "group-item active" : "group-item"}
                onClick={() => onChangeChat(item)}>
      <Avatar style={{flexShrink: 0}} size={48} src={receiver.avatarImage}/>
      <div className="info">
        <div className="name-line">
          <span className="name">{receiver.username}</span>
          <span className="date">12:45</span>
        </div>
        <div className="msg-line">
          <div className="msg">hello my name is coder potato</div>
          {unreadNum && <Badge count={unreadNum} size="small"/>}
        </div>
      </div>
    </div>
  }

  return <ChatGroupWrapper>
    <SearchWrapper>
      <Input placeholder="Search Message"/>
    </SearchWrapper>
    <GroupWrapper>
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
const GroupWrapper = styled.div`
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
        .name-line {
          display: flex;
          height: 24px;
          align-items: center;
          .name {
            font-size: 18px;
            font-weight: 500;
            flex: 1;
          }
          .date {
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
      background: #e6f4ff;
    }
    .active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: rgb(22, 119, 255);
    }
  }
`