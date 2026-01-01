// import OneSignal from 'react-native-onesignal';
import { shopchampRestaurantAPI } from '../Utility/api';
import onesignalDefalut from '../configs/onesignalDefalut';
// import firebaseAuth from '@react-native-firebase/auth';
// import { fbUpdateOnesignalTags } from '../db/firestore';
import { firebaseAuth } from '../db/firestore';

// specific for web
import OneSignal from 'react-onesignal';

// ############################### OneSignal Constant ##########################################
// // shopchamp-restaurant
// export const androidChannelIds = {
//   urgent:'f291d5e7-95c7-411c-8f3a-2bdd44d183df',   // urgent => show on any app foreground (heading notification), vibration/sound/LED, icon on status bar, notification drawer
//   high:'9f5c4b95-e7b0-4e4f-8bf5-c4829ac7dfbc',  // high => vibration/sound/LED, icon on status bar, notification drawer
//   medium:'595f6b58-81ad-4d05-92c3-8c8ce193f544',  // medium => icon on status bar, notification drawer
//   low:'3df6acc9-4aa5-41ee-afc5-459aa84b7920', // low =>   notification drawer
//   updateProfileStatus:'c2f5e5c0-488b-432d-8144-50bcab1f0783',
// }


// scanfood
export const androidChannelIds = {
  urgent:'7e7e2dd1-21e9-4959-b189-f24336e04542',   // urgent => show on any app foreground (heading notification), vibration/sound/LED, icon on status bar, notification drawer
  high:'20bdb8b0-68a3-4597-8580-5058b2687499',  // high => vibration/sound/LED, icon on status bar, notification drawer
  medium:'cac25f9b-590b-4384-a497-5b6e6bbb0c5f',  // medium => icon on status bar, notification drawer
  low:'ca049df5-530d-4459-998a-dcbee4b44cdf', // low =>   notification drawer
  updateProfileStatus:'8c8d3208-9d2c-446a-b1d1-3f379728eac6',
}

export const smallIcons = {
  ic_launcher:"ic_launcher",
  ic_launcher_round:"ic_launcher_round",
  ic_stat_onesignal_default:"ic_stat_onesignal_default"
}
// ############################### End of  ##########################################


// ############################### Build-in Support Function ##########################################
export const fbGetIdToken = () => {
  const promise = new Promise(async (resolve,reject) => {
    try{
      const authToken = await firebaseAuth.currentUser.getIdToken(true);
      resolve(authToken);

    }catch(err){
      console.log(err);
      reject(err);
    }    
  });

  return promise;
}


function keyNameToEmptyStringObj(arr) {
  const objFromArr = {};
  for (let i = 0; i < arr.length; ++i)
      objFromArr[arr[i]] = '';
  return objFromArr;
}

// ############################### End of Build-in Support Function ##########################################


// // ############################### Enable/Disable Notification,for web ###################################### 

export async function runOneSignal() {
  const appId = '48bc2f45-b853-401f-9e1f-1c100a7c9305';

  // const isProduction = false;
  const isProduction = true;
  if(isProduction){
    // when production
    OneSignal.init({ appId: appId }).then(() => {

      console.log("success_localhost_onesignal_init");

      OneSignal.Slidedown.promptPush();
      // do other stuff

      // OneSignal.Notifications.requestPermission();

      const result = onesignalWebGetDeviceState();

      console.log('onesignalWebGetDeviceState');
      console.log(result);
      alert(JSON.stringify(result,null,4));


    })
  }else{
    // when localhost 
    await OneSignal.init({ appId:appId, allowLocalhostAsSecureOrigin: true}).then(()=>{

      console.log("success_localhost_onesignal_init");
      // alert('success_localhost_onesignal_init')

      const result = onesignalWebGetDeviceState();

      console.log('onesignalWebGetDeviceState');
      console.log(result);
      alert(JSON.stringify(result,null,4));

    }).catch(err=>{

      console.log("not_success_localhost_onesignal_init");
      console.log(err);
      alert(err);

    });

    // alert('onesignalWebCheckPushPermission')
    // alert(onesignalWebCheckPushPermission())

    await OneSignal.Slidedown.promptPush();

    // OneSignal.Notifications.requestPermission();		// request permission, via the native browser prompt.

    // onesignalWebSetPushSubsciption(true)

    // OneSignal.Debug.setLogLevel('trace');


    // function getUserInfo() {
    //   console.log('getUserInfo()');
    //   Promise.all([
    //     OneSignal.Notifications.permission,
    //     OneSignal.User.PushSubscription.id,
    //     OneSignal.User.PushSubscription.token,
    //     OneSignal.User.PushSubscription.optedIn,
    //     // OneSignal.context.serviceWorkerManager.getActiveState(),
    //   ])
    //     .then(
    //       ([
    //         isSubscribed,
    //         subscriptionId,
    //         pushToken,
    //         optedIn,
    //         serviceWorkerActive,
    //       ]) => {
    //         // console.log('What is the current URL of this page?', location.href);
    //          console.log(
    //           "Is a service worker registered and active? (should be false on Safari, otherwise should be 'OneSignal Worker')?",
    //           serviceWorkerActive
    //         );
    //         console.log('')
    //         console.log('Are you subscribed, in the browser?', isSubscribed)
    //         console.log('Are you opted-in, in OneSignal?' , optedIn);
    //         console.log('');
    //         console.log('What is your OneSignal Subscription ID?', subscriptionId);
    //         console.log('What is your Push Token?', pushToken);
            
    //       }
    //     )
    //     .catch(e => {
    //       console.error('Issue determining whether push is enabled:', e);
    //     });
    // }
    // getUserInfo();

  }

}

