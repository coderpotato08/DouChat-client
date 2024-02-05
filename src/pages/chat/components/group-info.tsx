import AddGroupUserModal from "@components/add-group-user-modal"
import CIcon from "@components/c-icon"
import ChatAvatar from "@components/chat-avatar"
import InfoBox from "@components/info-box"
import { UserInfoType } from "@constant/user-types"
import { ApiHelper } from "@helper/api-helper"
import { formLayout } from "@helper/common-helper"
import { usePopup } from "@hooks/usePopup"
import { useAppSelector } from "@store/hooks"
import { userSelector } from "@store/index"
import { Avatar, Button, Col, Divider, Form, GlobalToken, Input, Popconfirm, Row, message, theme } from "antd"
import { isEmpty } from "lodash"
import { FC, KeyboardEventHandler, ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

const { useToken } = theme;
const FormLayout = formLayout(8, 16)

interface GroupInfoProps {
  groupId: string
  refreshGroupInfo: () => void
}
const GroupInfo:FC<GroupInfoProps> = (props: GroupInfoProps) => {
  const { 
    groupId = "",
    refreshGroupInfo
  } = props;
  const [groupInfo, setGroupInfo] = useState<any>({});
  const { 
    usersAvaterList,
    groupName, 
    groupNumber,
    sign, 
    creator
  } = groupInfo;
  const { token } = useToken();
  const navigate = useNavigate();
  const signInputRef = useRef<any>(null)
  const expandRef = useRef<any>(null);
  const userInfo = useAppSelector(userSelector);
  const [open, onPopup] = usePopup();
  const [userList, setUserList] = useState<any[]>([]);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [signEditable, setSignEditable] = useState<boolean>(false);

  const isCreator = useMemo(() => {
    return !isEmpty(groupInfo) && groupInfo.creator._id === userInfo._id;
  }, [groupInfo]);

  const groupUserIds = useMemo(() => {
    return userList.map((user) => user._id);
  }, [userList])

  const showUserList = useMemo(() => {
    return showMore ? userList : userList.slice(0, 19)
  }, [showMore, userList]);

  useEffect(() => {
    if(expandRef.current) {
      expandRef.current.scrollIntoView({
        block: "end",
        inline: "nearest", 
        behavior: "smooth",
      })
    }
  }, [showMore]);

  const onQuitGroup = () => {
    if(isCreator) {
      ApiHelper.disbandGroup({groupId: groupInfo._id})
        .then(() => {
          message.success(`${groupInfo.groupName} 已解散成功`, 1.5, refreshGroupInfo)
        })
    } else {
      ApiHelper.quitGroup({
        groupId: groupInfo._id,
        userId: userInfo._id
      })
        .then(() => {
          message.success(`已退出群聊`, 1.5, refreshGroupInfo)
        })
    }
  }

  const onClickSendMessage = () => {
    ApiHelper.createGroupContact({
      userId: userInfo._id,
      groupId: groupInfo._id,
    })
      .then(() => {
        navigate(`/chat/message/${groupInfo._id}?type=group`)
      })
  }

  const renderOptions = ():ReactNode => {
    return <OptionsWrapper>
      <Popconfirm
        title={`是否${isCreator ? "解散" : "退出"}群聊？`}
        onConfirm={onQuitGroup}
        onCancel={() => {}}
        okText="确定"
        cancelText="取消">
        <Button size="large"
                className="btn"
                danger
                type={"primary"}>{isCreator ? "解散群聊" : "退出群聊"}</Button>
      </Popconfirm>
      <Button size="large" 
              className="btn"
              type={"primary"}
              onClick={onClickSendMessage}>发消息</Button>
    </OptionsWrapper>
  }

  const onAddUsers = (list: string[]) => {
    const params = { 
      inviterId: userInfo._id,
      groupId: groupInfo._id,
      userList: list 
    };
    ApiHelper.inviteGroupUsers(params)
      .then(() => {
        message.success('邀请群成员成功')
      });
  }

  const handleSignInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      setSignEditable(false)
      const sign = signInputRef.current.input.value;
      ApiHelper.updateGroupInfo({ groupId, sign })
        .then(() => {
          message.success("群签名修改成功");
          setGroupInfo((preInfo: any) => ({...preInfo, sign}))
        })
    }
  }

  const loadGroupInfo = () => {
    if (groupId) {
      ApiHelper.loadGroupInfo({ groupId })
        .then(({ userList, ...groupInfo }) => {
          setGroupInfo(groupInfo);
          setUserList(userList);
        })
    }
  }

  useEffect(() => {
    if(signEditable) signInputRef.current?.focus()
  }, [signEditable])

  useEffect(() => {
    loadGroupInfo()
  }, [groupId]);

  return <>
    <InfoBox title={"群信息"} optionsNode={renderOptions()}>
      <HeaderInfo>
        <ChatAvatar isGroup size={"large"} groupImgList={usersAvaterList}/>
        <div className={"group-name"}>{groupName}</div>
        <div className="sign-line">
          {
            signEditable ? <Input
              ref={signInputRef}
              className={"sign"}
              onBlur={() => setSignEditable(false)}
              onKeyDown={handleSignInputKeyDown}
              defaultValue={sign || "暂无群简介"}
            /> : <div className={"sign"}>{sign || "暂无群简介"}</div>
          }
          <CIcon value={"icon-edit"}
                 style={{cursor: "pointer"}}
                 size={16} 
                 onClick={() => setSignEditable(pre => !pre)}/>
        </div>
        <Divider orientation="center">群信息</Divider>
        <Row className={"personal-info"}>
          <Col span={8}>
            <Form.Item {...FormLayout} label={"群号"}>
              {groupNumber}
            </Form.Item>
          </Col>
        </Row>
      </HeaderInfo>
      <Divider orientation="center">群用户</Divider>
      <UserBox $showMore={showMore}>
        {
          showUserList.map((user: UserInfoType) => <UserItem $token={token} key={user._id}>
            <div className={"icon"}>
              <Avatar size={48} src={user.avatarImage}/>
              {user._id === userInfo._id && <div className={"me-tag"}>我</div>}
              {user._id === creator._id && <div className={"creator-tag"}>群主</div>}
            </div>
            <div className="label">{user.nickname}</div>
          </UserItem>)
        }
        <UserItem $token={token} onClick={onPopup}>
          <div className={"icon"}>
            <CIcon size={48} value={"icon-add-user"} color="#666"/>
          </div>
          <div className="label">添加</div>
        </UserItem>
      </UserBox>
      {
        userList.length > 20 &&
        <ExpandBtn ref={expandRef} onClick={() => setShowMore(!showMore)}>
          {showMore ? "收起" : "展开"}
        </ExpandBtn>
      }
    </InfoBox>
    <AddGroupUserModal selected={groupUserIds} 
                       visible={open} 
                       onCancel={onPopup} 
                       onConfirm={onAddUsers}/>
  </>
}

