import { Avatar, Flex } from "antd";
import styled from "styled-components";

interface ChatAvatarProps {
  isGroup: boolean,
  imgUrl?: string,
  groupImgList?: string[],
}

const ChatAvatar = (props: ChatAvatarProps) => {
  const { isGroup, imgUrl, groupImgList } = props;
  return isGroup ? <GroupAvatar>
    <Flex wrap="wrap" gap={2}>
      {
        groupImgList && groupImgList.length > 0 &&
        groupImgList.map((url: string) => <Avatar src={url} shape="square" size={18}/>)
      }
    </Flex>
  </GroupAvatar> : <UserAvatar src={imgUrl}/>
}

export default ChatAvatar;

const UserAvatar = styled.img`
  & {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: 2px solid #ECECEC;
  }
`

const GroupAvatar = styled.div`
  & {
    padding: 2px;
    box-sizing: border-box;
    width: 46px;
    height: 46px;
    border: 2px solid #ECECEC;
    border-radius: 6px;
    > img {
      width: 20px;
      height: 20px;
    }
  }
`