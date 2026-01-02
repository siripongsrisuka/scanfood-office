import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  HomeScreen,
  SbsScreen,
  DemoScreen,
  AdminDashboard,
  StorePort,
  NewShopScreen,
  CloneScreen,
  BranchScreen,
  ApproveScreen,
  ImportItemStoreScreen,
  ImportItemFranchiseScreen,
  ImportBomFranchiseScreen,
  ImportBomShopScreen,
  ImportMarketPlaceFranchise,
  CustomerCareScreen,
  SoftwareHistory,
  HardwareHistory,
  TransformTable,
  TransferExpireScreen,
  QuestionSettingScreen,
  MasterScreen,
  DiagnosisScreen,
  KbankReportScreen,
  OfficeScreen,
  StaffScreen,
  WarehouseScreen,
} from './screens';
import { useSelector, useDispatch } from 'react-redux';
import { login } from './redux/authSlice';
import { firebaseAuth } from './db/firestore'
import 'rsuite/dist/rsuite.min.css';
import EquipmentSetting from "./screens/EquipmentSetting";
import { ToastContainer } from 'react-toastify';
import ApproveSoftwareScreen from "./screens/ApproveSoftwareScreen";


function App() {
 
  const { currentUser } = useSelector( state => state.auth);
  
  const dispatch = useDispatch();

    useEffect(() => {
      let unsubscribe;
      async function checkAuth (){
        unsubscribe = await firebaseAuth.onAuthStateChanged(user => {
          if(!!user?.uid){ // ไม่มี 
            dispatch(login(user));
          } else {
            // let obj =  firebaseAuth.signInWithEmailAndPassword('anonymoususer@gmail.com', '123123')
            // let obj =  firebaseAuth.signInWithEmailAndPassword('siripongsrisukha@gmail.com', '123456')
            // dispatch(login(obj));
          }
        })
      }

      if (!currentUser?.user) {
        checkAuth()
      }

  },[]);


  
  return (
    <Router>
    <div >
      <Routes>
          <Route path='/' element={<HomeScreen/>} />
          {/* <Route path='/' element={<DemoScreen/>} /> */}

          <Route path='/master' element={<MasterScreen/>} />
          <Route path='/office' element={<OfficeScreen/>} >
            <Route path='staff' element={<StaffScreen/>} />
            <Route path='clone' element={<CloneScreen/>} />
            <Route path='importItem' element={<ImportItemStoreScreen/>} />
            <Route path='importBomShop' element={<ImportBomShopScreen/>} />
            <Route path='kbankReport' element={<KbankReportScreen/>} />
            <Route path='equipmentSetting' element={<EquipmentSetting/>} />
            <Route path='warehouse' element={<WarehouseScreen/>} />
            <Route path='approveSoftware' element={<ApproveSoftwareScreen/>} />

          </Route>
          <Route path='/admin' element={<AdminDashboard/>} />
  
          <Route path='store' element={<StorePort/>}/>
          <Route path='store/demo' element={<DemoScreen/>} />
          <Route path='sbs' element={<SbsScreen/>} />
          <Route path='shop' element={<NewShopScreen/>} />
          <Route path='clone' element={<CloneScreen/>} />
          <Route path='branch/:id' element={<BranchScreen/>} />
          <Route path='approve' element={<ApproveScreen/>} />
          <Route path='importItemFranchise' element={<ImportItemFranchiseScreen/>} />
          <Route path='importBomFranchise' element={<ImportBomFranchiseScreen/>} />
          <Route path='importMarketPlaceFranchise' element={<ImportMarketPlaceFranchise/>} />
          <Route path='customerCare' element={<CustomerCareScreen/>} />
          <Route path='softwareHistory' element={<SoftwareHistory/>} />
          <Route path='hardwareHistory' element={<HardwareHistory/>} />
          <Route path='transform' element={<TransformTable/>} />
          <Route path='transferExpire' element={<TransferExpireScreen/>} />
          <Route path='questionSetting' element={<QuestionSettingScreen/>} />
          <Route path='diagnosis' element={<DiagnosisScreen/>} />

          

          

      </Routes>
      </div>
    </Router>
  );
}

export default () => {
  return  <Suspense fallback="...loading">
            <App />
            <ToastContainer position="top-right" autoClose={3000} />
          </Suspense>
};
