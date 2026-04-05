import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchRecent = createAsyncThunk('messages/fetchRecent', async ({ token }) => {
  const res = await fetch('/api/messages/recent', { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'Failed')
  return data.conversations
})

export const fetchConversation = createAsyncThunk('messages/fetchConversation', async ({ token, id }) => {
  const res = await fetch(`/api/messages/conversation/${id}`, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'Failed')
  return { id, messages: data.messages }
})

export const sendMessage = createAsyncThunk('messages/send', async ({ token, form }, thunkAPI) => {
  const res = await fetch('/api/messages/send', { method: 'POST', body: form, headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'Failed')
  return data.message
})

export const markSeen = createAsyncThunk('messages/markSeen', async ({ token, from }) => {
  const res = await fetch('/api/messages/mark-seen', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ from }) })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'Failed')
  return { from }
})

const slice = createSlice({
  name: 'messages',
  initialState: { conversations: [], active: { id: null, messages: [] }, status: 'idle', error: null },
  reducers: {
    clearActive(state) { state.active = { id: null, messages: [] } }
  },
  extraReducers: (b) => {
    b.addCase(fetchRecent.fulfilled, (s, a) => { s.conversations = a.payload })
    b.addCase(fetchConversation.fulfilled, (s, a) => { s.active = { id: a.payload.id, messages: a.payload.messages } })
    b.addCase(sendMessage.fulfilled, (s, a) => { if (s.active.id === a.payload.to || s.active.id === a.payload.from) s.active.messages.push(a.payload) })
    b.addCase(markSeen.fulfilled, (s, a) => { if (s.active.id === a.payload.from) s.active.messages = s.active.messages.map(m => ({ ...m, seen: true })) })
  }
})

export const { clearActive } = slice.actions
export default slice.reducer
