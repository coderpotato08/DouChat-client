import { MeetingMessageData } from "@constant/meeting-types";
import { MeetingChatBox } from "@pages/video/_compt/meeting-chat-box";
import { useState } from "react"

export const Demo2 = () => {
  const [list, setList] = useState<MeetingMessageData[]>([]);

  const submitMessage = (data: MeetingMessageData) => {
    setList(preList => ([...preList, data]));
    // let timer = setTimeout(() => {
    //   setList(preList => preList.filter(item => item.mid !== data.mid));
    //   clearTimeout(timer);
    // }, 5000)
  };

  return <div style={{ position: "relative", width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
    <MeetingChatBox messageList={list} onSend={submitMessage} />
  </div>
}