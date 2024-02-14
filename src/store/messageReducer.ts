import { PayloadAction, createSlice } from '@reduxjs/toolkit';
interface MessageState {
  totalUnreadNum: number,
  hasMore: boolean,
  pageIndex: number,
  messageList: any[],
  messageListCache: Record<string, any[]>
  recentSubmitMessage: any
}
const initialState: MessageState = {
  totalUnreadNum: 0,
  hasMore: true,
  pageIndex: 0,
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
      const hasMore = messageList.length === 20;
      return {
        ...state,
        hasMore,
        pageIndex: state.pageIndex + 1,
        messageList: state.messageList.length > 0 ? [...messageList, ...state.messageList] : [...messageList]
      }
    },
    changeMessageList: (state, action: PayloadAction<{messageList: any}>) => {
      const { payload: { messageList } } = action;
      return {
        ...state,
        messageList,
      }
    },
    setPageIndex: (state, action: PayloadAction<number>) => {
      const { payload } = action;
      return {
        ...state,
        pageIndex: payload,
      }
    },
    cacheMessageList: (state, action: PayloadAction<{contactId: string}>) => {
      const { payload: { contactId } } = action;
      const newmMessageListCache = contactId ? {[contactId]: state.messageList} : {}
      return {
        ...state,
        pageIndex: 0,
        messageList: [],
        messageListCache: {
          ...state.messageListCache,
          ...newmMessageListCache
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
  setPageIndex,
} = messageSlice.actions;

export const messageSelector = ({ message }: { message: MessageState}) => message;
export const hasMoreSelector = ({ message }: { message: MessageState}) => message.hasMore;
export const pageIndexSelector = ({ message }: { message: MessageState}) => message.pageIndex;
export const totalUnreadNumSelector = ({ message }: { message: MessageState}) => message.totalUnreadNum;
export const recentSubmitMessageSelector = ({ message }: { message: MessageState}) => message.recentSubmitMessage;
export const messageListSelector = ({ message }: { message: MessageState}) => message.messageList;
export const messageListCacheSelector = ({ message }: { message: MessageState}) => message.messageListCache;

export default messageSlice.reducer;