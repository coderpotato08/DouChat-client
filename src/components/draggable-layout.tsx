import styled, { CSSProperties } from "styled-components";
import invariant from "tiny-invariant";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { disableNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview';
import { preventUnhandled } from '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled';
import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { DragLocationHistory } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";
import { LocalStorageHelper, StorageKeys } from "@helper/storage-helper";

const widthBoundary = {
  start: 350,
  min: 250,
  max: 450
}
interface DraggableLayout {
  menuRender: ReactNode,
  contentRender?: ReactNode,
}

export const DraggableLayout: FC<DraggableLayout> = (props) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const [initialWidth, setInitialWidth] = useState<number>(
    LocalStorageHelper.getItem(StorageKeys.MENU_LOCAL_WIDTH) || widthBoundary.start
  );
  const [draggingStatus, setDraggingStatus] = useState<'idle' | 'dragging'>('idle');

  const getProposedWidth = (
    initialWidth: number,
    location: DragLocationHistory
  ) => {
    const diffX = location.current.input.clientX - location.initial.input.clientX;
    const proposedWidth = initialWidth + diffX;
    return Math.max(widthBoundary.min, Math.min(widthBoundary.max, proposedWidth));
  }

  useEffect(() => {
    invariant(dividerRef.current);
    return draggable({
      element: dividerRef.current,
      onGenerateDragPreview({ nativeSetDragImage }) {
        disableNativeDragPreview({ nativeSetDragImage });
        preventUnhandled.start();
      },
      onDragStart() {
        setDraggingStatus('dragging');
      },
      onDrag({ location }) {
        contentRef.current?.style.setProperty(
          '--local-resizing-width',
          `${getProposedWidth(initialWidth, location)}px`
        );
      },
      onDrop({ location }) {
        const localWidth = getProposedWidth(initialWidth, location);
        setDraggingStatus('idle');
        setInitialWidth(localWidth);
        LocalStorageHelper.setItem(StorageKeys.MENU_LOCAL_WIDTH, localWidth);
        preventUnhandled.stop();
      }
    })
  }, [initialWidth])
  return (
    <Wrapper>
      <GroupWrapper
        ref={contentRef}
        style={{ '--local-initial-width': `${initialWidth}px` } as CSSProperties}>
        {props.menuRender}
        <DraggableDivider ref={dividerRef} />
      </GroupWrapper>
      <ContainerWrapper>
        {props.contentRender}
      </ContainerWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  & {
    display: flex;
    width: 100%;
    height: 100%;
  }
`
const DraggableDivider = styled.div`
  & {
    position: absolute;
    right: 0;
    top: 0;
    width: 2px;
    height: 100%;
    background: #f3f3f3;
    cursor: col-resize;
  }
`

export const GroupWrapper = styled.div`
  & {
    position: relative;
    display: flex;
    flex-direction: column;
    width: var(--local-resizing-width, var(--local-initial-width));
    height: 100vh;
    box-shadow: 0px 0 15px 5px rgba(0,0,0,.2);
  }
`

export const ContainerWrapper = styled.div`
  & {
    position: relative;
    flex-grow: 1;
    flex-shrink: 1;
    overflow-y: scroll;
    height: 100vh;
    background: #F3F3F3;
  }
`