import { firebaseAuth } from '../db/firestore';


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