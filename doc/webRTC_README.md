# webRTC使用时遇到的问题与解决

## 屏幕共享

> 在交换完sdp建立通信后，屏幕共享理论上无需重新进行sdp协商，因为使用相同的编解码器和传输通道（即仅替换了视频流的来源，但媒体参数不变）

WebRTC 允许通过 `RTCRtpSender.replaceTrack()` 方法直接替换发送端的视频流，而无需重新交换 SDP

```js
  const pc = peerMap[peerId]?.peer;
  const sender = pc.getSenders().find((sender) => sender.track?.kind === 'video');
  sender?.replaceTrack(screenVideoTrack);
```
还有就是记得在结束共享时记得把视频流的轨道换回来