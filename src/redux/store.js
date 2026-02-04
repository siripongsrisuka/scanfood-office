import { combineReducers } from 'redux';
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import thunk from 'redux-thunk';
import logger from 'redux-logger'

import authReducer from './authSlice'
import orderReducer from './orderSlice';
import profileReducer from './profileSlice';
import shopReducer from './shopSlice';
import careReducer from './careSlice';
import cardReducer from './cardSlice';
import scenarioReducer from './scenarioSlice';
import reportReducer from './reportSlice';
import officeReducer from './officeSlice';
import upgradeReducer from './upgradeSlice';
import inboundReducer from './inboundSlice';
import warehouseReducer from './warehouseSlice';
import hardwareOrderReducer from './hardwareOrderSlice';
import extraReducer from './extraSlice';
import packageReducer from './packageSlice';
import hardwareReducer from './hardwareSlice';
import etaxReducer from './etaxSlice';


  const rootPersistConfig = {
      key: 'root',
      storage,
      whitelist:[]
  }


  const orderPersistConfig = {
    key: 'order',
    storage,
    whitelist: ['products','table','tableData','cart','linkId','orderHistory','type','personName']
  };
  const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['currentUser']
  };

  const profilePersistConfig = {
    key: 'profile',
    storage,
    whitelist: ['profile']
  };


  const carePersistConfig = {
    key: 'care',
    storage,
    whitelist: ['franchiseLine','branchLine']
  };



  const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    order:persistReducer(orderPersistConfig, orderReducer),
    profile:persistReducer(profilePersistConfig, profileReducer),
    shop:shopReducer,
    care:persistReducer(carePersistConfig, careReducer),
    card:cardReducer,
    scenario:scenarioReducer,
    report:reportReducer,
    office:officeReducer,
    upgrade:upgradeReducer,
    inbound:inboundReducer,
    warehouse:warehouseReducer,
    hardwareOrder:hardwareOrderReducer,
    extra:extraReducer,
    package:packageReducer,
    hardware:hardwareReducer,
    etax:etaxReducer,
    // care:careReducer,

  })
  const persistedReducer = persistReducer(rootPersistConfig, rootReducer)

  export const store = configureStore({
    reducer: persistedReducer,
    // middleware: [thunk, logger],
    middleware: [thunk, ],
  })
export const persistor = persistStore(store)