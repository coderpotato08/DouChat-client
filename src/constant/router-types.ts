import { RoleType } from "./meeting-types";

export enum RouterPath {
  Login = "/login", // 登陆
  Register = "/register", // 注册
  Chat = "/chat", // 聊天主页
  ChatMessage = "/chat/message", // 聊天消息页
  ChatRelationship= "/chat/relationship", // 聊天好友/群关系页
  VideoMeeting = "/video-meeting",  // 会议室
}

export type RouterItem<path, P = undefined> = {
  path: path;
  params?: P;
}

export type RouterDefine = [
  RouterItem<RouterPath.Login, Record<string, never>>,
  RouterItem<RouterPath.Register, Record<string, never>>,
  RouterItem<RouterPath.Chat, Record<string, never>>,
  RouterItem<RouterPath.ChatMessage, Record<string, never>>,
  RouterItem<RouterPath.ChatRelationship, Record<string, never>>,
  RouterItem<RouterPath.VideoMeeting, { role: RoleType }>,
]