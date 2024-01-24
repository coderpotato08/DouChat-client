import styled from "styled-components"

export const GroupWrapper = styled.div`
  & {
    display: flex;
    flex-direction: column;
    width: 25%;
    min-width: 310px;
    height: 100vh;
    border-right: 2px solid #ececec;
    box-shadow: 0px 0 15px 5px rgba(0,0,0,.2);
  }
`
export const ContainerWrapper = styled.div`
  & {
    position: relative;
    width: calc(100vw - 345px);
    height: 100vh;
    background: #F3F3F3;
  }
`

export const ShadowFloatBox = styled.div`
  & {
    padding: 12px 30px 12px 12px;
    width: 100%;
    height: 40px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 3px 3px 5px -2px rgba(0,0,0,.2);
    transition: all .4s;
  }
  &:hover {
    transform: translateX(-3px);
    transform: translateY(-3px);
    box-shadow: 3px 3px 5px 2px rgba(0,0,0,.2);
  }
`