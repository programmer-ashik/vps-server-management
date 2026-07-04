import { createSlice } from '@reduxjs/toolkit';
import { loadJSON, saveJSON } from '../../utils/storage';

const KEY = 'theme';
const savedTheme = loadJSON(KEY);
const initial = {
  mode: savedTheme?.mode === 'dark' ? 'dark' : 'light',
};

const slice = createSlice({
  name: 'theme',
  initialState: initial,
  reducers: {
    toggleMode(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      saveJSON(KEY, state);
    },
  },
});

export const { toggleMode } = slice.actions;
export default slice.reducer;
