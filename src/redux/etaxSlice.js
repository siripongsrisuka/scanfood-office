import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { stringYMDHMS3 } from '../Utility/dateTime';
import { normalSort } from '../Utility/sort';
import { formatTime } from '../Utility/function';

const initialState = {
    etax:[], // 
    modal_Etax:false,
    billDates:[],
    displayEtax:[],
    startDate:new Date(),
    endDate:new Date(),
}

export const fetchEtax = createAsyncThunk(
    'etax/fetchEtax',
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
        const query = db.collection('autoPayment')
          .where('billDate', 'in', chunk)
          .where('taxEnable','==',true);
  
        try {
          const qsnapshot = await query.get();
          if (qsnapshot.docs.length > 0) {
            qsnapshot.forEach((doc) => {
              const { createdAt, requestDate, ...rest } = doc.data()
              data.push({ 
                ...rest, 
                createdAt: formatTime(createdAt),
                requestDate: formatTime(requestDate),
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



export const etaxSlice = createSlice({
  name: 'etax',
  initialState,
  reducers: {
    clearEtax: state => {
      state.etax = [];
      state.billDates = [];
      state.displayEtax = [];
      state.startDate = new Date();
      state.endDate = new Date();
    },
    updateEtax: (state, action) => {
        const { selectedDate } = action.payload
        state.displayEtax = normalSort('timestamp',state.etax.filter(a=>[selectedDate].includes(a.billDate)))
    }, 
    updateStartDate: (state, action) => {
      state.startDate = action.payload
    },
    updateEndDate: (state, action) => {
      state.endDate = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchEtax.pending, state => {
      state.modal_Etax = true
    })
    builder.addCase(fetchEtax.fulfilled, (state, action) => {
        const { data, billDate, selectedDate } = action.payload;
        const today = stringYMDHMS3(new Date())
        const duplicate = billDate.some(a=>a===today)
        if(duplicate){
          state.etax = [...state.etax.filter(a=>a.billDate!==today),...data]
        } else {
          state.etax.push(...data)
        }
        state.billDates.push(...billDate.filter(a=>a!==today))
        state.displayEtax = normalSort('timestamp',state.etax.filter(a=>selectedDate.includes(a.billDate)))
        state.modal_Etax = false
    })
    builder.addCase(fetchEtax.rejected, state => {
        state.modal_Etax = false
    })
  }
})

export const { 
  clearEtax, 
  updateEtax, 
  updateStartDate, 
  updateEndDate
} = etaxSlice.actions

export default etaxSlice.reducer