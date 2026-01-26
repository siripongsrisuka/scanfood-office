import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { stringYMDHMS3 } from '../Utility/dateTime';
import { normalSort } from '../Utility/sort';
import { formatTime } from '../Utility/function';

const initialState = {
    hardware:[], // 
    modal_Hardware:false,
    billDates:[],
    displayHardware:[],
    startDate:new Date(),
    endDate:new Date(),
}

export const fetchHardware = createAsyncThunk(
    'hardware/fetchHardware',
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
              const { timestamp = new Date(),  ...rest } = doc.data()
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



export const hardwareSlice = createSlice({
  name: 'hardware',
  initialState,
  reducers: {
    clearHardware: state => {
      state.hardware = [];
      state.billDates = [];
      state.displayHardware = [];
      state.startDate = new Date();
      state.endDate = new Date();
    },
    updateHardware: (state, action) => {
        const { selectedDate } = action.payload
        state.displayHardware = normalSort('timestamp',state.hardware.filter(a=>[selectedDate].includes(a.billDate)))
    }, 
    updateNormalFieldHardware: (state, action) => {
        const { id, updatedField } = action.payload;
        let item = state.hardware.find(a=>a.id===id)
        if(item){
            Object.assign(item, updatedField)
        }
        let item2 = state.displayHardware.find(a=>a.id===id)
        if(item2){
            Object.assign(item2, updatedField)
        }
    }, 
    updateStartDate: (state, action) => {
      state.startDate = action.payload
    },
    updateEndDate: (state, action) => {
      state.endDate = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchHardware.pending, state => {
      state.modal_Hardware = true
    })
    builder.addCase(fetchHardware.fulfilled, (state, action) => {
        const { data, billDate, selectedDate } = action.payload;
        const today = stringYMDHMS3(new Date())
        const duplicate = billDate.some(a=>a===today)
        if(duplicate){
          state.hardware = [...state.hardware.filter(a=>a.billDate!==today),...data]
        } else {
          state.hardware    .push(...data)
        }
        state.billDates.push(...billDate.filter(a=>a!==today))
        state.displayHardware = normalSort('timestamp',state.hardware.filter(a=>selectedDate.includes(a.billDate)))
        state.modal_Hardware = false
    })
    builder.addCase(fetchHardware.rejected, state => {
        state.modal_Hardware = false
    })
  }
})

export const { 
  clearHardware, 
  updateHardware, 
  updateNormalFieldHardware,
  updateStartDate, 
  updateEndDate
} = hardwareSlice.actions

export default hardwareSlice.reducer