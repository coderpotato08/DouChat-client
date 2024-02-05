import CIcon from "@components/c-icon";
import ChatAvatar from "@components/chat-avatar";
import { YNEnum } from "@constant/common-types";
import { ApiHelper } from "@helper/api-helper";
import { formatShowMessage, formatMessageTime } from "@helper/common-helper";
import { LocalStorageHelper, StorageKeys } from "@helper/storage-helper";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/userReducer";
import { Badge, Checkbox, GlobalToken, Input, Popconfirm, message, theme } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox/Checkbox";
import { isEmpty } from "lodash";
import React, { FC, ReactNode, useState } from "react";
import styled from 'styled-components';

const { useToken } = theme;
interface ChatGroupProps {
  list: any[]
  selectedId: any,
  onChangeChat: (chatItem: any) => void
  refreshChatList: () => void
}

const ChatGroup:FC<ChatGroupProps> = (props: ChatGroupProps) => {
  const { 
    list,
    selectedId,
    onChangeChat,
    refreshChatList,
  } = props;
  const { token } = useToken();
  const userInfo = useAppSelector(userSelector);
  const isNeedDeleteTips = LocalStorageHelper.getItem(StorageKeys.IS_SHOW_DELETE_CONTACT_TIP) || YNEnum.YES;
  const [isShowTipsNext, setIsShowTipsNext] = useState<boolean>(false)

  const handleShowTips = (e: CheckboxChangeEvent) => {
    setIsShowTipsNext(e.target.checked);
  }

  const deleteContact = async (id: string, isGroup: boolean) => {
    if(isShowTipsNext) {
      LocalStorageHelper.setItem( // 下次是否不再提示
        StorageKeys.IS_SHOW_DELETE_CONTACT_TIP, 
        isShowTipsNext ? YNEnum.NO : YNEnum.YES
      );
    }
    if (isGroup) {
      await ApiHelper.deleteGroupContact({id})
    } else {
      await ApiHelper.deleteUserContact({id});
    }
    refreshChatList();
  }
  const renderGroupItem = (item: any): ReactNode => {
    const {
      _id,
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
      <div className="avatar-box">
        <ChatAvatar 
          isGroup={isGroup} 
          groupImgList={usersAvaterList} 
          imgUrl={receiver.avatarImage}/>
        <Badge className={"badge"} size="small" count={unreadNum}/>
      </div>
      <div className="info">
        <div className="name-line">
          <span className="name">{isGroup ? groupName : receiver.nickname}</span>
          <span className="date">{formatMessageTime(time)}</span>
        </div>
        <div className="msg-line">
          <div className="msg">{formatShowMessage(msgContent)}</div>
          {
            isNeedDeleteTips === YNEnum.YES ? 
              <Popconfirm
                placement="right"
                title={"确认要删除该聊天？"}
                description={<Checkbox onChange={handleShowTips}>不再提示</Checkbox>}
                onConfirm={(e: any) => {
                  e.stopPropagation();
                  deleteContact(_id, isGroup)
                }}
                okText="Yes"
                cancelText="No"
              >
                <div>
                  <CIcon value={"icon-delete-bin-smile"} 
                        size={16}
                        color="#666"
                        onClick={() => {}}/>
                </div>
              </Popconfirm> : <CIcon 
                value={"icon-delete-bin-smile"}
                size={16}
                color="#666"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteContact(_id, isGroup)
                }}/>
          }
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
      .avatar-box {
        position: relative;
        .badge {
          position: absolute;
          right: 0;
        }
      }
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