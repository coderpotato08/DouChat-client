import { ContainerWrapper, GroupWrapper, ShadowFloatBox } from "@components/custom-styles";
import { useSocket } from "@store/context/createContext";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import ChatTitle from "./components/chat-title";
import { ApiHelper } from "@helper/api-helper";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { 
  friendNoteNumSelector,
  groupNoteNumSelector,
  setFriendNoteNum,
  setGroupNoteNum,
  subFriendNoteNum,
  subGroupNoteNum,
  userSelector 
} from "@store/index";
import { Avatar, Badge, Menu, MenuProps, Button, message } from "antd";
import { ApplyStatusEnum } from "@constant/relationship-types";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import dayjs from "dayjs";
import FriendInfo from "./components/friend-info";
import ChatAvatar from "@components/chat-avatar";
import GroupInfo from "./components/group-info";
import { EventType } from "@constant/socket-types";
import { CloseOutlined } from "@ant-design/icons";

enum TabKeys {
  FRIEND_NOTIFICATION = "FRIEND_NOTIFICATION",
  GROUP_NOTIFICATION = "GROUP_NOTIFICATION",
  FRIEND_INFO = "FRIEND_INFO",
  GROUP_INFO = "GROUP_INFO",
}
const TabTitle = {
  [TabKeys.FRIEND_NOTIFICATION]: "好友通知",
  [TabKeys.GROUP_NOTIFICATION]: "群通知",
  [TabKeys.FRIEND_INFO]: "好友信息",
  [TabKeys.GROUP_INFO]: "群信息",
}

enum MenuKeys {
  FRIEND = 'FRIEND',
  GROUP = 'GROUP'
}

const items: MenuProps['items'] = [
  {
    label: '好友',
    key: MenuKeys.FRIEND,
    style: {flex: 1, textAlign: 'center', fontWeight: 'bold'}
  },
  {
    label: '群聊',
    key: MenuKeys.GROUP,
    style: {flex: 1, textAlign: 'center', fontWeight: 'bold'}
  },
]

