import firebase from 'firebase/app'
import 'firebase/firestore'
import  'firebase/auth'
import 'firebase/storage'
import { stringYMDHMS } from '../Utility/dateTime';
// Note! : firebase V9 are more change syntax and not different in feature.so,use V8 and change to V9 later .....
// import firebase from 'firebase/compat/app';
// import 'firebase/compat/auth';
// import 'firebase/compat/firestore';
// import 'firebase/compat/storage';


// // old, shopcham-brand
// const firebaseConfig = {
//     apiKey: "AIzaSyAQDCXX7p-vOMHVEAlUpDgQmh382ulvfMA",
//     authDomain: "shopcham-24b0b.firebaseapp.com",
//     projectId: "shopcham-24b0b",
//     storageBucket: "shopcham-24b0b.appspot.com",
//     messagingSenderId: "955470064375",
//     appId: "1:955470064375:web:46d333dd232ee016af01f2",
//     measurementId: "G-DS6JW927RY"
// };

// shopchamp-erp
const firebaseConfig = {
  apiKey: "AIzaSyDIrSUcUCUrdgCZ6xRTiw9kd4KGG5J609Q",
  authDomain: "shopchamp-restaurant.firebaseapp.com",
  projectId: "shopchamp-restaurant",
  storageBucket: "shopchamp-restaurant.appspot.com",
  messagingSenderId: "845480287943",
  appId: "1:845480287943:web:821115f96c08d7406428e2",
  measurementId: "G-4GEN2V2CEL"
};
  
  //hash for void error, load firebase only once
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  const db = firebase.firestore()
  const firebaseAuth = firebase.auth()
  const firebaseStorage = firebase.storage()

  export const frbGetIdToken = () => {
    const promise = new Promise(async (resolve,reject) => {
      try{
        const authToken = await firebaseAuth.currentUser.getIdToken(true);
        // const authToken = await firebaseAuth.currentUser.getIdToken(false);    // !!! will use for better speeed, when has a trustable solution to handle expire !!!
        
        // fbrIdToken = authToken;
        resolve(authToken);
  
      }catch(err){
        console.log(err);
        reject(err);
      }    
    });
  
    return promise;
  };
  

  export const prepareFirebaseImage = async (imageData,storageRef,shopId) => { // auto check format and prepare URL to send image file and get URL
  
    let imageUrl = ''
   
        const fileName = shopId+ Date.now()  // event.target.files[0].name ,add datetime to prevent instead old file in firebase storage
        await firebaseStorage.ref(storageRef+fileName+'.png').putString(imageData, 'data_url', { contentType: 'image/png' });
        imageUrl = await firebaseStorage.ref(storageRef+fileName+'.png').getDownloadURL();

    return imageUrl
  }



  
  export const webImageDelete = async (oldUrltoDelete=null) => {
    const oldFileRef = await firebaseStorage.refFromURL(oldUrltoDelete).fullPath;
    // alert(oldFileRef);
    
    firebaseStorage.ref(oldFileRef).getDownloadURL()
      .then(()=>{
        firebaseStorage.ref(oldFileRef).delete();
        // alert('success delete file in firebaseStorage!')
      })
      .catch((err)=>{
        console.log('oldUrltoDelete file does not exits!')
        // alert('oldUrltoDelete file does not exits!')
        console.log(err);
      }); 
  
  };

  export function addMail({content,scanfood,timestamp,shopId}){
      db.collection('mailbox').add({content,scanfood,timestamp,shopId})
  }

  export { db, firebaseAuth, firebaseStorage, firebase }
