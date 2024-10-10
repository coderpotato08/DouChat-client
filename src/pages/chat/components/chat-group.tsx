import CIcon from "@components/c-icon";
import ChatAvatar from "@components/chat-avatar";
import { YNEnum } from "@constant/common-types";
import { ApiHelper } from "@helper/api-helper";
import { formatShowMessage, formatMessageTime } from "@helper/common-helper";
import { LocalStorageHelper, StorageKeys } from "@helper/storage-helper";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/userReducer";
import { Badge, Checkbox, GlobalToken, Input, Popconfirm, theme } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox/Checkbox";
import { isEmpty } from "lodash";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from 'styled-components';
import { ChatSearch } from "./chat-search";
import { ChatSearchDetailModal } from "./chat-search-detail-modal";
import { usePopup } from "@hooks/usePopup";

const { useToken } = theme;
interface ChatGroupProps {
  list: any[]
  onChangeChat: (chatId: string) => void
  onAddChat: (chat: any) => void 
  onDeleteChat: (index: number) => void
}

const ChatGroup:FC<ChatGroupProps> = (props: ChatGroupProps) => {
  const { 
    list,
    onChangeChat,
    onAddChat,
    onDeleteChat,
  } = props;
  const { token } = useToken();
  const navigate = useNavigate();
  const userInfo = useAppSelector(userSelector);
  const { id: selectedChatId } = useParams();
  const isNeedDeleteTips = LocalStorageHelper.getItem(StorageKeys.IS_SHOW_DELETE_CONTACT_TIP) || YNEnum.YES;
  const [isShowTipsNext, setIsShowTipsNext] = useState<boolean>(false);
  const [isShowSearch, setIsShowSearch] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("");
  const [defaultKeyword, setDefaultKeyword] = useState<string>("");
  const [defaultSelectedChat, setDefaultSelectedChat] = useState<any>({});
  const [detailModel_open, detailModelPopup] = usePopup();

  const handleShowTips = (e: CheckboxChangeEvent) => {
    setIsShowTipsNext(e.target.checked);
  }

  const deleteContact = async (id: string, isGroup: boolean) => {
    const index: number = list.findIndex((item) => item._id === id);
    if (index === -1) return;
    const { groupId, contactId } = list[index];
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
    if (selectedChatId === (groupId || contactId)) {
      navigate('/chat/message')
    }
    onDeleteChat(index);
  }

  const renderGroupItem = (item: any): ReactNode => {
    const {
      _id,
      contactId, 
      groupId, 
      createTime,
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
      msgType,
      msgContent = "",
    } = recentMessage;
    const isGroup = !isEmpty(groupId);
    const chatId = isGroup ? groupId : contactId;
    const receiver = (users[0] || {})._id === userInfo._id ? (users[1] || {}) : (users[0] || {});
    const messageText = formatShowMessage(msgContent, msgType);
    const atTipText = unreadNum > 0 && messageText.indexOf(`@${userInfo.nickname}`) > -1 ? "[有人@我]" : "";
    return <div key={chatId}
                id={`CHAT_${chatId}`}
                className={selectedChatId === chatId ? "group-item active" : "group-item"}
                onClick={() => onChangeChat(chatId)}>
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
          <span className="date">{formatMessageTime(time || createTime)}</span>
        </div>
        <div className="msg-line">
          <div className="msg">
            {atTipText && <span className={"at-tip"}>{atTipText}</span>}
            {messageText}
          </div>
          {
            isNeedDeleteTips === YNEnum.YES ? 
              <Popconfirm
                placement="right"
                title={"确认要删除该聊天？删除后将清空聊天"}
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

  const onSearchFocus = () => {
    setIsShowSearch(true)
  }

  const onSearchCancel = () => {
    setKeyword("")
    setIsShowSearch(false)
  }

  const onDetailModelShow = (chat = {}) => {
    setDefaultKeyword(keyword);
    setDefaultSelectedChat(chat)
    detailModelPopup();
  }

  useEffect(() => {
    const ele = selectedChatId ? document.getElementById(`CHAT_${selectedChatId}`) : null;
    if(ele) {
      ele.scrollIntoView({
        block: "end",
        inline: "nearest", 
        behavior: "smooth",
      })
    }
  }, [selectedChatId])

  return <ChatGroupWrapper>
    <SearchWrapper $isShowSearch={isShowSearch}>
      <Input placeholder="Search Message"
             value={keyword}
             onChange={(e) => setKeyword(e.target.value)}
             onFocus={onSearchFocus}/>
      <div className="cancel-search"
           onClick={onSearchCancel}>取消</div>
    </SearchWrapper>
    <GroupWrapper $token={token}>
      {
        list.map((item) => renderGroupItem(item))
      }
    </GroupWrapper>
    <SearchInfoWrapper $visible={isShowSearch}>
      {keyword && <ChatSearch 
        keyword={keyword}
        onShowDetail={onDetailModelShow}
        onAddChat={onAddChat}
        onCancel={onSearchCancel}/>}
    </SearchInfoWrapper>
    {
      detailModel_open &&
      <ChatSearchDetailModal 
        defaultSelectedChat={defaultSelectedChat}
        defaultKeyword={defaultKeyword}
        visible={detailModel_open}
        onCancel={detailModelPopup}/>
      }
  </ChatGroupWrapper>
}

export default React.memo(ChatGroup)

const ChatGroupWrapper = styled.div`
  & {
    position: relative;
    width: 100%;
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
    flex: 1;
  }
`
const SearchWrapper = styled.div<{
  $isShowSearch: boolean
}>`
  & {
    display: flex;
    box-sizing: border-box;
    padding: 8px 18px 5px;
    width: 100%;
    height: 45px;
    .cancel-search {
      cursor: pointer;
      overflow: hidden;
      font-size: 14px;
      width: ${({$isShowSearch}) => $isShowSearch ? "50px" : 0};
      height: 45px;
      text-align: center;
      line-height: 32px;
      color: #666;
      transition: all .4s;
    }
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
          right: -5px;
          top: -5px;
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
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
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
          .at-tip {
            color: #ff0000;
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
const SearchInfoWrapper = styled.div<{
  $visible: boolean
}>`
  & {
    position: absolute;
    top: 45px;
    left: 0px;
    width: 100%;
    background: #fff;
    height: ${({$visible}) => $visible ? "calc(100% - 45px)" : 0};
    transition: all .4s;
  }
`