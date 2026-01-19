import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { stringYMDHMS3 } from '../Utility/dateTime';
import { normalSort } from '../Utility/sort';
import { formatTime } from '../Utility/function';

const initialState = {
    hardwareOrders:[], // 
    modal_HardwareOrder:false,
    billDates:[],
    displayHardwareOrders:[],
    startDate:new Date(),
    endDate:new Date(),
}

export const fetchHardwareOrder = createAsyncThunk(
    'hardwareOrder/fetchHardwareOrder',
    async ({ billDate, selectedDate }) => {
      let data = [];
  
      // Split billDate into chunks of 10 elements each
      const chunkSize = 10;
      const billDateChunks = [];
      for (let i = 0; i < billDate.length; i += chunkSize) {
        billDateChunks.push(billDate.slice(i, i + chunkSize));
      }
  
      // Use Promise.all to make multiple queries
      const promises = billDateChunks.map(async (chunk) => {
        const query = db.collection('hardwareOrder')
          .where('billDate', 'in', chunk);
  
        try {
          const qsnapshot = await query.get();
          if (qsnapshot.docs.length > 0) {
            qsnapshot.forEach((doc) => {
              const { timestamp,  ...rest } = doc.data()
              data.push({ 
                ...rest, 
                timestamp: formatTime(timestamp),
                id:doc.id, 
  
              });
            });
          } else {
            console.log('No items found for chunk:', chunk);
          }
        } catch (err) {
          console.error('Error:', err);
        }
      });
  
      // Wait for all queries to complete
      await Promise.all(promises);
      return { data, billDate, selectedDate };
    }
  );



export const hardwareOrderSlice = createSlice({
  name: 'hardwareOrder',
  initialState,
  reducers: {
    clearHardwareOrder: state => {
      state.hardwareOrders = [];
      state.billDates = [];
      state.displayHardwareOrders = [];
      state.startDate = new Date();
      state.endDate = new Date();
    },
    updateHardwareOrders: (state, action) => {
        const { selectedDate } = action.payload
        state.displayHardwareOrders = normalSort('timestamp',state.hardwareOrders.filter(a=>[selectedDate].includes(a.billDate)))
    }, 
    updateStartDate: (state, action) => {
      state.startDate = action.payload
    },
    updateEndDate: (state, action) => {
      state.endDate = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchHardwareOrder.pending, state => {
      state.modal_HardwareOrder = true
    })
    builder.addCase(fetchHardwareOrder.fulfilled, (state, action) => {
        const { data, billDate, selectedDate } = action.payload;
        const today = stringYMDHMS3(new Date())
        const duplicate = billDate.some(a=>a===today)
        if(duplicate){
          state.hardwareOrders = [...state.hardwareOrders.filter(a=>a.billDate!==today),...data]
        } else {
          state.hardwareOrders.push(...data)
        }
        state.billDates.push(...billDate.filter(a=>a!==today))
        state.displayHardwareOrders = normalSort('timestamp',state.hardwareOrders.filter(a=>selectedDate.includes(a.billDate)))
        state.modal_HardwareOrder = false
    })
    builder.addCase(fetchHardwareOrder.rejected, state => {
        state.modal_HardwareOrder = false
    })
  }
})

export const { 
  clearHardwareOrder, 
  updateHardwareOrders, 
  updateStartDate, 
  updateEndDate
} = hardwareOrderSlice.actions

export default hardwareOrderSlice.reducer