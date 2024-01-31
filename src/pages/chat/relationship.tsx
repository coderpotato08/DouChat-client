import { ContainerWrapper, GroupWrapper, ShadowFloatBox } from "@components/custom-styles";
import { SocketProvider } from "@store/context/createContext";
import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import ChatTitle from "./components/chat-title";
import { ApiHelper } from "@helper/api-helper";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { friendNoteNumSelector, setFriendNoteNum, subFriendNoteNum, userSelector } from "@store/userReducer";
import { Avatar, Badge, Menu, MenuProps, Button, message } from "antd";
import { FriendApplyStatusEnum } from "@constant/friend-types";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import dayjs from "dayjs";
import FriendInfo from "./components/friend-info";
import ChatAvatar from "@components/chat-avatar";
import GroupInfo from "./components/group-info";

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
  const userInfo = useAppSelector(userSelector);
  const friendNoteNum = useAppSelector(friendNoteNumSelector);
  const dispatch = useAppDispatch();
  const [currentMenu, setCurrentMenu] = useState<string>(MenuKeys.FRIEND);
  const [currentKey, setCurrentKey] = useState<TabKeys>();
  const [curFriendId, setCurFriendId] = useState<any>();
  const [curGroupInfo, setCurGroupInfo] = useState<any>();
  const [friendList, setFriendList] = useState<any[]>([]);
  const [friendNotificationList, setFriendNotificationList] = useState<any[]>([]);
  const [groupList, setGroupList] = useState<any[]>([]);

  const onClickMenu: MenuProps['onClick'] = (e) => {
    setCurrentMenu(e.key);
  };

  const onClickItem = (key: TabKeys) => {
    setCurrentKey(key);
  }

  const onClickFriend = (friendInfo: any) => {
    const { _id } = friendInfo;
    setCurrentKey(TabKeys.FRIEND_INFO);
    setCurFriendId(_id)
  }

  const onClickGroup = (groupInfo: any) => {
    setCurrentKey(TabKeys.GROUP_INFO);
    setCurGroupInfo(groupInfo);
  }

  const handleFriendApply = (id: string, status: FriendApplyStatusEnum, index: number) => {
    const isAccept = status === FriendApplyStatusEnum.ACCEPT;
    ApiHelper.changeFriendStatus({id, changeStatus: FriendApplyStatusEnum.ACCEPT})
      .then(() => {
        message.success(isAccept ? "添加成功" : "已拒绝申请")
        onRemoveFriendNote(index);
        isAccept && loadFriendList();
      })
  }

  const onRemoveFriendNote = (index: number) => {
    const newList = friendNotificationList.slice();
    newList.splice(index, 1);
    dispatch(subFriendNoteNum());
    setFriendNotificationList(newList)
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

  useEffect(() => {
    if(!currentMenu) return;
    if(currentMenu === MenuKeys.FRIEND) {
      loadFriendList();
    } else {
      loadGroupList();
    }
  }, [currentMenu])

  useEffect(() => {
    ApiHelper.loadFriendNotifications({userId: userInfo._id})
      .then(({ friendList = [] }) => {
        dispatch(setFriendNoteNum({ num: friendList.length }));
        setFriendNotificationList(friendList);
      })
  }, []);

  return <SocketProvider>
    <Wrapper>
      <GroupWrapper>
        <ChatTitle/>
        <NotificationWrapper>
          <NotificationBox onClick={() => onClickItem(TabKeys.FRIEND_NOTIFICATION)}>
            好友通知
            <Badge size="small" count={friendNoteNum}/>
          </NotificationBox>
          <NotificationBox onClick={() => onClickItem(TabKeys.GROUP_NOTIFICATION)}>
            群通知
          </NotificationBox>
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
          currentKey && currentKey === TabKeys.FRIEND_NOTIFICATION && 
            <ContainerTitle>{TabTitle[currentKey]}</ContainerTitle>
        }
        {
          currentKey === TabKeys.FRIEND_NOTIFICATION && <FriendNotification>
            <TransitionGroup>
              {
                friendNotificationList.length > 0 && 
                friendNotificationList.map((fNotification, index) => {
                  const { userId: { avatarImage, nickname }, status, createTime } = fNotification;
                  return <CSSTransition key={fNotification._id} timeout={400} classNames='friend-note'>
                    <NotificationItem>
                      <Avatar size={48} src={avatarImage}/>
                      <div className={"info"}>
                        <div className={"info-content"}>
                          <div className={"nickname"}>{nickname}</div>请求添加你为好友
                        </div>
                        <div className={"time"}>
                          {dayjs(createTime).format("YYYY-MM-DD HH:mm")}
                        </div>
                      </div>
                      {
                        status === FriendApplyStatusEnum.APPLYING ? <div className={"buttons"}>
                          <Button onClick={() => handleFriendApply(
                            fNotification._id, 
                            FriendApplyStatusEnum.ACCEPT,
                            index
                          )}>接受</Button>
                          <Button onClick={() => handleFriendApply(
                            fNotification._id,
                            FriendApplyStatusEnum.REJECTED,
                            index
                          )} danger type={"primary"}>拒绝</Button>
                        </div> : <div className={"status-label"}>
                          {status === FriendApplyStatusEnum.ACCEPT ? "已同意" : "已拒绝"}
                        </div>
                      }
                    </NotificationItem>
                  </CSSTransition>
                })
              }
            </TransitionGroup>
          </FriendNotification>
        }
        {currentKey === TabKeys.FRIEND_INFO && <FriendInfo friendId={curFriendId}/>}
        {currentKey === TabKeys.GROUP_INFO && <GroupInfo groupInfo={curGroupInfo}/>}
      </ContainerWrapper>
    </Wrapper>
  </SocketProvider>
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
const NotificationBox = styled(ShadowFloatBox)`
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
const FriendNotification = styled.div`
  & {
    height: calc(100vh - 60px);
    padding: 0 42px;
    .friend-note {
      transition: all 400ms;
    }
    .friend-note-enter {
      transform: translateX(100%);
      opacity: 0;
    }
    .friend-note-enter-active {
      opacity: 1;
    }
    .friend-note-exit {
      opacity: 1;
    }
    .friend-note-exit-active {
      opacity: 0;
      transform: translateX(100%);
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
    }
    .status-label {
      color: #666;
      margin-left: auto;
      margin-right: 40px;
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