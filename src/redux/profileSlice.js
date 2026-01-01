import { createSlice } from '@reduxjs/toolkit'
import { initialProfile } from '../configs';

const initialState = {
    profile:initialProfile, // 
    modal_Profile:false,
}

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    fetchNormalProfile: (state,action) => {
      state.profile = action.payload;
    },
  },
  extraReducers: builder => {

  }
})

export const { 
  fetchNormalProfile 
} = profileSlice.actions

export default profileSlice.reducer