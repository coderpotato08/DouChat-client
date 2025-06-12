import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { EventType } from "@constant/socket-types";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/index";
import {
  DeviceStatusMessage,
  JoinedData,
  MeetingMessageData,
  RejectMessageType,
  RoleType,
  UserData,
  UsersList,
  UserStatus,
} from "@constant/meeting-types";
import { ApiHelper } from "@helper/api-helper";
import { isEmpty } from "lodash"
import { Avatar, Modal, message } from "antd";
import { useSocket } from "@store/context/createContext";
import CIcon from "@components/c-icon";
import { getQuery } from "@helper/common-helper";
import { MeetingChatBox } from "./components/meeting-chat-box";
import { useRTCMeeting } from "@hooks/useRTCMeeting";
import { formatPeerId } from "@helper/user-helper";
import { MeetingToolList, OptionItem } from "./components/tool-list";
import { MeetingToolsEnum } from "./types/tools";
import { useCallbackRef } from "@hooks/useCallbackRef";
import { getUserMediaStream } from "@utils/navigator";

const UserStatusLabel = {
  [UserStatus.CALLING]: "呼叫中",
  [UserStatus.REJECTED]: "已拒绝",
  [UserStatus.QUIT]: "已退出",
}

const UserAvator = (props: {
  nickname: string,
  status?: UserStatus,
}) => {
  return <UserHeader>
    <Avatar style={{ backgroundColor: '#1677ff' }}
      size={72}>
      {props.nickname}
    </Avatar>
    {props.status !== UserStatus.JOINED && <StatusLayout>
      {
        (props.status === UserStatus.QUIT ||
          props.status === UserStatus.REJECTED) &&
        <CIcon value="icon-guaduan" size={32} color="#fff" />
      }
      {UserStatusLabel[props.status!]}
    </StatusLayout>}
  </UserHeader>
}

// 设置媒体流
const playStreamTo = (eleId: string, media: MediaStream) => {
  const ele = document.getElementById(eleId);
  if (ele) {
    (ele as HTMLVideoElement).srcObject = media;
  }
};

