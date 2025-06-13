## webRTC sdp会话描述协议

> SDP（会话描述协议）是WebRTC中用于协商媒体和网络配置的核心协议。它本质上是一个文本格式的描述，包含了建立媒体会话所需的所有信息。

### SDP的基本结构
```
v=0
o=- 7614219274584779017 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE audio video
a=msid-semantic: WMS
m=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 126
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:khLS
a=ice-pwd:cxLzteJaJBou3DspNaPsJhlQ
a=fingerprint:sha-256 FA:14:42:3B:C7:97:1B:E8:...
a=setup:actpass
a=mid:audio
...
```

### SDP中的关键字段
#### 1. 会话级字段：
   - v= - 协议版本
   - o= - 会话发起者标识
   - s= - 会话名称
   - t= - 会话时间
#### 2. 媒体级字段：
   - m= - 媒体描述（音频/视频/数据）
   - c= - 连接信息
   - a= - 各种属性（最重要的部分）

### WebRTC特有的SDP属性
WebRTC扩展了SDP，添加了许多特有的属性：
#### 1. ICE相关：
  - a=ice-ufrag - ICE用户名片段
  - a=ice-pwd - ICE密码
  - a=candidate - ICE候选地址
#### 2. DTLS相关：
  - a=fingerprint - DTLS证书指纹
  - a=setup - DTLS角色协商
#### 3. 媒体能力：
  - a=rtpmap - 编解码器映射
  - a=fmtp - 编解码器参数
  - a=rtcp-fb - RTCP反馈机制
#### 4.带宽控制：
  - a=bundle - 媒体流捆绑
  - a=ssrc - 同步源标识
  
### SDP在WebRTC中的使用流程
#### 1.Offer/Answer模型：
  - 一方生成offer SDP
  - 另一方响应answer SDP
  - 通过信令通道交换这些SDP

#### 2.ICE候选收集：
  - 在SDP交换后，双方会继续交换ICE候选
  - 这些候选也被添加到SDP中

### SDP的修改和重新协商
WebRTC允许通过以下方式修改会话：
1. `createOffer()/createAnswer()`生成新的SDP
2. `setLocalDescription()/setRemoteDescription()`应用SDP
3. `addIceCandidate()`添加新的候选

## WebRTC 中的 ICE候选
> ICE（交互式连接建立）（Interactive Connectivity Establishment）是 WebRTC 用于建立点对点连接的核心协议，它帮助两端在网络条件复杂（如 NAT 和防火墙）的情况下建立直接通信。

### ICE 的基本原理
#### ICE 通过以下方式解决连接问题：
1. 收集所有可能的连接路径（候选地址）
2. 测试这些路径的可达性
3. 选择最优路径进行通信

#### ICE 候选（Candidates）类型
WebRTC 会收集三种主要类型的候选地址：
1. 主机候选（Host Candidate）
   - 设备的本地 IP 地址
   - 最直接的连接方式（如果双方在同一局域网）
2. 反射候选（Server Reflexive Candidate）
   - 通过 STUN 服务器获取的 NAT 外部地址
   - 当双方位于不同 NAT 后方时使用
3. 中继候选（Relayed Candidate）
   - 通过 TURN 服务器获取的中继地址
   - 当直接连接无法建立时的最后手段

### ICE 工作流程
#### 候选收集阶段
  - 收集所有可能的网络接口地址
  - 查询 STUN 服务器获取公网映射地址
  - 如果需要，从 TURN 服务器获取中继地址

#### 候选交换阶段
  - 通过信令通道交换候选信息
  - 候选信息包含在 SDP 中（a=candidate 行）

#### 连接检查阶段
  - 对每个候选对进行连通性测试
  - 使用 STUN 绑定请求进行测试

#### 连接建立阶段
  - 选择最优的可用连接路径
  - 建立 DTLS 安全连接

### ICE 在 SDP 中的表示
ICE 相关信息在 SDP 中表现为：
```sdp
a=ice-ufrag:khLS
a=ice-pwd:cxLzteJaJBou3DspNaPsJhlQ
a=candidate:842163049 1 udp 1677729535 192.168.1.100 53165 typ host
a=candidate:842163049 2 udp 1677729535 192.168.1.100 53166 typ host
a=candidate:1853887674 1 udp 33562367 74.125.24.127 53165 typ srflx raddr 192.168.1.100 rport 53165
```

### ICE 状态机
ICE 连接过程会经历以下状态：
1. new - 初始状态
2. gathering - 正在收集候选
3. complete - 候选收集完成
4. checking - 正在检查候选连通性
5. connected - 成功建立连接
6. disconnected - 连接断开
7. failed - 连接失败
8. closed - ICE 会话结束

### 实际应用中的注意事项
1. NAT 类型影响：对称型 NAT 会限制连接可能性
2. TURN 备用：确保配置了 TURN 服务器作为最后手段
3. ICE 重启：当网络条件变化时可能需要重启 ICE 过程
4. 多宿主设备：可能有多个网络接口需要测试

### ICE Candidate 候选对象的属性详解
> 在 WebRTC 中，ICE 候选（Candidate）对象描述了设备可能的网络连接端点。每个候选对象包含多个重要属性，用于建立最优的 P2P 连接。

#### 候选对象的核心属性
1. 基础属性
  - candidate (字符串) - 完整的候选字符串，格式为：
```text
candidate:<foundation> <component-id> <transport> <priority> <ip> <port> typ <type> [raddr <rel-addr>] [rport <rel-port>] [tcptype <tcp-type>] 
```
  - sdpMid (字符串) - 关联的媒体流标识符（如 "audio"、"video" 或 "data"）(**但在chrome中表现实际与字符串0，1，2对应**)
  - sdpMLineIndex (数字) - 关联的 SDP 媒体行索引（从 0 开始）

  - usernameFragment (字符串) - ICE 用户片段（对应 SDP 中的 ice-ufrag）