export async function onesignalWebSetConsentRequired(){
  OneSignal.setConsentRequired(true);
}

export async function onesignalWebSetConsentGiven(){
  OneSignal.setConsentGiven(true);
}

export function onesignalWebCheckPushPermission(){
  return OneSignal.Notifications.permission;  // [true,false]
}

export async function onesignalWebAskPermission(pmsOption="native"){

  switch(pmsOption){
    case "native":
      OneSignal.Notifications.requestPermission();		// request permission, via the native browser prompt.
      break;
    case "slidePrompt":
      OneSignal.Slidedown.promptPush();			//  request permission, via onesignal prompt
      break;
    case "slidePromptCat":
      OneSignal.Slidedown.promptPushCategories();	// request permission, via onesignal prompt, as category to get noti as checklist
      break;
    default:
      OneSignal.Slidedown.promptPush();			//  request permission, via onesignal prompt
      break;
  }

}

export function onesignalWebCheckPushSubscribtion(){
  return OneSignal.User.PushSubscription.optedIn;	// Checking push subscription status
}


// let user to select subscipt push notificaiton in yes/no => set "subscribed" in onesignal user account, the default when user grant to init onesignal in app the "subscribed" = true
export function onesignalWebSetPushSubsciption(isWantSubscription = true){ 
  switch(isWantSubscription){ 
    case false:
        OneSignal.User.PushSubscription.optOut();	// Disable Push
        break;
    case true:
        OneSignal.User.PushSubscription.optIn();		// Enable Push
        break;                          
  }

}

  export async function onesignalWebHandleSignInUser(uid) {  // Prepare notification tracking for sign in user (Clear some old tracking value from lasted sign in user (if have) )
    try{
      await onesignalWebSetPushSubsciption(true);  // !!! must be first to any onesignal method and await,Do not use Promise.all() !!!
      await onesignalWebDeleteAllTagsByPlayerId();
      await onesignalWebSetExtUid(uid);
      
      console.log('onesignalHandleWebSignInUser success');
    }catch(err){
      console.log('onesignalHandleWebSignInUser error:',err);
    }

    // ### Attach tags from firebase to onesignal at "fetchShop" for read billing amount of firebase
    // if player_id same when new login (not necessary to bring user data to tag) 
    // but its busy to check.So, tag by any signin whether sign in from old player_id (same device,not delete app) or new player_id (new device or delete and reinstall app, Are update app version has new player_id ????)
    // (eg. await onesignalUpdateTagsByExternalUserId(uid,{nSignIn:"1"}); )

    // ### May send player_id to user collection in firestore to make notification tracking by device
  }


  export async function onesignalHandleWebSignOutUser() {  // Remove multiple notification tracking ,for cannot send notification when user sign out, not use this function for can send notification when user sign out
    try{
      await onesignalWebClearExtUid();
      await onesignalWebDeleteAllTagsByPlayerId();
      await onesignalWebSetPushSubsciption(false); // auto delete all tag when unsubscribtion
      console.log('onesignalHandleSignOutUser success');
    }catch(err){
      console.log('onesignalHandleWebSignOutUser error:',err);
    }
  }

  export function onesignalWebGetDeviceState(){ 
    const objWebDeviceState = {
      hasNotificationPermission:OneSignal.Notifications.permission,
      isSubscribed:OneSignal.User.PushSubscription.optedIn,
      player_id:OneSignal.User.PushSubscription.id,
      onsToken:OneSignal.User.PushSubscription.token,
    };
  
    return objWebDeviceState;
  }



