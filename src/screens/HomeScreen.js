import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
} from "react-bootstrap";
import { colors, initialProfile } from "../configs";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate , Outlet, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { resetPassword, signin } from '../redux/authSlice';
import { Modal_OneInput, Modal_Splash } from "../modal";
import { fetchNormalProfile } from "../redux/profileSlice";
import { db } from "../db/firestore";
import { shopchampRestaurantAPI } from "../Utility/api";
import { toastSuccess } from "../Utility/function";


const { white, darkGray } = colors;

function HomeScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading_Profile, currentUser } = useSelector((state)=> state.auth);

  const [formData, setFormData] = useState({email:'',password:''});
  const { email } = formData;
  const [loading, setLoading] = useState(false);
  const [reset_Modal, setReset_Modal] = useState(false);


  const handleFormChange = (event) => {
    event.preventDefault();

    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value;
    const newFormData = { ...formData };

    switch (fieldName) {
      default:
        newFormData[fieldName] = fieldValue; // dynamic object referent  (eg. equal 'obj.price')
    }

    setFormData(newFormData);
  };



useEffect(()=>{
  if(currentUser?.user?.uid){
    handleProfile(currentUser?.user?.uid)
  }
},[currentUser]);

async function handleProfile(profileId){
  try {
    const profileDoc = await db.collection('profile').doc(profileId).get();
    const profileInfo = {
      ...initialProfile,
      ...profileDoc.data(),
      id:profileId,
    };
    const officeDoc = await db.collection('admin').doc('office').get();
    const { humanRight } = officeDoc.data();
    if(!humanRight.some(a=>a.id === profileId)) throw 'ไม่มีสิทธิ์เข้าใช้งาน'
    dispatch(fetchNormalProfile(profileInfo));
    toastSuccess('เข้าสู่ระบบสำเร็จ')
  } catch (error) {
    alert(error)
  } finally {
    navigate("/office")
    setLoading(false)
  }
}


const checkRegisterUser = async() => {
  setLoading(true)
await shopchampRestaurantAPI.get('/users/checkEmailRegister/'+formData?.email.trim()).then(objRes=>{
  const emailUserUid = objRes?.data?.uid;

  if(emailUserUid){
    dispatch(signin(formData))
    setLoading(false)
  }else{ // Register other app, but not registed vender
    setLoading(false)
    alert('กรุณาสมัครสมาชิกเพื่อเข้าใช้งานระบบ');
  }  

}).catch(err=>{ // Not found user
    setLoading(false)
    alert('กรุณาสมัครสมาชิกเพื่อเข้าใช้งานระบบ');
  console.log(err);
});
}


    const handleReset = async () => {
      setReset_Modal(false)
      if(!formData.email){
        return alert('กรุณาใส่อีเมล')
      }
      const result = await dispatch(resetPassword({ email }));
      if (resetPassword.fulfilled.match(result)) {
        alert("ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลแล้ว");
      } else {
        alert(result.payload.message); // localized error message
      }
  };



  return (
    <div  style={styles.container} >
        <Modal_OneInput
              show={reset_Modal}
              header={`Email`}
              onHide={()=>{setReset_Modal(false)}}
              value={email}
              onClick={handleReset}
              placeholder='ใส่อีเมล'
              onChange={(value)=>{setFormData(prev=>({...prev,email:value}))}}
              rightText='รีเซตรหัสผ่าน'
        />
        <Modal_Splash show={loading || loading_Profile} />
        <div style={styles.container2} >
                <img style={styles.img} src={'/logo512.png'} alt="My Image" />
                <br/>
                <h5  ><b>Scan Food Office</b></h5>
                <h6 style={styles.text2} >Enter your credentials to continue</h6>
                <Form.Floating className="mb-3" style={styles.container3} >
                    <Form.Control
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      onChange={handleFormChange}
                    />
                    <label >Email address</label>
                </Form.Floating>
                <Form.Floating className="mb-3" style={styles.container3} >
                    <Form.Control
                      name="password"
                      type="password"
                      placeholder="Password"
                      onChange={handleFormChange}
                    />
                    <label >Password</label>
                </Form.Floating>
                {!!formData.email && !!formData.password
                    ?<Button onClick={()=>{checkRegisterUser()}}  style={styles.container5} >เข้าสู่ระบบ</Button>
                    :<Button onClick={()=>{alert('กรุณาใส่ข้อมูลให้ครบถ้วน')}}  style={styles.container5} >เข้าสู่ระบบ</Button>
                }
                <br/>
        </div>
    </div>
  );
};

const styles = {
    container : {
      width: "100%",
      height: "100vh", // Full viewport height
      backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/shopchamp-restaurant.appspot.com/o/office%2Froadway_mountains_landscape_landscape_road_mountain_journey_highway_mountain_road-664832.jpg?alt=media&token=7f1f80ad-fc7c-447c-88dc-3a5c5c854528')",
      backgroundSize: "cover", // Ensures the image covers the entire div
      backgroundPosition: "center", // Centers the image
      backgroundRepeat: "no-repeat", // Prevents image from repeating
      display:'flex',
      justifyContent:'center',
      alignItems:'center'
    },
    container2 : {
      backgroundColor:white,
      borderRadius:50,
      padding:20,
      paddingTop:5,
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      width:'25%',
      minWidth:'370px',
      opacity:0.9,
    },
    container3 : {
      width:'100%'
    },
    container5 : {
      width:'100%',borderRadius:20,marginTop:10,padding:30,backgroundColor:'#BF932A', border:'0px solid white'
    },
    img : {
      width:'200px',borderRadius:'1rem'
    },
    text2 : {
      fontSize:14,color:darkGray
    },
}

export default HomeScreen;
