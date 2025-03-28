import {
  ApiEnum,
  LoadMeetingInfoParamsType,
  CreateMeetingParamsType,
  UserContactsParamsType,
  SearchUserParamsType,
  AddFriendParamsType,
  LoadFriendNotificationsParamsType,
  ChangeFriendStatusParamsType,
  LoadFriendListParamsType,
  LoadUserInfoParamsType,
  LoadUserContactParamsType,
  CreateGroupParamsType,
  LoadGroupListParamsType,
  LoadGroupUsersParamsType,
  RegisterParamsType,
  QuitGroupParamsType,
  DisbandGroupParamsType,
  DeleteFriendParamsType,
  CreateGroupContactParamsType,
  LoadGroupContactListParamsType,
  LoadGroupContactParamsType,
  LoadGroupMsgListParamsType,
  InviteGroupUsersParamsType,
  LoadGroupNotificationsParamsType,
  DeleteGroupNotificationParamsType,
  DeleteFriendNotificationParamsType,
  CreateUserContactParamsType,
  LoadGroupInfoParamsType,
  UpdateGroupInfoParamsType,
  LoadAllUnreadMesageNumParamsType,
  ChatSearchParamsType,
  SearchMatchGroupMessageListParamsType,
  SearchMatchUserMessageListParamsType,
} from "@constant/api-types"
import { serviceRequest, SSEConfig } from "../service/index"
import { ApplyStatusEnum, FriendInfoType, GroupInfoType } from "@constant/relationship-types"
import { ContactInfoType, MessageTypeEnum, UserInfoType } from "@constant/user-types"
import { DsCompletionsParams } from "@constant/api/ai-chat-types"

export class ApiHelper {
  // 所有未读消息数加载
  public static loadAllUnreadNum = (params: LoadAllUnreadMesageNumParamsType) => {
    return serviceRequest.post<{
      userUnreadCount: number,
      groupUnreadCount: number
    }>(ApiEnum.LOAD_ALL_UNREAD_NUM, params);
  }
  // --------------- 视频聊天 ----------------------
  // 创建会议
  public static createMeeting = (params: CreateMeetingParamsType) => {
    return serviceRequest.post(ApiEnum.CREATE_MEETING, params);
  }

  // 加载会议信息
  public static loadMeetingInfo = (params: LoadMeetingInfoParamsType) => {
    return serviceRequest.post(ApiEnum.LOAD_MEETING_INFO, params);
  }
  // --------------- 群聊聊天 -----------------------
  // 创建群聊
  public static createGroup = (params: CreateGroupParamsType) => {
    return serviceRequest.post<{
      groupId: string,
      status: "success" | "fail"
    }>(ApiEnum.CREATE_GROUP, params);
  }

  // 创建用户 => 群聊 聊天1对1 关系
  public static createGroupContact = (params: CreateGroupContactParamsType) => {
    return serviceRequest.post<{
      contact: any,
      status: "success" | "fail"
    }>(ApiEnum.CREATE_GROUP_CONTACT, params);
  }

  // 创建用户 => 用户 聊天1对1 关系
  public static createUserContact = (params: CreateUserContactParamsType) => {
    return serviceRequest.post<{
      contact: any,
      status: "success" | "fail"
    }>(ApiEnum.CREATE_USER_CONTACT, params);
  }

  // 加载群聊天栏列表
  public static loadGroupContactList = (params: LoadGroupContactListParamsType) => {
    return serviceRequest.post<Array<{
      createTime: string,
      groupId: string,
      groupInfo: GroupInfoType,
      unreadNum: number,
      userId: string,
    }>>(ApiEnum.LOAD_GROUP_CONTACT_LIST, params);
  }

  // 加载群聊天栏 群聊 1对1 关系
  public static loadGroupContact = (params: LoadGroupContactParamsType) => {
    return serviceRequest.post<{
      createTime: string,
      groupId: string,
      groupInfo: GroupInfoType,
      unreadNum: number,
      userId: string,
    }>(ApiEnum.LOAD_GROUP_CONTACT, params);
  }

