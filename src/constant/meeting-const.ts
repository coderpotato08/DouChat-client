export enum RoleType {
  CREATOR = 'creator',
  PARTICIPANT = 'participant'
}

export type UserData = {
  _id: string,
  type: RoleType,
  nickname: string,
  avatarImage: string,
  socketId?: string,
  status: UserStatus,
  audioEnable: boolean,
  cameraEnable: boolean,
}

export enum UserStatus {  // 用户接听状态
  CALLING,  // 呼叫中
  REJECTED, // 已拒绝
  JOINED, // 已入会
  QUIT, // 已退出
}

export enum DeviceEnum {
  CAMERA = 'camera',
  AUDIO = 'audio',
}

export enum OptionsEnum {
  INVITE = "invite",
  MEMBERS = "members",
  SCREEN_SHARE = "screen-share",
}

export interface JoinedData {
  users: Array<UserData>,
  userInfo: any,
  socketId: string,
}
export type UsersList = JoinedData['users'];

export type RejectMessageType = {
  meetingId: string,
  userId: string
}
export type BaseMessageType = {
  meetingId: string,
  peerId: string,
}
export type SDPMessage = {
  sdp: RTCSessionDescription
} & BaseMessageType

export type ICEMessage = {
  candidate: RTCIceCandidate
} & BaseMessageType

export type DeviceStatusMessage = {
  meetingId: string,
  userId: string,
  device: "audio" | "video",
  enable: boolean,
}