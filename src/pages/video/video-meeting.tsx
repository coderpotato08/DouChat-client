import { 
  MutableRefObject, 
  useCallback, 
  useEffect, 
  useMemo, 
  useRef, 
  useState,
} from "react";
import { useLocation, useParams } from "react-router-dom";
import styled from "styled-components";
import { EventType } from "@constant/socket-const";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/index";
import { 
  DeviceEnum,
  DeviceStatusMessage,
  ICEMessage, 
  JoinedData, 
  OptionsEnum, 
  RejectMessageType, 
  RoleType, 
  SDPMessage, 
  UserData, 
  UsersList,
  UserStatus,
} from "@constant/meeting-const";
import { ApiHelper } from "@helper/api-helper";
import { isEmpty } from "lodash"
import { Avatar, Button, Modal, message } from "antd";
import { useSocket } from "@store/context/createContext";
import CIcon from "@components/c-icon";
import { getQuery } from "@helper/common-helper";

const UserStatusLabel =  {
  [UserStatus.CALLING]: "呼叫中",
  [UserStatus.REJECTED]: "已拒绝",
  [UserStatus.QUIT]: "已退出",
}
const ExtraOptionList = [
  {title: "邀请", key: OptionsEnum.INVITE, icon: `icon-invite`},
  {title: "成员", key: OptionsEnum.MEMBERS, icon: `icon-members`},
  {title: "共享屏幕", key: OptionsEnum.SCREEN_SHARE, icon: `icon-screen-share`},
]

//这里使用了几个公共的stun协议服务器
const config: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ]
};

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
         <CIcon value="icon-guaduan" size={32} color="#fff"/>
      }
      {UserStatusLabel[props.status!]}
    </StatusLayout>}
  </UserHeader>
}

