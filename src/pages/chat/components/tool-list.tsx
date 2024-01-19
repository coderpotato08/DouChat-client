import { Popover } from "antd"
import { useCallback, useState } from "react";
import CIcon from "@components/c-icon";
import { styled } from "styled-components";
import CreateMeetingModal from "@components/create-meeting-modal";
import { usePopup } from "@hooks/usePopup";

enum ToolType {
  ADD_FRIEND = 'add-friend',
  CREATE_MEETING = 'create-meeing',
}
const toolList = [
  {key: ToolType.ADD_FRIEND, name: "添加好友", icon: "icon-add_friends"},
  {key: ToolType.CREATE_MEETING, name: "创建会议", icon: "icon-video-meeting"},
]

const ToolList = () => {
  const [open, setOpen] = useState<boolean>(false);
  // const [open: createMeetingMdoal_open] = usePopup();
  const [createMeetingMdoal_open, createMeetingMdoalPopup] = usePopup();

  const renderToolListContent = useCallback(() => {
    return <ToolWrapper>
      {
        toolList.map((tool) => <ToolItem key={tool.key} 
                                         onClick={() => onClickTool(tool.key)}>
          <div className={"tool-icon"}>
            <CIcon size={36} value={tool.icon}/>
          </div>
          <div className={"tool-name"}>{tool.name}</div>
        </ToolItem>)
      }
    </ToolWrapper>
  }, [])

  const onClickTool = useCallback((type: ToolType) => {
    switch(type) {
      case ToolType.ADD_FRIEND:
        break;
      case ToolType.CREATE_MEETING:
        createMeetingMdoalPopup();
        break;
    }
  }, [])
  
  return <>
    <Popover placement={"bottom"}
             zIndex={990}
             color={"#f9f9f9"}
             overlayInnerStyle={{padding: 0}}
             content={renderToolListContent}
             open={open}>
      <CIcon style={{cursor: 'pointer'}} 
             value="icon-more" 
             size={24} 
             color="#000"
             onClick={() => setOpen(!open)}/>
    </Popover>
    <CreateMeetingModal visible={createMeetingMdoal_open}
                        onCancel={createMeetingMdoalPopup}/>
  </>
}

export default ToolList;

const ToolWrapper = styled.div`
  & {
    box-sizing: border-box;
    display: grid;
    gap: 18px 28px;
    grid-template-columns: repeat(4, 48px);
    width: 300px;
    padding: 12px;
  }
`
const ToolItem= styled.div`
  & {
    position: relative;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .tool-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .tool-name {
      color: #000;
      font-weight: 500;
      font-size: 12px;
    }
  }
`