  // 加载群聊列表
  public static loadGroupList = (params: LoadGroupListParamsType) => {
    return serviceRequest.post<Array<{
      state: ApplyStatusEnum,
      time: string,
      userInfo: UserInfoType,
      groupInfo: GroupInfoType,
    }>>(ApiEnum.LOAD_GROUP_LIST, params)
  }

  // 加载群邀请通知
  public static loadGroupNotifications = (params: LoadGroupNotificationsParamsType) => {
    return serviceRequest.post<Array<{
      inviter: UserInfoType,
      groupInfo: GroupInfoType,
      userId: string,
      status: ApplyStatusEnum,
    }>>(ApiEnum.LOAD_GROUP_NOTIFICATIONS, params)
  }

  // 加载群信息
  public static loadGroupInfo = (params: LoadGroupInfoParamsType) => {
    return serviceRequest.post<{
      userList: Array<UserInfoType>
    } & GroupInfoType>(ApiEnum.LOAD_GROUP_INFO, params);
  }

  // 更新群信息
  public static updateGroupInfo = (params: UpdateGroupInfoParamsType) => {
    return serviceRequest.post(ApiEnum.UPDATE_GROUP_INFO, params);
  }

  // 加载群用户列表
  public static loadGroupUsers = (params: LoadGroupUsersParamsType) => {
    return serviceRequest.post<Array<UserInfoType>>(ApiEnum.LOAD_GROUP_USERS, params)
  }

  // 邀请群成员
  public static inviteGroupUsers = (params: InviteGroupUsersParamsType) => {
    return serviceRequest.post(ApiEnum.INVITE_GROUP_USERS, params)
  }

  // 退出群聊
  public static quitGroup = (params: QuitGroupParamsType) => {
    return serviceRequest.post(ApiEnum.QUIT_GROUP, params)
  }

  // 解散群聊
  public static disbandGroup = (params: DisbandGroupParamsType) => {
    return serviceRequest.post(ApiEnum.DISBANED_GROUP, params)
  }

  // 模糊查询群聊
  public static searchGroupList = (params: ChatSearchParamsType) => {
    return serviceRequest.post<Array<GroupInfoType & {
      usersAvaterList: string[],
      filterUserList: UserInfoType[],
    }>>(ApiEnum.SEARCH_GROUP_LIST, params)
  }

  // --------------- 私人聊天 -----------------------
  // 模糊查询用户
  public static loadUserInfo = (params: LoadUserInfoParamsType) => {
    return serviceRequest.post<UserInfoType>(ApiEnum.LOAD_USER_INFO, params)
  }
  public static searchUsers = (params: SearchUserParamsType) => {
    return serviceRequest.post(ApiEnum.SEARCH_USERS, params)
  }

  // 申请添加好友
  public static addFriend = (params: AddFriendParamsType) => {
    return serviceRequest.post(ApiEnum.ADD_FRIEND, params)
  }

  // 同意/拒绝 好友申请
  public static changeFriendStatus = (params: ChangeFriendStatusParamsType) => {
    return serviceRequest.post<{
      status: "success" | "fail",
      relationship: any
    }>(ApiEnum.CHANGE_FRIEND_STATUS, params)
  }

  // 移除好友
  public static deleteFriend = (params: DeleteFriendParamsType) => {
    return serviceRequest.post<{
      status: "success" | "fail",
    }>(ApiEnum.DELETE_FRIEND, params)
  }

  // 删除好友申请通知记录
  public static deleteFriendNotification = (params: DeleteFriendNotificationParamsType) => {
    return serviceRequest.post(ApiEnum.DELETE_FRIEND_NOTIFICATION, params)
  }

  // 好友通知列表
  public static loadFriendNotifications = (params: LoadFriendNotificationsParamsType) => {
    return serviceRequest.post<Array<{
        userId: any,
        friendId: string,
        status: ApplyStatusEnum,
        createTime: Date,
      }>>(ApiEnum.LOAD_FRIEND_NOTIFICATION, params)
  }

  // 好友列表
  public static loadFriendList = (params: LoadFriendListParamsType) => {
    return serviceRequest.post<{
      friendList: Array<{
        friendInfo: FriendInfoType
        status: ApplyStatusEnum,
        createTime: Date,
      }>
    }>(ApiEnum.FRIEND_LIST, params)
  }
  
