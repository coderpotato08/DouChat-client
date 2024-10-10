import styled from "styled-components";

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