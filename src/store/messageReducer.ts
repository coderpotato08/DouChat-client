import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface MessageState {
  messageList: any[],
  messageListCache: Record<string, any[]>
  recentSubmitMessage: any
}
const initialState: MessageState = {
  messageList: [],
  messageListCache: {},
  recentSubmitMessage: {},
}
const messageSlice = createSlice({
  name: "message",
  initialState: initialState,
  reducers: {
    addMessage:  (state, action: PayloadAction<{message: any}>) => {
      const { payload: { message } } = action;
      return {
        ...state,
        recentSubmitMessage: message,
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
  pushMessageList,
  changeMessageList,
  cacheMessageList,
} = messageSlice.actions;

export const recentSubmitMessageSelector = ({ message }: { message: MessageState}) => message.recentSubmitMessage;
export const messageListSelector = ({ message }: { message: MessageState}) => message.messageList;
export const messageListCacheSelector = ({ message }: { message: MessageState}) => message.messageListCache;

export default messageSlice.reducer;