import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { stringYMDHMS3 } from '../Utility/dateTime';
import { normalSort } from '../Utility/sort';
import { formatTime } from '../Utility/function';

const initialState = {
    reports:[], // 
    modal_Report:false,
    selectedReport:[],
    startDate:new Date(),
    endDate:new Date(),
    billDates:[],
};


// fetch bill
export const fetchReport = createAsyncThunk(
  'kbank/fetchReport',
  async ({ billDate, selectedDate }) => {
    let data = [];
    // Split billDate into chunks of 10 elements each
    const chunkSize = 10;
    const billDateChunck = [];
    for (let i = 0; i < billDate.length; i += chunkSize) {
      billDateChunck.push(billDate.slice(i, i + chunkSize));
    }

    // Use Promise.all to make multiple queries
    const promises = billDateChunck.map(async (chunk) => {
      const query = db.collection('kbankReports')
        .where('billDate', 'in', chunk);

      try {
        const qsnapshot = await query.get();
        if (qsnapshot.docs.length > 0) {
          qsnapshot.forEach((doc) => {
            
            const { timestamp, ...rest } = doc.data();
            let obj = { 
                ...rest, 
                  timestamp:formatTime(timestamp),
  
            }
         
            data.push(obj);
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
    return { data:normalSort('timestamp',data), billDate, selectedDate };
  }
);


export const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearReport: state => {
      state.reports = [];
      state.selectedReport = [];
      state.startDate = new Date();
      state.endDate = new Date();
      state.billDates = [];
    },
    updateStartDate: (state, action) => {
      state.startDate = action.payload
    },
    updateEndDate: (state, action) => {
      state.endDate = action.payload
    },
    updateReport: (state, action) => {
      const { selectedDate } = action.payload
      state.selectedReport = normalSort('timestamp',state.reports.filter(a=>[selectedDate].includes(a.billDate)))
    }, 
  },
  extraReducers: builder => {
    builder.addCase(fetchReport.pending, state => {
      state.modal_Report = true
    })
    builder.addCase(fetchReport.fulfilled, (state, action) => {
      const { data, billDate, selectedDate } = action.payload;
      const today = stringYMDHMS3(new Date());
    
      const isDuplicate = billDate.includes(today);
    
      state.reports = isDuplicate
        ? [
            ...state.reports.filter(report => report.billDate !== today),
            ...data,
          ]
        : [...state.reports, ...data];
    
      state.billDates.push(...billDate.filter(date => date !== today));
    
      state.selectedReport = normalSort(
        'timestamp',
        state.reports.filter(report => selectedDate.includes(report.billDate))
      );
      state.modal_Report = false;
    });
    builder.addCase(fetchReport.rejected, state => {
        state.modal_Report = false
    })
  }
})

export const { clearReport, updateReport, updateStartDate, updateEndDate } = reportSlice.actions

export default reportSlice.reducer