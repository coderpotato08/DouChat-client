import { UserInfoType } from "./user-types";

export enum ApplyStatusEnum {
  APPLYING,
  ACCEPT,
  REJECTED,
}

export type FriendInfoType = {
  avatarImage: string,
  nickname: string,
  username: string,
  _id: string,
}

export interface GroupInfoType {
  creator: UserInfoType,
  groupName: string,
  groupNumber: number,
  sign?: string,
  createTime: string,
}
