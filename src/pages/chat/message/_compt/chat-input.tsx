import CIcon from "../../../../components/c-icon";
import styled from "styled-components";
import { Flex, Button, theme, GlobalToken, Popover, Avatar } from "antd";
import { ClipboardEvent, FC, FormEvent, KeyboardEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { base64ToImageFile, handleRemindStr, textAndImageFormat, textFormat } from "../../../../helper/common-helper";
import { debounce } from "lodash";
import EmojiPicker from "../../../../components/emoji-picker";
import { ApiHelper } from "../../../../helper/api-helper";
import { useAppSelector } from "@store/hooks";
import { isGroupSelector, userSelector } from "@store/index";
import InputTools from "../../components/input-tools";
import { MessageInfoType, MessageTypeEnum } from "@constant/user-types";
import { useParams } from "react-router-dom";

const { useToken } = theme;
interface ChatInputProps {
  onSubmit: (message: Array<MessageInfoType> | MessageInfoType) => void,
}

const imgMap = new Map(); // base64 => file
const imgFixStyle = "max-width: 100%; height: auto; width: auto; max-height: 120px;"
const ChatInput: FC<ChatInputProps> = (props: ChatInputProps) => {
  const {
    onSubmit
  } = props;
  let metaPress = false;
  const { token } = useToken();
  const { id: selectedChatId } = useParams();
  const userInfo = useAppSelector(userSelector);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const inputChildNodes = useRef<any>([]);
  const [message, setMessage] = useState("");
  const [groupUsers, setGroupUsers] = useState<any[]>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<any>(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState<number>(0);
  const [remindOpen, setRemindOpen] = useState<boolean>(false);
  const [isShowMore, setIsShowMore] = useState<boolean>(false)

  const isGroup = useMemo(() => selectedChatId && selectedChatId.indexOf("_") === -1, [selectedChatId])

  const onMessageInput = (e: FormEvent) => {
    const messageStr = (e.target as HTMLInputElement).innerHTML
    if (remindOpen) {  // 处理查询@用户
      debounceSearchUsers(messageStr);
    }
    setMessage(messageStr);
  }

  const debounceSearchUsers = useCallback(debounce(async (text) => {
    const regexUsername = /@([^@]+)$/;  // 匹配最后一个以 '@' 开头的字符串
    const match = text.match(regexUsername);
    const keyWord = match ? match[1] : "";
    const userlist = await loadGroupUsers(keyWord);
    setRemindOpen(userlist.length > 0);
  }, 500), [selectedChatId]);

  const onInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const key = e.key;
    switch (key) {
      case "Meta": // 处理组合按键
        metaPress = true;
        break;
      case "@": // @ 用户
        if (!isGroup) return;
        loadGroupUsers();
        setRemindOpen(true)
        break;
      case " ": // 空格 关闭@框
        onCloseRemindBox();
        break;
      case "Enter":
        if (metaPress) return;
        // onClickSubmit();
        break;
      default:
        break;
    }
  }

  const onInputKeyUp: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const key = e.key;
    switch (key) {
      case "Meta":
        metaPress = false;
        break;
      default:
        break;
    }
  }

  const onCloseRemindBox = () => {
    if (remindOpen) {
      setRemindOpen(false);
      setSelectedUserIndex(0);
    }
  }

  const onInputPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    setMessage(messageInputRef.current!.innerHTML);
  }

  const onClickSubmit = () => {
    const imgNodes = messageInputRef.current!.querySelectorAll('img');
    const imgReq: Promise<any>[] = [];
    // 图文信息 处理图片url；
    if (imgNodes && imgNodes.length > 0) {
      imgNodes.forEach((node: HTMLImageElement) => {
        if (imgMap.has(node.src)) {
          const formData = new FormData();
          formData.append('image', imgMap.get(node.src));
          imgReq.push(ApiHelper.uploadImage(formData));
        }
      })
      Promise.allSettled(imgReq)
        .then((res: any[]) => {
          const imgMessageList = res
            .map((data) => data.status === 'fulfilled' ? data.value.filename : '')
            .filter(Boolean)
            .map((src) => ({
              value: `<img src=${src} style="${imgFixStyle}"/>`,
              type: MessageTypeEnum.IMAGE,
            }))
          const messageList = textAndImageFormat(message)
            .filter(Boolean)
            .map((text) => ({
              value: text,
              type: MessageTypeEnum.TEXT,
            }))
          console.log(messageList, imgMessageList)
          submitMessage([...messageList, ...imgMessageList])
        })
    } else {
      submitMessage({ value: textFormat(message), type: MessageTypeEnum.TEXT });
    }
  }

  const submitMessage = (message: Array<MessageInfoType> | MessageInfoType) => {
    onSubmit(message);
    cleanInputContent();
  }

  const cleanInputContent = () => {
    imgMap.clear();
    messageInputRef.current!.innerHTML = "";
    inputChildNodes.current = [];
    setMessage("");
  }

  const onSelectEmoji = (emoji: any, event: PointerEvent) => {
    setSelectedEmoji(emoji);
    messageInputRef.current!.innerHTML += `<span>${emoji.native}</span>`
    setMessage(messageInputRef.current!.innerHTML);
  }

  const onSelectRemindUser = (index: number) => {
    const selectedUsesr: any = groupUsers ? groupUsers[index] : {};
    const newMessage = handleRemindStr(message, selectedUsesr.nickname); // 处理@用户字符串替换
    messageInputRef.current!.innerHTML = newMessage;
    setMessage(newMessage);
    setRemindOpen(false);
    setSelectedUserIndex(0);
  }

  const loadGroupUsers = async (keyWord?: string) => {
    if (isGroup) {
      const params = keyWord ? { groupId: selectedChatId!, keyWord } : { groupId: selectedChatId! };
      const list = await ApiHelper.loadGroupUsers(params);
      const newList = list.filter((user: any) => user._id !== userInfo._id);
      setGroupUsers(newList);
      return newList
    }
    return [];
  }

  const renderRemindList = () => {
    return <RemindBox>
      {
        groupUsers && groupUsers.length > 0 &&
        groupUsers.map((user, index) => <UserItem
          key={user._id}
          $token={token}
          $isActive={index === selectedUserIndex}
          onMouseEnter={() => setSelectedUserIndex(index)}
          onClick={() => onSelectRemindUser(index)}>
          <Avatar src={user.avatarImage} size={24} />
          <div className={"nickname"}>{user.nickname}</div>
        </UserItem>)
      }
    </RemindBox>
  }

  const handleChildNodes = useCallback(debounce(() => {
    inputChildNodes.current = (messageInputRef.current!.childNodes)
    // 处理图片，缓存file
    const imgNodes = messageInputRef.current!.querySelectorAll('img');
    if (imgNodes.length > 0) {
      imgNodes.forEach((imgNode: HTMLImageElement) => {
        let base64Url = imgNode.src;
        imgNode.setAttribute("style", imgFixStyle);
        if (!imgMap.has(base64Url)) {
          const { key, file } = base64ToImageFile(base64Url);
          imgMap.set(key, file);
        }
      })
    }
  }, 16), []);

  const handleShowTools = () => {
    setIsShowMore(!isShowMore)
  }

  useEffect(() => {
    cleanInputContent();
  }, [selectedChatId])

  useEffect(() => () => {
    if (messageInputRef.current?.innerHTML) {
      handleChildNodes();
    }
  }, [messageInputRef.current?.innerHTML]);

  return <InputContainer $token={token}>
    <Wrapper>
      <Flex className="wrapper" gap={10} align="flexStart">
        <div className="add-option" onClick={handleShowTools}>
          <CIcon value="icon-tianjia" size={24} color={"#666"} />
        </div>
        <Popover
          open={remindOpen}
          trigger={"click"}
          placement={"topLeft"}
          overlayInnerStyle={{ padding: "4px" }}
          content={renderRemindList()}
          onOpenChange={onCloseRemindBox}>
          <MessageInput>
            <EmojiPicker onSelect={onSelectEmoji} />
            <div className={"chat-input"}
              ref={messageInputRef}
              contentEditable="true"
              spellCheck="false"
              onKeyDown={onInputKeyDown}
              onKeyUp={onInputKeyUp}
              onInput={onMessageInput}
              onPaste={onInputPaste}>
            </div>
            <Button className="submit-btn"
              type="primary"
              onClick={onClickSubmit}>
              SUBMIT
            </Button>
          </MessageInput>
        </Popover>
        <div className="voice">
          <CIcon value="icon-yuyin" size={20} color={"#545454"} />
        </div>
      </Flex>
      <InputTools visible={isShowMore} />
    </Wrapper>
  </InputContainer>
}

export default ChatInput;

const InputContainer = styled.div<{
  $token: GlobalToken,
}>`
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
      max-height: 124px;
      line-height: 28px;
      font-size: 16px;
      border: 2px solid #d9d9d9;
      border-radius: 4px;
      transition: all .4s;
      padding: 4px 95px 4px 40px;
      overflow-y: scroll;
      &:focus-visible {
        border-color: ${props => props.$token.colorPrimary};
      }
    }
    .add-option {
      border-radius: 4px;
    }
    .voice {
      border-radius: 50%;
    }
  }
`
const Wrapper = styled.div`
  & {
    padding: 10px;
    background: #FFFFFF;
    border-radius: 4px;
    box-shadow: 0 0 5px 5px rgba(0,0,0,0.02);
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
const RemindBox = styled.div`
  & {
    width: 180px;
    max-height: 240px;
    overflow-y: scroll;
  }
`
const UserItem = styled.div<{
  $token: GlobalToken
  $isActive: boolean
}>`
  & {
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all .4s;
    padding: 6px;
    border-radius: 4px;
    background-color: ${({ $isActive, $token }) => $isActive ? $token.colorInfoBg : ""};
    .nickname {
      margin-left: 8px;
      font-size: 12px;
      width: 130px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
`