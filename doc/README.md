# DouChat客户端
## 项目介绍
前端技术栈：react hook + ts + socket.io-client + webRtc。

后端技术栈：koa + ts + socket.io + mongoose

数据库：mongodb

## 功能介绍
以下是目前完成的功能

## 项目启动

启动前需要完成也写配置与依赖包的安装

项目目前用npm管理包，先安装依赖
> `npm install`

启动项目
> `npm run start`  
> 项目运行于本地 3000端口

域名映射
> mac 需要到host文件下配置域名映射， 加上一行`127.0.0.1 http://dev.dou-chat.com`

访问
> 地址 `http://dev.dou-chat.com`

注意：如果想要在多端调试视频会议，需要在统一局域网下，访问运行端的ip，并在chrome的安全上下文下做如下配置
> 访问 `chrome://flags/#unsafely-treat-insecure-origin-as-secure`  
> 
> 并在`insecure origins treated as secure
`下配置运行端的ip与端口，选择 Enabled，这样才能在本地访问其他端的http ip地址下拥有navigator的**媒体流权限**
![](./doc/assets/chrome-config_1.png)

桌面端dev环境访问
> `npm run tauri:dev`
### 1. 用户1对1聊天
   - 用户聊天由redux本地缓存
   - 聊天支持多种聊天信息的发送，包括文本，图片，语音，文件消息
   - 模拟微信功能，包括聊天最近时间的展示规则、用户入群退群提示、@艾特用户等
   - 聊天框的删除，删除后删除对应的聊天记录
### 2. 用户聊天模糊查询（仿微信）
   - 支持多维度查询：包括用户，群聊，聊天记录
   - 支持定位群聊和定位聊天记录
### 3. 群聊天
  - 功能与1对1类似
### 4. 基于webRtc的多人视频会议
   - 支持多人会议，入群自动开启麦克风和关闭麦克风
   - 用户可以自行打开和关闭摄像头和麦克风

目前项目在持续更新功能中。。。，暂时只支持浏览器本地访问，后续准备接入tauri产出桌面应用。
