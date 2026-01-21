import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { stringYMDHMS3 } from '../Utility/dateTime';
import { normalSort } from '../Utility/sort';
import { formatTime } from '../Utility/function';

const initialState = {
    extraDays:[], // 
    modal_ExtraDay:false,
    billDates:[],
    displayExtraDays:[],
    startDate:new Date(),
    endDate:new Date(),
}

export const fetchExtraDay = createAsyncThunk(
    'extraDay/fetchExtraDay',
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
        const query = db.collection('extraDay')
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



export const extraSlice = createSlice({
  name: 'extraDay',
  initialState,
  reducers: {
    clearExtraDay: state => {
      state.extraDays = [];
      state.billDates = [];
      state.displayExtraDays = [];
      state.startDate = new Date();
      state.endDate = new Date();
    },
    updateExtraDays: (state, action) => {
        const { selectedDate } = action.payload
        state.displayExtraDays = normalSort('timestamp',state.extraDays.filter(a=>[selectedDate].includes(a.billDate)))
    }, 
    updateStartDate: (state, action) => {
      state.startDate = action.payload
    },
    updateEndDate: (state, action) => {
      state.endDate = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchExtraDay.pending, state => {
      state.modal_ExtraDay = true
    })
    builder.addCase(fetchExtraDay.fulfilled, (state, action) => {
        const { data, billDate, selectedDate } = action.payload;
        const today = stringYMDHMS3(new Date())
        const duplicate = billDate.some(a=>a===today)
        if(duplicate){
          state.extraDays = [...state.extraDays.filter(a=>a.billDate!==today),...data]
        } else {
          state.extraDays.push(...data)
        }
        state.billDates.push(...billDate.filter(a=>a!==today))
        state.displayExtraDays = normalSort('timestamp',state.extraDays.filter(a=>selectedDate.includes(a.billDate)))
        state.modal_ExtraDay = false
    })
    builder.addCase(fetchExtraDay.rejected, state => {
        state.modal_ExtraDay = false
    })
  }
})

export const { 
  clearExtraDay, 
  updateExtraDays, 
  updateStartDate, 
  updateEndDate
} = extraSlice.actions

export default extraSlice.reducer