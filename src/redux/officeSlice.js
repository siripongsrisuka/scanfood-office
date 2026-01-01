import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    office:{
      humanResource:[],
      humanRight:[],
    }, // 
    modal_Office:false,
};

export const officeSlice = createSlice({
  name: 'office',
  initialState,
  reducers: {
    updateNormalFieldOffice: (state, action) => {
      Object.assign(state.office,action.payload)
    },
    fetchNormalOffice: (state,action) => {
      state.office =  action.payload;
    },
  },
  extraReducers: builder => {
 
  }
})

export const { 
  fetchNormalOffice, 
  updateNormalFieldOffice
} = officeSlice.actions

export default officeSlice.reducer