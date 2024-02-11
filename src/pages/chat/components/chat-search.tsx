import { UserInfoType } from '@constant/user-types';
import { ApiHelper } from '@helper/api-helper';
import { useAppSelector } from '@store/hooks';
import { userSelector } from '@store/index';
import { GlobalToken, theme } from 'antd';
import { debounce } from 'lodash';
import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { ChatSearchItem } from './chat-search-item';

const { useToken } = theme;
const ListBox = (props: {
  title: string
} & PropsWithChildren) => {
  const { token } = useToken()
  return <ListBoxWrapper $token={token}>
    <div className={'title'}>{props.title}</div>
    {
      props.children
    }
  </ListBoxWrapper>
}

interface ChatSearchProps {
  keyword: string
  refreshChatList: () => void
  onCancel: () => void
  onChangeChat: (chatId: string) => void
}
export const ChatSearch:FC<ChatSearchProps> = (props: ChatSearchProps) => {
  const {
    keyword,
    refreshChatList,
    onChangeChat,
    onCancel,
  } = props;
  const userInfo = useAppSelector(userSelector);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [friendSearchList, setFriendSearchList] = useState<any[]>([]);
  const [groupSearchList, setGroupSearchList] = useState<any[]>([]);
  const [messageSearchList, setMessageSearchList] = useState<any[]>([]);

  const onSearch = useCallback(debounce(async (keyword) => {
    const params = { userId: userInfo._id, keyword }
    setIsLoading(true);
    const [
      friendList,
      groupList,
      messageList,
    ] = await Promise.all([
      ApiHelper.searchFriendList(params),
      ApiHelper.searchGroupList(params),
      ApiHelper.searchMessageList(params),
    ])
    setIsLoading(false);
    setFriendSearchList(friendList);
    setGroupSearchList(groupList);
    setMessageSearchList(messageList);
  }, 500), [])

  useEffect(() => {
    if(keyword) {
      onSearch(keyword);
    } else {
      setFriendSearchList([]);
      setGroupSearchList([]);
      setMessageSearchList([]);
    }
  }, [keyword])
  return (
    isLoading ? <LoadingWrapper>
      搜索中
    </LoadingWrapper> : <Wrapper>
      {
        friendSearchList.length > 0 &&
        <ListBox title='好友'>
          {
            friendSearchList.slice(0, 3).map((friend: UserInfoType) => {
              return <ChatSearchItem key={friend._id}
                                     type={'friend'}
                                     keyword={keyword}
                                     searchedItem={friend}
                                     onCancel={onCancel}
                                     onChangeChat={onChangeChat}
                                     refreshChatList={refreshChatList}/>
            })
          }
          {
            groupSearchList.length > 3 &&
            <div className={'more'}>更多好友</div>
          }
        </ListBox>
      }
      {
        groupSearchList.length > 0 &&
        <ListBox title='群聊'>
          {
            groupSearchList.slice(0, 3).map((group: any) => {
              return <ChatSearchItem key={group._id}
                                     type={'group'}
                                     keyword={keyword}
                                     searchedItem={group}
                                     onCancel={onCancel}
                                     onChangeChat={onChangeChat}
                                     refreshChatList={refreshChatList}/>
            })
          }
          {
            groupSearchList.length > 3 &&
            <div className={'more'}>更多群聊</div>
          }
        </ListBox>
      }
      {
        messageSearchList.length > 0 &&
        <ListBox title='聊天记录'>
          {
            messageSearchList.slice(0, 3).map((messageChat: any) => {
              return <ChatSearchItem key={messageChat.chatId}
                                     type={'message'}
                                     keyword={keyword}
                                     searchedItem={messageChat}
                                     onCancel={onCancel}
                                     onChangeChat={onChangeChat}
                                     refreshChatList={refreshChatList}/>
            })
          }
          {
            messageSearchList.length > 3 &&
            <div className={'more'}>更多聊天记录</div>
          }
        </ListBox>
      }
    </Wrapper>
  )
}

const Wrapper = styled.div`
  & {
    padding: 8px;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: scroll;
  }
`
const ListBoxWrapper = styled.div<{
  $token: GlobalToken
}>`
  & {
    width: 100%;
    background: #fff;
    border-radius: 4px;
    margin-bottom: 8px;
    overflow: hidden;
    box-shadow: 0 0 3px 3px rgba(0,0,0,.05);
    .title, .more {
      box-sizing: border-box;
      width: 100%;
      height: 36px;
      line-height: 36px;
      padding: 0 12px;
      font-size: 14px;
      color: #333;
      border-bottom: 1px solid rgba(0,0,0,.05);
    }
    .more {
      cursor: pointer;
      color: ${({$token}) => $token.colorPrimary};
      border-top: 1px solid rgba(0,0,0,.05);
      border-bottom: none;
    }
  }
`
const LoadingWrapper = styled.div`
  & {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    height: 60px;
    font-size: 14px;
    color: #333;
  }
`
