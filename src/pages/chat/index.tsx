import { FC, useState, useEffect, CSSProperties, useCallback, createElement, cloneElement } from 'react';
import styled from 'styled-components';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CIcon from '../../components/c-icon';
import { Avatar, Badge, Button, GlobalToken, Modal, notification, theme } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setTotalUnreadNum,
  setChatList as setStoreChatList,
  totalUnreadNumSelector,
  userSelector,
  deleteUser
} from '@store/index';
import { useSocket } from '@store/context/createContext';
import { EventType } from '@constant/socket-types';
import { CreateMeetingParamsType, LoadGroupContactListParamsType, UserContactsParamsType } from '@constant/api-types';
import { RoleType } from '@constant/meeting-types';
import { ApiHelper } from '@helper/api-helper';
import dayjs from 'dayjs';
import { OpenAIFilled, OpenAIOutlined } from '@ant-design/icons';
import { clone } from 'lodash';

const { useToken } = theme;
const menuList = [
  {
    key: 'message',
    route: 'message',
    icon: 'icon-message',
  },
  {
    key: 'relationship',
    route: 'relationship',
    icon: 'icon-friend',
  },
  {
    key: 'ai-chat',
    route: 'ai-chat',
    icon: <OpenAIOutlined />,
    iconActive: <OpenAIFilled />,
  }
]
const btnStyle: CSSProperties = {
  position: "absolute",
  bottom: "12px",
  right: "12px",
}
const Chat: FC = () => {
  const { pathname } = useLocation();
  const { token } = useToken();
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const totalUnreadNum = useAppSelector(totalUnreadNumSelector)
  const userInfo = useAppSelector(userSelector);
  const [api, meetingNotificationHolder] = notification.useNotification()
  const [selectedKey, setSelectedKey] = useState('message');

  const onClickMenu = (item: any) => {
    if (selectedKey === item.key) return;
    setSelectedKey(item.key)
    navigate(item.route);
  }

  // 退出
  const onClickLogout = () => {
    Modal.confirm({
      title: '退出登录',
      content: '确定退出登录吗?',
      okText: '退出',
      cancelText: '取消',
      onOk: () => {
        dispatch(deleteUser({ username: userInfo.username }));
        socket.emit(EventType.USER_QUIT_APP, userInfo);
        navigate('/login');
      }
    })
  }

  const loadGlobalInfo = async () => {
    const [{ userUnreadCount, groupUnreadCount }] = await Promise.all([
      ApiHelper.loadAllUnreadNum({ userId: userInfo._id })
    ]);
    dispatch(setTotalUnreadNum({ num: userUnreadCount + groupUnreadCount }));
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

  const loadAllContactList = async () => {
    const [userChatList, groupChatList] = await Promise.all([
      loadUserChatList(),
      loadGroupChatList(),
    ])
    const chatList = [...userChatList, ...groupChatList]
      .sort((a: any, b: any) => {
        const aTime = a.recentMessage?.time || a.createTime;
        const bTime = b.recentMessage?.time || b.createTime;
        return dayjs(bTime).diff(dayjs(aTime));
      })
    dispatch(setStoreChatList(chatList));
  }

  const onReceiveInviteMeeting = (data: { meetingId: string } & CreateMeetingParamsType) => {
    const { creator, meetingName, meetingId } = data;
    api.open({
      key: meetingId,
      message: <InviteMessageWrapper>
        <Avatar style={{ marginRight: '12px', flexShrink: 0 }} size={48} />
        <div className='info'>
          <div>{creator.nickname}</div>
          <div>邀请您视频会议-{meetingName}</div>
        </div>
        <Button key={"reveive"}
          className={"receive-btn"}
          type="primary"
          onClick={() => receiveInvite(meetingId)}>
          接听
        </Button>
      </InviteMessageWrapper>,
      btn: <Button danger
        style={btnStyle}
        type="primary"
        onClick={() => rejectInvite(meetingId)}>拒绝</Button>,
      duration: null,
      onClose: () => rejectInvite(meetingId),
    });
  }

  const rejectInvite = useCallback((key: string) => {
    socket.emit(EventType.REJECT_INVITE, { meetingId: key, userId: userInfo._id })
    api.destroy(key)
  }, [])

  const receiveInvite = (meetingId: string) => {
    api.destroy(meetingId)
    navigate(`/video-meeting/${meetingId}?role=${RoleType.PARTICIPANT}`, {
      state: {
        role: RoleType.PARTICIPANT,
      }
    })
  }

  const handleSocketEvent = (type: "on" | "off") => {
    socket[type](EventType.INVITE_MEETING, onReceiveInviteMeeting);
  }

  useEffect(() => {
    handleSocketEvent("on");
    loadGlobalInfo();
    loadAllContactList();
    return () => {
      handleSocketEvent("off");
    }
  }, []);

  useEffect(() => {
    if (pathname.includes("message")) {
      setSelectedKey("message");
    } else {
      const splitPath = pathname.split("/");
      const curPath = splitPath[splitPath.length - 1];
      setSelectedKey(curPath);
    }
  }, [pathname])

  const keyIndex = menuList.findIndex((item) => item.key === selectedKey);
  return (
    <ChatWrapper>
      <MenuWrapper>
        <AvatarWrapper>
          <Avatar size={48}
            src={userInfo.avatarImage} />
        </AvatarWrapper>
        <MenuListWrapper>
          {
            menuList.map((item) => {
              const isActive = selectedKey === item.key;
              const isCIcon = typeof item.icon === 'string';
              const IconNode = (isActive ? item.iconActive : item.icon) as React.ReactNode;
              return <MenuItem key={item.key} onClick={() => onClickMenu(item)}>
                {
                  isCIcon ?
                    <CIcon value={`${item.icon}${isActive ? '-fill' : ''}`}
                      size={28}
                      color={isActive ? token.colorPrimary : '#666'} /> :
                    cloneElement(IconNode as JSX.Element, {
                      style: {
                        fontSize: '28px',
                        color: isActive? token.colorPrimary : '#666',
                      }
                    })
                }
                {item.key === 'message' && <Badge className={'unread-count'} count={totalUnreadNum} size={'small'} />}
              </MenuItem>
            })
          }
          {
            !!selectedKey && <ActiveMark $keyIndex={keyIndex} $token={token} />
          }
        </MenuListWrapper>
        <LogoutButton $token={token} onClick={onClickLogout}>
          <CIcon value={'icon-logout'} size={24} color={'#fff'} />
        </LogoutButton>
      </MenuWrapper>
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
      {meetingNotificationHolder}
    </ChatWrapper>
  )
}

export default Chat

const ChatWrapper = styled.div`
  & {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
  }
`
const MenuWrapper = styled.div`
  & {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0;
    background: #f3f3f3;
    height: 100vh;
    width: 90px;
    z-index: 1;
  }
`
const AvatarWrapper = styled.div`
  & {
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    display: flex;
    width: 100%;
    height: 80px;
    margin-bottom: 20px;
  }
`
const MenuListWrapper = styled.div`
  & {
    flex: 1;
    position: relative;
    width: 100%;
  }
`
const MenuItem = styled.div`
  & {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 80px;
    .unread-count {
      position: absolute;
      right: 24px;
      bottom: 20px;
      >sup {
        padding: 0px !important;
      }
    }
  }
`
const ActiveMark = styled.div<{
  $keyIndex: number,
  $token: GlobalToken,
}>`
  & {
    transition: all 0.3s;
    position: absolute;
    top: ${props => `calc(20px + ${props.$keyIndex * 80}px)`};
    left: 0;
    width: 4px;
    height: 40px;
    border-radius: 4px;
    background-color: ${props => props.$token.colorPrimary};
    box-shadow: 0 0 5px 5px ${props => props.$token.colorPrimaryBgHover};
  }
`
const LogoutButton = styled.div<{
  $token: GlobalToken,
}>`
  & {
    cursor: pointer;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 54px;
    background-color: ${props => props.$token.colorPrimary};
    border-radius: 8px;
    transition: all 0.3s;
  }
  &:hover {
    transform: scale(1.1);
  }
`
const ContentWrapper = styled.div`
  & {
    width: calc(100vw - 90px);
    height: 100vh;
  }
`
const InviteMessageWrapper = styled.div`
  & {
    display: flex;
    width: 100%;
    align-items: center;
    margin-bottom: 20px;
    .info {
      width: 85%;
      flex: 1;
      > div{
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    .receive-btn {
      position: absolute;
      bottom: 12px;
      right: 82px;
    }
  }
`