const Relationship: FC = () => {
  const socket = useSocket();
  const userInfo = useAppSelector(userSelector);
  const friendNoteNum = useAppSelector(friendNoteNumSelector);
  const groupNoteNum = useAppSelector(groupNoteNumSelector);
  const dispatch = useAppDispatch();
  const [currentMenu, setCurrentMenu] = useState<string>(MenuKeys.FRIEND);
  const [currentKey, setCurrentKey] = useState<string>();
  const [curFriendId, setCurFriendId] = useState<any>();
  const [curGroupId, setCurGroupId] = useState<any>();
  const [friendList, setFriendList] = useState<any[]>([]);
  const [friendNotificationList, setFriendNotificationList] = useState<any[]>([]);
  const [groupNotificationList, setGroupNotificationList] = useState<any[]>([]);
  const [groupList, setGroupList] = useState<any[]>([]);

  const isFriend = useMemo(() => {
    return currentKey === TabKeys.FRIEND_NOTIFICATION
  }, [currentKey])
  const notificationList = useMemo(() => {
    switch (currentKey) {
      case TabKeys.FRIEND_NOTIFICATION:
        return friendNotificationList;
      case TabKeys.GROUP_NOTIFICATION:
        return groupNotificationList;
      default:
        return [];
    }
  }, [currentKey, friendNotificationList, groupNotificationList]);

  const sortNotificationList = useCallback((list: any[]): any[] => {
    return [
      ...list.filter((item: any) => item.status === ApplyStatusEnum.APPLYING),
      ...list
        .filter((item: any) => item.status !== ApplyStatusEnum.APPLYING)
        .sort((a, b) => dayjs(b.createTime).diff(dayjs(a.createTime)))
    ]
  }, []);

  const onClickMenu: MenuProps['onClick'] = (e) => {
    setCurrentMenu(e.key);
  };

  const onClickItem = (key: TabKeys) => {
    setCurrentKey(key);
    switch (key) {
      case TabKeys.FRIEND_NOTIFICATION:
        loadFriendNoteList();
        break;
      case TabKeys.GROUP_NOTIFICATION:
        loadGroupNoteList();
        break;
      default:
        break;
    }
  }

  const onClickFriend = (friendInfo: any) => {
    const { _id } = friendInfo;
    setCurrentKey(TabKeys.FRIEND_INFO);
    setCurFriendId(_id)
  }

  const onClickGroup = (groupInfo: any) => {
    setCurrentKey(TabKeys.GROUP_INFO);
    setCurGroupId(groupInfo._id);
  }

  const handleApply = async (data: {nid: string, groupName: string}, status: ApplyStatusEnum, index: number) => {
    const isAccept = status === ApplyStatusEnum.ACCEPT;
    const { nid, groupName } = data
    if (isFriend) {
      ApiHelper.changeFriendStatus({id: nid, changeStatus: status})
        .then(() => {
          message.success(isAccept ? "添加成功" : "已拒绝申请")
          setFriendNotificationList(preList => sortNotificationList(preList)
            .map((item: any, i) => {
              if (i === index) item.status = status;
              return item
            }))
          dispatch(subFriendNoteNum());
          isAccept && loadFriendList();
        })
    } else {
      socket.emit(EventType.ACCEPT_GROUP_INVITE, {id: nid, changeStatus: status})
      message.success(isAccept ? `已同意群「${groupName}」的申请` : `已拒绝群「${groupName}」的申请`);
      setGroupNotificationList(preList => sortNotificationList(preList)
        .map((item: any, i) => {
          if (i === index) item.status = status;
          return item
        }))
      dispatch(subGroupNoteNum());
      isAccept && loadGroupList();
    }
  }

  const loadFriendList = () => {
    ApiHelper.loadFriendList({userId: userInfo._id})
      .then(({ friendList = [] }) => {
        setFriendList(friendList);
      })
  }
  
  const loadGroupList = () => {
    ApiHelper.loadGroupList({userId: userInfo._id})
      .then((list) => {
        setGroupList(list);
      })
  }

  const loadFriendNoteList = () => {
    ApiHelper.loadFriendNotifications({ userId: userInfo._id })
      .then((list) => {
        dispatch(setFriendNoteNum({ 
          num: list.filter((item) => item.status === ApplyStatusEnum.APPLYING).length  
        }));
        setFriendNotificationList(sortNotificationList(list));
      })
  }

  const loadGroupNoteList = () => {
    ApiHelper.loadGroupNotifications({ userId: userInfo._id })
      .then((list) => {
        dispatch(setGroupNoteNum({ 
          num: list.filter((item) => item.status === ApplyStatusEnum.APPLYING).length 
        }))
        setGroupNotificationList(sortNotificationList(list))
      })
  }

  const refreshGroupInfo = () => {
    setCurrentKey("");
    setCurGroupId("");
    loadGroupList();
  }

  const refreshFriendInfo = () => {
    setCurrentKey("");
    setCurFriendId({});
    loadFriendList();
  }

  const onDeleteNotification = (index: number) => {
    const note = notificationList[index];
    const deleteHandle = isFriend ? ApiHelper.deleteFriendNotification : ApiHelper.deleteGroupNotification;
    const setList = isFriend ? setFriendNotificationList : setGroupNotificationList;
    deleteHandle({ nid: note._id })
      .then(() => {
        if (note.status === ApplyStatusEnum.APPLYING) {
          isFriend ? dispatch(subFriendNoteNum()) : dispatch(subFriendNoteNum())
        };
        setList((preList) => {
          preList.splice(index, 1);
          return sortNotificationList(preList);
        })
      })
  }

  useEffect(() => {
    if(!currentMenu) return;
    if(currentMenu === MenuKeys.FRIEND) {
      loadFriendList();
    } else {
      loadGroupList();
    }
  }, [currentMenu])

  useEffect(() => {
    loadFriendNoteList();
    loadGroupNoteList();
  }, []);

  return <Wrapper>
    <GroupWrapper>
      <ChatTitle addGroupCallback={loadGroupList}/>
      <NotificationWrapper>
        <FloatBox onClick={() => onClickItem(TabKeys.FRIEND_NOTIFICATION)}>
          好友通知
          <Badge size="small" count={friendNoteNum}/>
        </FloatBox>
        <FloatBox onClick={() => onClickItem(TabKeys.GROUP_NOTIFICATION)}>
          群通知
          <Badge size="small" count={groupNoteNum}/>
        </FloatBox>
      </NotificationWrapper>
      <Menu onClick={onClickMenu} 
            selectedKeys={[currentMenu]} 
            mode="horizontal" 
            items={items}/>
      <ListBox>
        {
          currentMenu === MenuKeys.FRIEND && <>
            {
              friendList.length > 0 ? 
              friendList.map((friend) => {
                const { avatarImage, nickname } = friend.friendInfo
                return <BaseItem key={friend._id} onClick={() => onClickFriend(friend.friendInfo)}>
                  <Avatar size={48} src={avatarImage}/>
                  <div className="info">
                    <div>{nickname}</div>
                    <div>{"这个人很懒什么都没留下～"}</div>
                  </div>
                </BaseItem>
              }) : <NoData>暂无好友</NoData>
            }
          </>
        }
        {
          currentMenu === MenuKeys.GROUP && <>
            {
              groupList.length > 0 ? 
              groupList.map((group) => {
                const { groupInfo, _id } = group;
                return <BaseItem key={_id} onClick={() => onClickGroup(groupInfo)}>
                  <ChatAvatar isGroup groupImgList={groupInfo.usersAvaterList}/>
                  <div className="info">
                    <div>{groupInfo.groupName}</div>
                    <div>{groupInfo.sign}</div>
                  </div>
                </BaseItem>
              }) : <NoData>暂无群聊</NoData>
            }
          </>
        }
      </ListBox>
    </GroupWrapper>
    <ContainerWrapper>
      {
        currentKey && [
          TabKeys.FRIEND_NOTIFICATION,
          TabKeys.GROUP_NOTIFICATION
        ].includes(currentKey as TabKeys) && 
          <ContainerTitle>{TabTitle[currentKey as TabKeys]}</ContainerTitle>
      }
      {
        (currentKey === TabKeys.FRIEND_NOTIFICATION || 
        currentKey === TabKeys.GROUP_NOTIFICATION) && <NotificationBox>
          <TransitionGroup>
            {
              notificationList.length > 0 && 
              notificationList.map((notification, index) => {
                const { 
                  status, 
                  createTime,
                  inviter = {},
                  groupInfo = {},
                  userId = {}, 
                } = notification;
                return <CSSTransition key={notification._id} timeout={300} classNames='note'>
                  <NotificationItem>
                    <Avatar size={48} src={isFriend ? userId.avatarImage : inviter.avatarImage}/>
                    <div className={"info"}>
                      <div className={"info-content"}>
                        <div className={"nickname"}>{isFriend ? userId.nickname : inviter.nickname}</div>
                        {isFriend ? "请求添加你为好友" : `邀请你加入群聊 「${groupInfo.groupName}」`}
                      </div>
                      <div className={"time"}>
                        {dayjs(createTime).format("YYYY-MM-DD HH:mm")}
                      </div>
                    </div>
                    {
                      status === ApplyStatusEnum.APPLYING ? <div className={"buttons"}>
                        <Button onClick={() => handleApply(
                          {nid: notification._id, groupName: groupInfo.groupName}, 
                          ApplyStatusEnum.ACCEPT,
                          index
                        )}>接受</Button>
                        <Button onClick={() => handleApply(
                          {nid: notification._id, groupName: groupInfo.groupName},
                          ApplyStatusEnum.REJECTED,
                          index
                        )} danger type={"primary"}>拒绝</Button>
                      </div> : <div className={"status-label"}>
                        {status === ApplyStatusEnum.ACCEPT ? "已同意" : "已拒绝"}
                      </div>
                    }
                    <CloseOutlined className={"close-btn"} 
                                   onClick={() => onDeleteNotification(index)}/>
                  </NotificationItem>
                </CSSTransition>
              })
            }
          </TransitionGroup>
        </NotificationBox>
      }
      {
        currentKey === TabKeys.FRIEND_INFO && 
          <FriendInfo friendId={curFriendId}
                      refreshFriendInfo={refreshFriendInfo}/>
      }
      {
        currentKey === TabKeys.GROUP_INFO && 
          <GroupInfo groupId={curGroupId}
                     refreshGroupInfo={refreshGroupInfo}/>
      }
    </ContainerWrapper>
  </Wrapper>
}

