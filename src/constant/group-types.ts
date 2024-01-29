import { UserInfoType } from "./user-types";

export enum GroupApplyStatusEnum { // 群申请状态
  APPLING,
  ACCEPTED,
  REJECTED,
}

export interface GroupInfoType {
  creator: UserInfoType,
  groupName: string,
  groupNumber: number,
  sign?: string,
  createTime: string,
}