const VideoMeeting = () => {
  const userInfo = useAppSelector(userSelector);
  const { role } = getQuery();
  const { id: meetingId } = useParams();
  const socket = useSocket();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const { current: peerMap }: MutableRefObject<Record<string, RTCPeerConnection>> = useRef({});
  const localStream: MutableRefObject<MediaStream | null> = useRef(null);  // 当前用户视频流
  const [ audioEnable, setAudioEnable ] = useState<boolean>(false); // 麦克风是否开启
  const [ cameraEnable, setCameraEnable ] = useState<boolean>(false)  // 摄像头是否开启
  const [ devicePermission, setDevicePermission ] = useState<boolean>(false) // 设备授权
  const [ meetingInfo, setMeetingInfo ] = useState<any>({});
  const [ memberList, setMemberList ] = useState<UsersList>([]);  // 用户列表
  const { creator = {}, meetingName, isJoinedMuted } = meetingInfo;
  const joinedMemberList = useMemo(() => {
    if(memberList && memberList.length > 0) {
      return memberList.filter((member) => member.status === UserStatus.JOINED)
    }
    return []
  }, [memberList])
  // 设置媒体流
  const playStreamTo = useCallback((eleId: string, media: MediaStream) => {
    const ele = document.getElementById(eleId);
    if(ele) {
      (ele as HTMLVideoElement).srcObject = media;
    }
  }, []);

  // 处理peerId
  const formatPeerId = useCallback((id_a: string, id_b: string) => {
    let arr = [id_a, id_b];
    return arr.sort().join("_")
  }, [])

  const createRTCp2pConnection = (obj: {peerId: string}) => {
    const peer = new RTCPeerConnection(config);
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit(EventType.ICE_CANDIDATE, {
          candidate: e.candidate,
          peerId: obj.peerId,
          meetingId,
        })
      }
    }
    peer.ontrack = (e) => {
      console.log(`[RTC]：有其他客户端的媒体流加入，ID：${obj.peerId}`);
      const stream = e.streams[0];
      playStreamTo(obj.peerId, stream);
    };
    peer.onconnectionstatechange = (e) => {
      console.log('[RTC]：ICE connection state change');
    }
    const tracks = localStream.current!.getTracks();
    if(tracks && tracks.length > 0) {
      tracks.forEach((track: MediaStreamTrack) => {
        peer.addTrack(track, localStream.current!);
      })
    }
    peerMap[obj.peerId] = peer
  };

  const emitUserEnter = () => {   // 会议创建者/参与者入会，通知signal server
    let eventType;
    if(role === RoleType.CREATOR) {
      eventType = EventType.CREATE_MEETING;
    } else {
      eventType = EventType.JOIN_MEETING;
    }
    socket.emit(eventType, {
      meetingId,
      meetingInfo,
      userInfo,
    })
  }

  const createOffer = async (peerId: string, peer: RTCPeerConnection) => {
    //发送offer，发送本地session描述
    const desc = await peer.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })
    peer.setLocalDescription(desc)
      .then(() => {
        socket.emit(EventType.SEND_OFFER, {
          sdp: peer.localDescription, 
          meetingId, 
          peerId
        });
      })
      .catch((err) => console.log(err))
  }

  const onUserJoin = async (data: JoinedData) => { // 用户入会
    const { users, userInfo: successUserInfo } = data;
    if(successUserInfo._id === userInfo._id) {
      await currentUserJoin(successUserInfo, users); // 当前用户已入会
    } else {
      otherUserJoin(successUserInfo, users); // 其他成员入会
    };
    const joinedUsers = users.filter((user) => user.status === UserStatus.JOINED)
    if(joinedUsers.length > 1) {
      joinedUsers.forEach((user: UserData) => {
        const peerId = formatPeerId(user._id, userInfo._id)  // peerId id_id
        if(!peerMap[peerId] && user._id !== userInfo._id) {
          createRTCp2pConnection({peerId}); // 创建p2p连接
        }
      })
    }
    if(successUserInfo._id === userInfo._id) {
      const keys = Object.keys(peerMap);
      for(let peerId of keys) {
        if(peerId === userInfo._id) continue;
        createOffer(peerId, peerMap[peerId])
      }
    }
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

  const onGetSendOffer = (data: SDPMessage) => {  // 接收到其他客户端传来的offer
    const { sdp, meetingId, peerId } = data;
    if(peerMap[peerId]) {
      const toPeer = peerMap[peerId];
      toPeer.setRemoteDescription(sdp)
        .then(async () => {
          const desc = await toPeer.createAnswer();
          await toPeer.setLocalDescription(desc);
          socket.emit(EventType.ANSWER_OFFER, {
            sdp: toPeer.localDescription,
            meetingId,
            peerId
          })
        })
        .catch((err) => console.log(err))
    }
  }

  const onGetAnswerOffer = (data: SDPMessage) => {  // 接收到其他客户端传来的answer
    const { sdp, meetingId, peerId } = data;
    if(peerMap[peerId]) {
      peerMap[peerId].setRemoteDescription(sdp)
        .catch(err => console.log(err));
    }
  }

  const onGetIceCandidate = (data: ICEMessage) => { // 接受ice候选
    const { candidate, peerId } = data;
    if(peerMap[peerId]) {
      peerMap[peerId].addIceCandidate(candidate)
        .catch(err => console.log(err));
    }
  }

  const currentUserJoin = async (userInfo: any, users: UsersList) => {
    console.log("当前用户已入会");
    handleJoinedMember(users);
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }, 
        audio: true 
      });
      setDevicePermission(true);
      localStream.current = stream;
      handleDeviceStatus("video", false)  // 入会默认关闭摄像头
      handleDeviceStatus("audio", false) 
      playStreamTo('user', stream);
    } catch(err) {
      setDevicePermission(false)
      console.log(err);
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
      if(isCreator) {
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

  const handleDeviceStatus = useCallback((
    device: "audio" | "video", 
    enable: boolean, 
    needEmit: boolean = false
  ) => {  // 关闭/打开 摄像头/麦克风
    const tracks = localStream.current?.getTracks() || [];
    if(tracks.length > 0) {
      tracks.forEach((track) => {
        if(track.kind === device) {
          track.enabled = enable;
        }
      })
    }
    if(device === "audio") {
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
      if(member._id === userId) {
        if(device === "video") {
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
    modalApi.confirm({
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
    socket[trigger](EventType.DEVICE_STATUS_CHANGE, onUserDeviceChange)
    socket[trigger](EventType.LEAVE_MEETING, onUserLeave) // 有用户退出会议
    socket[trigger](EventType.END_MEETING, onGetMeetingEnd) // 主持人结束会议
    socket[trigger](EventType.SEND_OFFER, onGetSendOffer);  // p2p sdp offer
    socket[trigger](EventType.ANSWER_OFFER, onGetAnswerOffer);    // p2p sdp answer
    socket[trigger](EventType.ICE_CANDIDATE, onGetIceCandidate);  // p2p ice
  }

  useEffect(() => {
    if(!isEmpty(meetingInfo)) {
      emitUserEnter();
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
      // onQuit()
    }
  }, [])

  return <Wrapper>
    <TitleWrapper>
      <div className="title">{creator.nickname}发起的会议-{meetingName}</div>
      <div className="member-num">{joinedMemberList.length + 1}人在会议中</div>
    </TitleWrapper>
    <VideoWrapper>
      <video id={'user'} autoPlay/> 
      {
        (!devicePermission || !cameraEnable) && <SelfNoVideo>
          <UserAvator nickname={userInfo.nickname} status={UserStatus.JOINED}/>
        </SelfNoVideo>
      }
      <OptionsWrapper>
        <div className={"device-list"}>
          <OptionsItem onClick={() => handleDeviceStatus("video", !cameraEnable, true)}>
            <CIcon value={`icon-camera${cameraEnable ? "" : "-static"}`} 
                   size={28} 
                   color="#fff"/>
            摄像头
          </OptionsItem>
          <OptionsItem onClick={() => handleDeviceStatus("audio", !audioEnable, true)}>
            <CIcon value={`icon-audio${audioEnable ? "" : "-static"}`} 
                   size={28} 
                   color="#fff"/>
            麦克风
          </OptionsItem>
        </div>
        {
          ExtraOptionList.map((opt) => {
            const extraTitle = opt.key === OptionsEnum.MEMBERS ? `(${joinedMemberList.length})` : ""
            return <OptionsItem key={opt.key}>
              <CIcon value={opt.icon} size={28} color="#fff"/>
              {opt.title}{extraTitle}
            </OptionsItem>
          })
        }
        <Button danger 
                type={"primary"} 
                className={"cancel"} 
                onClick={onQuit}>
          {creator?._id === userInfo._id ? "结束会议" : "退出会议"}
        </Button>
      </OptionsWrapper>
    </VideoWrapper>
    <MemberWrapper>
      {
        !isEmpty(memberList) && memberList.map((member: UserData) => {
          const isJoined = member.status === UserStatus.JOINED;
          const videoId = formatPeerId(member._id, userInfo._id);
          return <MemberItem key={member._id}>
            <video id={videoId} autoPlay/>
            {(!isJoined || !member.cameraEnable) && <MemberNoVideo>
              <UserAvator nickname={member.nickname} status={member.status}/>
            </MemberNoVideo>}
            <div className={"name-tag"}>
              <CIcon value={`icon-audio${member.audioEnable ? "" : "-static"}`} size={16} color="#fff"/>
              <div className="nickname">{member.nickname}</div>
            </div>
          </MemberItem>
        })
      }
    </MemberWrapper>
    {modalContextHolder}
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
const OptionsWrapper = styled.div`
  & {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 65px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 26px;
    border-top: 2px solid #000;
    background: #333;
    .device-list {
      display: flex;
      gap: 20px;
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
    }
    .cancel {
      position: absolute;
      right: 8px;
      bottom: 12px;
    }
  }
`
const OptionsItem = styled.div`
  & {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 12px;
    .device-icon {
      position: relative;
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
    bottom: 0;
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