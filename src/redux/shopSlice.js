import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { db } from "../db/firestore";
import { normalSort } from '../Utility/sort'; 


const initialState = {
    shops:[], // 
    modal_Shop:false,

}

export const fetchShop = createAsyncThunk(
  'shop/fetchShop', async (token) => {
    let data = []
    const shopRef = db.collection('shop')
    .where("suggester", "==", token)

    await shopRef.get().then((docs)=>{
      docs.forEach((doc)=>{
        data.push({
          packageArray:[],
          info:{ name:'', tel:'', note:''},
          id: doc.id,
          ...doc.data(),
          createdDate:doc.data().createdDate.toDate()
        })
        console.log(doc.data())
      })
    })
    return normalSort('createdDate',data)
});



export const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    updateModal_Shop: state => {
      state.modal_Shop = !state.modal_Shop
    },
    updateNormalShop: (state,action) => {
      state.shops = state.shops.map(a=>{
        return a.id===action.payload.shopId
            ?{...a,info:action.payload}
            :a
      })
    },
    clearShop: state => {
      state.shops = []
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchShop.pending, state => {
      state.modal_Shop = true
    })
    builder.addCase(fetchShop.fulfilled, (state, action) => {
      state.shops = action.payload
      state.modal_Shop = false
    })
    builder.addCase(fetchShop.rejected, state => {
      state.modal_Shop = false
    })
  }
})

export const { updateModal_Shop, updateNormalShop, clearShop } = shopSlice.actions

export default shopSlice.reducer