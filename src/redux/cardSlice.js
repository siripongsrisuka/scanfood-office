import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { db } from "../db/firestore";

const initialState = {
    cards:[],
    modal_Card:[],
}


// fetchCard
export const fetchCard = createAsyncThunk(
    'card/fetchCard',
    async () => {
      const query = await db.collection('card').get();
      const results = query.docs.map(doc=>{
        return {
            ...doc.data(),
            id:doc.id
        }
      })

      return results
    }
);


export const cardSlice = createSlice({
    name:'card',
    initialState,
    reducers: {
      addNormalCard: (state,action) => {
        state.cards.push(action.payload);
      },
        updateNormalCard: (state,action) => {
            let item = state.cards.find(a=>a.id === action.payload.id);
            Object.assign(item,action.payload)
      },
      deleteNormalCard: (state,action) => {
         const index = state.cards.findIndex(a => a.id === action.payload);
            state.cards.splice(index, 1); // Directly remove the item (Immer handles imm
      },
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchCard.pending, (state, action) => {
          state.modal_Card = []
        })
        .addCase(fetchCard.fulfilled, (state, action) => {
          state.cards = action.payload
          state.modal_Card = false
        })
        .addCase(fetchCard.rejected, (state, action) => {
          state.cards = action.payload
          state.modal_Card = false
        })
      }
})

export const  { addNormalCard, updateNormalCard, deleteNormalCard  } = cardSlice.actions;
export default cardSlice.reducer;