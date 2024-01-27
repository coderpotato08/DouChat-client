import React, { ReactNode, useContext } from "react";
import { socketHost } from "@constant/api-types";
import { io, Socket } from "socket.io-client";

export const socket = io(socketHost, {
  transports: ['websocket', 'polling'], // 指定传输方式
  autoConnect: true, // 是否自动连接
  reconnection: true, // 是否自动重新连接
  reconnectionAttempts: 100, // 重新连接尝试次数
  reconnectionDelay: 1000 // 重新连接延迟时间（毫秒）
})

const SocketContext = React.createContext<Socket>(socket);
SocketContext.displayName = 'SocketContext';
export const SocketProvider = ({ children }: { children: ReactNode }) => {
  return <SocketContext.Provider value={socket}>
    {children}
  </SocketContext.Provider>
}
export const useSocket = (): Socket => {
  const context = useContext(SocketContext);
  return context;
};
export const SocketConsumer = SocketContext.Consumer
export default SocketContext