import CIcon from "@components/c-icon";
import { Button } from "antd";
import { FC } from "react";
import styled from "styled-components";
import { MeetingToolsEnum } from "../types/tools";
import { useAppSelector } from "@store/hooks";
import { userSelector } from "@store/index";
import { UserData } from "@constant/meeting-types";

export type OptionItem = {
  key: MeetingToolsEnum;
  icon: string;
  title: string;
  params?: Record<string, any>;
  onClick?: (params: any) => void | Promise<any>;
}

export type ToolListProps = {
  meetingCreator: UserData;
  cameraEnable: boolean;
  audioEnable: boolean;
  extraOptions?: OptionItem[];
  onClickQuick: () => void;
  onChangeDeviceStatus: (
    type: "video" | "audio",
    enable: boolean,
    needEmit: boolean
  ) => void;
}

export const MeetingToolList: FC<ToolListProps> = (props) => {
  const userInfo = useAppSelector(userSelector);

  const { 
    meetingCreator,
    cameraEnable,
    audioEnable,
    extraOptions = [],
    onClickQuick,
    onChangeDeviceStatus,
  } = props;

  return <OptionsWrapper>
    <div className={"device-list"}>
      <OptionsItem onClick={() => onChangeDeviceStatus("video", !cameraEnable, true)}>
        <CIcon value={`icon-camera${cameraEnable ? "" : "-static"}`}
          size={28}
          color="#fff" />
        摄像头
      </OptionsItem>
      <OptionsItem onClick={() => onChangeDeviceStatus("audio", !audioEnable, true)}>
        <CIcon value={`icon-audio${audioEnable ? "" : "-static"}`}
          size={28}
          color="#fff" />
        麦克风
      </OptionsItem>
    </div>
    {
      extraOptions.map((opt) => {
        return <OptionsItem key={opt.key}>
          <CIcon value={opt.icon} size={28} color="#fff" />
          {opt.title}
        </OptionsItem>
      })
    }
    <Button danger
      type={"primary"}
      className={"cancel"}
      onClick={onClickQuick}>
      {meetingCreator?._id === userInfo._id ? "结束会议" : "退出会议"}
    </Button>
  </OptionsWrapper>
}

const OptionsWrapper = styled.div`
  & {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 65px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 26px;
    border-top: 2px solid #000;
    background: #333;
    .device-list {
      display: flex;
      gap: 20px;
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
    }
    .cancel {
      position: absolute;
      right: 8px;
      bottom: 12px;
    }
  }
`
const OptionsItem = styled.div`
  & {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 12px;
    .device-icon {
      position: relative;
    }
  }
`