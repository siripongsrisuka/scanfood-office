import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from '../db/firestore';
import { formatTime } from '../Utility/function';
import { reverseSort } from '../Utility/sort';
import { initialWarehouse }  from '../configs'

const initialState = {
    warehouse:[], // 
    modal_Warehouse:false,
};

// fetch fetchWarehouse
export const fetchWarehouse = createAsyncThunk(
  'warehouse/fetchWarehouse',
  async () => {
    const query = await db.collection('warehouse')
        .get();
    const results = query.docs.map(doc=>{
        const { timestamp, ...rest } = doc.data();
        return {
            ...initialWarehouse,
            ...rest,
            timestamp:formatTime(timestamp),
            id:doc.id
        }
    })
    return reverseSort('timestamp',results)
  }
);
  

export const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    deleteNormalWarehouse: (state, action) => {
        const index = state.warehouse.findIndex(a => a.id === action.payload);
        state.warehouse.splice(index, 1); // Directly remove the item (Immer handles immutability)
    },
    updateNormalWarehouse: (state, action) => {
        const { id, updatedField } = action.payload;
        let item = state.warehouse.find(a=>a.id === id);
        Object.assign(item,updatedField)
    },
    clearWarehouse: state => {
        state.warehouse = []
    },
    fetchNormalWarehouse: (state, action) => {
        state.warehouse = action.payload
    },

    addNormalWarehouse: (state, action) => {
        state.warehouse.push(action.payload)
    },

  },
  extraReducers: builder => {
    builder.addCase(fetchWarehouse.pending, state => {
        state.modal_Warehouse = true
    })
    builder.addCase(fetchWarehouse.fulfilled, (state, action) => {
        state.warehouse = action.payload
        state.modal_Warehouse = false
    })
    builder.addCase(fetchWarehouse.rejected, state => {
        state.modal_Warehouse = false
    })
  }
})

export const { 
    fetchNormalWarehouse, 
    clearWarehouse, 
    updateNormalWarehouse,
    addNormalWarehouse, 
    deleteNormalWarehouse 
} = warehouseSlice.actions

export default warehouseSlice.reducer