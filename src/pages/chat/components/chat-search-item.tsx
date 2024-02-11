import ChatAvatar from '@components/chat-avatar'
import { HighlightText } from '@components/highlight-text'
import { ApiHelper } from '@helper/api-helper'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { setSelectedId, userSelector } from '@store/index'
import { Avatar } from 'antd'
import { FC, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

interface ChatSearchItemProps {
  type: "friend" | "group" | "message"
  keyword: string,
  searchedItem: any,
  onCancel: () => void,
  refreshChatList: () => void,
}

type ItemNodeType = "avatarNode" | "nameNode" | "descriptionNode"
type ReturnNodesType<T extends string> = {[K in T]: ReactNode | null}

const getItemNodes = (
  type: "friend" | "group" | "message", 
  item: any, 
  keyword: string
): ReturnNodesType<ItemNodeType> => {
  if(type === "friend") {
    const { nickname, avatarImage, username } = item;
    const isNameMatch = nickname!.indexOf(keyword) > -1
    return {
      avatarNode: <Avatar style={{flexShrink: 0}} src={avatarImage} size={48}/>,
      nameNode: <HighlightText text={nickname} keyword={keyword}/>,
      descriptionNode: !isNameMatch ? <div><HighlightText text={username} keyword={keyword}/></div> : null,
    }
  } else if (type === "group") {
    const { usersAvaterList, filterUserList, groupName } = item;
    const isGroupNameMatch = groupName!.indexOf(keyword) > -1;
    const { nickname, username } = filterUserList[0] || {};
    return {
      avatarNode: <ChatAvatar isGroup={true} groupImgList={usersAvaterList}/>,
      nameNode: <HighlightText text={groupName} keyword={keyword}/>,
      descriptionNode: !isGroupNameMatch ? <div>包含：
        <HighlightText text={`${nickname}(${username})`} keyword={keyword}/>
      </div> : null,
    }
  } else {
    const { matchedMessages, friendInfo, groupInfo } = item;
    const descriptionNode = matchedMessages.length > 1 ? 
      <div>{matchedMessages.length}条相关聊天记录</div> :
      <div><HighlightText text={`${matchedMessages[0]}`} keyword={keyword}/></div>
    if(friendInfo) {
      const { avatarImage, nickname } =  friendInfo;
      return {
        avatarNode: <Avatar style={{flexShrink: 0}} src={avatarImage} size={48}/>,
        nameNode: nickname,
        descriptionNode
      }
    } else {
      const { usersAvaterList, groupName } = groupInfo;
      return {
        avatarNode: <ChatAvatar isGroup={true} groupImgList={usersAvaterList}/>,
        nameNode: groupName,
        descriptionNode
      }
    }
  }
}

export const ChatSearchItem:FC<ChatSearchItemProps> = (props: ChatSearchItemProps) => {
  const {
    type,
    keyword,
    searchedItem,
    onCancel,
    refreshChatList,
  } = props;
  const {
    avatarNode,
    nameNode,
    descriptionNode,
  } = getItemNodes(type, searchedItem, keyword);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector(userSelector);

  const onClickItem = () => {
    if(type === "friend") {
      const params = {
        fromId: userInfo._id,
        toId: searchedItem._id
      }
      ApiHelper.createUserContact(params)
        .then(({ contactId }) => {
          dispatch(setSelectedId({ selectedId: contactId, isGroup: false }))
          refreshChatList();
          onCancel();
          contactId && navigate(`/chat/message/${contactId}?type=user`);
        })
    } else if(type === "group") {

    } else {

    }
  }
  return (
    <InfoItem onClick={onClickItem}>
      {avatarNode}
      <div className={'info'}>
        <div>{nameNode}</div>
        {descriptionNode}
      </div>
    </InfoItem>
  )
}

const InfoItem = styled.div`
  & {
    cursor: pointer;
    display: flex;
    padding: 8px;
    transition: all .4s;
    border-bottom: 1px solid rgba(0,0,0,.05);
    .info {
      color: #333;
      display: flex;
      margin-left: 12px;
      flex-direction: column;
      justify-content: center;
      > div:nth-child(1) {
        font-size: 14px;
        font-weight: 500;
      }
      > div:nth-child(2) {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
      }
    }
  }
  &:hover {
    background-color: #f2f2f2;
  }
  &:last-child {
    border: none
  }
`