export default GroupInfo

const HeaderInfo = styled.div`
  & {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    .group-name {
      font-size: 24px;
      margin: 12px 0 12px;
    }
    .sign-line {
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sign {
      text-align: center;
      font-size: 14px;
      color: #666;
      margin-right: 8px;
    }
    .personal-info {
      width: 70%;
    }
  }
`
const UserBox = styled.div<{
  $showMore?: boolean
}>`
  & {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    padding: 0 72px;
    gap: 12px;
    height: ${props => props.$showMore ? "auto" : "142px"};
    overflow: hidden;
  }
`
const UserItem = styled.div<{
  $token: GlobalToken
}>`
  & {
    cursor: pointer;
    width: 74px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .icon {
      position: relative;
      width: 48px;
      height: 48px;
    }
    .me-tag {
      position: absolute;
      left: -8px;
      top: 0;
      width: 18px;
      height: 18px;
      text-align: center;
      line-height: 18px;
      border-radius: 50%;
      font-size: 12px;
      color: #fff;
      background: rgb(37, 222, 0)
    }
    .creator-tag {
      position: absolute;
      right: -12px;
      bottom: 0;
      padding: 0 4px;
      border-radius: 4px;
      font-size: 12px;
      color: #fff;
      background: ${props => props.$token.colorPrimary}
    }
    .label {
      width: 100%;
      text-align: center;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`
const OptionsWrapper = styled.div`
  & {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding-bottom: 24px;
    width: 100%;
    height: 60px;
    position: absolute;
    bottom: 0;
    left: 0;
    background: #fff;
    .btn {
      width: 105px;
    }
  }
`
const ExpandBtn = styled.div`
  & {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    margin: 12px auto;
    font-size: 14px;
    color: #333
  }
`