const VideoMeeting = () => {
  const userInfo = useAppSelector(userSelector);
  const { role } = getQuery();
  const { id: meetingId } = useParams();
  const socket = useSocket();
  const [quitModalApi, quitModalContext] = Modal.useModal();
  const localStream: MutableRefObject<MediaStream | undefined> = useRef();  // 当前用户视频流
  const [memberList, setMemberList] = useState<UsersList>([]);  // 用户列表
  const [audioEnable, setAudioEnable] = useState<boolean>(false); // 麦克风是否开启
  const [cameraEnable, setCameraEnable] = useState<boolean>(false)  // 摄像头是否开启
  const [devicePermission, setDevicePermission] = useState<boolean>(false) // 设备授权
  const [meetingInfo, setMeetingInfo] = useState<any>({});  // 会议信息
  const [msgList, setMsgList] = useState<MeetingMessageData[]>([]);  // 聊天消息列表
  const {
    peerMap,
    createPeerConnection,
    destoryPeerConnection,
    startNegotiate,
  } = useRTCMeeting(
    meetingId || '',
    {
      peer: { onAddStream: playStreamTo },
      dataChannel: {
        onMessage: (msgData: any) => {
          setMsgList((pre) => [...pre, msgData]);
        }
      }
    }
  );
  const { creator = {}, meetingName, isJoinedMuted } = meetingInfo;

  const joinedMemberList = useMemo(() => {
    if (memberList && memberList.length > 0) {
      return memberList.filter((member) => member.status === UserStatus.JOINED)
    }
    return []
  }, [memberList])

  /** 屏幕共享 */
  const onShareScreen = useCallbackRef(async () => {
    try {
      const screenStream = await getUserMediaStream('screen');
      const { videoTrack } = changeStreamTrack(screenStream);
      videoTrack.onended = () => onEndShareScreen();
    } catch (error) {
      console.log('error', error);
    }
  });

  const onEndShareScreen = useCallbackRef(async () => {
    const newLocalStream = await getUserMediaStream('camera', {
      video: { facingMode: "user" },
      audio: true,
    });
    changeStreamTrack(newLocalStream);
  })

  // 更换本地视频通道
  const changeStreamTrack = (stream: MediaStream): { stream: MediaStream, videoTrack: MediaStreamTrack } => {
    localStream.current = stream;
    playStreamTo('user', stream);
    const [videoTrack] = stream.getVideoTracks();
    Object.keys(peerMap).forEach((peerId) => {
      const pc = peerMap[peerId]?.peer;
      const sender = pc.getSenders().find((sender) => sender.track?.kind === 'video');
      sender?.replaceTrack(videoTrack);
    });
    return { stream, videoTrack }
  }

  const ExtraOptionList: OptionItem[] = useMemo(() => {
    return [
      {
        title: "邀请",
        key: MeetingToolsEnum.INVITE,
        icon: `icon-invite`
      },
      {
        title: `成员(${joinedMemberList.length})`,
        key: MeetingToolsEnum.MEMBERS,
        icon: `icon-members`
      },
      {
        title: "共享屏幕",
        key: MeetingToolsEnum.SCREEN_SHARE,
        icon: `icon-screen-share`,
        onClick: onShareScreen,
      },
    ]
  }, [joinedMemberList])

  const onUserJoin = async (data: JoinedData) => { // 用户入会
    const { users, userInfo: successUserInfo } = data;
    if (successUserInfo._id === userInfo._id) {
      await currentUserJoin(successUserInfo, users); // 当前用户已入会
    } else {
      otherUserJoin(successUserInfo, users); // 其他成员入会
    };
    const joinedUsers = users.filter((user) => user.status === UserStatus.JOINED)
    if (joinedUsers.length > 1) {
      joinedUsers.forEach((user: UserData) => {
        // 当前入会的成员，要与当前会议所有入会的其他会员间建立p2p连接
        if (user._id !== successUserInfo._id) {
          const peerId = formatPeerId(user._id, successUserInfo._id)  // peerId id_id
          if (!peerMap[peerId]) {
            createPeerConnection(peerId, localStream.current!); // 创建p2p连接
            startNegotiate(peerId, successUserInfo._id);
          }
        }
      })
    };
  }

  const onUserReject = (data: RejectMessageType) => {
    const { userId } = data;
    const newMemberList = memberList.map((user) => {
      return {
        ...user,
        status: user._id === userId ? UserStatus.REJECTED : user.status,
      }
    })
    setMemberList(newMemberList);
  }

  const currentUserJoin = async (userInfo: any, users: UsersList) => {
    console.log("当前用户已入会");
    handleJoinedMember(users);
    try {
      const stream: MediaStream = await getUserMediaStream('camera', {
        video: { facingMode: "user" },
        audio: true
      });
      setDevicePermission(true);
      localStream.current = stream;
      handleDeviceStatus("video", false)  // 入会默认关闭摄像头
      handleDeviceStatus("audio", false)
      playStreamTo('user', stream);
      return Promise.resolve();
    } catch (err) {
      setDevicePermission(false)
      console.log(err);
      return Promise.reject();
    }
  }

  const otherUserJoin = (userInfo: any, users: UsersList) => {
    console.log(`用户${userInfo.username}已入会`);
    handleJoinedMember(users);
  }

  const handleJoinedMember = (users: UsersList) => {  // 更新入会用户列表
    const newMemberList = users.filter((user) => user._id !== userInfo._id);
    setMemberList(newMemberList)
  }

  const onQuit = () => { // 结束/退出会议
    const isCreator = creator._id === userInfo._id;
    openQuitModal(isCreator, () => {
      closeLocalStream();
      if (isCreator) {
        socket.emit(EventType.END_MEETING, meetingId);
      } else {
        socket.emit(EventType.LEAVE_MEETING, { meetingId, userId: userInfo._id })
      }
    })
  }

  const onUserLeave = ({ users }: { users: UsersList }) => {
    handleJoinedMember(users)
  }

  const onGetMeetingEnd = (getMeedingId: string) => { // 接收到会议结束消息
    message.info("会议已结束");
    closeLocalStream();
  }

  const onSubmitMessage = (data: MeetingMessageData) => {
    // setMsgList(preList => ([...preList, data]));
    Object.keys(peerMap).forEach(peerId => {
      const { dataChannel } = peerMap[peerId];
      dataChannel.send(JSON.stringify(data));
    });
    // let timer = setTimeout(() => {
    //   setMsgList(preList => preList.filter(item => item.mid !== data.mid));
    //   clearTimeout(timer);
    // }, 5000)
  };

  const handleDeviceStatus = useCallback((
    device: "audio" | "video",
    enable: boolean,
    needEmit: boolean = false
  ) => {  // 关闭/打开 摄像头/麦克风
    const tracks = localStream.current?.getTracks() || [];
    if (tracks.length > 0) {
      tracks.forEach((track) => {
        if (track.kind === device) {
          track.enabled = enable;
        }
      })
    }
    if (device === "audio") {
      setAudioEnable(enable);
    } else {
      setCameraEnable(enable);
    }
    needEmit && socket.emit(EventType.DEVICE_STATUS_CHANGE, { // 通知其他用户
      meetingId,
      userId: userInfo._id,
      device,
      enable,
    })
  }, [localStream.current]);

  const onUserDeviceChange = (data: DeviceStatusMessage) => {
    const { userId, device, enable } = data;
    const newMemberList = memberList.map((member) => {
      if (member._id === userId) {
        if (device === "video") {
          member.cameraEnable = enable;
        } else {
          member.audioEnable = enable;
        }
      }
      return member;
    })
    setMemberList(newMemberList);
  }

  const closeLocalStream = useCallback(async () => {  // 关闭视频流通道
    localStream.current!.getTracks().forEach(track => track.stop());
  }, [localStream.current])

  const openQuitModal = useCallback((isEnd: boolean, onOk: () => void) => {
    quitModalApi.confirm({
      title: isEnd ? "会议结束" : "退出会议",
      content: <div>{isEnd ? "会议结束后，所有人将被移出会议" : "确定要退出当前会议？"}</div>,
      icon: null,
      mask: false,
      okText: isEnd ? "结束会议" : "退出",
      cancelText: "取消",
      cancelButtonProps: { danger: true, type: "primary" },
      onOk,
    })
  }, [closeLocalStream])

  const loadMeetingInfo = () => {
    ApiHelper.loadMeetingInfo({ meetingId: meetingId || "" })
      .then((info: any) => {
        setMeetingInfo(info);
      })
  }

  const handleSocketEvent = (type: "mount" | "unmount") => {
    const trigger = type === "mount" ? "on" : "off";
    socket[trigger](EventType.JOINED_MEETING, onUserJoin);  // 用户加入
    socket[trigger](EventType.REJECT_INVITE, onUserReject); // 用户拒绝
    socket[trigger](EventType.DEVICE_STATUS_CHANGE, onUserDeviceChange) // 用户设备开启/关闭
    socket[trigger](EventType.LEAVE_MEETING, onUserLeave) // 有用户退出会议
    socket[trigger](EventType.END_MEETING, onGetMeetingEnd) // 主持人结束会议
  }

  useEffect(() => {
    if (!isEmpty(meetingInfo)) {
      socket.emit(
        role === RoleType.CREATOR ? EventType.CREATE_MEETING : EventType.JOIN_MEETING,
        {
          meetingId,
          meetingInfo,
          userInfo,
        }
      );
    }
  }, [meetingInfo]);

  useEffect(() => {
    handleSocketEvent("mount");
    return () => {
      handleSocketEvent("unmount");
    }
  }, [memberList])

  useEffect(() => {
    loadMeetingInfo();
    return () => {
      // 销毁peer 断开媒体流
      Object.keys(peerMap).forEach((peerId) => {
        destoryPeerConnection(peerId);
      });
      localStream.current?.getTracks().forEach(track => track.stop());
    };
  }, [])

  return <Wrapper>
    <TitleWrapper>
      <div className="title">{creator.nickname}发起的会议-{meetingName}</div>
      <div className="member-num">{joinedMemberList.length + 1}人在会议中</div>
    </TitleWrapper>
    <VideoWrapper>
      <video id={'user'} autoPlay />
      {
        (!devicePermission || !cameraEnable) && <SelfNoVideo>
          <UserAvator
            nickname={userInfo?.nickname || ""}
            status={UserStatus.JOINED} />
        </SelfNoVideo>
      }
      <MeetingToolList
        meetingCreator={creator}
        cameraEnable={cameraEnable}
        audioEnable={audioEnable}
        extraOptions={ExtraOptionList}
        onClickQuick={onQuit}
        onChangeDeviceStatus={handleDeviceStatus} />
      <MeetingChatBox
        offset={{ bottom: 67 }}
        messageList={msgList}
        onSend={onSubmitMessage} />
    </VideoWrapper>
    <MemberWrapper>
      {
        !isEmpty(memberList) && memberList.map((member: UserData) => {
          const isJoined = member.status === UserStatus.JOINED;
          const videoId = formatPeerId(member._id, userInfo._id);
          return <MemberItem key={member._id}>
            <video id={videoId} autoPlay />
            {(!isJoined || !member.cameraEnable) && <MemberNoVideo>
              <UserAvator nickname={member.nickname} status={member.status} />
            </MemberNoVideo>}
            <div className={"name-tag"}>
              <CIcon value={`icon-audio${member.audioEnable ? "" : "-static"}`} size={16} color="#fff" />
              <div className="nickname">{member.nickname}</div>
            </div>
          </MemberItem>
        })
      }
    </MemberWrapper>
    {quitModalContext}
  </Wrapper>
}

