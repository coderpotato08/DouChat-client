import { Button, Input, message } from "antd"
import { FC, useState } from "react";
import styled from "styled-components"
import { AxiosHelper } from "../../../helper/axios-helper";
import { ApiEnum } from "../../../constant/api-types";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LocalStorageHelper, StorageKeys } from "../../../helper/storage-helper";
import { setUserInfo } from "../../../store";
import { Toastify } from "../../../helper/toastify-helper";

const Login:FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onLogin = () => {
    if (!username) {
      message.error("请填写用户名");
      return;
    }
    if (!password) {
      message.error("请填写密码");
      return;
    }
    const params = {
      username,
      password,
    }
    AxiosHelper.post(ApiEnum.LOGIN, params)
      .then((res: any) => {
        if (res.code && res.code !== 10000) return;
        const { userInfo } = res;
        LocalStorageHelper.setItem(StorageKeys.USER_INFO, userInfo);
        dispatch(setUserInfo(userInfo));
        Toastify("success", "登录成功", () => {
          navigate("/chat/message")
        })
      })
  }
  
  return <Wrapper>
    <h1>Login</h1>
    <div className='tips'>
      <span>Don't have an account? </span>
      <span>Create your account</span>
      <span>, it takes less than a minute</span>
    </div>
    <div className='form'>
      <Input 
        placeholder='Username'
        value={username}
        onChange={(e) => setUsername(e.target.value)}/>
      <Input
        placeholder='Password'
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}/>
    </div>
    <Button className='login-btn' type='primary' onClick={onLogin}>LOGIN</Button>
  </Wrapper>
}

export default Login

const Wrapper = styled.div`
  & {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    padding: 70px 60px;
    > h1 {
      color: #333;
    }
    .tips {
      color: #666;
      margin-bottom: 40px;
      > span:nth-child(2) {
        cursor: pointer;
        color: #1890ff;
      }
    }
    .login-btn {
      letter-spacing: 2px;
      font-size: 18px;
      font-weight: bold;
      height: 40px;
      margin-top: 60px;
    }
    .ant-input {
      border: none;
      border-radius: 0;
      margin-bottom: 20px;
      border-bottom: 2px solid #DCDCDC;
    }
    .ant-input:focus {
      box-shadow: none;
    }
  }
`