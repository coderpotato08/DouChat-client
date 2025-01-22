import { AuthPlatform, useAuthLogin } from "@hooks/useAuthLogin";
import { message } from "antd";
import styled from "styled-components";

type AuthButtonProps = {
  key: string;
  icon: string;
  onClick?: () => void;
}
const AUTH_BUTTON_LIST = [
  { key: AuthPlatform.github, icon: require('@assets/imgs/Github.png') },
  { key: AuthPlatform.google, icon: require('@assets/imgs/Google.png') },
]
const AuthButton = (props: AuthButtonProps) => {
  return <div className="auth-button" onClick={props.onClick}>
    <img src={props.icon} alt={`${props.key} outh2.0 icon`} />
  </div>
}
export const AuthLogin = () => {
  const authLogin = useAuthLogin();

  const onClickButton = async (type: AuthPlatform) => {
    try {
      await authLogin({ platform: type })
    } catch (err: any) {
      message.error((err as Error).message);
    }
  };

  return <AuthLoginWrapper>
    <div className="title">第三方账号登录</div>
    <AuthButtonList>
      {
        AUTH_BUTTON_LIST.map((item) => <AuthButton
          key={item.key}
          icon={item.icon}
          onClick={() => onClickButton(item.key as AuthPlatform)}
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
      img {
        width: 48px;
        height: 48px;

      }
    }
  }
`