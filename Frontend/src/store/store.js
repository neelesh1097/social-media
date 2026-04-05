import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import messagesReducer from './messagesSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    messages: messagesReducer,
  }
})

export default store
