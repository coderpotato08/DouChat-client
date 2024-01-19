import { FC, useState } from 'react';
import styled from 'styled-components'
import { ToastContainer } from 'react-toastify';
import LoginComp from './components/login'
import 'react-toastify/dist/ReactToastify.css';

const Login:FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true)

  return (
    <LoginWrapper>
      <div className='background'>
        <h1>Welcome</h1>
      </div>
      <div className='box'>
        {
          isLogin ? <LoginComp/> : null
        }
      </div>
      <ToastContainer/>
    </LoginWrapper>
  )
}

export default Login;

const LoginWrapper = styled.div`
  & {
    position: relative;
    display: flex;
    width: 100%;
    height: 100vh;
    .background {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      flex: 1;
      height: 100vh;
      background-size: 100% 100%;
      background-image: url(${require('../../assets/imgs/login-bg.jpeg')});
      > h1 {
        font-size: 60px;
        color: #fff;
      }
    }
    .box {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 24px;
      width: 40vw;
      height: 90vh;
      border-radius: 8px;
      box-shadow: -3px 0px 10px 3px rgba(0, 0, 0, 0.2);
    }
  }
`
