import { FriendApplyStatusEnum } from '@constant/friend-types';
import { GenderEnum } from './user-types';
export const socketHost = "http://localhost:3040" // 聊天室socket
export const meetingSocketHost = "http://localhost:3050"  // 视频会议socket
export const avatarUrl = "https://api.multiavatar.com"   // multiavatar 获取随机头像
export enum ApiEnum {
  LOGIN = "/user/login", // 登陆
  REIGSTER = "/user/register",  // 注册
  SEARCH_USERS = "/user/search", // 模糊查询用户
  LOAD_USER_INFO = "/user/loadUserInfo", // 加载用户信息
  ADD_FRIEND = "/user/add-friend", // 添加用户
  FRIEND_NOTIFICATION = "/user/friend/notification",  // 好友通知
  FRIEND_LIST = "/user/friend/list", // 好友列表
  CHANGE_FRIEND_STATUS = "/user/friend/changeStatus",  // 同意/拒绝 好友申请
  DELETE_FRIEND = "/user/friend/deleteFriend",  // 删除好友

  CREATE_GROUP = '/group/create', // 创建群聊
  LOAD_GROUP_LIST = '/group/loadGroupList', // 加载群聊
  LOAD_GROUP_USERS = '/group/loadGroupUsers', // 加载群用户列表
  QUIT_GROUP = '/group/quitGroup', // 退出群聊
  DISBANED_GROUP = '/group/disbandGroup', // 解散群聊

  CREATE_MEETING = "/meeting/create", // 创建会议
  LOAD_MEETING_INFO = "/meeting/getInfo", // 获取会议信息

  LOAD_USER_CONTACT_LIST = '/contacts/user-contact-list',  // 聊天栏用户列表
  LOAD_USER_CONTACT = '/contacts/loadUserContact', // 加载某个聊天关系
  CREATE_GROUP_CONTACT = '/contacts/createGroupContact', // 创建用户 => 群聊 1对1 关系
  LOAD_GROUP_CONTACT_LIST = '/contacts/loadGroupContactList', // 加载群聊天栏列表

  LOAD_USER_MESSAGE_LIST = '/message/userMessageList', // 用户-消息记录

  UPLOAD_IMAGE = '/upload/image', // 上传图片
}

export interface UserContactsParamsType {
  userId: string
}

export interface RegisterParamsType {
  nickname: string,
  username: string,
  password: string,
  gender: GenderEnum,
  avatarImage: string,
  email?: string,
  phoneNumber?: string,
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

export interface ChangeFriendStatusParamsType {
  id: string,
  changeStatus: FriendApplyStatusEnum,
}

export interface LoadUserContactParamsType {
  contactId: string,
}

export interface CreateGroupParamsType {
  users: string[],
  creator: string,
  groupName: string,
  groupNumber: number,
  sign?: string,
}

export interface LoadGroupUsersParamsType {
  groupId: string,
}

export interface QuitGroupParamsType extends LoadGroupUsersParamsType {
  userId: string
}
export interface DeleteFriendParamsType {
  userId: string,
  friendId: string,
}
export interface CreateGroupContactParamsType extends QuitGroupParamsType {}
export interface DisbandGroupParamsType extends LoadGroupUsersParamsType {}
export interface LoadGroupContactListParamsType extends UserContactsParamsType {}
export interface LoadUserInfoParamsType extends UserContactsParamsType {}
export interface LoadFriendListParamsType extends UserContactsParamsType {}
export interface LoadFriendNotificationsParamsType extends UserContactsParamsType {}
export interface LoadGroupListParamsType extends UserContactsParamsType {}