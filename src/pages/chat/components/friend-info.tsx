import { UserInfoType } from "@constant/user-types";
import { ApiHelper } from "@helper/api-helper";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/userReducer";
import { Button } from "antd";
import React from "react";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

interface FriendInfoProps {
  friendId: string
}
const FriendInfo:FC<FriendInfoProps> = (props: FriendInfoProps) => {
  const navigate = useNavigate();
  const userInfo = useAppSelector(userSelector);
  const [ friendInfo, setFriendInfo ] = useState<any>();

  useEffect(() => {
    ApiHelper.loadUserInfo({ userId: props.friendId })
      .then((res: UserInfoType) => {
        setFriendInfo(res)
      })
  }, [props.friendId]);

  const onClickSendMessage = () => {
    const arr = [userInfo._id, friendInfo._id]
    const contactId = arr.sort().join("_");
    navigate(`/chat/message/${contactId}`);
  }

  return <Wrapper>
    <HeaderInfo>
      
    </HeaderInfo>
    <OptionsWrapper>
      <Button size="large" 
              type={"primary"}
              onClick={onClickSendMessage}>发消息</Button>
    </OptionsWrapper>
  </Wrapper>
}

export default React.memo(FriendInfo);

const Wrapper = styled.div`
  & {
    position: relative;
    margin: 48px;
    width: calc(100% - 96px);
    height: calc(100% - 96px);
    min-height: 480px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 0 3px 3px rgba(0,0,0,.2);
  }
`
const HeaderInfo = styled.div`
  & {
    display: flex;
  }
`
const OptionsWrapper = styled.div`
  & {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    width: 100%;
    height: 60px;
    position: absolute;
    bottom: 24px;
    left: 0;
  }
`