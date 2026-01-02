import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { db } from '../db/firestore';

const initialState = {
    office:{
      humanResource:[],
      humanRight:[],
    }, // 
    modal_Office:false,
};

export const fetchOffice = createAsyncThunk(
  'office/fetchOffice', async () => {
    const officeDoc = await db.collection('admin').doc('office').get();
 
    return officeDoc.data();
});

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
      builder.addCase(fetchOffice.pending, state => {
        state.modal_Office = true
      })
      builder.addCase(fetchOffice.fulfilled, (state, action) => {
          state.office = action.payload
          state.modal_Office = false
      })
      builder.addCase(fetchOffice.rejected, state => {
          state.modal_Office = false
      })
  }
})

export const { 
  fetchNormalOffice, 
  updateNormalFieldOffice
} = officeSlice.actions

export default officeSlice.reducer