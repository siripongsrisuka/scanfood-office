import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { stringYMDHMS3 } from '../Utility/dateTime';
import { normalSort } from '../Utility/sort';
import { formatTime } from '../Utility/function';

const initialState = {
    inbounds:[], // 
    modal_Inbound:false,
    billDates:[],
    displayInbounds:[],
    startDate:new Date(),
    endDate:new Date(),
}

export const fetchInbound = createAsyncThunk(
    'inbound/fetchInbound',
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
        const query = db.collection('inbound')
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



export const inboundSlice = createSlice({
  name: 'inbound',
  initialState,
  reducers: {
    clearInbound: state => {
      state.inbounds = [];
      state.billDates = [];
      state.displayInbounds = [];
      state.startDate = new Date();
      state.endDate = new Date();
    },
    updateInbounds: (state, action) => {
        const { selectedDate } = action.payload
        state.displayInbounds = normalSort('timestamp',state.inbounds.filter(a=>[selectedDate].includes(a.billDate)))
    }, 
    updateStartDate: (state, action) => {
      state.startDate = action.payload
    },
    updateEndDate: (state, action) => {
      state.endDate = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchInbound.pending, state => {
      state.modal_Inbound = true
    })
    builder.addCase(fetchInbound.fulfilled, (state, action) => {
        const { data, billDate, selectedDate } = action.payload;
        const today = stringYMDHMS3(new Date())
        const duplicate = billDate.some(a=>a===today)
        if(duplicate){
          state.inbounds = [...state.inbounds.filter(a=>a.billDate!==today),...data]
        } else {
          state.inbounds.push(...data)
        }
        state.billDates.push(...billDate.filter(a=>a!==today))
        state.displayInbounds = normalSort('timestamp',state.inbounds.filter(a=>selectedDate.includes(a.billDate)))
        state.modal_Inbound = false
    })
    builder.addCase(fetchInbound.rejected, state => {
        state.modal_Inbound = false
    })
  }
})

export const { 
  clearInbound, 
  updateInbounds, 
  updateStartDate, 
  updateEndDate
} = inboundSlice.actions

export default inboundSlice.reducer