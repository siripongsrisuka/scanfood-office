import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { stringYMDHMS3 } from '../Utility/dateTime';
import { normalSort } from '../Utility/sort';
import { formatTime } from '../Utility/function';

const initialState = {
    packages:[], // 
    modal_Package:false,
    billDates:[],
    displayPackages:[],
    startDate:new Date(),
    endDate:new Date(),
}

export const fetchPackage = createAsyncThunk(
    'package/fetchPackage',
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
        const query = db.collection('packageOrder')
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



export const packageSlice = createSlice({
  name: 'package',
  initialState,
  reducers: {
    clearPackage: state => {
      state.packages = [];
      state.billDates = [];
      state.displayPackages = [];
      state.startDate = new Date();
      state.endDate = new Date();
    },
    updatePackages: (state, action) => {
        const { selectedDate } = action.payload
        state.displayPackages = normalSort('timestamp',state.packages.filter(a=>[selectedDate].includes(a.billDate)))
    }, 
    updateNormalFieldPackage: (state, action) => {
        const { id, updatedField } = action.payload;
        let item = state.packages.find(a=>a.id===id)
        if(item){
            Object.assign(item, updatedField)
        }
        let item2 = state.displayPackages.find(a=>a.id===id)
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
    builder.addCase(fetchPackage.pending, state => {
      state.modal_Package = true
    })
    builder.addCase(fetchPackage.fulfilled, (state, action) => {
        const { data, billDate, selectedDate } = action.payload;
        const today = stringYMDHMS3(new Date())
        const duplicate = billDate.some(a=>a===today)
        if(duplicate){
          state.packages = [...state.packages.filter(a=>a.billDate!==today),...data]
        } else {
          state.packages    .push(...data)
        }
        state.billDates.push(...billDate.filter(a=>a!==today))
        state.displayPackages = normalSort('timestamp',state.packages.filter(a=>selectedDate.includes(a.billDate)))
        state.modal_Package = false
    })
    builder.addCase(fetchPackage.rejected, state => {
        state.modal_Package = false
    })
  }
})

export const { 
  clearPackage, 
  updatePackages, 
  updateNormalFieldPackage,
  updateStartDate, 
  updateEndDate
} = packageSlice.actions

export default packageSlice.reducer