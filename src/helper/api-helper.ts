import {
  ApiEnum,
  LoadMeetingInfoParamsType,
  CreateMeetingParamsType,
  UserContactsParamsType,
  UserMsgListParamsType,
} from "../constant/api-const"
import { AxiosHelper } from "./axios-helper"

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
  // --------------- 聊天室 ----------------------
  // 加载聊天栏用户列表
  public static loadUserContacts = (params: UserContactsParamsType) => {
    return AxiosHelper.post(ApiEnum.LOAD_USER_CONTACT, params)
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