import { Avatar, Flex } from "antd";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";

interface ChatAvatarProps {
  isGroup: boolean,
  imgUrl?: string,
  size?: "small" | "large"
  groupImgList?: string[],
}

const ChatAvatar = (props: ChatAvatarProps) => {
  const { isGroup, imgUrl, groupImgList, size = "small" } = props;

  return isGroup ? <GroupAvatar size={size}>
    <Flex wrap="wrap" gap={size === "small" ? 2 : 4}>
      {
        groupImgList && groupImgList.length > 0 &&
        groupImgList.map((url: string) => <Avatar
          key={uuidv4()}
          src={url}
          shape="square"
          size={size === "small" ? 18 : 45} />)
      }
    </Flex>
  </GroupAvatar> : <UserAvatar size={size} src={imgUrl} />
}

export default ChatAvatar;

const UserAvatar = styled.img<{
  size: "small" | "large"
}>`
  & {
    flex-shrink: 0;
    width: ${props => props.size === "small" ? "46px" : "72px"};
    height: ${props => props.size === "small" ? "46px" : "72px"};
    border-radius: 50%;
    border: 2px solid #ECECEC;
  }
`

const GroupAvatar = styled.div<{
  size: "small" | "large"
}>`
  & {
    flex-shrink: 0;
    padding: 2px;
    box-sizing: border-box;
    width: ${props => props.size === "small" ? "46px" : "102px"};
    height: ${props => props.size === "small" ? "46px" : "102px"};
    border: 2px solid #ECECEC;
    border-radius: 6px;
    background: #fff;
  }
`