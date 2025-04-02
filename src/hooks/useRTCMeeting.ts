import { ICEMessage, SDPMessage } from "@constant/meeting-types";
import { EventType } from "@constant/socket-types";
import { useSocket } from "@store/context/createContext";
import { isEmpty } from "lodash";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useCallbackRef } from "./useCallbackRef";
import { getFromToByPeerId } from "@helper/user-helper";

export type PeerConnectionData = {
  peer: RTCPeerConnection;
  dataChannel: RTCDataChannel;
};

export type DataChannelConfig = {
  onMessage: (data: any) => void;
};

/** 建立RTC链接相关参数 */
export type PeerConfig = {
  /** STUN/TURN 服务器配置 */
  stunConfig?: RTCConfiguration;
  /** 媒体轨道监听到媒体设备加入后回调 */
  onAddStream: (eleId: string, stream: MediaStream) => void;
};

export type RTCMeetingResult = {
  peerMap: Record<string, PeerConnectionData>,
  createPeerConnection: (peerId: string, localStream: MediaStream) => void,
  destoryPeerConnection: (peerId: string) => void,
  startNegotiate: (peerId: string, joinUserId: string) => void
};

const defaultStunConfig: RTCConfiguration = {
  iceServers: [
    // { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "stun:118.31.173.162:3478",
      username: "testpotato1",
      credential: "testpotato1",
    }
  ],
};

export const useRTCMeeting = (
  meetingId: string,
  config: {
    peer: PeerConfig;
    dataChannel: DataChannelConfig;
  }
): RTCMeetingResult => {
  const socket = useSocket();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const {
    current: peerMap,
  }: MutableRefObject<Record<string, PeerConnectionData>> = useRef({});

  const {
    peer: { stunConfig, onAddStream },
    dataChannel: { onMessage },
  } = config;

  const createPeerConnection = useCallbackRef((peerId: string, currStream: MediaStream) => {
    setLocalStream(currStream);
    if (!isEmpty(peerMap[peerId])) {
      return;
    }
    const channelKey = `_channel_${peerId}`;
    const peer = new RTCPeerConnection(stunConfig || defaultStunConfig);
    // 创建信道
    const dataChannel = peer.createDataChannel(channelKey, {
      id: 0,
      negotiated: true,
    });
    dataChannel.onopen = () => {
      console.log("[RTC]：Channel opened");
    };
    dataChannel.onclose = () => {
      console.log("[RTC]：Channel closed");
    };
    dataChannel.onmessage = (e) => {
      const data = JSON.parse(e.data);
      onMessage(data);
    };
    peer.ondatachannel = () => {
      console.log("ondatachannel");
    };
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit(EventType.ICE_CANDIDATE, {
          peerId,
          candidate: e.candidate,
          meetingId,
        });
      }
    };
    peer.ontrack = (e) => {
      console.log(`[RTC]：有其他客户端的媒体流加入，ID：${peerId}`);
      const stream = e.streams[0];
      onAddStream(peerId, stream);
    };
    peer.onconnectionstatechange = (e) => {
      console.log("[RTC]：ICE connection state change");
    };
    const tracks = currStream?.getTracks();
    if (tracks && tracks.length > 0) {
      tracks.forEach((track: MediaStreamTrack) => {
        peer.addTrack(track, currStream!);
      });
    }
    peerMap[peerId] = { peer, dataChannel };
  });

  const destoryPeerConnection = useCallbackRef((peerId: string) => {
    const peer = peerMap[peerId]?.peer;
    if (peer) {
      peer.close();
      delete peerMap[peerId];
    }
  });

  /** 开始和对端SDP协商 建立链接 */
  const createOffer = useCallbackRef(
    async (peerId: string, joinUserId: string) => {
      const peer = peerMap[peerId]?.peer;
      const fromTo = getFromToByPeerId(peerId, joinUserId);
      //发送offer，发送本地session描述
      const desc = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      console.log(`[RTC] [peerId: ${peerId}]：准备发送offer status: ${peer.signalingState}`);
      peer
        .setLocalDescription(desc)
        .then(() => {
          console.log(`[RTC] [peerId: ${peerId}]：发送offer完成 status: ${peer.signalingState}`);
          socket.emit(EventType.SEND_OFFER, {
            sdp: peer.localDescription,
            meetingId,
            peerId,
            ...fromTo,
          });
        })
        .catch((err) => console.log(err));
    }
  );

  /** 接收到其他客户端传来的offer */
  const onGetSendOffer = useCallbackRef((data: SDPMessage) => {
    const { sdp, meetingId, peerId, from, to } = data;
    if (peerMap[peerId]) {
      const toPeer = peerMap[peerId].peer;
      console.log(`[RTC] [peerId: ${peerId}]：准备发送answer status: ${toPeer.signalingState}`);
      toPeer
        .setRemoteDescription(sdp)
        .then(async () => {
          const desc = await toPeer.createAnswer();
          await toPeer.setLocalDescription(desc);
          console.log(`[RTC] [peerId: ${peerId}]：发送answer完成 status: ${toPeer.signalingState}`);
          socket.emit(EventType.ANSWER_OFFER, {
            sdp: toPeer.localDescription,
            meetingId,
            peerId,
            from: to,
            to: from,
          });
        })
        .catch((err) => console.log(err));
    }
  });

  /** 接收到其他客户端传来的answer */
  const onGetAnswerOffer = useCallbackRef((data: SDPMessage) => {
    const { sdp, meetingId, peerId } = data;
    if (peerMap[peerId]) {
      const toPeer = peerMap[peerId].peer;
      console.log(`[RTC] [peerId: ${peerId}]：准备接收answer status: ${toPeer.signalingState}`);
      toPeer
        .setRemoteDescription(sdp)
        .then(() => {
          console.log(`[RTC] [peerId: ${peerId}]：接收answer完成 status: ${toPeer.signalingState}`);
        })
        .catch((err) => console.log(err));
    }
  });

  /** 接收ice候选 */
  const onGetIceCandidate = useCallbackRef((data: ICEMessage) => {
    const { candidate, peerId } = data;
    if (peerMap[peerId]) {
      peerMap[peerId].peer
        .addIceCandidate(candidate)
        .catch((err) => console.log(err));
    }
  });

  const handleSocketEvent = useCallbackRef((type: "mount" | "unmount") => {
    const trigger = type === "mount" ? "on" : "off";
    socket[trigger](EventType.SEND_OFFER, onGetSendOffer); // p2p sdp offer
    socket[trigger](EventType.ANSWER_OFFER, onGetAnswerOffer); // p2p sdp answer
    socket[trigger](EventType.ICE_CANDIDATE, onGetIceCandidate); // p2p ice
  });

  useEffect(() => {
    handleSocketEvent("mount");
    return () => {
      handleSocketEvent("unmount");
    };
  }, [localStream]);

  return {
    peerMap, 
    createPeerConnection, 
    startNegotiate: createOffer,
    destoryPeerConnection,
  };
};
