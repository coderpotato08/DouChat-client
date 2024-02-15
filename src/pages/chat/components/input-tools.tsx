import CIcon from '@components/c-icon';
import { ApiEnum } from '@constant/api-types';
import { EventType } from '@constant/socket-types';
import { MessageTypeEnum } from '@constant/user-types';
import { getReceiverAndSender } from '@helper/common-helper';
import { createUidV4 } from '@helper/uuid-helper';
import { useSocket } from '@store/context/createContext';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { addMessage, selectedChatSelector, userSelector } from '@store/index';
import { GetProp, GlobalToken, Upload, UploadProps, message, theme } from 'antd';
import dayjs from 'dayjs';
import { FC, useMemo } from 'react'
import { useParams } from 'react-router-dom';
import styled from 'styled-components'

const { useToken } = theme;

type FileBeforeUploadType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
type FileOnChangeType = Parameters<GetProp<UploadProps, 'onChange'>>[0];

enum ToolKey {
  SEND_IMAGE = "send-image",
  UPLOAD_FILE = "upload-file"
}
const ToolItem = (props: {
  title: string,
  icon: string,
  onClick?: () => void
}) => {
  const { token } = useToken();
  return <ToolItemWrapper $token={token}>
    <CIcon value={props.icon} size={32} color={'#999'}/>
    <div className={'tool-title'}>{props.title}</div>
  </ToolItemWrapper>
}

const handleResponse = (response: any) => {
  const { code, data, msg } = response;
  if(code === 10000) {
    return data;
  } else {
    message.error(msg || "上传失败，请稍后再试");
    return {}
  }
}
interface InputToolsProps {
  visible: boolean,
}
const InputTools:FC<InputToolsProps> = (props: InputToolsProps) => {
  const {
    visible,
  } = props;
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const { id: selectedChatId } = useParams();
  const selectedChat = useAppSelector(selectedChatSelector);
  const userInfo = useAppSelector(userSelector);

  const isGroup = useMemo(() => selectedChatId && selectedChatId.indexOf("_") === -1, [selectedChatId])

  const beforeFileUpload = (file: FileBeforeUploadType) => {
    const { size } = file;
    const isLimit1G = size / 1024 / 1024 / 1024 <= 1;
    if(!isLimit1G) {
      message.error('文件大小不能超过 1GB!');
      return false
    }
    return true;
  }

  const onFileChange = ({ file }: FileOnChangeType) => {
    const { status, response } = file;
    if (status === "done") {
      const data = handleResponse(response);
      const fileMessage = {
        uid: createUidV4(),
        msgContent: data,
        msgType: MessageTypeEnum.FILE,
        time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      }
      if (isGroup) {
        socket.emit(EventType.SEND_GROUP_MESSAGE, {
          ...fileMessage,
          fromId: userInfo._id,
          groupId: selectedChatId,
        });
        dispatch(addMessage({ message: {
          ...fileMessage,
          fromId: userInfo,
          groupId: selectedChatId,
        } }))
      } else {
        const { users = [] } = selectedChat;
        const { receiver, sender } = getReceiverAndSender(users, userInfo._id);
        socket.emit(EventType.SEND_MESSAGE, {
          ...fileMessage,
          fromId: userInfo._id,
          toId: receiver._id,
        });
        dispatch(addMessage({ message: {
          ...fileMessage,
          fromId: userInfo,
          toId: receiver,
        } }));
      }
    }
  }

  return (
    <ToolsWrapper $isShowMore={visible}>
      <Upload>
        <ToolItem key={ToolKey.SEND_IMAGE}
                  title={"图片"}
                  icon={"icon-image"}/>
      </Upload>
      <Upload showUploadList={false}
              action={`${window.location.origin}/api/${ApiEnum.UPLOAD_FILE}`}
              beforeUpload={beforeFileUpload}
              onChange={onFileChange}>
        <ToolItem key={ToolKey.UPLOAD_FILE}
                  title={"文件"}
                  icon={"icon-upload-file"}/>
      </Upload>
    </ToolsWrapper>
  )
}

export default InputTools

const ToolsWrapper = styled.div<{
  $isShowMore: boolean
}>`
  & {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    box-sizing: border-box;
    overflow: hidden;
    width: 100%;
    background: #fff;
    transition: all .4s;
    height: ${props => props.$isShowMore ? "120px" : 0};
    padding: ${props => props.$isShowMore ? "10px 10px" : "0 10px"};
  }
`
const ToolItemWrapper = styled.div<{
  $token: GlobalToken
}>`
  & {
    box-sizing: border-box;
    cursor: pointer;
    padding: 12px 24px;
    border-radius: 4px;
    background: #fff;
    border: 1px solid #eee;
    transition: all .4s;
    .tool-title {
      text-align: center;
      margin-top: 4px;
      font-size: 14px;
      color: #666;
    }
  }
  &:hover {
    background: #fcfcfc;
    border-color: transparent;
    box-shadow: 0 0 5px 5px rgba(0,0,0,.06);
  }
`
