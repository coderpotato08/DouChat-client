import CIcon from "@components/c-icon";
import { AuthPlatform, useAuthLogin } from "@hooks/useAuthLogin";
import styled from "styled-components";

type AuthButtonProps = {
  icon: string;
  onClick?: () => void;
}
const AUTH_BUTTON_LIST = [
  { key: 'github', icon: 'icon-github' },
]
const AuthButton = (props: AuthButtonProps) => {
  return <div className="auth-button" onClick={props.onClick}>
    <CIcon value={props.icon} size={36} color="#ffffff" />
  </div>
}
export const AuthLogin = () => {
  const authLogin = useAuthLogin();
  return <AuthLoginWrapper>
    <div className="title">第三方账号登录</div>
    <AuthButtonList>
      {
        AUTH_BUTTON_LIST.map((item) => <AuthButton 
          key={item.key} 
          icon={item.icon} 
          onClick={() => authLogin({ platform: item.key as AuthPlatform })}
        />)
      }
    </AuthButtonList>
  </AuthLoginWrapper>
};

const AuthLoginWrapper = styled.div`
  & {
    margin-top: 30px;
    width: 100%;
    .title {
      position: relative;
      width: fit-content;
      margin: 0 auto;
      color: #999;
    }
    .title::after, .title::before {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 100px;
      height: 1px;
      background: #999;
    }
    .title::after {
      right: -120px;
    }
    .title::before {
      left: -120px;
    }
  }
`
const AuthButtonList = styled.div`
  & {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
    .auth-button {
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #999;
    }
  }
`