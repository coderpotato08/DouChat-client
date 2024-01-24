import { FC, useState, useEffect, useMemo, CSSProperties, useCallback } from 'react';
import styled from 'styled-components';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CIcon from '../../components/c-icon';
import { Avatar, Button, notification } from 'antd';
import { useAppSelector } from '../../store/hooks';
import { userSelector } from '../../store';
import { useSocket } from '@store/context/createContext';
import { EventType } from '@constant/socket-const';
import { CreateMeetingParamsType } from '@constant/api-const';
import { RoleType } from '@constant/meeting-const';

const menuList = [
  {
    key: 'message',
    route: 'message',
    icon: 'icon-message',
  },
  {
    key: 'friend',
    route: 'friend',
    icon: 'icon-friend',
  },
]
const btnStyle:CSSProperties = {
  position: "absolute",
  bottom: "12px",
  right: "12px",
}
const Chat:FC = () => {
  const { pathname } = useLocation();
  const socket = useSocket();
  const userInfo = useAppSelector(userSelector);
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification()
  const [selectedKey, setSelectedKey] = useState('message');

  const onClickMenu = (item: any) => {
    setSelectedKey(item.key)
    navigate(item.route);
  }

  const onReceiveInviteMeeting = (data: { meetingId: string } & CreateMeetingParamsType) => {
    const { creator, meetingName, meetingId } = data;
    api.open({
      key: meetingId, 
      message: <InviteMessageWrapper>
        <Avatar style={{marginRight: '12px', flexShrink: 0}} size={48}/>
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

  useEffect(() => {
    socket.on(EventType.INVITE_MEETING, onReceiveInviteMeeting);
  }, []);

  useEffect(() => {
    const splitPath = pathname.split("/");
    const curPath = splitPath[splitPath.length - 1];
    setSelectedKey(curPath);
  }, [pathname])

  return (
    <ChatWrapper>
      <MenuWrapper>
        <AvatarWrapper>
          <Avatar size={48}
                  src={userInfo.avatarImage}/>
        </AvatarWrapper>
        {
          menuList.map((item) => {
            const isActive = selectedKey === item.key;
            return <MenuItem key={item.key} onClick={() => onClickMenu(item)}>
              <CIcon value={`${item.icon}${isActive ? '-fill' : ''}`} 
                    size={28} 
                    color={isActive ? '#1677ff' : '#666'}/>
            </MenuItem>
          })
        }
      </MenuWrapper>
      <ContentWrapper>
        <Outlet/>
      </ContentWrapper>
      {contextHolder}
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
    width: 70px;
    z-index: 1;
  }
`
const AvatarWrapper = styled.div`
  & {
    justify-content: center;
    align-items: center;
    display: flex;
    width: 100%;
    height: 80px;
    margin-bottom: 20px;
  }
`
const MenuItem = styled.div`
  & {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 60px;
  }
`
const ContentWrapper = styled.div`
  & {
    width: calc(100vw - 70px);
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