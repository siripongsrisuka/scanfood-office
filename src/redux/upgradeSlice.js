import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { stringYMDHMS3 } from '../Utility/dateTime';
import { normalSort } from '../Utility/sort';

const initialState = {
    upgrades:[], // 
    modal_Upgrade:false,
    selectedUpgrade:[],
    startDate:new Date(),
    endDate:new Date(),
    billDates:[],
};


// fetch bill
export const fetchUpgrade = createAsyncThunk(
  'upgrade/fetchUpgrade',
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
      const query = db.collection('autoUpgradeSize')
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


export const upgradeSlice = createSlice({
  name: 'upgrade',
  initialState,
  reducers: {
    updateNormalFieldUpgrade: (state, action) => {
      const { id, updatedField } = action.payload
      let item = state.upgrades.find(a=>a.id===id);
      if(item){
        Object.assign(item,updatedField)
      }
      let item2 = state.selectedUpgrade.find(a=>a.id === id);
      if(item2){
        Object.assign(item2,updatedField)
      }
    }, 
    clearUpgrade: state => {
      state.upgrades = [];
      state.selectedUpgrade = [];
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
    updateUpgrade: (state, action) => {
      const { selectedDate } = action.payload
      state.selectedUpgrade = normalSort('timestamp',state.upgrades.filter(a=>[selectedDate].includes(a.billDate)))
    }, 
  },
  extraReducers: builder => {
    builder.addCase(fetchUpgrade.pending, state => {
      state.modal_Upgrade = true
    })
    builder.addCase(fetchUpgrade.fulfilled, (state, action) => {
      const { data, billDate, selectedDate } = action.payload;
      const today = stringYMDHMS3(new Date());
    
      const isDuplicate = billDate.includes(today);
    
      state.upgrades = isDuplicate
        ? [
            ...state.upgrades.filter(upgrade => upgrade.billDate !== today),
            ...data,
          ]
        : [...state.upgrades, ...data];
    
      state.billDates.push(...billDate.filter(date => date !== today));
    
      state.selectedUpgrade = normalSort(
        'timestamp',
        state.upgrades.filter(upgrade => selectedDate.includes(upgrade.billDate))
      );
      state.modal_Upgrade = false;
    });
    builder.addCase(fetchUpgrade.rejected, state => {
        state.modal_Upgrade = false
    })
  }
})

export const { 
  clearUpgrade, 
  updateUpgrade, 
  updateStartDate, 
  updateEndDate,
  updateNormalFieldUpgrade
} = upgradeSlice.actions

export default upgradeSlice.reducer