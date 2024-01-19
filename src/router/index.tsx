import Chat from '@pages/chat';
import Message from '@pages/chat/message';
import Login from "@pages/login";
import VideoMeeting from '@pages/video/video-meeting';
import Test from '@pages/video/test';
import { RouteObject, Navigate } from 'react-router-dom';

const router: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to={"/login"}/> 
  },
  {
    path: "/login",
    element: <Login/>
  },
  {
    path: "/chat",
    element: <Chat/>,
    children: [
      {
        path: "message",
        element:<Message/>,
      }
    ]
  },
  {
    path: "/video-meeting/:id",
    element: <VideoMeeting/>
  },
  {
    path: "/test",
    element: <Test/>
  }
]

export default router;