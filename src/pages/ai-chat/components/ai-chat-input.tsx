import { Sender } from "@ant-design/x";
import { FC, useState } from "react";
import styled from "styled-components";

type AiChatInputProps = {

}
export const AiChatInput: FC<AiChatInputProps> = () => {

  const [fileList, setFileList] = useState<File[]>([])

  const onSubmit= (message: string) => {
    console.log(message)
  } 
  
  return <AiChatInputWrapper>
    <Sender
      allowSpeech
      submitType="shiftEnter"
      placeholder="请输入shift+enter发送消息"
      style={{ backgroundColor: '#fff' }} 
      onSubmit={onSubmit}/>
  </AiChatInputWrapper>
}

const AiChatInputWrapper = styled.div`
  & {
    box-sizing: border-box;
    padding: 18px 24px;
    width: 100%;
    background-color: #f3f3f3;
  }
`