// // ############################### End of Enable/Disable Notification,for web ###################################### 



// // ############################### Listener,for web ##########################################

export function onesignalWebNotificationClickObserver(callback = ()=>{}){
  OneSignal.Notifications.addEventListener("click", (event)=>{
    console.log(`click event: ${event}`);

    callback();
  });
}

export function onesignalWebSubscriptionObserver(callback = ()=>{}){
  OneSignal.User.PushSubscription.addEventListener("change", (event) =>{
    // event:{
    //   previous:{
    //     id,token,optedIn
    //   },
    //   current:{
    //     id,token,optedIn
    //   }
    
    // }  

    if (event.current.token) {
      console.log(`The push subscription has received a token!`);
    }

    callback();
  });	  
}




// // ### Remove Listener
// function eventListener(event) { // ... }

// OneSignal.Notifications.removeEventListener("eventname", eventListener)

// // ############################### End of Listener,for web ##########################################



// ############################### API => Get Player || Get/Update/Delete Tags || Send Push ##########################################

export async function onesignalWebGetPlayerId(){
  const { player_id } = await onesignalWebGetDeviceState();   // Except this, must from SDK  
  return player_id ;
}


export async function cloneShop(pushParam) {  // update tag to all same external_user_id in all player of onesignal



  try{
    // return await shopchampRestaurantAPI.put("/updateTagsByExternalUserId/"+external_user_id,{uid:objRes.user.uid,appName:'merchant'});
    const response = await shopchampRestaurantAPI.post(
      "/shop/cloneShop/",
      {...pushParam},
      { }
    );

    return response
  }catch(error){
    console.log('cloneShop_error')
    // console.log(error)

    if (error.response) {   // // not make error on calling layer, cause it reject by axios and has go to this scope (catch), reject or error can only go to catch scpoe one time if want more than one must thow error to make error again on outside layer
      console.log('Error data:', error.response.data); // The data returned by the server
      console.log('Error status:', error.response.status); // The HTTP status code
      console.log('Error headers:', error.response.headers); // The response headers
      // console.log('Error message:', error.message); // The error message 
    }

  }



}


export async function onesignalWebGetFullPlayerData(_player_id='') {   // use to get "external_user_id" of user in onesignal
  let player_id = _player_id;  
  if (!player_id) player_id = await onesignalWebGetPlayerId();

  const fullPlayerData =  await shopchampRestaurantAPI.get("/onesignal_scanFood/getFullPlayerData/"+player_id);
  return fullPlayerData.data;
}

export async function onesignalWebGetTags(_player_id='') {   // use to get "external_user_id" of user in onesignal
  let player_id = _player_id;  
  if (!player_id) player_id = await onesignalWebGetPlayerId();
  
  const fullPlayerData = await onesignalWebGetFullPlayerData();
  const tags = fullPlayerData?.tags;
  return tags;
}

export async function onesignalWebGetExtUid(_player_id='') {   // use to get "external_user_id" of user in onesignal
  let player_id = _player_id;  
  if (!player_id) player_id = await onesignalWebGetPlayerId();
  
  const fullPlayerData = await onesignalWebGetFullPlayerData();
  const external_user_id = fullPlayerData?.external_user_id;
  return external_user_id;
}

export async function onesignalWebSetExtUid(extUid = "",_player_id = '') {
  let player_id = _player_id;  
  if (!player_id) player_id = await onesignalWebGetPlayerId();

  console.log('onesignalSetExtUid player_id:',player_id)
  
  return shopchampRestaurantAPI.put(
    "/onesignal_scanFood/setExternalUserId/"+player_id,
    {external_user_id:extUid}
  );
}


export async function onesignalWebClearExtUid(_player_id = '') {
  let player_id = _player_id;  
  if (!player_id) player_id = await onesignalWebGetPlayerId();

  console.log('onesignalDelExtUid player_id:',player_id)
  
  return shopchampRestaurantAPI.put(
    "/onesignal_scanFood/setExternalUserId/"+player_id,
    {external_user_id:""}
  );
}

