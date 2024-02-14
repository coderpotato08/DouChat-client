import { BaseModalProps } from '@constant/common-types'
import { ApiHelper } from '@helper/api-helper'
import { useAppSelector } from '@store/hooks'
import { userSelector } from '@store/userReducer'
import { Avatar, GlobalToken, Input, Modal, ModalProps, theme } from 'antd'
import { debounce, isEmpty } from 'lodash'
import { FC, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { ChatSearchItem } from './chat-search-item'
import { formatBytes, formatMessageTime } from '@helper/common-helper'
import { MessageTypeEnum } from '@constant/user-types'
import { FileIcon } from '@components/file-icon'
import { HighlightText } from '@components/highlight-text'
import { RightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const ModelStyles: ModalProps['styles'] = {
  content: {
    padding: "15px 0 0 0",
  },
  header: {
    textAlign: "center",
    padding: "0 24px",
  }
}
const { useToken } = theme;
const MessageInfo = (props: {
  keyword: string,
  message: any,
}) => {
  const { keyword, message } = props
  const { msgType, msgContent } = message;
  if(msgType === MessageTypeEnum.TEXT || msgType === MessageTypeEnum.IMAGE) {
    return <TextMessageInfo>
      <HighlightText text={msgContent} keyword={keyword}/>
    </TextMessageInfo>
  } else if (msgType === MessageTypeEnum.FILE) {
    const { filename, mimetype, size } = msgContent;
    return <FileMessageInfo>
      <div className={'file-info'}>
        <HighlightText text={filename} keyword={keyword}/>
        <div>{size ? formatBytes(size) : "未知大小"}</div>
      </div>
      <FileIcon mimeType={mimetype}/>
    </FileMessageInfo>
  }
  return <div/>
}

interface ChatSearchDetailModalProps extends BaseModalProps {
  defaultKeyword?: string
  defaultSelectedChat?: any
}
export const ChatSearchDetailModal:FC<ChatSearchDetailModalProps> = (props: ChatSearchDetailModalProps) => {
  const {
    visible,
    onCancel,
    defaultKeyword,
    defaultSelectedChat,
  } = props;
  const { token } = useToken();
  const navigate = useNavigate();
  const userInfo = useAppSelector(userSelector);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedChat, setSelectedChat] = useState<any>(defaultSelectedChat || {});
  const [messageChatList, setMessageChatList] = useState<any[]>([]);
  const [messageList, setMessageList] = useState<any[]>([])
  const [keyword, setKeyword] = useState<string>(defaultKeyword || "");

  const onModelCancel = () => {
    onCancel();
  }

  const onSearch = useCallback(debounce(async (keyword: string) => {
    const params = { userId: userInfo._id, keyword };
    setIsLoading(true)
    const messageList = await ApiHelper.searchMessageList(params);
    setIsLoading(false);
    setMessageChatList(messageList);
  }, 500), []);

  const onGoToChat = () => {
    const { chatId } = selectedChat;
    const isGroup = chatId.indexOf("_") === -1;
    navigate(`/chat/message/${chatId}?type=${isGroup ? "group" : "user"}`);
    onModelCancel();
  }

  useEffect(() => {
    if(isEmpty(selectedChat)) return;
    const { chatId, groupInfo, friendInfo } = selectedChat
    const isGroup = chatId.indexOf("_") === -1;
    if (isGroup) {
      const params = {keyword, groupId: groupInfo._id};
      ApiHelper.searchMatchGroupMessageList(params)
        .then((list) => {
          setMessageList(list);
        })
    } else {
      const params = {keyword, userId: userInfo._id, friendId: friendInfo._id};
      ApiHelper.searchMatchUserMessageList(params)
        .then((list) => {
          setMessageList(list)
        })
    }
  }, [selectedChat])

  useEffect(() => {
    if(keyword) {
      onSearch(keyword);
    } else {
      setMessageChatList([]);
      setMessageList([]);
      setSelectedChat({});
    }
  }, [keyword])

  return (
    <Modal
      centered
      mask={false}
      styles={ModelStyles}
      width={"90vw"}
      footer={null}
      title={"搜索聊天记录"}
      open={visible}
      onCancel={onModelCancel}>
      <Wrapper>
        <SearchWrapper>
          <Input.Search
            style={{width: "90%"}}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear/>
        </SearchWrapper>
        {
          keyword &&
          <>
            <GroupWrapper>
              {
                messageChatList.map((chat) => {
                  return <ChatSearchItem 
                            isActive={selectedChat.chatId === chat.chatId}
                            key={chat.chatId}
                            type={'message'}
                            keyword={keyword}
                            searchedItem={chat}
                            onClick={() => setSelectedChat(chat)}/>
                })
              }
            </GroupWrapper>
            <ContainerWrapper>
              {
                messageList.length > 0 &&
                <MatchTip $token={token}>
                  <div>
                    <span style={{color: token.colorPrimary}}>{messageList.length}</span>
                    条与"{keyword}"相关的搜索结果
                  </div>
                  <div className={'enter-chat'}
                       onClick={onGoToChat}>
                    进入聊天<RightOutlined />
                  </div>
                </MatchTip>
              }
              {
                messageList.length > 0 &&
                <div className={'content'}>
                  {
                    messageList.map((messageInfo: any) => {
                      const { _id, userInfo = {}, time, msgType, msgContent } = messageInfo;
                      const { avatarImage, nickname, username } = userInfo;
                      const isUsernameMatch = username.indexOf(keyword) > -1;
                      const nameStr = nickname + (isUsernameMatch ? `(${username})` : "")
                      return <MessageItem key={_id} $token={token}>
                        <Avatar className={'avatar-image'} src={avatarImage} size={42}/>
                        <div className={'info-content'}>
                          <div className={'header-info'}>
                            <div>
                              <HighlightText text={nameStr} keyword={keyword}/>
                            </div>
                            <div>{formatMessageTime(time, false)}</div>
                          </div>
                          <div className={'message-info'}>
                            <MessageInfo message={{msgType, msgContent}} keyword={keyword}/>
                            <div className={'affix'}>定位到聊天位置</div>
                          </div>
                        </div>
                      </MessageItem>
                    })
                  }
                </div>
              }
            </ContainerWrapper>
          </>
        }
      </Wrapper>
    </Modal>
  )
}
const Wrapper = styled.div`
  & {
    display: flex;
    position: relative;
    height: 80vh;
  }
`
const SearchWrapper = styled.div`
  & {
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    padding: 0 24px;
    width: 100%;
    height: 45px;
  }
`

const GroupWrapper = styled.div`
  & {
    width: 25%;
    margin-top: 45px;
    height: calc(80vh - 45px);
    overflow: scroll;
    border-top: 2px solid #ececec;
    border-right: 2px solid #ececec;
  }
`
const ContainerWrapper = styled.div`
  & {
    box-sizing: border-box;
    position: relative;
    width: 75%;
    margin-top: 45px;
    padding: 0 24px;
    height: calc(80vh - 45px);
    border-top: 2px solid #ececec;
    background: #f3f3f3;
    .content {
      width: 100%;
      height: calc(100% - 40px);
      overflow: scroll;
    }
  }
`
const MatchTip = styled.div<{
  $token: GlobalToken
}>`
  & {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .enter-chat {
      cursor: pointer;
      color: ${({$token}) => $token.colorPrimaryText};
    }
  }
`
const MessageItem = styled.div<{
  $token: GlobalToken
}>`
  & {
    display: flex;
    .avatar-image {
      flex-shrink: 0;
      margin: 8px 12px 8px 0;
    }
    .info-content {
      flex: 1;
      margin-left: 12px;
      padding: 8px 12px 12px 0;
      border-bottom: 1px solid #ececec;
      .header-info {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #666;
      }
      .message-info {
        display: flex;
        margin-top: 8px;
        justify-content: space-between;
      }
      .affix {
        cursor: pointer;
        display: none;
        font-size: 12px;
        color: ${({$token}) => $token.colorPrimaryText};
      }
    }
    &:hover .affix {
      display: block;
    }
  }
`
const TextMessageInfo = styled.div`
  & {
    font-size: 14px;
    color: #333;
    width: 80%;
  }
`
const FileMessageInfo = styled.div`
  & {
    display: flex;
    position: relative;
    padding: 12px;
    border-radius: 4px;
    width: 250px;
    background: #fff;
    .file-info {
      flex: 1;
      >div:nth-child(2) {
        font-size: 12px;
        color: #666;
      }
    }
  }
  &::before {
    content: '';
    position: absolute;
    top: 12px;
    left: -14px;
    border-width: 4px 7px 4px 7px;
    border-style: solid;
    border-color: transparent #fff transparent transparent ;
  }
`