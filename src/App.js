import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// เมนู 6.1-6.7 · 6.9-6.12 ย้ายไป scanoffice ทีม Tech (2026-09-24 · Pack เคาะ 4a) — route เดิมเหลือหน้าแจ้งย้าย · 6.8 ไม่ย้าย (Pack 3b)
import MovedToScanofficeScreen from './screens/MovedToScanofficeScreen';
import { 
  HomeScreen,
  SoftwareHistory,
  TransformTable,
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
  ReportHardware,
  NewShopDashboard,
  ExtraDayScreen,
  ExtraDayHistory,
  QuestionHistoryScreen,
  CustomerProfileScreen,
  OneMonthShopScreen,
  EmailKbankScreen,
  EmailTaxScreen,
  ManualPaidScreen,
  PackageHistoryScreen,
  HardwareHistoryScreen,
  EmailPrinterScreen,
  ETaxHistoryScreen,
  ETaxScreen,
  KbankScreen,
  SourceScreen,
  PaymentFailedScreen,
  CustomerSuccessShiftScreen,
  SubscriptionScreen,
  CodeRelativeScreen,
  TrainingScheduleScreen,
  TaxInvoiceReceiptTemplate,
  CommissionScreen,
  ExecutiveSalesLeaderboardScreen,
  CommissionHistoryScreen,
  CrmLeadScreen,
  FacebookLeadScreen,
  ReportLinkCodeFalse
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
            <Route index  element={<FacebookLeadScreen/>} />
            {/* <Route index  element={<SaleScreen/>} /> */}
            <Route path='staff' element={<StaffScreen/>} />
            <Route path='clone' element={<MovedToScanofficeScreen from='clone'/>} />
            <Route path='importItem' element={<MovedToScanofficeScreen from='importItem'/>} />
            <Route path='importBomShop' element={<MovedToScanofficeScreen from='importBomShop'/>} />
            <Route path='kbankReport' element={<KbankReportScreen/>} />
            <Route path='warehouse' element={<WarehouseScreen/>} />
            <Route path='approveSoftware' element={<ApproveSoftwareScreen/>} />
            <Route path='sale' element={<SaleScreen/>} />
            <Route path='upgrade' element={<UpgradeStoreSizeScreen/>} />
            <Route path='upgradeHistory' element={<UpgradeStoreSizeHistory/>} />
            <Route path='transferExpire' element={<MovedToScanofficeScreen from='transferExpire'/>} />
            <Route path='transform' element={<TransformTable/>} />
            <Route path='softwareHistory' element={<SoftwareHistory/>} />
            <Route path='saleManager' element={<SaleManagerScreen/>} />
            <Route path='marketingBoots' element={<MarketingBootsScreen/>} />
            <Route path='warehouseJob' element={<WarehouseJobScreen/>} />
            <Route path='warehouseSetting' element={<WarehouseSettingScreen/>} />
            <Route path='hardwareArrange' element={<WarehouseArrangeScreen/>} />
            <Route path='reportInbound' element={<ReportInbound/>} />
            <Route path='reportHardware' element={<ReportHardware/>} />
            <Route path='newShop' element={<NewShopDashboard/>} />
            <Route path='importItemFranchise' element={<MovedToScanofficeScreen from='importItemFranchise'/>} />
            <Route path='importBomFranchise' element={<MovedToScanofficeScreen from='importBomFranchise'/>} />
            <Route path='importMarketPlaceFranchise' element={<MovedToScanofficeScreen from='importMarketPlaceFranchise'/>} />
            <Route path='question' element={<QuestionScreen/>} />
            <Route path='diagnosis' element={<DiagnosisScreen/>} />
            <Route path='transferOwner' element={<MovedToScanofficeScreen from='transferOwner'/>} />
            <Route path='extraDay' element={<ExtraDayScreen/>} />
            <Route path='extraDayHistory' element={<ExtraDayHistory/>} />
            <Route path='questionHistory' element={<QuestionHistoryScreen/>} />
            <Route path='customerProfile' element={<CustomerProfileScreen/>} />
            <Route path='oneMonthShop' element={<OneMonthShopScreen/>} />
            <Route path='emailKbank' element={<MovedToScanofficeScreen from='emailKbank'/>} />
            <Route path='emailTax' element={<MovedToScanofficeScreen from='emailTax'/>} />
            <Route path='manualPaid' element={<ManualPaidScreen/>} />
            <Route path='packageHistory' element={<PackageHistoryScreen/>} />
            <Route path='hardwareHistory' element={<HardwareHistoryScreen/>} />
            <Route path='emailPrinter' element={<MovedToScanofficeScreen from='emailPrinter'/>} />
            <Route path='eTax' element={<ETaxScreen/>} />
            <Route path='eTaxHistory' element={<ETaxHistoryScreen/>} />
            <Route path='changeTable' element={<MovedToScanofficeScreen from='changeTable'/>} />
            <Route path='kbank' element={<KbankScreen/>} />
            <Route path='source' element={<SourceScreen/>} />
            <Route path='paymentFailed' element={<PaymentFailedScreen/>} />
            <Route path='customerSuccessShift' element={<CustomerSuccessShiftScreen/>} />
            <Route path='subscription' element={<SubscriptionScreen/>} />
            <Route path='codeRelative' element={<CodeRelativeScreen/>} />
            <Route path='trainingSchedule' element={<TrainingScheduleScreen/>} />
            <Route path='uploadStaff' element={<MovedToScanofficeScreen from='uploadStaff'/>} />
            <Route path='taxInvoice' element={<TaxInvoiceReceiptTemplate/>} />
            <Route path='commission' element={<CommissionScreen/>} />
          <Route path='executiveSalesLeaderboard' element={<ExecutiveSalesLeaderboardScreen/>} />
          <Route path='commissionHistory' element={<CommissionHistoryScreen/>} />
          <Route path='resetPassword' element={<MovedToScanofficeScreen from='resetPassword'/>} />
          <Route path='crmLead' element={<CrmLeadScreen/>} />
          <Route path='lead' element={<FacebookLeadScreen/>} />
          <Route path='reportLinkCodeFalse' element={<ReportLinkCodeFalse/>} />
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
