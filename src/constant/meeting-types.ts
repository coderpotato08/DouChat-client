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

/** 用户接听状态 */ 
export enum UserStatus {  
  CALLING,  // 呼叫中
  REJECTED, // 已拒绝
  JOINED, // 已入会
  QUIT, // 已退出
}

/** 设备类型 */
export enum DeviceEnum {
  CAMERA = 'camera',
  AUDIO = 'audio',
}

/** 会议底部菜单项枚举 */
export enum OptionsEnum {
  INVITE = "invite",
  MEMBERS = "members",
  SCREEN_SHARE = "screen-share",
}

/** 拒绝入会报文 */
export interface JoinedData {
  users: Array<UserData>,
  userInfo: any,
  socketId: string,
}
/** 用户列表 */
export type UsersList = JoinedData['users'];

/** 拒绝入会报文 */
export type RejectMessageType = {
  meetingId: string,
  userId: string
}
/** socket报文基本信息 */
export type BaseMessageType = {
  meetingId: string,
  peerId: string,
}
/** sdp报文 */
export type SDPMessage = {
  sdp: RTCSessionDescription
} & BaseMessageType

/** ice */
export type ICEMessage = {
  candidate: RTCIceCandidate
} & BaseMessageType

/** 用户设备开启/关闭报文 */
export type DeviceStatusMessage = {
  meetingId: string,
  userId: string,
  device: "audio" | "video",
  enable: boolean,
}

/** 会议内置聊天报文类型 */
export enum MeetingMessageTypeEnum {
  TEXT = "text",
  NOTICE = "notice",
}
/** 会议内置聊天报文 */
export type MeetingMessageData = {
  mid: string,
  type: MeetingMessageTypeEnum,
  content: string,
  name: string,
}