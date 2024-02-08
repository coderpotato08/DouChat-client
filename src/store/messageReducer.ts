import { PayloadAction, createSlice } from '@reduxjs/toolkit';
interface MessageState {
  totalUnreadNum: number,
  messageList: any[],
  messageListCache: Record<string, any[]>
  recentSubmitMessage: any
}
const initialState: MessageState = {
  totalUnreadNum: 0,
  messageList: [],
  messageListCache: {},
  recentSubmitMessage: {},
}
const messageSlice = createSlice({
  name: "message",
  initialState: initialState,
  reducers: {
    setTotalUnreadNum: (state, action: PayloadAction<{num: number}>) => {
      const { payload: { num } } = action;
      return {
        ...state,
        totalUnreadNum: num,
      }
    },
    addTotalUnreadNum: (state) => {
      return {
        ...state,
        totalUnreadNum: state.totalUnreadNum + 1,
      }
    },
    subTotalUnreadNum: (state, action: PayloadAction<{num: number}>) => {
      const { payload: { num } } = action;
      return {
        ...state,
        totalUnreadNum: state.totalUnreadNum - num > 0 ? state.totalUnreadNum - num : 0,
      }
    },
    addMessage: (state, action: PayloadAction<{message: any}>) => {
      const { payload: { message } } = action;
      return {
        ...state,
        recentSubmitMessage: message,
        messageList: [...state.messageList, message]
      }
    },
    addTipMessage: (state, action: PayloadAction<{message: any}>) => {
      const { payload: { message } } = action;
      return {
        ...state,
        messageList: [...state.messageList, message]
      }
    },
    pushMessageList: (state, action: PayloadAction<{messageList: any}>) => {  // 
      const { payload: { messageList } } = action;
      return {
        ...state,
        messageList: state.messageList.length > 0 ? [...state.messageList, ...messageList] : [...messageList]
      }
    },
    changeMessageList: (state, action: PayloadAction<{messageList: any}>) => {
      const { payload: { messageList } } = action;
      return {
        ...state,
        messageList,
      }
    },
    cacheMessageList: (state, action: PayloadAction<{contactId: string}>) => {
      const { payload: { contactId } } = action;
      return {
        ...state,
        messageList: [],
        messageListCache: {
          ...state.messageListCache,
          [contactId]: state.messageList,
        },
      }
    }
  }
})

export const {
  addMessage,
  addTipMessage,
  pushMessageList,
  changeMessageList,
  cacheMessageList,
  setTotalUnreadNum,
  addTotalUnreadNum,
  subTotalUnreadNum,
} = messageSlice.actions;

export const totalUnreadNumSelector = ({ message }: { message: MessageState}) => message.totalUnreadNum;
export const recentSubmitMessageSelector = ({ message }: { message: MessageState}) => message.recentSubmitMessage;
export const messageListSelector = ({ message }: { message: MessageState}) => message.messageList;
export const messageListCacheSelector = ({ message }: { message: MessageState}) => message.messageListCache;

export default messageSlice.reducer;