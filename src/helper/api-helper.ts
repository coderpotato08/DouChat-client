import {
  ApiEnum,
  LoadMeetingInfoParamsType,
  CreateMeetingParamsType,
  UserContactsParamsType,
  UserMsgListParamsType,
  SearchUserParamsType,
  AddFriendParamsType,
  LoadFriendNotificationsParamsType,
  ChangeFriendStatusParamsType,
  LoadFriendListParamsType,
  LoadUserInfoParamsType,
  LoadUserContactParamsType,
  CreateGroupParamsType,
} from "@constant/api-types"
import { AxiosHelper } from "./axios-helper"
import { FriendApplyStatusEnum, FriendInfoType } from "@constant/friend-types"
import { ContactInfoType, UserInfoType } from "@constant/user-types"

export class ApiHelper {
  // --------------- 视频聊天 ----------------------
  // 创建会议
  public static createMeeting = (params: CreateMeetingParamsType) => {
    return AxiosHelper.post(ApiEnum.CREATE_MEETING, params)
  }
  // 加载会议信息
  public static loadMeetingInfo = (params: LoadMeetingInfoParamsType) => {
    return AxiosHelper.post(ApiEnum.LOAD_MEETING_INFO, params)
  }
  // --------------- 群聊聊天 -----------------------
  // 创建群聊
  public static createGroup = (params: CreateGroupParamsType) => {
    return AxiosHelper.post<{
      groupId: string,
      status: "success" | "fail"
    }>(ApiEnum.CREATE_GROUP, params);
  }
  // --------------- 私人聊天 -----------------------
  // 模糊查询用户
  public static loadUserInfo = (params: LoadUserInfoParamsType) => {
    return AxiosHelper.post<UserInfoType>(ApiEnum.LOAD_USER_INFO, params)
  }
  public static searchUsers = (params: SearchUserParamsType) => {
    return AxiosHelper.post(ApiEnum.SEARCH_USERS, params)
  }
  // 申请添加好友
  public static addFriend = (params: AddFriendParamsType) => {
    return AxiosHelper.post(ApiEnum.ADD_FRIEND, params)
  }
  // 同意/拒绝 好友申请
  public static changeFriendStatus = (params: ChangeFriendStatusParamsType) => {
    return AxiosHelper.post<{
      status: "success" | "fail",
      relationship: any
    }>(ApiEnum.CHANGE_FRIEND_STATUS, params)
  }
  // 好友通知列表
  public static loadFriendNotifications = (params: LoadFriendNotificationsParamsType) => {
    return AxiosHelper.post<{
      friendList: Array<{
        userId: any,
        friendId: string,
        status: FriendApplyStatusEnum,
        createTime: Date,
      }>
    }>(ApiEnum.FRIEND_NOTIFICATION, params)
  }
  // 好友列表
  public static loadFriendList = (params: LoadFriendListParamsType) => {
    return AxiosHelper.post<{
      friendList: Array<{
        friendInfo: FriendInfoType
        status: FriendApplyStatusEnum,
        createTime: Date,
      }>
    }>(ApiEnum.FRIEND_LIST, params)
  }
  // 加载聊天栏用户列表
  public static loadUserContactList = (params: UserContactsParamsType) => {
    return AxiosHelper.post<Array<ContactInfoType>>(ApiEnum.LOAD_USER_CONTACT_LIST, params)
  }
  // 加载某个聊天栏
  public static loadUserContact = (params: LoadUserContactParamsType) => {
    return AxiosHelper.post<ContactInfoType>(ApiEnum.LOAD_USER_CONTACT, params)
  }
  // 加载用户聊天记录
  public static loadUserMsgList = (params: UserMsgListParamsType) => {
    return AxiosHelper.post(ApiEnum.LOAD_USER_MESSAGE_LIST, params)
  }

  // 上传图片
  public static uploadImage = (params: FormData) => {
    return AxiosHelper.post(ApiEnum.UPLOAD_IMAGE, params, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}