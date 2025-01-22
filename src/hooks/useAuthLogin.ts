import { LocalStorageHelper, StorageKeys } from "@helper/storage-helper";

export enum AuthPlatform {
  github = "github",
  google = "google",
}

export type AuthLoginProps = {
  platform: AuthPlatform;
};

export const useAuthLogin = () => {
  return async (props: AuthLoginProps) => {
    const { platform } = props;
    switch (platform) {
      case AuthPlatform.github:
        LocalStorageHelper.setLocalData(
          StorageKeys.LOGIN_THIRD_PLATFORM,
          AuthPlatform.github,
          300
        );
        window.location.href = `http://localhost:3030/auth/github`;
        break;
      case AuthPlatform.google:
        LocalStorageHelper.setLocalData(
          StorageKeys.LOGIN_THIRD_PLATFORM,
          AuthPlatform.google,
          300
        );
        window.location.href = `http://localhost:3030/auth/google`;
        break;
      default:
        throw new Error("不支持的登录平台");
    }
  };
};