export async function onesignalWebInitUserTagsByPlayerId(objTags={},_player_id='') {  // update tag to all same external_user_id in all player of onesignal
  let player_id = _player_id;  
  if (!player_id) player_id = await onesignalWebGetPlayerId();

  console.log('player_id:',player_id);
  console.log('onesignalInitUserTagsByPlayerId objTags:',JSON.stringify(objTags,null,4))

  // await fbUpdateOnesignalTags(shopDoc, {...strObjTags}); // in future, may change random doc id to doc id from uid (equivalent external_user_uid)


  // !! should tag only curent player id on this device, use other code instead below !!
  return shopchampRestaurantAPI.put(
    "/onesignal_scanFood/updateTagsByPlayerId/"+player_id,
    {tags:{...objTags}}
  );
}


export async function onesignalWebInitShopTagsByPlayerId(objShop={},_player_id='') {  // update tag to all same external_user_id in all player of onesignal
  let player_id = _player_id;  
  if (!player_id) player_id = await onesignalWebGetPlayerId();

  // console.log('initShopTagsByPlayerId objShop:',JSON.stringify(objShop,null,4))

  return shopchampRestaurantAPI.put(
    "/onesignal_scanFood/initShopTagsByPlayerId/"+player_id,
    {objShop:{...objShop}}
  );
}

export async function onesignalWebInitProfileTagsByPlayerId(objProfile={},_player_id='') {  // update tag to all same external_user_id in all player of onesignal
  let player_id = _player_id;  
  if (!player_id) player_id = await onesignalWebGetPlayerId();

  // console.log('initProfileTagsByPlayerId objProfile:',JSON.stringify(objProfile,null,4))

  return shopchampRestaurantAPI.put(
    "/onesignal_scanFood/initProfileTagsByPlayerId/"+player_id,
    {objProfile:{...objProfile}}
  );
}



export async function onesignalWebUpdateUserTagsByExtUid(objTags={},_external_user_id='',shopDoc='') {  // update tag to all same external_user_id in all player of onesignal
  let external_user_id = _external_user_id;  
  // if (!external_user_id) external_user_id = await onesignalGetExtUid();

  // await fbUpdateOnesignalTags(shopDoc, {...strObjTags}); // in future, may change random doc id to doc id from uid (equivalent external_user_uid)


  // return shopchampRestaurantAPI.put(
  //   "/onesignal_scanFood/updateTagsByExternalUserId/"+external_user_id,
  //   {tags:{...objTags}}
  // );

  const res = await shopchampRestaurantAPI.put(
    "/onesignal_scanFood/updateTagsByExternalUserId/"+external_user_id,
    {tags:{...objTags}}
  );
  console.log('res.status:',res.status)


}

// build-in delete tag function both onesignal and firebase
export async function onesignalWebDeleteUserTagsByExtUid(arrTagsKey=[],_external_user_id='',shopDoc='') {  // delete tag to all same external_user_id in all player of onesignal
  let external_user_id = _external_user_id;  
  // if (!external_user_id) external_user_id = await onesignalGetExtUid();

  const objEmptyString = keyNameToEmptyStringObj([...arrTagsKey])
  
  // await fbDeleteOnesignalTags(shopDoc, {...objTags}); // in future, may change random doc id to doc id from uid (equivalent external_user_uid)
  
  return shopchampRestaurantAPI.put(   // !!! use this instead send array in axios, will change later ....
    "/onesignal_scanFood/updateTagsByExternalUserId/"+external_user_id,
    {tags:{...objEmptyString}}
  );
}

export async function onesignalWebDeleteTagsByPlayerId(arrTagsKey=[],_player_id='',shopDoc='') {
  let player_id = _player_id;  
  if (!player_id) player_id = await onesignalWebGetPlayerId();

  const objEmptyString = keyNameToEmptyStringObj([...arrTagsKey])     // ['dateTime','name','age']

  // return shopchampRestaurantAPI.delete(       // !!! have an error, cannot send array data via axios to nodejs ,must to confix if need, not occur when test with postman
  //   "/onesignal_scanFood/deleteTagsByPlayerId/"+player_id,
  //   JSON.stringify({ arrTagsKey:["name","af_favSport"] }),
    // {
    //   // headers: {'Content-Type': 'application/json'}
    //   headers: {'content-type': 'application/x-www-form-urlencoded'}
    // }
  // );

  return shopchampRestaurantAPI.put(   // !!! use this instead send array in axios, will change later ....
    "/onesignal_scanFood/updateTagsByPlayerId/"+player_id,
    // {tags:{name:'',af_first_name:''}}
    { tags:{...objEmptyString} }
  );
}


