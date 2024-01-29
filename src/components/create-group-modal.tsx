import { ApiHelper } from "@helper/api-helper";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/userReducer";
import { Button, Flex, Form, Input, Modal, ModalProps, message } from "antd";
import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import UserSelector from "./user-selector";
import { FriendInfoType } from "@constant/friend-types";
import { formLayout } from "@helper/common-helper";
import { CreateGroupParamsType } from "@constant/api-types";
import Avatar from "antd/es/avatar/avatar";
import CIcon from "./c-icon";
import { cloneDeep } from "lodash";

interface AddGroupModalProps {
  visible: boolean,
  onCancel: () => void,
}

const ModelBaseConfig: ModalProps = {
  footer: null,
}
const FormItemLayout = formLayout(6, 16);
type FormTypes = Partial<Omit<CreateGroupParamsType, 'users' | 'creator'>>

const AddGroupModal:FC<AddGroupModalProps> = (props: AddGroupModalProps) => {
  const userInfo = useAppSelector(userSelector);
  const [ form ] = Form.useForm();
  const [selectedUsers, setSelectedUsers] = useState<FriendInfoType[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<(string | number)[]>([]);

  const onCancel = () => {
    form.resetFields();
    setSelectedUsers([]);
    setSelectedUserId([]);
    props.onCancel()
  }

  const onSelectUser = (value: any[], options: FriendInfoType[]) => {
    setSelectedUsers(options);
    setSelectedUserId(value)
  }

  const onDeleteUser = (index: number) => {
    const newSelectedUserId = cloneDeep(selectedUserId);
    const newSelectedUsers = cloneDeep(selectedUsers);
    newSelectedUserId.splice(index, 1);
    newSelectedUsers.splice(index, 1);
    setSelectedUserId(newSelectedUserId);
    setSelectedUsers(newSelectedUsers);
  }

  const onSubmit = () => {
    form.validateFields()
      .then(async (values) => {
        const params = {
          ...values,
          creator: userInfo._id,
          users: selectedUserId,
        }
        const { groupId, status } = await ApiHelper.createGroup(params)
        if(status === "success") {
          message.success(`${values.groupName} 群聊创建成功`);
          onCancel();
        }
      })
      .catch(() => {})
  }
  
  return <Modal title={"创建群聊"}
                destroyOnClose
                width={850}
                centered
                onCancel={onCancel}
                open={props.visible} 
                {...ModelBaseConfig}>
    <Flex gap={10}>
      <LeftWrapper>
        <UserSelector value={selectedUserId}
                      onSelect={onSelectUser}/>
      </LeftWrapper>
      <RightWrapper>
        <div className={"container"}>
          <Form {...FormItemLayout}
                form={form}>
            <Form.Item<FormTypes>
              name="groupName"
              label="群名称"
              rules={[{ required: true, message: "请输入群聊名称" }]}
              initialValue={`${userInfo.nickname}创建的群聊`}>
                <Input placeholder={'请填写群聊名称'}/>
            </Form.Item>
            <Form.Item<FormTypes>
              name="groupNumber" 
              label={"群号"}
              rules={[{ required: true, message: "请输入正确的群号" },
                      { len: 12, message: "请输入12位的群号" }]}>
                <Input type={"number"} placeholder={'请填写群号，长度为12的数字'}/>
            </Form.Item>
            <Form.Item<FormTypes>
              name="sign" 
              label={"群简介"}>
                <Input.TextArea style={{resize: "none"}} 
                                rows={4}
                                placeholder={'请填写群简介，字数不超过100字～'}/>
            </Form.Item>
          </Form>
          <UsersBox>
            <div className={"title"}>
              <div>群成员</div>
              <div>{selectedUserId.length > 0 ? `已选择${selectedUserId.length}个成员` : "未选择成员"}</div>
            </div>
            {
              selectedUsers.map((user, index) => <UserItem key={user._id}>
                <div className={"close"}>
                  <CIcon size={16} value="icon-guanbi" color="#666" onClick={() => onDeleteUser(index)}/>
                </div>
                <Avatar size={48} src={user.avatarImage}/>
                <div className={"name"}>{user.nickname}</div>
              </UserItem>)
            }
          </UsersBox>
        </div>
        <Footer>
          <Button danger 
                  type="primary" 
                  className={"footer-btn"}
                  onClick={onCancel}>取消</Button>
          <Button type="primary" 
                  className={"footer-btn"} 
                  disabled={selectedUserId.length <= 0}
                  onClick={onSubmit}>创建</Button>
        </Footer>
      </RightWrapper>
    </Flex>
  </Modal>
}

export default AddGroupModal

const LeftWrapper = styled.div`
  & {
    box-sizing: border-box;
    padding: 12px;
    width: 35%;
    height: 50vh;
    overflow-y: scroll;
    border-radius: 4px;
    background: #f3f3f3;
  }
`
const RightWrapper = styled.div`
  & {
    position: relative;
    flex: 1;
    border-radius: 4px;
    background: #f3f3f3;
    height: 50vh;
    overflow: hidden;
    .container {
      box-sizing: border-box;
      padding: 24px 12px 12px;
      width: 100%;
      height: 50vh;
      overflow-y: scroll;
    }
  }
`
const UsersBox = styled.div`
  & {
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
    padding: 26px 0 48px 70px;
    .title {
      position: absolute;
      top: 0;
      width: calc(100% - 110px);
      display: flex;
      justify-content: space-between;
    }
  }
`
const UserItem = styled.div`
  & {
    position: relative;
    width: 72px;
    padding: 4px;
    .close {
      cursor: pointer;
      position: absolute;
      right: 10px;
      top: -5px;
    }
    .name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      width: 100%;
      font-size: 12px;
      color: #000;
    }
  }
`
const Footer = styled.div`
  & {
    position: absolute;
    left: 0;
    bottom: 0;
    display: flex;
    gap: 24px;
    box-sizing: border-box;
    width: 100%;
    padding: 0 45px 12px;
    background: #f3f3f3;
    .footer-btn {
      flex: 1;
    }
  }
`