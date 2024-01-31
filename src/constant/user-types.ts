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

export enum GenderEnum {
  MAN = 'man',
  GIRL = 'girl',
}