  // 模糊查询好友
  public static searchFriendList = (params: ChatSearchParamsType) => {
    return serviceRequest.post<Array<{
      _id: string,
      username: string,
      nickname: string
    }>>(ApiEnum.SEARCH_FRIEND_LIST, params)
  }

  // 加载聊天栏用户列表
  public static loadUserContactList = (params: UserContactsParamsType) => {
    return serviceRequest.post<Array<ContactInfoType>>(ApiEnum.LOAD_USER_CONTACT_LIST, params)
  }

  // 加载某个聊天栏
  public static loadUserContact = (params: LoadUserContactParamsType) => {
    return serviceRequest.post<ContactInfoType>(ApiEnum.LOAD_USER_CONTACT, params)
  }

  // 加载用户聊天记录
  public static loadUserMsgList = (params: {
    fromId: string,
    toId: string,
    limitTime: Date,
  }) => {
    return serviceRequest.post(ApiEnum.LOAD_USER_MESSAGE_LIST, params)
  }

  // 加载群聊天记录
  public static loadGroupMsgList = (params: LoadGroupMsgListParamsType) => {
    return serviceRequest.post<Array<{
      fromId: UserInfoType,
      groupId: string,
      msgType: MessageTypeEnum,
      msgContent: any,
      time: string,
    }>>(ApiEnum.LOAD_GROUP_MESSAGE_LIST, params)
  }

  // 模糊查询某群详细聊天记录
  public static searchMatchGroupMessageList = (params: SearchMatchGroupMessageListParamsType) => {
    return serviceRequest.post<Array<{
      msgType: MessageTypeEnum,
      msgContent: any,
      time: string,
      groupInfo: GroupInfoType,
      userInfo: UserInfoType,
    }>>(ApiEnum.SEARCH_MATCH_GROUP_MESSAGE_LIST, params)
  }

  // 模糊查询某好友详细聊天记录
  public static searchMatchUserMessageList = (params: SearchMatchUserMessageListParamsType) => {
    return serviceRequest.post<Array<{
      msgType: MessageTypeEnum,
      msgContent: any,
      time: string,
      userInfo: UserInfoType,
    }>>(ApiEnum.SEARCH_MATCH_USER_MESSAGE_LIST, params)
  }

  // 模糊查询聊天记录
  public static searchMessageList = (params: ChatSearchParamsType) => {
    return serviceRequest.post<Array<any>>(ApiEnum.SEARCH_MESSAGE_LIST, params)
  }

  // 删除群邀请通知记录
  public static deleteGroupNotification = (params: DeleteGroupNotificationParamsType) => {
    return serviceRequest.post(ApiEnum.DELETE_GROUP_NOTIFICATION, params)
  }

  // 删除群聊天栏
  public static deleteGroupContact = (params: {
    id: string
  }) => {
    return serviceRequest.post(ApiEnum.DELETE_GROUP_CONTACT, params)
  }

  // 删除用户聊天栏
  public static deleteUserContact = (params: {
    id: string
  }) => {
    return serviceRequest.post(ApiEnum.DELETE_USER_CONTACT, params)
  }

  // 注册
  public static register = (params: RegisterParamsType) => {
    return serviceRequest.post<{
      status: "success" | "fail",
    }>(ApiEnum.REIGSTER, params)
  }

  // 上传图片
  public static uploadImage = (params: FormData) => {
    return serviceRequest.post(ApiEnum.UPLOAD_IMAGE, params, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  public static githubAuthAccess = (params: { code: string, state: number }) => {
    return serviceRequest.post(ApiEnum.AUTH_GITHUB_ACCESS, params);
  }

  public static googleAuthAccess = (params: { code: string, state: number }) => {
    return serviceRequest.post(ApiEnum.AUTH_GOOGLE_ACCESS, params);
  }

  // ai 对话补全
  public static aiCompletion = (params: DsCompletionsParams, config: SSEConfig) => {
    return serviceRequest.sse(ApiEnum.AI_COMPLETION, params, config)
  }
}