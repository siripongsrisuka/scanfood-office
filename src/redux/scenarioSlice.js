import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { db } from "../db/firestore";

const initialState = {
    scenarioes:[],
    modal_Scenario:[],
}


// fetchScenario
export const fetchScenario = createAsyncThunk(
    'scenario/fetchScenario',
    async () => {
      const query = await db.collection('scenario').get();
      const results = query.docs.map(doc=>{
        return {
            ...doc.data(),
            id:doc.id
        }
      })

      return results
    }
);


export const scenarioSlice = createSlice({
    name:'card',
    initialState,
    reducers: {
      addNormalScenario: (state,action) => {
        state.scenarioes.push(action.payload);
      },
        updateNormalScenario: (state,action) => {
            let item = state.scenarioes.find(a=>a.id === action.payload.id);
            Object.assign(item,action.payload)
      },
      deleteNormalScenario: (state,action) => {
         const index = state.scenarioes.findIndex(a => a.id === action.payload);
            state.scenarioes.splice(index, 1); // Directly remove the item (Immer handles imm
      },
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchScenario.pending, (state, action) => {
          state.modal_Scenario = []
        })
        .addCase(fetchScenario.fulfilled, (state, action) => {
          state.scenarioes = action.payload
          state.modal_Scenario = false
        })
        .addCase(fetchScenario.rejected, (state, action) => {
          state.scenarioes = action.payload
          state.modal_Scenario = false
        })
      }
})

export const  { addNormalScenario, updateNormalScenario, deleteNormalScenario  } = scenarioSlice.actions;
export default scenarioSlice.reducer;