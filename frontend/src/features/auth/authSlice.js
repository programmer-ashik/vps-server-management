import { createSlice } from '@reduxjs/toolkit';
import { saveJSON, loadJSON, remove } from '../../utils/storage';

const KEY = 'auth';
const initial = loadJSON(KEY) ?? { token: null, user: null };

const slice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    setCredentials(state, { payload }) {
      state.token = payload.token;
      state.user = payload.user;
      saveJSON(KEY, state);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      remove(KEY);
    },
  },
});

export const { setCredentials, logout } = slice.actions;
export default slice.reducer;

