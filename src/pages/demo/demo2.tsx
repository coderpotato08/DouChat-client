import { useEffect, useState } from "react";
import { EventSourceMessage, fetchEventSource } from '@fortaine/fetch-event-source';
import ChatInput from "@pages/chat/message/_compt/chat-input";
export const Demo2 = () => {

  const [value, setValue] = useState();

  useEffect(() => {
    // fetchEventSource('http://localhost:3030/ai/test-sse', {
    //   onopen: async () => {
    //     console.log('open')
    //   },
    //   onmessage: (e: EventSourceMessage) => {
    //     console.log(e, Date.now())
    //   },
    //   onclose: () => {
    //     console.log('close')
    //   },
    // })
  }, [])

  return <>
    <div>{value ? JSON.stringify(value) : ''}</div>
    <div style={{position: 'fixed', bottom: 0, width: '100%'}}>
      <ChatInput onSubmit={(message: any) => setValue(message)} />
    </div>
  </>
}