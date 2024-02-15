import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ChatStateType {
  chatList: any[]
  selectedId: string
  selectedChat: any
  isGroup: boolean
}

const initialState: ChatStateType = {
  chatList: [],
  selectedId: "",
  selectedChat: {},
  isGroup: false,
}

const chatSlice = createSlice({
  name: "chat",
  initialState: initialState,
  reducers: {
    setChatList: (state, action: PayloadAction<any[]>) => {
      const { payload } = action;
      return {
        ...state,
        chatList: payload,
      }
    },
    addChat: (state, action: PayloadAction<any>) => {
      const { payload: chat } = action;
      const newChatList = [...state.chatList]
      if(newChatList.findIndex((item) => (item.contactId || item.groupId) === (chat.contactId || chat.groupId)) > -1){ 
        return {...state}
      } else {
        newChatList.unshift(chat);
        return {
          ...state,
          chatList: newChatList,
        }
      }
    },
    deleteChat: (state, action: PayloadAction<number>) => {
      const { payload: index } = action;
      const newChatList = [...state.chatList];
      newChatList.splice(index, 1);
      return {
        ...state,
        chatList: newChatList,
      }
    },
    setSelectedId: (state, action: PayloadAction<{selectedId: string, isGroup: boolean}>) => {
      const { payload: { selectedId, isGroup } } = action;
      return {
        ...state,
        selectedId,
        isGroup,
      }
    },
    setSelectedChat: (state, action: PayloadAction<any>) => {
      const { payload: selectedChat } = action;
      return {
        ...state,
        selectedChat,
      }
    },
    cleanSelectedChat: (state) => {
      return {
        ...state,
        selectedId: "",
        selectedChat: {},
        isGroup: false,
      }
    },
  }
});

export const {
  setChatList,
  addChat,
  deleteChat,
  setSelectedId,
  setSelectedChat,
  cleanSelectedChat,
} = chatSlice.actions;

export const chatListSelector = (({ chat }: { chat : ChatStateType}) => chat.chatList);
export const selectedChatSelector = (({ chat }: { chat : ChatStateType}) => chat.selectedChat);
export const isGroupSelector = (({ chat }: { chat : ChatStateType}) => chat.isGroup);

export default chatSlice.reducer