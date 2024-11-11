import { LoadingOutlined } from '@ant-design/icons'
import CIcon from '@components/c-icon'
import { RegisterParamsType } from '@constant/api-types'
import { GenderEnum } from '@constant/user-types'
import { ApiHelper } from '@helper/api-helper'
import { createAvatarBase64 } from '@helper/common-helper'
import { createUidV4 } from '@helper/uuid-helper'
import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
const potato_image = require('@assets/imgs/potato.png');

enum PasswordStatus {
  STRONG = "strong",
  MODERATE = "moderate",
  WEAK = "weak",
}
const PasswordStatusMap: Record<PasswordStatus, { label: string, color: string }> = {
  [PasswordStatus.STRONG]: { label: "强", color: "#52C41A" },
  [PasswordStatus.MODERATE]: { label: "中", color: "#FADB14" },
  [PasswordStatus.WEAK]: { label: "弱", color: "#F5222D" },
}
const GENDERS = [
  { icon: 'icon-gender-man', key: GenderEnum.MAN, color: '#1296db' },
  { icon: 'icon-gender-girl', key: GenderEnum.GIRL, color: '#fb506f' },
]
const PasswordRules = [/(?=.*[a-z])/g, /(?=.*[A-Z])/g, /(?=.*\d)/g, /(?=.*[!@#$%^&*()\-_=+{};:,<.>]])/g];
type FormTypes = RegisterParamsType
const Register: FC = () => {
  const navigate = useNavigate()
  const [form] = useForm();
  const [gender, setGender] = useState<GenderEnum>(GenderEnum.MAN);
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus | null>(null);
  const [imgLoading, setImgLoading] = useState<boolean>(false);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string>("");

  useEffect(() => {
    getRandomAvatar();
    form.resetFields();
    createAvatarBase64('jack').then((base64) => console.log(base64))
  }, [])

  const getRandomAvatar = async () => {
    if (imgLoading) return;
    setImgLoading(true);
    const uri = await createAvatarBase64(createUidV4());
    setAvatarImageUrl(uri);
  }

  const changePasswordStatus = (e: any) => {
    const str = e.target.value;
    if (!str) {
      setPasswordStatus(null);
      return;
    }
    let score = 0;
    for (let i = 0; i < PasswordRules.length; i++) {
      if (PasswordRules[i].test(str)) {
        score += 1
      } else break;
    }
    setPasswordStatus(score >= 3 ? PasswordStatus.STRONG : score === 2 ? PasswordStatus.MODERATE : PasswordStatus.WEAK)
  }

  const submit = () => {
    form.validateFields()
      .then((values) => {
        const params: RegisterParamsType = {
          ...values,
          gender,
          avatarImage: avatarImageUrl,
        }
        ApiHelper.register(params)
          .then(({ status }) => {
            if (status === "success") {
              message.success("注册成功", 1.5, () => navigate('/login'));
            }
          })
      })
      .catch(() => { })
  }

  const goToLogin = () => {
    navigate('/login')
  }
  return (
    <Wrapper>
      <SpaceBox>
        <img className={'rotate-potato'} src={potato_image} alt='potato' />
        <h1>It's a potato</h1>
      </SpaceBox>
      <RegisterBox>
        <div className='scroll-wrapper'>
          <h1>Create an account</h1>
          <AvatarBox>
            {
              imgLoading && <div className={'loading-layer'}>
                <LoadingOutlined className='loading' />
              </div>
            }
            <img className={'avatar-img'}
              src={avatarImageUrl}
              onLoad={() => setImgLoading(false)}
              onClick={getRandomAvatar}
              alt='' />
          </AvatarBox>
          <GenderBox>
            {
              GENDERS.map((item) => <div key={item.key}
                style={item.key === gender ? { background: "#eeeeee" } : {}}
                onClick={() => setGender(item.key)}>
                <CIcon size={24} value={item.icon} color={item.color} />
              </div>)
            }
          </GenderBox>
          <Form className={"register-form"}
            form={form}
            name={"registerForm"}>
            <Form.Item<FormTypes>
              name={"nickname"}
              rules={[{ required: true, message: "请填写昵称" }]}>
              <Input placeholder='Nickname' />
            </Form.Item>

            <Form.Item<FormTypes>
              name={"username"}
              rules={[{ required: true, message: "请填写用户名" }]}>
              <Input placeholder='Username' />
            </Form.Item>

            <Form.Item style={{ position: "relative", marginBottom: 0 }}>
              <Form.Item<FormTypes>
                name={"password"}
                rules={[{ required: true, message: "请填写密码" },
                { min: 9, message: "密码长度必须大于等于9位" },
                { max: 20, message: "密码长度必须小于等于20位" }
                ]}>
                <Input.Password onChange={changePasswordStatus} placeholder='Password' />
              </Form.Item>
              {passwordStatus && <PasswordValidater $status={passwordStatus}>
                {passwordStatus && PasswordStatusMap[passwordStatus].label}
              </PasswordValidater>}
            </Form.Item>

            <Form.Item<FormTypes>
              name={"phoneNumber"}
              rules={[{ required: true, message: "请填写手机号" }]}>
              <Input placeholder='Phone number' />
            </Form.Item>

            <Form.Item<FormTypes>
              name={"email"}>
              <Input placeholder='Email' />
            </Form.Item>

          </Form>
          <Button className={'submit-btn'}
            disabled={imgLoading}
            type={'primary'}
            size={'large'}
            onClick={submit}>
            Create an account
          </Button>
          <div className={'tip'}>Already have an account?
            <div className={'login'} onClick={goToLogin}>
              <CIcon style={{ margin: "0 4px 0 12px" }} size={20} value={'icon-login'} />Log in
            </div>
          </div>
        </div>
      </RegisterBox>
    </Wrapper>
  )
}

export default Register

const Wrapper = styled.div`
  & {
    position: relative;
    width: 100vw;
    height: 100vh;
  }
`
const SpaceBox = styled.div`
  & {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 0;
    width: 60vw;
    height: 100vh;
    h1 {
      color: #bc8300;
      transition: all .5s;
    }
    h1:hover {
      transform: scale(1.2);
    }
    .rotate-potato {
      width: 240px;
      height: 240px;
      animation: rotatePotato 4s ease-in-out infinite;
    }
    @keyframes rotatePotato {
      0% {
        transform: scale(1) rotate(0deg);
      }
      50% {
        transform: scale(1.3) rotate(180deg);
      }
      100% {
        transform: scale(1) rotate(360deg);
      }
    }
  }
`
const GenderBox = styled.div`
  & {
    display: flex;
    gap: 24px;
    margin: 24px 0;
    > div {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 4px;
    }
  }
`
const AvatarBox = styled.div`
  & {
    position: relative;
    flex-shrink: 0;
    width: 64px;
    height:  64px;
    border-radius: 50%;
    background: #eeeeee;
    overflow: hidden;
    .loading-layer {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      left: 0;
      width: 64px;
      height:  64px;
      background: rgba(0,0,0,.5);
    }
    .loading {
      font-size: 36px;
      color: #fff;
    }
    .avatar-img {
      width: 64px;
      height: 64px;    
    }
  }
`
const RegisterBox = styled.div`
  & {
    box-sizing: border-box;
    position: absolute;
    right: 0;
    width: 40vw;
    height: 100vh;
    border-radius: 12px 0 0 12px;
    background: #fff;
    padding: 6%;
    .scroll-wrapper {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      height: 100%;
      overflow-y: scroll;
    }
    .tip {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #666;
      margin-top: 64px;
      .login {
        cursor: pointer;
        display: flex;
        align-items: center;
      }
    }
    .register-form {
      width: 100%;
    }
    .ant-input, .ant-input-outlined {
      padding: 0 8px;
      width: 100%;
      border: none;
      background: #f0f0f0 !important;
      height: 36px;
      color: #666;
    }
    .submit-btn {
      cursor: pointer;
      width: 100%;
    }
  }
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      0deg,
      hsl(300deg, 100%, 50%),
      hsl(200deg, 100%, 50%),
      hsl(100deg, 100%, 50%)
    );
    border-radius: 12px 0 0 12px;
    filter: blur(24px);
    z-index: -1;
  }
`
const PasswordValidater = styled.div<{
  $status?: PasswordStatus | null
}>`
  & {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    text-align: center;
    line-height: 30px; 
    display: ${props => props.$status ? "block" : "none"};
    background: ${props => props.$status ? PasswordStatusMap[props.$status].color : "#fff"};
    position: absolute;
    color: #fff;
    font-weight: bold;
    top: 2px;
    right: -40px;
    transition: all .4s;
  }
`