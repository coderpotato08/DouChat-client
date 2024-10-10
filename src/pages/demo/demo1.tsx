import { DraggableLayout } from "@components/draggable-layout";
import styled from "styled-components";

export const Demo1 = () => {
  return <DraggableLayout
    menuRender={<Menu />}
    contentRender={<Content />} />
}

const Menu = styled.div`
  & {
    background-color: chartreuse;
    width: 100%;
    height: 100%;
  }
`

const Content = styled.div`
  & {
    background-color: red;
    width: 100%;
    height: 100%;
  }
`