export async function onesignalWebDeleteAllTagsByPlayerId(_player_id='') {
  let player_id = _player_id;  
  if (!player_id) player_id = await onesignalWebGetPlayerId();

  return shopchampRestaurantAPI.delete(
    "/onesignal_scanFood/deleteAllTagsByPlayerId/"+player_id
  );
}





export async function onesignalUpdateUserTagsByExtUid(objTags={},_external_user_id='',shopDoc='') {  // update tag to all same external_user_id in all player of onesignal
  let external_user_id = _external_user_id;  
  // if (!external_user_id) external_user_id = await onesignalGetExtUid();

  // await fbUpdateOnesignalTags(shopDoc, {...strObjTags}); // in future, may change random doc id to doc id from uid (equivalent external_user_uid)


  // return shopchampRestaurantAPI.put(
  //   "/onesignal_scanFood/updateTagsByExternalUserId/"+external_user_id,
  //   {tags:{...objTags}}
  // );

  const res = await shopchampRestaurantAPI.put(
    "/onesignal_scanFood/updateTagsByExternalUserId/"+external_user_id,
    {tags:{...objTags}}
  );
  console.log('res.status:',res.status)


}

// build-in delete tag function both onesignal and firebase
export async function onesignalDeleteUserTagsByExtUid(arrTagsKey=[],_external_user_id='',shopDoc='') {  // delete tag to all same external_user_id in all player of onesignal
  let external_user_id = _external_user_id;  
  // if (!external_user_id) external_user_id = await onesignalGetExtUid();

  const objEmptyString = keyNameToEmptyStringObj([...arrTagsKey])
  
  // await fbDeleteOnesignalTags(shopDoc, {...objTags}); // in future, may change random doc id to doc id from uid (equivalent external_user_uid)
  
  return shopchampRestaurantAPI.put(   // !!! use this instead send array in axios, will change later ....
    "/onesignal_scanFood/updateTagsByExternalUserId/"+external_user_id,
    {tags:{...objEmptyString}}
  );
}

// export async function onesignalDeleteTagsByPlayerId(arrTagsKey=[],_player_id='',shopDoc='') {
//   let player_id = _player_id;  
//   if (!player_id) player_id = await onesignalGetPlayerId();

//   const objEmptyString = keyNameToEmptyStringObj([...arrTagsKey])     // ['dateTime','name','age']

//   // return shopchampRestaurantAPI.delete(       // !!! have an error, cannot send array data via axios to nodejs ,must to confix if need, not occur when test with postman
//   //   "/onesignal_scanFood/deleteTagsByPlayerId/"+player_id,
//   //   JSON.stringify({ arrTagsKey:["name","af_favSport"] }),
//     // {
//     //   // headers: {'Content-Type': 'application/json'}
//     //   headers: {'content-type': 'application/x-www-form-urlencoded'}
//     // }
//   // );

//   return shopchampRestaurantAPI.put(   // !!! use this instead send array in axios, will change later ....
//     "/onesignal_scanFood/updateTagsByPlayerId/"+player_id,
//     // {tags:{name:'',af_first_name:''}}
//     { tags:{...objEmptyString} }
//   );
// }


// export async function onesignalDeleteAllTagsByPlayerId(_player_id='') {
//   let player_id = _player_id;  
//   if (!player_id) player_id = await onesignalGetPlayerId();

//   return shopchampRestaurantAPI.delete(
//     "/onesignal_scanFood/deleteAllTagsByPlayerId/"+player_id
//   );
// }



export async function onesignalSendPush(pushParam) {  // update tag to all same external_user_id in all player of onesignal
  const authToken = await fbGetIdToken();

  // return await shopchampRestaurantAPI.put("/updateTagsByExternalUserId/"+external_user_id,{uid:objRes.user.uid,appName:'merchant'});
  return shopchampRestaurantAPI.post(
    "/onesignal_scanFood/sendPush/",
    {...pushParam},
    { authorization: `Bearer ${authToken}` }
  );

}


// ############################### End of API => Get Player || Get/Update/Delete Tags || Send Push ##########################################




// ###################### Modify Message and Send Push Function ######################

