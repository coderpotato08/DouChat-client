import { Popover } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import styled, { CSSProperties } from "styled-components";
import React, { useCallback, useState } from "react";

const iconStyle: CSSProperties = {
  cursor: "pointer",
  fontSize: '20px',
  color: '#ded300'
}

interface EmojiPickerProps {
  onSelect: (emojiInfo: any, event: PointerEvent) => void
}
const EmojiPicker = (props: EmojiPickerProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const onSelectEmoji = useCallback((emojiInfo: any, event: PointerEvent) => {
    onSelect(emojiInfo, event)
  }, [])

  const { onSelect } = props;
  return <Popover content={<Picker data={data}
                                   theme={'light'}
                                   onEmojiSelect={onSelectEmoji}/>}
                  trigger="click"
                  open={open}
                  onOpenChange={() => setOpen(!open)}>
    <Wrapper>
      <SmileOutlined style={iconStyle}/>
    </Wrapper>
  </Popover>
}

export default React.memo(EmojiPicker)

const Wrapper = styled.div`
  & {
    position: absolute;
    top: 50%;
    left: 8px;
    transform: translateY(-50%);
  }
`