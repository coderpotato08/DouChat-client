import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { omit } from 'lodash';
import { LocalStorageHelper, StorageKeys } from '../helper/storage-helper';

const saveOnlineStorage = (onlineUser: Record<string, any>, num: number) => {
  LocalStorageHelper.setItem(StorageKeys.ONLINE_USER, onlineUser);
  LocalStorageHelper.setItem(StorageKeys.ONLINE_NUM, num);
}
const userSlice = createSlice({
  name: 'user',
  initialState: {
    onlineUser: LocalStorageHelper.getItem(StorageKeys.ONLINE_USER) || {},
    onlineNum: LocalStorageHelper.getItem(StorageKeys.ONLINE_NUM) || 0,
    userInfo: LocalStorageHelper.getItem(StorageKeys.USER_INFO) || {},
  },
  reducers: {
    setUserInfo: (state, action:PayloadAction<any>) => ({
      ...state, 
      userInfo: action.payload
    }),
    addUser: (state, action:PayloadAction<any>) => {
      const newOnlineUser = {...state.onlineUser, ...action.payload};
      const newNum = Object.keys(newOnlineUser).length;
      saveOnlineStorage(newOnlineUser, newNum);
      return {  
        ...state, 
        onlineUser: newOnlineUser,
        onlineNum: newNum,
      }
    },
    deleteUser: (state, action:PayloadAction<{username: string}>) => {
      const { payload: { username } } = action;
      const newOnlineUser = omit(state.onlineUser, [username]);
      const newNum = Object.keys(newOnlineUser).length;
      saveOnlineStorage(newOnlineUser, newNum);
      return {  
        ...state, 
        onlineUser: newOnlineUser,
        onlineNum: newNum,
      }
    }
  }
})

export const { 
  setUserInfo,
  addUser,
  deleteUser, 
} = userSlice.actions;
export const userSelector = (state: any) => state.user.userInfo;
export const onlineInfoSelector = (state: any) => ({
  onlineUser: state.user.onlineUser,
  onlineNum: state.user.onlineNum,
})

export default userSlice.reducer;