export async function apiExtTags(objTags={},external_user_uid='',shopDoc=''){
  if(!objTags){
    alert('please specify tag !');
    return;
  }

  await onesignalUpdateUserTagsByExtUid(objTags,external_user_uid,shopDoc);
}


// ###################### End of Modify Message and Send Push Function ######################


// ###################### Modify Message and Send Push Function ######################


// ##### Easy test send push
// ##### Push with Android Notification Level
export async function sendPush(){
  await onesignalSendPush({
    campaignName:"urgent",
    android_channel_id: androidChannelIds.urgent,
    small_icon:smallIcons.ic_stat_onesignal_default,
    heading:"ส่งให้เฉพาะวิน",
    content:"abc defg 1234",
    priority:10,
    enable_frequency_cap:false,
    objTargerUserCondition:{
      filters: [
          // {         
          //     field: "tag",
          //     key: "name",
          //     relation: "=",
          //     value: "win"
          // }
          {         
              field: "tag",
              key: "name",
              relation: "=",
              value: "winApiExt"
          }
      ]     
    }
  });

  alert('success send push')
}

export async function sendPush2(){
  await onesignalSendPush({
    campaignName:"urgent",
    android_channel_id: androidChannelIds.urgent,
    small_icon:smallIcons.ic_stat_onesignal_default,
    heading:"ส่งให้เฉพาะวิน",
    content:"abc defg 1234",
    priority:10,
    enable_frequency_cap:false,
    objTargerUserCondition:{
      filters: [
          {         
              field: "tag",
              key: "af_name",
              relation: "=",
              value: "win"
          }
      ]     
    }
  });

  alert('success send push')
}


export async function pushWithAndroidNotiLevel(androidNotiLevel = 'test'){
  let cAndroidChannelId = '';
  switch(androidNotiLevel){
    case 'urgent':
      cAndroidChannelId = androidChannelIds.urgent;
      break;
    case 'high':
      cAndroidChannelId = androidChannelIds.high;
      break;
    case 'medium':
      cAndroidChannelId = androidChannelIds.medium;
      break;
    case 'low':
      cAndroidChannelId = androidChannelIds.low;
    default:
      cAndroidChannelId = androidChannelIds.low;
      break;
  } 

  alert(cAndroidChannelId);

  await onesignalSendPush({
    campaignName:androidNotiLevel,
    android_channel_id: cAndroidChannelId,
    small_icon:smallIcons.ic_stat_onesignal_default,
    heading:"ส่งให้เฉพาะวิน",
    content:"abc defg 1234",
    priority:10,
    enable_frequency_cap:false,
    objTargerUserCondition:{
      filters: [
          {         
              field: "tag",
              key: "email",
              relation: "=",
              value: "winionian@gmail.com"
          }
      ]     
    }
  });

  // alert('success send push')
};


export async function pushByIdFilter(dataSet){
  let config = {...onesignalDefalut,...dataSet}
await onesignalSendPush({
  ...config,
  android_channel_id: androidChannelIds.urgent,
  small_icon:smallIcons.ic_stat_onesignal_default,
  // small_icon:'https://entertain.teenee.com/thaistar/img5/927933.jpg',
  priority:10,
  enable_frequency_cap:false,
  objTargerUserCondition:{
    filters: [
      { field: "tag",key: "id",relation:"=",value: config?.id}
    ]     
  }
});
}



// ######## <Send Push Patttern>
// Now have ….. patterns , can only use 1 pattern of them
// #1 by “Filters” => a target that setting with default tags by OneSignal such as device data,account data also include “tags” (json data that we can built-in)
// in free plan limit at 2 filters !!!!
                          // # 1.1 one filter
//     //                       "filters": [
                                    // {         
                                    //   field: "tag",
                                    //   key: "name",
                                    //   relation: "=",
                                    //   value: "win"
                                    // }
//     //                        ]
                          // # 1.2 more than one filter
                          // # 1.2.1 "AND",  operator by default to each condtion object
//     //                       "filters": [
//     //                           {"field": "tag", "key": "level", "relation": "=", "value": "10"},
//     //                           {"field": "amount_spent", "relation": ">","value": "0"}
//     //                        ]
                          // # 1.2.2 "OR" operator
//     //                        "filters": [
//     //                            {"field": "tag", "key": "level", "relation": "=", "value": "10"}, 
//     //                            {"operator": "OR"}, {"field": "tag", "key": "level", "relation": "=", "value": "20"}
//     //                         ]


