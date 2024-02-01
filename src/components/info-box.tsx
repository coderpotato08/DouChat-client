import { GlobalToken, theme } from 'antd';
import React, { FC, PropsWithChildren, ReactNode } from 'react'
import styled from 'styled-components'

const { useToken } = theme;

interface InfoBoxProps {
  title: string,
  optionsNode: ReactNode
}
const InfoBox:FC<PropsWithChildren<InfoBoxProps>> = (props: PropsWithChildren<InfoBoxProps>) => {
  const { 
    title, 
    optionsNode 
  } = props;
  const { token } = useToken();
  return (
    <Wrapper $token={token}>
      <div className='title-wrapper'>
        <div className={"title"}>{title}</div>
      </div>
      <div className={"scroll-box"}>
        {props.children}  
      </div>
      {optionsNode}
    </Wrapper>
  )
}

export default InfoBox

const Wrapper = styled.div<{
  $token: GlobalToken
}>`
  & {
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    margin: 48px;
    width: calc(100% - 96px);
    height: calc(100% - 96px);
    min-height: 580px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 0 3px 3px rgba(0,0,0,.2);
    .scroll-box {
      width: 100%;
      height: calc(100% - 60px - 84px);
      margin-bottom: 60px;
      overflow-y: scroll;
    }
    .title-wrapper {
      display: flex;
      align-items: center;
      position: relative;
      height: 60px;
    }
    .title {
      position: absolute;
      margin-left: 24px;
    }
    .title::after {
      content: '';
      position: absolute;
      height: 2px;
      left: 0;
      right: 0;
      bottom: -4px;
      border-radius: 2px;
      background: ${props => props.$token.colorPrimary};
    }
  }
`