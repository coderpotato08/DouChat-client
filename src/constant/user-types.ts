export type UserInfoType = {
  _id: string,
  username: string,
  nickname?: string,
  email?: string,
  avatarImage?: string,
  token?: string,
  updatedAt?: Date,
  createdAt?: Date,
}

export type ContactInfoType = {
  _id: string,
  contactId: string,
  users: [UserInfoType, UserInfoType],
  createTime: Date,
}

export type MessageInfoType = {
  value: string,
  type: MessageTypeEnum,
}

export enum MessageTypeEnum {
  TEXT, // 文本 0
  IMAGE,  // 图片 1
  VIDEO,  // 视频 2
  FILE, // 文件 3
  TIPS = 99,  // 提示（入群，邀请用户等 99
}

export enum GenderEnum {
  MAN = 'man',
  GIRL = 'girl',
}