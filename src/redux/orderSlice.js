import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { db } from "../db/firestore";

const initialState = {
    orders:[],
    modal_Orders:[],
}


// fetchOrder
export const fetchOrder = createAsyncThunk(
    'shop/fetchOrder',
    async (token) => {
      let data = []
      await db.collection('packageOrder')
        .where("suggestCode", "==", token)
        .orderBy('timestamp', 'desc')
        .limit(100) 
        .get().then((docs)=>{
        docs.forEach((doc)=>{
          data.push({
            id: doc.id,
            ...doc.data(),
            timestamp:doc.data().timestamp.toDate()
          })
        })
      })
      return data
    }
);


export const orderSlice = createSlice({
    name:'order',
    initialState,
    reducers: {
      clearOrder: (state,action) => {
        state.orders = []
      },
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchOrder.pending, (state, action) => {
          state.modal_Orders = []
        })
        .addCase(fetchOrder.fulfilled, (state, action) => {
          state.orders = action.payload
          state.modal_Orders = false
        })
      }
})

export const  { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;