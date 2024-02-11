import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ChatStateType {
  selectedId: string
  selectedChat: any
  isGroup: boolean
}

const initialState: ChatStateType = {
  selectedId: "",
  selectedChat: {},
  isGroup: false,
}

const chatSlice = createSlice({
  name: "chat",
  initialState: initialState,
  reducers: {
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
  setSelectedId,
  setSelectedChat,
  cleanSelectedChat,
} = chatSlice.actions;

export const selectedChatSelector = (({ chat }: { chat : ChatStateType}) => chat.selectedChat);
export const isGroupSelector = (({ chat }: { chat : ChatStateType}) => chat.isGroup);

export default chatSlice.reducer