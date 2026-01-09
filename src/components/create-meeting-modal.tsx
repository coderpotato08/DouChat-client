import type { CreateMeetingParamsType } from "@constant/api-types";
import type { BaseModalProps } from "@constant/common-types";
import { RoleType } from "@constant/meeting-types";
import { RouterPath } from "@constant/router-types";
import { EventType } from "@constant/socket-types";
import { ApiHelper } from "@helper/api-helper";
import { formLayout } from "@helper/common-helper";
import { useOpenWebview } from "@hooks/webview/useOpenWebview";
import { useSocket } from "@store/context/createContext";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/index";
import { Form, Input, Modal, Select, Space, Switch } from "antd";
import { type FC, useCallback, useEffect, useState } from "react";
import { styled } from "styled-components";

const FormItemLayout = formLayout(6, 16);

type FormTypes = Partial<Omit<CreateMeetingParamsType, "creator" | "createTime">>

const CreateMeetingModal: FC<BaseModalProps> = (props: BaseModalProps) => {
  const {
    visible,
    onCancel,
    confirmCallback
  } = props;
  const openWebview = useOpenWebview(RouterPath.VideoMeeting, {

  });
  const socket = useSocket();
  const { nickname, _id } = useAppSelector(userSelector);
  const [form] = Form.useForm();
  const selectedUserList = Form.useWatch('userList', form);
  const [friendList, setFriendList] = useState<{ nickname: string; _id: string; avatarImage?: string }[]>([]);

  const onHandleCancel = useCallback(() => {
    onCancel?.();
    form.resetFields();
  }, [visible])

  const loadFriendList = () => {
    ApiHelper.loadFriendList({ userId: _id })
      .then(({ friendList }) => {
        const userList = friendList.map((item: { friendInfo: { nickname: string; _id: string; avatarImage?: string } }) => ({
          ...item.friendInfo,
        }))
        setFriendList(userList);
      })
  }

  const onCreateMeeting = async () => {
    await form.validateFields();
    const confirmValue: Required<FormTypes> = form.getFieldsValue();
    const params: CreateMeetingParamsType = {
      ...confirmValue,
      creator: _id,
      createTime: new Date(),
    }
    ApiHelper.createMeeting(params)
      .then((res: any) => {
        socket.emit(EventType.INVITE_MEETING, {
          meetingId: res.meetingId,
          ...params,
        })
        confirmCallback?.();
        onCancel();
        openWebview({
          id: res.meetingId,
          params: {
            role: RoleType.CREATOR
          },
        })
      })
  };

  useEffect(() => {
    form.setFieldValue('isJoinedMuted', selectedUserList && selectedUserList.length > 6);
  }, [selectedUserList])

  useEffect(() => {
    if (visible) {
      loadFriendList()
    }
  }, [visible])

  return <Modal destroyOnClose
    closeIcon={null}
    cancelText={"取消"}
    title={"新建会议"}
    okText={"创建会议"}
    onOk={onCreateMeeting}
    onCancel={onHandleCancel}
    open={visible}
    maskClosable={false}>
    <ModalWrapper>
      <Form {...FormItemLayout}
        form={form}>
        <Form.Item<FormTypes>
          name="meetingName"
          label={"会议名称"}
          rules={[{ required: true }]}
          initialValue={`${nickname}创建的会议`}
        >
          <Input placeholder={'请填写会议名称'} />
        </Form.Item>
        <Form.Item<FormTypes>
          name="userList"
          label={"邀请成员"}
          rules={[{ required: true }]}
        >
          <Select style={{ width: '100%' }}
            mode={"multiple"}
            options={friendList}
            fieldNames={{ label: 'nickname', value: '_id' }} />
        </Form.Item>
        <Form.Item label={"成员入会时静音"}>
          <Space>
            <Form.Item<FormTypes>
              name="isJoinedMuted"
              valuePropName={"checked"}
              initialValue={false}
            >
              <Switch style={{ marginRight: "10px" }} />
            </Form.Item>
            <div style={{ marginBottom: "24px" }}>超过6人后自动开启</div>
          </Space>
        </Form.Item>
      </Form>
    </ModalWrapper>
  </Modal>
}

export default CreateMeetingModal

const ModalWrapper = styled.div`
  & {
    width: 100%;
    user-select: none;
  }
`