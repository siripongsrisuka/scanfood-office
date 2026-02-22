import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { stringYMDHMS3 } from '../Utility/dateTime';
import { normalSort } from '../Utility/sort';

const initialState = {
    autoPayments:[], // 
    modal_AutoPayment:false,
    selectedAutoPayment:[],
    startDate:new Date(),
    endDate:new Date(),
    billDates:[],
};


// fetch bill
export const fetchAutoPayment = createAsyncThunk(
  'autoPayment/fetchAutoPayment',
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
      const query = db.collection('autoPayment')
        .where('billDate', 'in', chunk);

      try {
        const qsnapshot = await query.get();
        if (qsnapshot.docs.length > 0) {
          qsnapshot.forEach((doc) => {
            
            const { timestamp, createdAt, ...rest } = doc.data();
            let obj = { 
                ...rest, 
                createdAt:createdAt.toDate(),
                id: doc.id, 
  
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
    return { data:normalSort('createdAt',data), billDate, selectedDate };
  }
);


export const autoPaymentSlice = createSlice({
  name: 'autoPayment',
  initialState,
  reducers: {
    updateNormalFieldAutoPayment: (state, action) => {
      const { id, updatedField } = action.payload
      let item = state.autoPayments.find(a=>a.id===id);
      if(item){
        Object.assign(item,updatedField)
      }
      let item2 = state.selectedAutoPayment.find(a=>a.id === id);
      if(item2){
        Object.assign(item2,updatedField)
      }
    }, 
    clearAutoPayment: state => {
      state.autoPayments = [];
      state.selectedAutoPayment = [];
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
    updateAutoPayment: (state, action) => {
      const { selectedDate } = action.payload
      state.selectedAutoPayment = normalSort('createdAt',state.autoPayments.filter(a=>[selectedDate].includes(a.billDate)))
    }, 
  },
  extraReducers: builder => {
    builder.addCase(fetchAutoPayment.pending, state => {
      state.modal_AutoPayment = true
    })
    builder.addCase(fetchAutoPayment.fulfilled, (state, action) => {
      const { data, billDate, selectedDate } = action.payload;
      const today = stringYMDHMS3(new Date());
    
      const isDuplicate = billDate.includes(today);
    
      state.autoPayments = isDuplicate
        ? [
            ...state.autoPayments.filter(autoPayment => autoPayment.billDate !== today),
            ...data,
          ]
        : [...state.autoPayments, ...data];
    
      state.billDates.push(...billDate.filter(date => date !== today));
    
      state.selectedAutoPayment = normalSort(
        'createdAt',
        state.autoPayments.filter(autoPayment => selectedDate.includes(autoPayment.billDate))
      );
      state.modal_AutoPayment = false;
    });
    builder.addCase(fetchAutoPayment.rejected, state => {
        state.modal_AutoPayment = false
    })
  }
})

export const { 
  clearAutoPayment, 
  updateAutoPayment, 
  updateStartDate, 
  updateEndDate,
  updateNormalFieldAutoPayment
} = autoPaymentSlice.actions

export default autoPaymentSlice.reducer