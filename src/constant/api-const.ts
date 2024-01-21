export const socketHost = "http://localhost:3040" // 聊天室socket
export const meetingSocketHost = "http://localhost:3050"  // 视频会议socket

export enum ApiEnum {
  LOGIN = "/user/login", // 登陆
  SEARCH_USERS = "/user/search", // 查找用户
  ADD_FRIEND = "/user/add-friend", // 添加用户
  CREATE_MEETING = "/meeting/create", // 创建会议
  LOAD_MEETING_INFO = "/meeting/getInfo", // 获取会议信息
  LOAD_USER_CONTACT = '/contacts/user-contact-list',  // 聊天栏用户列表
  LOAD_USER_MESSAGE_LIST = '/message/user-list', // 用户-消息记录
  UPLOAD_IMAGE = '/upload/image', // 上传图片
}

export interface UserContactsParamsType {
  userId: string
}

export interface UserMsgListParamsType {
  fromId: string
  toId: string
}
export interface CreateMeetingParamsType {
  creator: any,
  meetingName: string,
  userList: Array<string>,
  isJoinedMuted: boolean,
  createTime: Date,
}

export interface LoadMeetingInfoParamsType {
  meetingId: string
}

export interface SearchUserParamsType {
  keyWord: string,
  currUserId: string
}

export interface AddFriendParamsType {
  userId: string,
  friendId: string,
}