export default VideoMeeting;

const Wrapper = styled.div`
  & {
    position: relative;
    display: flex;
    width: 100%;
    height: 100vh;
  }
`
const TitleWrapper = styled.div`
  & {
    display: flex;
    align-items: center;
    gap: 15px;
    box-sizing: border-box;
    width: 100%;
    height: 40px;
    padding: 0 20px;
    position: absolute;
    top: 0;
    left: 0;
    color: #fff;
    font-size: 14px;
    background: #333;
    border-bottom: 2px solid #000;
  }
`
const VideoWrapper = styled.div`
  & {
    position: relative;
    display: flex;
    width: 80%;
    background: #333;
    margin-top: 40px;
    video {
      object-fit: fill;
      margin: 0 auto;
      width: 80%;
      height: calc(100vh - 40px - 65px);
    }
  }
`
const MemberWrapper = styled.div`
  & {
    margin-top: 40px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    width: 20%;
    height: calc(100vh - 40px);
    overflow-y: scroll;
    background: #000;
  }
`
const MemberItem = styled.div`
  & {
    box-sizing: border-box;
    position: relative;
    width: 100%;
    height: 210px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    video {
      object-fit: fill;
      width: 100%;
      height: 100%;
    }
    .name-tag {
      display: flex;
      align-items: center;
      position: absolute;
      left: 8px;
      bottom: 8px;
      background: rgba(0,0,0,.5);
      color: #fff;
      font-size: 12px;
      padding: 4px 8px 4px 4px;
      border-radius: 4px;
      .nickname {
        margin-left: 2px;
      }
    }
  }
`
const SelfNoVideo = styled.div`
  & {
    user-select: none;
    position: absolute;
    top: 0;
    bottom: 67px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 40px;
    color: #fff;
    background: #222;
  }
`
const MemberNoVideo = styled(SelfNoVideo)`
  & {
    bottom: 0;
    box-sizing: border-box;
    background: rgb(65, 65, 65);
    font-size: 28px;
  }
`
const UserHeader = styled.div`
  & {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    overflow: hidden;
  }
`
const StatusLayout = styled.div`
  & {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: 0;
    width: 72px;
    height: 72px;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.7);
  }
`