// // # 1.1 one filter
// export async function pushByOneFilter({heading,content,email,campaignName,big_picture,url,data}){
  export async function pushByOneFilter(dataSet){
    let config = {...onesignalDefalut,...dataSet}
  await onesignalSendPush({
    ...config,
    android_channel_id: androidChannelIds.urgent,
    small_icon:smallIcons.ic_stat_onesignal_default,
    priority:10,
    enable_frequency_cap:false,
    objTargerUserCondition:{
      filters: [
        { field: "tag",key: "email",relation:"=",value: config.email}
      ]     
    }
  })
  .then(res=>{
    console.log("res.status:"+res.status)

  });

  // alert('success send push')
}


// export async function pushByOneFilter(){
//   await onesignalSendPush({
//     campaignName:"urgent",
//     android_channel_id: androidChannelIds.urgent,
//     small_icon:smallIcons.ic_stat_onesignal_default,
//     heading:"ยอดขายเบญจมาศ อารีย์",
//     content:"13,700 บาท",
//     priority:10,
//     enable_frequency_cap:false,
//     objTargerUserCondition:{
//       filters: [
//         { field: "tag",key: "email",relation:"=",value: "siripongsrisukha@gmail.com" }
//       ]     
//     }
//   });

//   alert('success send push')
// }


export async function pushByTwoFilter(dataSet){
  let config = {...onesignalDefalut,...dataSet}
  await onesignalSendPush({
    ...config,
    android_channel_id: androidChannelIds.urgent,
    small_icon:smallIcons.ic_stat_onesignal_default,
    // small_icon:'https://entertain.teenee.com/thaistar/img5/927933.jpg',
    priority:10,
    enable_frequency_cap:false,
    objTargerUserCondition:{
      filters: [
        // { field: "tag",key: "email",relation:"=",value: config.email}
        { field: "tag",key: "id",relation:"=",value: config?.id },
          { operator:"AND" },
        { field: "tag",key: "shopId",relation:"=",value: config?.shopId}
      ]     
    }
  });

  // alert('success send push')
}

export async function lineNotifyAPI(obj){
  // const { arrLineNotifyToken, message, base64Image } = obj
  try{

    // const authToken = await frbGetIdToken();


    const { status, data } = await shopchampRestaurantAPI.post(
        "/onesignal_scanFood/sendMultiLineNotify/",
        {   
            // arrLineNotifyToken:["8AlwzGsVaRo7LwQUJSZj2UBkKv1vsmTsZJr1fgEeuCm",]  // ทดสอบ LINE Notify
            // arrLineNotifyToken:["8AlwzGsVaRo7LwQUJSZj2UBkKv1vsmTsZJr1fgEeuCm","3gPPd2ZWA9jLSjHGITs5ZH9PRqHz75HCT8v1p749xGv", "XDlaFjrb7XhE8CkZC1i1zLDp5H9LhtWUJ8W56KQHXVl"]  // ทดสอบ LINE Notify
            // ,stickerPackageId:11537
            // ,stickerId:52002740
            notificationDisabled:false,
            ...obj
            // ,base64Image:base64Image
            
        },
        {
            // headers: {
            //     Authorization:`Bearer ${authToken}`,
            // },
            // timeout: 3000
        }
    );
    // console.log('linenotify')
    // console.log(data)
  }catch(err){
    // console.log('linenotify_err')
    // console.log(err)
  }
}

// # 1.2.1 "AND",  operator by default to each condtion object
export async function pushByMultiFilter_AND(){
  await onesignalSendPush({
    campaignName:"urgent",
    android_channel_id: androidChannelIds.urgent,
    small_icon:smallIcons.ic_stat_onesignal_default,
    heading:"ส่งให้เฉพาะวิน",
    content:"abc defg 1234",
    priority:10,
    enable_frequency_cap:false,
    objTargerUserCondition:{
      filters: [
        { field: "tag",key: "email",relation:"=",value: "winionian@gmail.com" },
        { operator:"AND" },
        { field: "tag",key: "gender",relation:"=",value: "male" }
      ]     
    }
  });

  alert('success send push')
}


