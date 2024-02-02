import { Form, Input, Modal, Select, Space, Switch } from "antd";
import { CreateMeetingParamsType } from "@constant/api-types";
import { FC, useCallback, useEffect, useState } from "react";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/index";
import { styled } from "styled-components";
import { ApiHelper } from "@helper/api-helper";
import { useNavigate } from "react-router-dom";
import { RoleType } from "@constant/meeting-types";
import { useSocket } from "@store/context/createContext";
import { EventType } from "@constant/socket-types";
import { formLayout } from "@helper/common-helper";
import { BaseModalProps } from "@constant/common-types";

const FormItemLayout = formLayout(6, 16);
const temp_userList = [
  {
    _id: '63c50ec9b514ebc8491c08e8',
    username: 'luhaiyu002',
  },
  {
    _id: '63c5134e1d3b1256de04ca5f',
    username: 'luhaiyu003',
  },
  {
    _id: '63c5136b1d3b1256de04ca6c',
    username: 'luhaiyu004',
  },
  {
    _id: '63c50ec9b514ebc8491c08e1',
    username: 'luhaiyu005',
  },
  {
    _id: '63c5134e1d3b1256de04ca5f=2',
    username: 'luhaiyu006',
  },
  {
    _id: '63c5136b1d3b1256de04ca6c41',
    username: 'luhaiyu007',
  },
  {
    _id: '63c5136b1d3b1256de04ca6caf',
    username: 'luhaiyu008',
  },

]
type FormTypes = Partial<Omit<CreateMeetingParamsType, "creator" | "createTime">>

const CreateMeetingModal:FC<BaseModalProps> = (props: BaseModalProps) => {
  const {
    visible,
    onCancel,
    confirmCallback
  } = props;
  const navigate = useNavigate();
  const socket = useSocket();
  const { nickname, _id } = useAppSelector(userSelector);
  const [ form ] = Form.useForm();
  const selectedUserList = Form.useWatch('userList', form);
  const [ userList, setUserList ] = useState<any[]>([]);

  const onHandleCancel = useCallback(() => {
    onCancel();
    form.resetFields();
  }, [visible])

  const onCreateMeeting = () => {
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
        confirmCallback && confirmCallback();
        onCancel();
        navigate(`/video-meeting/${res.meetingId}?role=${RoleType.CREATOR}`, {
          state: {
            role: RoleType.CREATOR,
          }
        })
      })
  };

  useEffect(() => {
    form.setFieldValue('isJoinedMuted', selectedUserList && selectedUserList.length > 6);
  }, [selectedUserList])

  useEffect(() => {
    
  }, [])

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
          <Input placeholder={'请填写会议名称'}/>
        </Form.Item>
        <Form.Item<FormTypes> 
          name="userList" 
          label={"邀请成员"}  
          rules={[{ required: true }]}
        >
          <Select style={{width: '100%'}}
                  mode={"multiple"}
                  options={temp_userList}
                  fieldNames={{label: 'username', value: '_id'}}/>
        </Form.Item>
        <Form.Item label={"成员入会时静音"}>
          <Space>
            <Form.Item<FormTypes>
              name="isJoinedMuted"
              valuePropName={"checked"}
              initialValue={false}
            >
              <Switch style={{marginRight: "10px"}}/>
            </Form.Item>
            <div style={{marginBottom: "24px"}}>超过6人后自动开启</div>
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