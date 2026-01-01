import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { db } from "../db/firestore";
import { initialStore } from "../configs";

const initialState = {
    orders:[],
    modal_Care:[],
    demo:initialStore,
    portStores:[],
    franchisePorts:[],
    franchiseLine:'', // สำหรับการเข้าใช้งานครั้งถัดไป ของเจ้าของแฟรนไชส์
    branchLine:'', // สำหรับการเข้าใช้งานครั้งถัดไป ของเจ้าของสาขา

}


// fetchOrder
export const fetchOrder = createAsyncThunk(
    'shop/fetchOrder',
    async (token) => {
      let data = []
      await db.collection('packageOrder')
        .where("suggestCode", "==", token)
        .orderBy('timestamp', 'desc')
        .limit(100) 
        .get().then((docs)=>{
        docs.forEach((doc)=>{
          data.push({
            id: doc.id,
            ...doc.data(),
            timestamp:doc.data().timestamp.toDate()
          })
        })
      })
      return data
    }
);

export const fetchBySale = createAsyncThunk(
  'shop/fetchBySale',
  async (codeName) => {
    let data = []
    await db.collection('portStore')
      .where('codeName','==',codeName)
      .where('process','in',['demo','payment','setup','implementation','training','softlaunch'])
      .get()
      .then((qsnapshot)=>{
        if(qsnapshot.docs.length>0){
            qsnapshot.forEach((doc)=>{
                const { timestamp, demoDate, paymentDate, expireDate, trainingDate, launchDate, endDate, ...rest } = doc.data();
                data.push({ 
                    ...initialStore,
                    ...rest,
                    timestamp:timestamp.toDate(),
                    demoDate:demoDate.toDate(),
                    paymentDate:paymentDate.toDate(),
                    trainingDate:trainingDate.toDate(),
                    launchDate:launchDate.toDate(),
                    expireDate:expireDate.toDate(),
                    endDate:endDate.toDate(),
                    id:doc.id
                 })
            })
        }
    })
    return data
  }
);

export const fetchFranchisePort = createAsyncThunk(
  'care/fetchFranchisePort',
  async (codeName) => {
    let data = []
    await db.collection('portFranchise')
      .where('codeName','==',codeName)
      .get()
      .then((qsnapshot)=>{
        if(qsnapshot.docs.length>0){
            qsnapshot.forEach((doc)=>{
                const { timestamp,  ...rest } = doc.data();
                data.push({ 
                    ...rest,
                    timestamp:timestamp.toDate(),
                    id:doc.id
                 })
            })
        }
    })
    return data
  }
);

// addNewStorePort to firestore
export const addNewFranchise = createAsyncThunk(
  'care/addNewFranchise',
  async (obj)=>{
    let data = {
      ...obj,
      timestamp: new Date(),
    }
      const docRef = await db.collection('portFranchise').add(data);
      
      data.id = docRef.id; // Capture the document ID

      return data
  }
);


export const updateFieldStore = createAsyncThunk(
  'shop/updateFieldStore', async ({doc,field}) => {
  await db.collection('portStore').doc(doc).update(field)
  return {doc,field};
});

// addNewStorePort to firestore
export const addNewStorePort = createAsyncThunk(
  'shop/addNewStorePort',
  async (obj)=>{
    let data = {
      ...initialStore,
      ...obj,
      timestamp: new Date(),
    }
      const docRef = await db.collection('portStore').add(data);
      
      data.id = docRef.id; // Capture the document ID

      return data
  }
);



export const careSlice = createSlice({
    name:'care',
    initialState,
    reducers: {
      updateFranchiseLine: (state,action) => {
        state.franchiseLine = action.payload
      },
      updateBranchLine: (state,action) => {
        state.branchLine = action.payload
      },
      updateDemo: (state,action) => {
        state.demo = action.payload
      },
      updateStores: (state,action) => {
        state.portStores = state.portStores.map(a=>{
          return a.id===state.demo.id
            ?state.demo
            :a
        })
      },
      addNormalPort: (state,action) => {
        state.portStores = [...state.portStores,action.payload]
      },
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchOrder.pending, (state, action) => {
          state.modal_Care = []
        })
        .addCase(fetchOrder.fulfilled, (state, action) => {
          state.orders = action.payload
          state.modal_Care = false
        })
        builder.addCase(fetchBySale.pending, state => {
          state.modal_Care = true
        })
        builder.addCase(fetchBySale.fulfilled, (state, action) => {
          state.portStores = action.payload
          state.modal_Care = false
        })
        builder.addCase(fetchBySale.rejected, state => {
          state.modal_Care = false
        })
        builder.addCase(updateFieldStore.pending, state => {
          state.modal_Care = true
        })
        builder.addCase(updateFieldStore.fulfilled, (state, action) => {
          const { doc, field } = action.payload;
          state.portStores = state.portStores.map(a=>{
            return a.id === doc
                    ?{...a,...field}
                    :a
          })
          state.demo = {...state.demo,...field}
          state.modal_Care = false
        })
        builder.addCase(updateFieldStore.rejected, state => {
          state.modal_Care = false
        })
        builder.addCase(addNewStorePort.pending, state => {
          state.modal_Care = true
        })
        builder.addCase(addNewStorePort.fulfilled, (state, action) => {
          state.portStores = [...state.portStores,action.payload]
          state.demo = action.payload
          state.modal_Care = false
        })
        builder.addCase(addNewStorePort.rejected, state => {
          state.modal_Care = false
        })
        builder.addCase(fetchFranchisePort.pending, state => {
          state.modal_Care = true
        })
        builder.addCase(fetchFranchisePort.fulfilled, (state, action) => {
          state.franchisePorts = action.payload
          state.modal_Care = false
        })
        builder.addCase(fetchFranchisePort.rejected, state => {
          state.modal_Care = false
        })
        builder.addCase(addNewFranchise.pending, state => {
          state.modal_Care = true
        })
        builder.addCase(addNewFranchise.fulfilled, (state, action) => {
          state.franchisePorts = [action.payload,...state.franchisePorts]
          state.modal_Care = false
        })
        builder.addCase(addNewFranchise.rejected, state => {
          state.modal_Care = false
        })

        
      }
})

export const  { updateDemo, updateStores, addNormalPort, updateFranchiseLine, updateBranchLine } = careSlice.actions;
export default careSlice.reducer;