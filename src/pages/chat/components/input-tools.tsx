import CIcon from '@components/c-icon';
import { GlobalToken, Upload, theme } from 'antd';
import React, { FC } from 'react'
import styled from 'styled-components'

const { useToken } = theme;

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

interface InputTools {
  visible: boolean
}
const InputTools:FC<InputTools> = (props: InputTools) => {
  const {
    visible
  } = props;

  return (
    <ToolsWrapper $isShowMore={visible}>
      <Upload>
        <ToolItem key={ToolKey.SEND_IMAGE}
                  title={"图片"}
                  icon={"icon-image"}/>
      </Upload>
      <Upload>
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
