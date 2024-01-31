import CIcon from "@components/c-icon"
import ChatAvatar from "@components/chat-avatar"
import InfoBox from "@components/info-box"
import { UserInfoType } from "@constant/user-types"
import { ApiHelper } from "@helper/api-helper"
import { formLayout } from "@helper/common-helper"
import { useAppSelector } from "@store/hooks"
import { userSelector } from "@store/index"
import { Avatar, Button, Col, Divider, Form, Row } from "antd"
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react"
import styled from "styled-components"

const FormLayout = formLayout(8, 16)

interface GroupInfoProps {
  groupInfo: any
}
const GroupInfo:FC<GroupInfoProps> = (props: GroupInfoProps) => {
  const expandRef = useRef<any>(null);
  const { groupInfo = {} } = props;
  const { usersAvaterList, groupName, groupNumber, sign, _id: groupId, creator } = groupInfo;
  const userInfo = useAppSelector(userSelector);
  const [userList, setUserList] = useState<any[]>([]);
  const [showMore, setShowMore] = useState<boolean>(false);

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
  }, [showMore])

  const renderOptions = ():ReactNode => {
    return <OptionsWrapper>
      <Button size="large"
              className="btn"
              danger
              type={"primary"}>退出群聊</Button>
      <Button size="large" 
              className="btn"
              type={"primary"}
              onClick={() => {}}>发消息</Button>
    </OptionsWrapper>
  }

  useEffect(() => {
    if (groupId) {
      ApiHelper.loadGroupUsers({groupId})
        .then((list) => {
          setUserList(list)
        })
    }
  }, [groupId]);

  return <InfoBox title={"群信息"} optionsNode={renderOptions()}>
    <HeaderInfo>
      <ChatAvatar isGroup size={"large"} groupImgList={usersAvaterList}/>
      <div className={"group-name"}>{groupName}</div>
      <div className={"sign"}>{sign || "暂无群简介"}</div>
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
        showUserList.map((user: UserInfoType) => <UserItem key={user._id}>
          <div className={"icon"}>
            <Avatar size={48} src={user.avatarImage}/>
            {user._id === creator._id && <div className={"creator-tag"}>群主</div>}
          </div>
          <div className="label">{user.nickname}</div>
        </UserItem>)
      }
      <UserItem>
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
    .sign {
      width: 50%;
      text-align: center;
      font-size: 14px;
      color: #666;
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
const UserItem = styled.div`
  & {
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
    .creator-tag {
      position: absolute;
      right: -12px;
      bottom: 0;
      padding: 0 4px;
      border-radius: 4px;
      font-size: 12px;
      color: #fff;
      background: rgb(22, 119, 255)
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