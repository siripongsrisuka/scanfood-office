import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  HomeScreen,
  CloneScreen,
  ImportItemStoreScreen,
  ImportItemFranchiseScreen,
  ImportBomFranchiseScreen,
  ImportBomShopScreen,
  ImportMarketPlaceFranchise,
  SoftwareHistory,
  TransformTable,
  TransferExpireScreen,
  QuestionScreen,
  DiagnosisScreen,
  KbankReportScreen,
  OfficeScreen,
  StaffScreen,
  WarehouseScreen,
  SaleScreen,
  UpgradeStoreSizeScreen,
  UpgradeStoreSizeHistory,
  SaleManagerScreen,
  MarketingBootsScreen,
  WarehouseJobScreen,
  WarehouseSettingScreen,
  WarehouseArrangeScreen,
  ReportInbound,
  WarehouseJobHistory,
  ReportHardware,
  NewShopDashboard,
  TransferOwnerScreen,
  ExtraDayScreen,
  ExtraDayHistory,
  QuestionHistoryScreen,
  CustomerProfileScreen,
  OneMonthShopScreen,
  EmailKbankScreen,
} from './screens';
import { useSelector, useDispatch } from 'react-redux';
import { login } from './redux/authSlice';
import { firebaseAuth } from './db/firestore'
import 'rsuite/dist/rsuite.min.css';
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

          <Route path='/office' element={<OfficeScreen/>} >
            <Route index  element={<SaleScreen/>} />
            <Route path='staff' element={<StaffScreen/>} />
            <Route path='clone' element={<CloneScreen/>} />
            <Route path='importItem' element={<ImportItemStoreScreen/>} />
            <Route path='importBomShop' element={<ImportBomShopScreen/>} />
            <Route path='kbankReport' element={<KbankReportScreen/>} />
            <Route path='warehouse' element={<WarehouseScreen/>} />
            <Route path='approveSoftware' element={<ApproveSoftwareScreen/>} />
            <Route path='sale' element={<SaleScreen/>} />
            <Route path='upgrade' element={<UpgradeStoreSizeScreen/>} />
            <Route path='upgradeHistory' element={<UpgradeStoreSizeHistory/>} />
            <Route path='transferExpire' element={<TransferExpireScreen/>} />
            <Route path='transform' element={<TransformTable/>} />
            <Route path='softwareHistory' element={<SoftwareHistory/>} />
            <Route path='saleManager' element={<SaleManagerScreen/>} />
            <Route path='marketingBoots' element={<MarketingBootsScreen/>} />
            <Route path='warehouseJob' element={<WarehouseJobScreen/>} />
            <Route path='warehouseSetting' element={<WarehouseSettingScreen/>} />
            <Route path='hardwareArrange' element={<WarehouseArrangeScreen/>} />
            <Route path='reportInbound' element={<ReportInbound/>} />
            <Route path='warehouseJobHistory' element={<WarehouseJobHistory/>} />
            <Route path='reportHardware' element={<ReportHardware/>} />
            <Route path='newShop' element={<NewShopDashboard/>} />
            <Route path='importItemFranchise' element={<ImportItemFranchiseScreen/>} />
            <Route path='importBomFranchise' element={<ImportBomFranchiseScreen/>} />
            <Route path='importMarketPlaceFranchise' element={<ImportMarketPlaceFranchise/>} />
            <Route path='questionSetting' element={<QuestionScreen/>} />
            <Route path='diagnosis' element={<DiagnosisScreen/>} />
            <Route path='transferOwner' element={<TransferOwnerScreen/>} />
            <Route path='extraDay' element={<ExtraDayScreen/>} />
            <Route path='extraDayHistory' element={<ExtraDayHistory/>} />
            <Route path='questionHistory' element={<QuestionHistoryScreen/>} />
            <Route path='customerProfile' element={<CustomerProfileScreen/>} />
            <Route path='oneMonthShop' element={<OneMonthShopScreen/>} />
            <Route path='emailKbank' element={<EmailKbankScreen/>} />
            
          </Route>
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
