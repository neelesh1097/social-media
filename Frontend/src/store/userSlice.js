import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchUser = createAsyncThunk('user/fetch', async ({ token }, thunkAPI) => {
  const res = await fetch('/api/user/data', { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'Failed to fetch user')
  return data.user
})

export const updateUser = createAsyncThunk('user/update', async ({ token, form }, thunkAPI) => {
  const res = await fetch('/api/user/update', { method: 'POST', body: form, headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'Failed to update user')
  return data.user
})

const userSlice = createSlice({
  name: 'user',
  initialState: { user: null, status: 'idle', error: null },
  reducers: {
    clearUser(state) { state.user = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (s) => { s.status = 'loading' })
      .addCase(fetchUser.fulfilled, (s, a) => { s.status = 'succeeded'; s.user = a.payload })
      .addCase(fetchUser.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message })
      .addCase(updateUser.pending, (s) => { s.status = 'updating' })
      .addCase(updateUser.fulfilled, (s, a) => { s.status = 'succeeded'; s.user = a.payload })
      .addCase(updateUser.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message })
  }
})

export const { clearUser } = userSlice.actions
export default userSlice.reducer
