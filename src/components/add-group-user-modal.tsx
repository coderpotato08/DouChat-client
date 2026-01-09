import { BaseModalProps } from '@constant/common-types';
import { ApiHelper } from '@helper/api-helper';
import { useAppSelector } from '@store/hooks';
import { userSelector } from '@store/index';
import { Avatar, Checkbox, GetProp, Modal, Space } from 'antd';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

interface AddGroupUserModalProps extends BaseModalProps {
  selected: string[],
  onConfirm: (values: string[]) => void;
}
const AddGroupUserModal: FC<AddGroupUserModalProps> = ({
  visible,
  selected,
  onCancel,
  onConfirm,
}: AddGroupUserModalProps) => {
  const userInfo = useAppSelector(userSelector);
  const [value, setValue] = useState<any[]>(selected);
  const [friendList, setFriendList] = useState<any[]>([]);

  const onHandleChange: GetProp<typeof Checkbox.Group, 'onChange'> = (value) => {
    setValue(value);
  }

  const onHandleConfirm = () => {
    const list = value.filter((userId) => selected.indexOf(userId) === -1);
    onConfirm(list);
    onCancel();
  }

  const loadFriendList = () => {
    ApiHelper.loadFriendList({ userId: userInfo._id })
      .then(({ friendList }) => {
        const userList = friendList.map((item) => ({
          ...item.friendInfo,
        }))
        setFriendList(userList);
      })
  }

  const onHandleCancel = () => {
    setValue([...selected]);
    onCancel()
  }

  useEffect(() => {
    setValue([...selected])
  }, [selected]);

  useEffect(() => {
    visible && loadFriendList();
  }, [visible]);

  return (
    <Modal title={"添加群成员"}
      open={visible}
      okText={"确定"}
      cancelText={"取消"}
      onOk={onHandleConfirm}
      onCancel={onHandleCancel}>
      <Wrapper>
        <Checkbox.Group value={value} onChange={onHandleChange}>
          <Space direction="vertical">
            {
              friendList.map((friend) => {
                const disabled = selected.indexOf(friend._id ) > -1;
                return <Checkbox key={friend._id}
                  disabled={disabled}
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
    </Modal>
  )
}

export default AddGroupUserModal;

const Wrapper = styled.div`
  & {
    width: 100%;
    height: 480px;
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