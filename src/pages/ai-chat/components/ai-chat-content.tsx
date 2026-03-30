import { Welcome } from "@ant-design/x";
import { FC } from "react";
import styled from "styled-components";

type AiChatContentProps = {

}
export const AiChatContent: FC<AiChatContentProps> = () => {
  return <AiChatContentWrapper>
    <Welcome
      style={{ padding: '32px 64px', backgroundColor: 'transparent' }}
      icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
      title="Hello, I'm Ant Design X"
      description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
    />
  </AiChatContentWrapper>
}

const AiChatContentWrapper = styled.div`
  & {
    flex: 1;
    width: 100%;
  }
`