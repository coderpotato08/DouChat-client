import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { RoleType } from "../../constant/meeting-types";
import { useState } from "react";
import CreateMeetingModal from "../../components/create-meeting-modal";

const Test = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState<boolean>(false)

  const createMeeting = (id: string) => { 
    navigate(`/video-meeting/${id}`, {
      state: {
        role: RoleType.CREATOR,
      }
    })
  }

  const joinMeeting = (id: string) => { 
    navigate(`/video-meeting/${id}`, {
      state: {
        role: RoleType.PARTICIPANT,
      }
    })
  }

  return <>
    <Button onClick={() => createMeeting("cc6e5506-fbea-4b0d-82c3-6d9a47756799")}>创建会议</Button>
    <Button onClick={() => joinMeeting("cc6e5506-fbea-4b0d-82c3-6d9a47756799")}>进入会议</Button>
    <Button onClick={() => createMeeting("123456789")}>创建会议2</Button>
    <Button onClick={() => joinMeeting("eb2dd7b9-a98c-46e5-ada3-5b6b90c8f8e3")}>进入会议2</Button>
    <p>
      <Button type="primary" onClick={() => setVisible(true)}>创建会议modal</Button>
    </p>
    <CreateMeetingModal visible={visible}
                        onCancel={() => setVisible(false)}/>
  </>
}

export default Test