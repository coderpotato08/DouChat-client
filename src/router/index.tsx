import Chat from '@pages/chat';
import Message from '@pages/chat/message';
import Login from "@pages/login";
import VideoMeeting from '@pages/video/video-meeting';
import { RouteObject, Navigate } from 'react-router-dom';
import Relationship from '@pages/chat/relationship';
import ChatContainer from '@pages/chat/components/chat-container';
import Register from '@pages/register';
import { SocketProvider } from '@store/context/createContext';
import { Demo1 } from '@pages/demo/demo1';
import { Demo2 } from '@pages/demo/demo2';

const router: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to={"/login"} />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/chat",
    element: <Chat />,
    children: [
      {
        path: "message",
        element: <Message />,
        children: [
          {
            path: ":id",
            element: <ChatContainer />,
          },
        ]
      },
      {
        path: "relationship",
        element: <SocketProvider>
          <Relationship />
        </SocketProvider>
      }
    ]
  },
  {
    path: "/video-meeting/:id",
    element: <VideoMeeting />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/demo1",
    element: <Demo1 />
  },
  {
    path: "/demo2",
    element: <Demo2 />
  }
]

export default router;