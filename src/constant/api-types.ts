import { ApplyStatusEnum } from '@constant/relationship-types';
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
  FRIEND_LIST = "/user/friend/list", // 好友列表
  CHANGE_FRIEND_STATUS = "/user/friend/changeStatus",  // 同意/拒绝 好友申请
  DELETE_FRIEND = "/user/friend/deleteFriend",  // 删除好友

  CREATE_GROUP = '/group/create', // 创建群聊
  LOAD_GROUP_INFO = '/group/loadGroupInfo', // 加载群信息
  LOAD_GROUP_LIST = '/group/loadGroupList', // 加载群聊
  LOAD_GROUP_USERS = '/group/loadGroupUsers', // 加载群用户列表
  QUIT_GROUP = '/group/quitGroup', // 退出群聊
  DISBANED_GROUP = '/group/disbandGroup', // 解散群聊
  INVITE_GROUP_USERS = '/group/inviteGroupUsers', // 发起申请添加用户
  UPDATE_GROUP_INFO = '/group/updateGroupInfo', // 更新群信息

  CREATE_MEETING = "/meeting/create", // 创建会议
  LOAD_MEETING_INFO = "/meeting/getInfo", // 获取会议信息

  LOAD_FRIEND_NOTIFICATION = "/notification/loadFriendNotifications",  // 好友通知
  DELETE_FRIEND_NOTIFICATION = "/notification/deleteFriendNotification", // 删除好友申请通知记录
  LOAD_GROUP_NOTIFICATIONS = '/notification/loadGroupNotifications', // 加载群邀请通知
  DELETE_GROUP_NOTIFICATION = '/notification/deleteGroupNotification',   // 删除群邀请通知记录

  LOAD_USER_CONTACT_LIST = '/contacts/user-contact-list',  // 聊天栏用户列表
  LOAD_USER_CONTACT = '/contacts/loadUserContact', // 加载某个聊天关系
  CREATE_USER_CONTACT = '/contacts/createUserContact', //创建用户 1对1 聊天关系
  CREATE_GROUP_CONTACT = '/contacts/createGroupContact', // 创建用户 => 群聊 1对1 关系
  LOAD_GROUP_CONTACT_LIST = '/contacts/loadGroupContactList', // 加载群聊天栏列表
  LOAD_GROUP_CONTACT = '/contacts/loadGroupContact',// 加载群聊天栏 群聊 1对1 关系
  DELETE_USER_CONTACT = '/contacts/deleteUserContact',  // 删除用户聊天栏
  DELETE_GROUP_CONTACT = '/contacts/deleteGroupContact', // 删除群聊天栏

  LOAD_USER_MESSAGE_LIST = '/message/loadUserMessageList', // 用户-消息记录
  LOAD_GROUP_MESSAGE_LIST = '/message//loadGroupMessageList', // 群-消息记录
  LOAD_ALL_UNREAD_NUM = '/message/loadAllUnreadMesageNum',  // 未读消息数

  UPLOAD_IMAGE = '/upload/image', // 上传图片
}

export interface UserContactsParamsType {
  userId: string
}
export interface LoadGroupContactListParamsType extends UserContactsParamsType {}
export interface LoadUserInfoParamsType extends UserContactsParamsType {}
export interface LoadFriendListParamsType extends UserContactsParamsType {}
export interface LoadFriendNotificationsParamsType extends UserContactsParamsType {}
export interface LoadGroupListParamsType extends UserContactsParamsType {}
export interface LoadGroupNotificationsParamsType extends UserContactsParamsType {}
export interface LoadAllUnreadMesageNumParamsType extends UserContactsParamsType {}

export interface RegisterParamsType {
  nickname: string,
  username: string,
  password: string,
  gender: GenderEnum,
  avatarImage: string,
  email?: string,
  phoneNumber?: string,
}
export interface CreateUserContactParamsType{
  fromId: string
  toId: string
}
export interface UserMsgListParamsType  extends CreateUserContactParamsType {
  limitTime: Date
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
  changeStatus: ApplyStatusEnum,
}
export interface ChangeGroupStatusParamsType extends ChangeFriendStatusParamsType {}
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
  keyWord?: string,
  groupId: string,
}
export interface LoadGroupInfoParamsType extends LoadGroupUsersParamsType {}
export interface DisbandGroupParamsType extends LoadGroupUsersParamsType {}
export interface LoadGroupMsgListParamsType extends LoadGroupUsersParamsType {
  limitTime: Date,
}
export interface QuitGroupParamsType extends LoadGroupUsersParamsType {
  userId: string
}
export interface InviteGroupUsersParamsType extends LoadGroupUsersParamsType {
  userList: string[],
}
export interface CreateGroupContactParamsType extends QuitGroupParamsType {}
export interface LoadGroupContactParamsType extends QuitGroupParamsType {}
export interface DeleteFriendParamsType {
  userId: string,
  friendId: string,
}
export interface DeleteGroupNotificationParamsType {
  nid: string
}
export interface DeleteFriendNotificationParamsType extends DeleteGroupNotificationParamsType {}

export interface UpdateGroupInfoParamsType {
  groupId: string
  groupName?: string,
  sign?: string
}