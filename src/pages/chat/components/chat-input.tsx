import CIcon from "../../../components/c-icon";
import styled from "styled-components";
import { Flex, Button } from "antd";
import { ClipboardEvent, FC, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { base64ToImageFile } from "../../../helper/common-helper";
import { debounce } from "lodash";
import EmojiPicker from "../../../components/emoji-picker";
import { ApiHelper } from "../../../helper/api-helper";

interface ChatInputProps {
  onSubmit: (value: string) => void
}

const imgMap = new Map(); // base64 => file

const ChatInput:FC<ChatInputProps> = (props: ChatInputProps) => {
  const messageInputRef = useRef<HTMLInputElement>(null);
  const inputChildNodes = useRef<any>([]);
  const [message, setMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<any>(null);
  const { onSubmit } = props;

  const onMessageInput = (e: FormEvent) => {
    setMessage((e.target as HTMLInputElement).innerHTML);
  }

  const onInputPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const imgNodes = messageInputRef.current!.querySelectorAll('img');
    if (imgNodes.length > 0) {
      imgNodes.forEach((imgNode: HTMLImageElement) => {
        imgNode.style.width = "45%"
      })
    }
    setMessage(messageInputRef.current!.innerHTML);
  }

  const onClickSubmit = () => {
    const imgNodes = messageInputRef.current!.querySelectorAll('img');
    const imgReq: Promise<any>[] = [];
    // 图文信息 处理图片url；
    if(imgNodes && imgNodes.length > 0) {
      imgNodes.forEach((node: HTMLImageElement) => {
        if(imgMap.has(node.src)) {
          const formData = new FormData();
          formData.append('image', imgMap.get(node.src));
          imgReq.push(ApiHelper.uploadImage(formData));
        }
      })
      Promise.allSettled(imgReq)
        .then((res: any[]) => {
          const imgSrcList = res.map((data) => data.status === 'fulfilled' ? data.value.filename : '');
          const matchRes = message.matchAll(/<img[^>]+src="([^"]*)"/g);  
          let resMessage = message;
          [...matchRes].forEach((match, index) => {
            resMessage = resMessage.replace(match[1], imgSrcList[index]);
          })
          submitMessage(resMessage)
        })
    } else {
      submitMessage(message);
    }
  }

  const submitMessage = (msg: any) => {
    onSubmit(msg);
    messageInputRef.current!.innerHTML = "";
    inputChildNodes.current = [];
    setMessage("");
  }

  const onSelectEmoji = (emoji: any, event: PointerEvent) => {
    setSelectedEmoji(emoji);
    messageInputRef.current!.innerHTML += `<span>${emoji.native}</span>`
    setMessage(messageInputRef.current!.innerHTML);
  }

  const handleChildNodes = useCallback(debounce(() => {
    inputChildNodes.current = (messageInputRef.current!.childNodes)
    // 处理图片，缓存file
    const imgNodes = messageInputRef.current!.querySelectorAll('img');
    if (imgNodes.length > 0) {
      imgNodes.forEach((imgNode: HTMLImageElement) => {
        let base64Url = imgNode.src;
        imgNode.style.width = '45%';
        if (!imgMap.has(base64Url)) {
          const {key, file} = base64ToImageFile(base64Url);
          imgMap.set(key, file);
        }
      })
    }
  }, 16), [])

  useEffect(() => () => {
    if (messageInputRef.current?.innerHTML) {
      handleChildNodes();
    }
  }, [messageInputRef.current?.innerHTML])

  return <InputContainer>
    <Flex className="wrapper" gap={10} align="flexStart">
      <div className="add-option">
        <CIcon value="icon-tianjia" size={24} color={"#666"}/>
      </div>
      <MessageInput>
        <EmojiPicker onSelect={onSelectEmoji}/>
        <div className={"chat-input"}
             ref={messageInputRef}
             contentEditable="true" 
             spellCheck="false"
             onInput={onMessageInput}
             onPaste={onInputPaste}>
        </div>
        <Button className="submit-btn" 
                type="primary" 
                onClick={onClickSubmit}>
          SUBMIT
        </Button>
      </MessageInput>
      <div className="voice">
        <CIcon value="icon-yuyin" size={20} color={"#545454"}/>
      </div>
    </Flex>
  </InputContainer>
}

export default ChatInput;

const InputContainer = styled.div`
  & {
    flex-shrink: 0;
    box-sizing: border-box;
    width: 100%;
    padding: 0 18px 12px;
    background: #F3F3F3;
    .add-option, .voice {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 2px solid #d9d9d9;
    }
    .chat-input {
      box-sizing: border-box;
      flex: 1;
      min-height: 40px;
      max-height: 190px;
      line-height: 28px;
      font-size: 16px;
      border: 2px solid #d9d9d9;
      border-radius: 4px;
      transition: all .4s;
      padding: 4px 95px 4px 40px;
      overflow-y: scroll;
      transition: all .4;
      &:focus-visible {
        border-color: rgb(22, 119, 255);
      }
    }
    .add-option {
      border-radius: 4px;
    }
    .voice {
      border-radius: 50%;
    }
    .wrapper {
      width: 100%;
      height: 100%;
      padding: 10px;
      background: #FFFFFF;
      border-radius: 4px;
      box-shadow: 0 0 5px 5px rgba(0,0,0,0.02);
    }
  }
`
const MessageInput = styled.div`
  & {
    position: relative;
    flex: 1;
    .submit-btn {
      position: absolute;
      bottom: 4px;
      right: 5px;
    }
  }
`