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
  LaosScreen,
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
  TeamAScreen,
  QuestionSettingScreen,
  MasterScreen,
  DiagnosisScreen,
  KbankReportScreen,
  OfficeScreen,
  StaffScreen,
} from './screens';
import { useSelector, useDispatch } from 'react-redux';
import { login } from './redux/authSlice';
import { firebaseAuth } from './db/firestore'
import 'rsuite/dist/rsuite.min.css';
import EquipmentSetting from "./screens/EquipmentSetting";
import { ToastContainer } from 'react-toastify';


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

          </Route>
          <Route path='/admin' element={<AdminDashboard/>} />
  
          <Route path='store' element={<StorePort/>}/>
          <Route path='store/demo' element={<DemoScreen/>} />
          <Route path='sbs' element={<SbsScreen/>} />
          <Route path='shop' element={<NewShopScreen/>} />
          <Route path='clone' element={<CloneScreen/>} />
          <Route path='laos' element={<LaosScreen/>} />
          <Route path='branch/:id' element={<BranchScreen/>} />
          <Route path='approve' element={<ApproveScreen/>} />
          <Route path='importItem' element={<ImportItemStoreScreen/>} />
          <Route path='importItemFranchise' element={<ImportItemFranchiseScreen/>} />
          <Route path='importBomFranchise' element={<ImportBomFranchiseScreen/>} />
          <Route path='importBomShop' element={<ImportBomShopScreen/>} />
          <Route path='importMarketPlaceFranchise' element={<ImportMarketPlaceFranchise/>} />
          <Route path='customerCare' element={<CustomerCareScreen/>} />
          <Route path='equipmentSetting' element={<EquipmentSetting/>} />
          <Route path='softwareHistory' element={<SoftwareHistory/>} />
          <Route path='hardwareHistory' element={<HardwareHistory/>} />
          <Route path='transform' element={<TransformTable/>} />
          <Route path='transferExpire' element={<TransferExpireScreen/>} />
          <Route path='teamA' element={<TeamAScreen/>} />
          <Route path='questionSetting' element={<QuestionSettingScreen/>} />
          <Route path='diagnosis' element={<DiagnosisScreen/>} />
          <Route path='kbankReport' element={<KbankReportScreen/>} />

          

          

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
