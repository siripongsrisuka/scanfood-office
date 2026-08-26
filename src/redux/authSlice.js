import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { firebaseAuth } from "../db/firestore";

const initialState = {
    currentUser:null,
    Loading_Auth:true,
    token:null,
    path:'',
    currentShopId:''
}

export const signin = createAsyncThunk( 
  'auth/signin',
  async ({email,password}) => {
    // let user = firebaseAuth.signInWithEmailAndPassword(email, password).then(us)
    // return user;

    // alert('email:'+email +'\n'+
    //       'password:'+JSON.stringify(password))



    console.log("email"+email+"password"+password)
    let user = {}
    try{
      user = await firebaseAuth.signInWithEmailAndPassword(email.trim(), password);
      // user = await firebaseAuth.signInWithEmailAndPassword('siripongsrisukha@gmail.com', '123456');
      // await onesignalHandleSignInUser(objRes.user.uid);
      // dispatch({type:'signIn',payload:{token:objRes.user.uid,currentUser:objRes.user}});

      // alert('authSlice signin:'+JSON.stringify(user,null,4))
      
      // console.log('authSlice signin:'+JSON.stringify(user,null,4))
      
    }catch(err){
        console.log("Error Code:"+err.code+"\nMessage:"+err.message)
        // 🔒 ทุกสาขาต้องมีข้อความ — **ห้ามมี default ที่เงียบ**
        //   เดิม switch นี้ไม่มี `default:` ⇒ รหัส error ที่ไม่อยู่ใน 4 เคส (เช่น `auth/invalid-credential`
        //   ที่ Firebase คืนมาเมื่อเปิด Email enumeration protection · หรือเน็ตหลุด) = กดแล้ว **ไม่มีอะไรเกิดขึ้นเลย**
        //   ผู้ใช้แยกไม่ออกระหว่าง "จอค้าง" กับ "รหัสผิด" ⇒ อาการเดียวกับบั๊กที่เพิ่งแก้ไป
        switch(err.code){
            case 'auth/invalid-email':
                alert('รูปแบบอีเมลไม่ถูกต้อง')
                break;
            case 'auth/user-disabled':
                alert('บัญชีผู้ใช้งานนี้ถูกระงับ')
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
            case 'auth/invalid-login-credentials':
                // Firebase รวมเคส "ไม่มีบัญชี" กับ "รหัสผิด" ให้เป็นรหัสเดียวเมื่อเปิดกันการไล่ถามอีเมล
                // ⇒ ข้อความต้องรวมเช่นกัน (แยกเมื่อไหร่ = จอล็อกอินกลายเป็นช่องถามว่าอีเมลไหนมีบัญชี)
                alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
                break;
            case 'auth/too-many-requests':
                alert('ลองผิดหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่')
                break;
            case 'auth/network-request-failed':
                alert('เชื่อมต่ออินเทอร์เน็ตไม่ได้ กรุณาตรวจสอบสัญญาณแล้วลองใหม่')
                break;
            default:
                alert('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'+(err?.code?' ('+err.code+')':''))
        }
    }
    console.log('user')
    console.log(user)

    return user
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      await firebaseAuth.sendPasswordResetEmail(email.trim());
      return { success: true };
    } catch (err) {
      console.log("Reset Password Error:", err?.code, err?.message);
      let message = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      switch (err?.code) {
        case 'auth/invalid-email':
          message = 'อีเมลไม่ถูกต้อง';
          break;
        case 'auth/user-not-found':
          message = 'ไม่พบบัญชีที่ใช้กับอีเมลนี้';
          break;
      }
      return rejectWithValue({ code: err.code, message });
    }
  }
);

export const signin_customToken = createAsyncThunk( 
  'auth/signin_customToken',
  async (frbUserCustomToken = '') => {
    let user = {}
    try{
      user = await firebaseAuth.signInWithCustomToken(frbUserCustomToken);
      
    }catch(err){
        console.log("Error Code:"+err.code+"\nMessage:"+err.message)
        switch(err.code){
            // case 'auth/invalid-email':
            //     alert('อีเมลนี้ไม่พบในเครื่อข่ายอินเตอร์เน็ต')
            //     break;
            case 'auth/user-disabled':
                alert('บัญชีผู้ใช้งานนี้ถูกระงับ')
                break;
            case 'auth/user-not-found':
                alert('ไม่พบบัญชีผู้ใช้งานในระบบ')
                break;
            case 'auth/wrong-password': //เกิดเฉพาะเมื่ออะไรที่ใช้อีเมลล์ซ้ำ
                alert('รหัสผ่านผิด กรุณาลองใหม่อีกครั้ง')
                break;
            default:
              alert('พบข้อผิดพลาด กรุณาลองอีกครั้ง')
        }
    }
    console.log('user')
    console.log(user)

    return user
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async ({email,password}) => {
    let user ={}
    try{
      user =  await firebaseAuth.createUserWithEmailAndPassword(email.trim(), password);
      
    }catch(err){
      console.log("Error Code:"+err?.code+"\nMessage:"+err?.message)
      // alert("Error Code:"+err?.code+"\nMessage:"+err?.message)
        switch(err?.code){
            case 'auth/email-already-in-use':
                alert('อีเมลนี้ใช้สมัครบริการแล้ว กรุณาใช้อีเมลอื่น')
                break;
            case 'auth/invalid-email':
                alert('อีเมลนี้ไม่พบในเครื่อข่ายอินเตอร์เน็ต กรุณาใช้อีเมลอื่น')
                break;
            case 'auth/operation-not-allowed':
                alert('ผู้ให้บริการปิดการทำงานของวิธีล็อกอินนี้')
                break;
            case 'auth/weak-password':
                alert('โปรดกรอกรหัสผ่านอย่างน้อย 6 หลัก')
                break;
        }
    }
    
    return user
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    return firebaseAuth.signOut();
  }
);

export const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers: {
      login: (state, action) => {
        state.currentUser = action.payload;
      },
      addShopId: (state, action) => {
        state.currentShopId = action.payload;
      },
    },
    extraReducers: (builder) => {
      // // signin
      builder.addCase(signin.pending, state => {
        state.Loading_Auth = true
      })
      builder.addCase(signin.fulfilled, (state, action) => {
        state.Loading_Auth = false
        state.currentUser = action.payload
      })
      builder.addCase(signin.rejected, state => {
        state.Loading_Auth = false
      })

      // // signin_customToken
      builder.addCase(signin_customToken.pending, state => {
        state.Loading_Auth = true
      })
      builder.addCase(signin_customToken.fulfilled, (state, action) => {
        state.Loading_Auth = false
        state.currentUser = action.payload
      })
      builder.addCase(signin_customToken.rejected, state => {
        state.Loading_Auth = false
      })

      // // logout
      builder.addCase(logout.fulfilled, (state, action) => {
        state.currentUser = null;
        // state.Loading_Auth = true;
        state.token = null;
        state.path = '';
        state.currentShopId = '';
      })

    }
})


export const  { login, addShopId } = authSlice.actions;
export default authSlice.reducer;