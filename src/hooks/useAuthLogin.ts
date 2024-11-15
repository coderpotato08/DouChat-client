
export enum AuthPlatform {
  github = 'github',
}

export type AuthLoginProps = {
  platform: AuthPlatform
}

export const useAuthLogin = () => {
  return async (props: AuthLoginProps) => {
    const { platform } = props;
    switch (platform) {
      case AuthPlatform.github:
        window.location.href = `http://localhost:3030/auth/github`;
        break;
      default:
        throw new Error('不支持的登录平台');
    }
  }
}