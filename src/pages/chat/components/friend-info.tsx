import InfoBox from "@components/info-box";
import { UserInfoType } from "@constant/user-types";
import { ApiHelper } from "@helper/api-helper";
import { formLayout } from "@helper/common-helper";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/userReducer";
import { Avatar, Button, Col, Divider, Form, Popconfirm, Row, message } from "antd";
import dayjs from "dayjs";
import React, { ReactNode } from "react";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

interface FriendInfoProps {
  friendId: string,
  refreshFriendInfo: () => void,
}
const FormLayout = formLayout(8, 16)
const FriendInfo:FC<FriendInfoProps> = (props: FriendInfoProps) => {
  const navigate = useNavigate();
  const userInfo = useAppSelector(userSelector);
  const [ friendInfo, setFriendInfo ] = useState<any>({});

  useEffect(() => {
    ApiHelper.loadUserInfo({ userId: props.friendId })
      .then((res: UserInfoType) => {
        setFriendInfo(res)
      })
  }, [props.friendId]);

  const onClickSendMessage = () => {
    const arr = [userInfo._id, friendInfo._id]
    const contactId = arr.join("_");
    navigate(`/chat/message/${contactId}`);
  }

  const onDeleteFriend = () => {
    ApiHelper.deleteFriend({
      userId: userInfo._id,
      friendId: friendInfo._id
    })
      .then(() => {
        message.success(`已移除好友 ${friendInfo.nickname}`, 1.5, props.refreshFriendInfo)
      })
  }

  const renderOptions = ():ReactNode => {
    return <OptionsWrapper>
      <Popconfirm
        title={`是否要移除好友？`}
        onConfirm={onDeleteFriend}
        onCancel={() => {}}
        okText="确定"
        cancelText="取消">
        <Button size="large"
              className="btn"
              danger
              type={"primary"}>移除好友</Button>
      </Popconfirm>
      <Button size="large" 
              className={"btn"}
              type={"primary"}
              onClick={onClickSendMessage}>发消息</Button>
    </OptionsWrapper>
  }

  return <InfoBox title={"好友信息"} optionsNode={renderOptions()}>
    <HeaderInfo>
      <Avatar size={108} src={friendInfo.avatarImage}/>
      <div className={"nickname"}>{friendInfo.nickname}</div>
      <div className={"sign"}>{friendInfo.sign || "这个人很懒什么都没留下～"}</div>
      <Divider orientation="center">个人信息</Divider>
      <Row className={"personal-info"}>
        <Col span={8}>
          <Form.Item {...FormLayout} label={"用户账号"}>{friendInfo.username}</Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item {...FormLayout} label={"用户邮箱"}>{friendInfo.email}</Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item {...FormLayout} label={"创建时间"}>
            {dayjs(friendInfo.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          </Form.Item>
        </Col>
      </Row>
    </HeaderInfo>
  </InfoBox>
}

export default React.memo(FriendInfo);

const HeaderInfo = styled.div`
  & {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 60px;
    width: 100%;
    .nickname {
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
const OptionsWrapper = styled.div`
  & {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    width: 100%;
    padding-bottom: 24px;
    position: absolute;
    bottom: 0;
    left: 0;
    background: #fff;
    .btn {
      width: 105px;
    }
  }
`