// # 1.2.2 "OR" operator
export async function pushByMultiFilter_OR(){
  await onesignalSendPush({
    campaignName:"urgent",
    android_channel_id: androidChannelIds.urgent,
    small_icon:smallIcons.ic_stat_onesignal_default,
    heading:"ส่งให้เฉพาะวิน",
    content:"abc defg 1234",
    priority:10,
    enable_frequency_cap:false,
    objTargerUserCondition:{
      filters: [
        { field: "tag",key: "email",relation:"=",value: "winioinan@gmail.com" },
        { operator:"OR" },
        { field: "tag",key: "gender",relation:"=",value: "male" }
      ]     
    }
  });

  alert('success send push')
}



// #2 by “Segments” => same as "Filters" but created condition beforehand, 
//     //              only combo compatible only in 2 fields by "included_segments" and "excluded_segments",
//     //              must create segment or use defualt segment to send
//     //                  eg. 
//     //                      included_segments:["Active Users", "Engaged Users"],
//     //                      excluded_segments:["All SMS Subscribers"]



// #2 by “Segments”
export async function pushBySegment(){
  await onesignalSendPush({
    campaignName:"urgent",
    android_channel_id: androidChannelIds.urgent,
    small_icon:smallIcons.ic_stat_onesignal_default,
    heading:"ส่งให้ Active Users หรือ Engaged Users",
    content:"abc defg 1234",
    priority:10,
    enable_frequency_cap:false,
    objTargerUserCondition:{
      included_segments:["Active Users", "Engaged Users"],
      excluded_segments:["All SMS Subscribers"]   
    }
  });

  alert('success send push')
}


// #3 by Specific Device => 
//     //              proper for send individual or some user/device
//     //              all of field in this type => "Limit of 2,000 entries per REST API call" (in array value)
//    # 3.1 by “external user id”, an an built-in user id that give to OneSignal (eg.from "uid" from firebase) to attach to  any wanted device of user
//     //        # 3.1.1 multi “external user id”
//     //		include_external_user_ids:['123456789','99999']     // send to all channel,all platform (if have more than 1 channel ,1 platform)
//     //                   
//    # 3.1.2  multi “external user id” only push and android platform
//     //                      {                                                           
//     //                            "include_external_user_ids": ["external_user_id"],
//     //                            "channel_for_external_user_ids": "push",
//     //                            "isAndroid": true
//     //                        }
//    # 3.2 by “player id”, an id that OneSignal bind to each device
//    //			include_player_ids:["1dd608f2-c6a1-11e3-851d-000c2940e62c"]

// # 3.1.1 multi “external user id”
export async function pushByMultiExtUid(){
  await onesignalSendPush({
    campaignName:"urgent",
    android_channel_id: androidChannelIds.urgent,
    small_icon:smallIcons.ic_stat_onesignal_default,
    heading:"ส่งตาม External User Id ที่เลือก",
    content:"abc defg 1234",
    priority:10,
    enable_frequency_cap:false,
    objTargerUserCondition:{
      include_external_user_ids:['52QzJ1Gnccc8r8G3CbD0pM3zRBk2','HYoXUJXmk0YW65VUUaXABzM5OrA2'] 
    }
  });

  alert('success send push')
}

// # 3.1.2  multi “external user id” only push and android platform
export async function pushByMultiExtUid_onlyPushAndAndroid(){
  await onesignalSendPush({
    campaignName:"urgent",
    android_channel_id: androidChannelIds.urgent,
    small_icon:smallIcons.ic_stat_onesignal_default,
    heading:"ส่งตาม External User Id ที่เลือก เฉพาะ Android",
    content:"abc defg 1234",
    priority:10,
    enable_frequency_cap:false,
    objTargerUserCondition:{
      include_external_user_ids:['52QzJ1Gnccc8r8G3CbD0pM3zRBk2','HYoXUJXmk0YW65VUUaXABzM5OrA2'],
      channel_for_external_user_ids: "push",
      isAndroid: true 
    }
  });

  alert('success send push')
}

// # 3.2 by “player id”, an id that OneSignal bind to each device
export async function pushByMultiPlyId(){
  await onesignalSendPush({
    campaignName:"urgent",
    android_channel_id: androidChannelIds.urgent,
    small_icon:smallIcons.ic_stat_onesignal_default,
    heading:"ส่งตาม Player Id ที่เลือก",
    content:"abc defg 1234",
    priority:10,
    enable_frequency_cap:false,
    objTargerUserCondition:{
      include_player_ids:["bc1b079c-42f2-4afc-9ebb-3fa7c44ba123","e7c393a7-3241-4891-a9c4-0f14d73ae134"]
    }
  });

  alert('success send push')
}

// ###################### End of Modify Message and Send Push Function ######################