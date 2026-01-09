import type { FriendInfoType } from "@constant/relationship-types";
import { ApiHelper } from "@helper/api-helper";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/userReducer";
import { Avatar, Checkbox, type GetProp, Space } from "antd";
import { type FC, useEffect, useState } from "react";
import styled from "styled-components";

interface UserSelectorProps {
  value: Array<any>,
  onSelect: (value: Array<any>, options: Array<FriendInfoType>) => void
}
const UserSelector: FC<UserSelectorProps> = ({
  value,
  onSelect,
}: UserSelectorProps) => {
  const userInfo = useAppSelector(userSelector);
  const [friendList, setFriendList] = useState<any[]>([]);

  const loadFriendList = () => {
    ApiHelper.loadFriendList({ userId: userInfo._id })
      .then(({ friendList }) => {
        const userList = friendList.map((item) => ({
          ...item.friendInfo,
        }))
        setFriendList(userList);
      })
  }

  const onHandleSelect: GetProp<typeof Checkbox.Group, 'onChange'> = (checkedValues) => {
    const options = friendList.filter(({ _id }) => checkedValues.findIndex((value) => value === _id) > -1);
    onSelect(checkedValues, options);
  };

  useEffect(() => {
    loadFriendList();
  }, [])

  return <Wrapper>
    <Checkbox.Group value={value} onChange={onHandleSelect}>
      <Space direction="vertical">
        {
          friendList.map((friend) => {
            return <Checkbox key={friend._id}
              value={friend._id}>
              <FriendInfo>
                <Avatar size={48} src={friend.avatarImage} />
                <div className="name">{friend.nickname}</div>
              </FriendInfo>
            </Checkbox>
          })
        }
      </Space>
    </Checkbox.Group>
  </Wrapper>
}

export default UserSelector

const Wrapper = styled.div`
  & {
    width: 100%;
    height: 100%;
    overflow: scroll;
  }
`

const FriendInfo = styled.div`
  & {
    display: flex;
    align-items: center;
    flex: 1;
    height: 60px;
    .name {
      margin-left: 10px;
    }
  }
`