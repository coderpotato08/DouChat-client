import { Badge, Popover } from "antd"
import { useCallback, useState } from "react";
import CIcon from "@components/c-icon";
import { styled } from "styled-components";
import CreateMeetingModal from "@components/create-meeting-modal";
import { usePopup } from "@hooks/usePopup";
import AddFriendModal from "@components/add-friend-modal";
import CreateGroupModal from "@components/create-group-modal";

enum ToolType {
  ADD_FRIEND = 'add-friend',
  CREATE_GROUP = 'create-group',
  CREATE_MEETING = 'create-meeing',
}
const toolList = [
  {key: ToolType.ADD_FRIEND, name: "添加好友", icon: "icon-add_friends"},
  {key: ToolType.CREATE_MEETING, name: "创建会议", icon: "icon-video-meeting"},
  {key: ToolType.CREATE_GROUP, name: "创建群聊", icon: "icon-add-group"},
]

const ToolList = () => {
  const [createMeetingMdoal_open, createMeetingMdoalPopup] = usePopup();  // 创建会议
  const [addFriendModal_open, addFriendModalPopup] = usePopup();  // 添加好友
  const [addGroupModal_open, addGroupModalPopup] = usePopup();  // 添加好友

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
        addFriendModalPopup();
        break;
      case ToolType.CREATE_MEETING:
        createMeetingMdoalPopup();
        break;
      case ToolType.CREATE_GROUP:
        addGroupModalPopup();
        break;
    }
  }, [])
  
  return <>
    <Popover placement={"bottom"}
             zIndex={990}
             color={"#f9f9f9"}
             overlayInnerStyle={{padding: 0}}
             content={renderToolListContent}>
      <Badge count={5} size={"small"}>
        <CIcon style={{cursor: 'pointer'}} 
              value="icon-more" 
              size={24} 
              color="#000"/>
      </Badge>
    </Popover>
    <CreateMeetingModal visible={createMeetingMdoal_open}
                        onCancel={createMeetingMdoalPopup}/>
    <AddFriendModal visible={addFriendModal_open}
                    onCancel={addFriendModalPopup}/>
    <CreateGroupModal visible={addGroupModal_open}
                      onCancel={addGroupModalPopup}/>
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