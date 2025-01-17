import { useEffect } from "react";
import { EventSourceMessage, fetchEventSource } from '@fortaine/fetch-event-source';
export const Demo2 = () => {

  useEffect(() => {
    fetchEventSource('http://localhost:3030/ai/test-sse', {
      onopen: async () => {
        console.log('open')
      },
      onmessage: (e: EventSourceMessage) => {
        console.log(e, Date.now())
      },
      onclose: () => {
        console.log('close')
      },
    })
  }, [])

  return <div style={{ position: "relative", width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
  </div>
}