export default Relationship;

const Wrapper = styled.div`
  & {
    display: flex;
  }
`
const NotificationWrapper = styled.div`
  & {
    padding: 0 12px;
  }
`
const FloatBox = styled(ShadowFloatBox)`
  & {
    cursor: pointer;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 30px 12px 12px;
    width: 100%;
    height: 40px;
    margin-bottom: 12px;
  }
`
const ListBox = styled.div`
  & {
    padding: 12px 0;
    overflow-y: scroll;
    flex: 1;
  }
`
const BaseItem = styled.div`
  & {
    cursor: pointer;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    height: 64px;
    width: 100%;
    padding: 0 12px;
    transition: all .4s;
    overflow: hidden;
    .info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: calc(100% - 50px);
      height: 64px;
      div {
        margin-left: 12px;
        height: 20px;
        line-height: 20px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      > div:nth-child(1) {
        font-size: 14px;
        font-weight: 500;
      }
      > div:nth-child(2) {
        font-size: 12px;
        color: #444;
      }
    }
  }
  &:hover {
    background: #f2f2f2;
  }
`
const ContainerTitle = styled.div`
  & {
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 24px;
    font-size: 18px;
    font-weight: 500;
    font-family: "CircularStd-Bold", sans-serif;
  }
`
const NotificationBox = styled.div`
  & {
    height: calc(100vh - 60px);
    padding: 0 42px;
    .note {
      transition: all 300ms;
    }
    .note-enter {
      transform: translateX(110%);
      opacity: 0;
    }
    .note-enter-active {
      opacity: 1;
    }
    .note-exit {
      opacity: 1;
    }
    .note-exit-active {
      opacity: 0;
      transform: translateX(110%);
    }
  }
`
const NotificationItem = styled(ShadowFloatBox)`
  & {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    background: #fff;
    height: 72px;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 12px;
    .close-btn {
      color: #666;
      font-size: 14px;
      cursor: pointer;
    }
    .info {
      margin-left: 12px;
      .info-content {
        display: flex;
        .nickname {
          font-weight: 500;
          margin-right: 8px;
        }
      }
      .time {
        color: #666;
        font-size: 14px;
        margin-top: 4px;
      }
    }
    .buttons {
      display: flex;
      gap: 12px;
      margin-left: auto;
      margin-right: 16px;
    }
    .status-label {
      color: #666;
      margin-left: auto;
      margin-right: 16px;
    }
  }
`
const NoData = styled.div`
  & {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    color: #666;
    width: 100%;
    height: 80px;
  }
` 