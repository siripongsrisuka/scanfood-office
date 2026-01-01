import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { NumberYMD, minusDays, stringYMDHMS3 } from '../Utility/dateTime';
import { endCutoff, manageBill, startCutoff, useToDate } from '../Utility/function';
import { db } from '../db/firestore';
import { initialCheckOut } from '../configs';

const initialState = {
    bills:[], // 
    normalBill:[],
    voidedBill:[],
    modal_Bill:false,
    billDates:[],  // วันที่ทำการ fetch
    selectedBill:[],
    selectedVoidedBill:[],
}
export const fetchBill = createAsyncThunk(
  'product/fetchBill',
  async ({ shopId, billDate, cutOff, startDate, endDate }) => {
    let data = [];

    // Split billDate into chunks of 10 elements each
    const chunkSize = 10;
    const billDateChunks = [];
    for (let i = 0; i < billDate.length; i += chunkSize) {
      billDateChunks.push(billDate.slice(i, i + chunkSize));
    }

    // Use Promise.all to make multiple queries
    const promises = billDateChunks.map(async (chunk) => {
      const query = db.collection('checkout')
        .where("shopId", "==", shopId)
        .where('billDate', 'in', chunk);

      try {
        const qsnapshot = await query.get();
        if (qsnapshot.docs.length > 0) {
          qsnapshot.forEach((doc) => {
            data.push({ 
              ...initialCheckOut,
              id:doc.id, 
              ...doc.data(), 
              timestamp: useToDate(doc.data().timestamp)
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
    return { data, billDate, cutOff, startDate, endDate };
  }
);


// updateFieldBill
export const updateFieldBill = createAsyncThunk(
  'bill/updateFieldBill',
  async ({id,field,startDate,endDate,cutOff}) => {
      await db.collection('checkout').doc(id).update(field)
      return {data:{id:id,...field},startDate,endDate,cutOff}
  }
);



export const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    updateBills: (state, action) => {
      const { startDate, endDate, cutOff } = action.payload
      state.selectedBill = state.normalBill.filter((item)=>{return(new Date(item.timestamp) > startCutoff(startDate,new Date(cutOff)) && new Date(item.timestamp) <= endCutoff(endDate,new Date(cutOff)))})
      state.selectedVoidedBill = state.voidedBill.filter((item)=>{return(new Date(item.timestamp) > startCutoff(startDate,new Date(cutOff)) && new Date(item.timestamp) <= endCutoff(endDate,new Date(cutOff)))})
    }, 
    clearBill: (state, action) => {
      state.bills = [] // 
      state.normalBill = []
      state.voidedBill = []
      state.billDates = []  // วันที่ทำการ fetch
      state.selectedBill = []
      state.selectedVoidedBill = []
    },   
    updateNormalFieldBill: (state, action) => {
      const { id, field, startDate, endDate, cutOff } = action.payload;
        state.bills = state.bills.map((item)=>{
          return item.id===id
              ?{...item,...field}
              :item
        })
        state.normalBill = state.bills.filter(a=>!a.void)
        state.voidedBill = state.bills.filter(a=>a.void)
        state.selectedBill = state.normalBill.filter((item)=>{return(new Date(item.timestamp) > startCutoff(startDate,new Date(cutOff)) && new Date(item.timestamp) <= endCutoff(endDate,new Date(cutOff)))})
        state.selectedVoidedBill = state.voidedBill.filter((item)=>{return(new Date(item.timestamp) > startCutoff(startDate,new Date(cutOff)) && new Date(item.timestamp) <= endCutoff(endDate,new Date(cutOff)))})
        state.modal_Bill = false
  },
  },
  extraReducers: builder => {
    builder.addCase(updateFieldBill.pending, state => {
        state.modal_Bill = true
    })
    builder.addCase(updateFieldBill.fulfilled, (state, action) => {
      const { data, startDate, endDate, cutOff } = action.payload;
        state.bills = state.bills.map((item)=>{
          return item.id===data.id
              ?{...item,...data}
              :item
        })
        state.normalBill = state.bills.filter(a=>!a.void)
        state.voidedBill = state.bills.filter(a=>a.void)
        state.selectedBill = state.normalBill.filter((item)=>{return(new Date(item.timestamp) > startCutoff(startDate,new Date(cutOff)) && new Date(item.timestamp) <= endCutoff(endDate,new Date(cutOff)))})
        state.selectedVoidedBill = state.voidedBill.filter((item)=>{return(new Date(item.timestamp) > startCutoff(startDate,new Date(cutOff)) && new Date(item.timestamp) <= endCutoff(endDate,new Date(cutOff)))})
        state.modal_Bill = false
    })
    builder.addCase(updateFieldBill.rejected, state => {
        state.modal_Bill = false
    })
    builder.addCase(fetchBill.pending, state => {
      state.modal_Bill = true
    })
    builder.addCase(fetchBill.fulfilled, (state, action) => {
      const { data, billDate, cutOff, startDate, endDate } = action.payload;
        state.bills = data
        state.normalBill = data.filter(a=>!a.void)
        state.voidedBill = data.filter(a=>a.void)
        state.selectedBill = state.normalBill.filter((item)=>{return(new Date(item.timestamp) > startCutoff(startDate,new Date(cutOff)) && new Date(item.timestamp) <= endCutoff(endDate,new Date(cutOff)))})
        state.selectedVoidedBill = state.voidedBill.filter((item)=>{return(new Date(item.timestamp) > startCutoff(startDate,new Date(cutOff)) && new Date(item.timestamp) <= endCutoff(endDate,new Date(cutOff)))})
        state.billDates = [...state.billDates,...billDate.filter((item)=>{return(item < stringYMDHMS3(new Date()))})] 
        state.modal_Bill = false
    })
    builder.addCase(fetchBill.rejected, state => {
        state.modal_Bill = false
    })
  }
})

export const { updateBills, clearBill, updateNormalFieldBill } = billSlice.actions

export default billSlice.reducer