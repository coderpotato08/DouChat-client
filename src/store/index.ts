import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatReducer';
import userReducer from './userReducer';
import messageReducer from './messageReducer';

const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: userReducer,
    message: messageReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export * from './userReducer';
export * from './messageReducer';
export * from './chatReducer'
export default store;