import React, { useState, useEffect } from "react";
import { DemoRender, ImplementationRender, LaunchRender, OneButton, PaymentRender, SearchControl, SetupRender, TrainingRender } from "../components";
import { Modal_Loading, Modal_Success } from "../modal";
import { db, frbGetIdToken } from "../db/firestore";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate , Outlet, NavLink } from 'react-router-dom';
import { Button } from "rsuite";
import { useDispatch, useSelector } from "react-redux";
import { addNewStorePort, fetchBySale, updateDemo } from "../redux/careSlice";
import { colors } from "../configs";
import { searchFilterFunction } from "../Utility/function";
import { scanfoodAPI } from "../Utility/api";

const initialStore = { storeName:'', ownerName:'', tel:'', codeName:'',timestamp:new Date() };

const initialProcess = [
    { id:'demo', color:'red'},
    { id:'payment', color:'orange'},
    { id:'setup', color:'yellow'},
    { id:'implementation', color:'green'},
    { id:'training', color:'cyan'},
    { id:'softlaunch', color:'blue'},
];

const { ten, dark } = colors;

function StorePort() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { demo, portStores, modal_Care } = useSelector(state=>state.care);
    const { profile } = useSelector(state=>state.profile);
    const { codeName, id } = profile;
     
    const [search, setSearch] = useState('');

    const [franchise_Modal, setFranchise_Modal] = useState(false);
    const [current, setCurrent] = useState(initialStore);
    const [loading, setLoading] = useState(false);
    const [success_Modal, setSuccess_Modal] = useState(false);
    const [currentProcess, setCurrentProcess] = useState('demo');
    const [display, setDisplay] = useState([])


    useEffect(()=>{
        dispatch(fetchBySale(codeName))
    },[]);

    useEffect(()=>{
        let arr = portStores.filter(a=>a.process===currentProcess)
        if(search){
            arr = searchFilterFunction(arr,search,'name')
        }
        setDisplay(arr)
    },[currentProcess,search,portStores])


    async function addNewFranchise() {
        setFranchise_Modal(false);
        setLoading(true);
        try {
            dispatch(addNewStorePort({...current,codeName})).then(()=>{
                navigate('demo')
                setSuccess_Modal(true);
                setTimeout(() => setSuccess_Modal(false), 900);
            })
        } catch (error) {
            console.error("Error adding franchise:", error);
        } finally {
            setLoading(false);
        }
    }

    function handleProfile(item){
        dispatch(updateDemo(item))
        navigate('demo')
    };

    // async function testPack(){
    //     try {
    //         const authToken = await frbGetIdToken();
    //         const res = await scanfoodAPI.post('/test2/test/'+"085555xx",{ phoneNumber2:'winny' },{
    //             headers: {
    //                 Authorization:`Bearer ${authToken}`,
    //             },
    //             // timeout: 3000
    //         })
    //         console.log(res.data)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }



    // async function testPack(){
    //     try{
    //         const authToken = await frbGetIdToken();

    //         const { status, data } = await scanfoodAPI.post(
    //             "/paymentGateway/payTransaction/",
    //             {   
    //                 // serverOption:serverOption,
    //                 // morris_profile_token_shop:morris_profile_token_shop,
    //                 // paymentType:paymentType,
    //                 // paymentGatewayData:apiReq["paymentGatewayData"]
    //                 abc:'123'
    //             },
    //             {
    //                 headers: {
    //                     Authorization:`Bearer ${authToken}`,
    //                 },
    //                 // timeout: 3000
    //             }
    //         );


    //         // {
    //         //   "success": true,
    //         //   "data": {
    //         //       "responsePayment": {
    //         //           "morris_reference_no": "241007154429E9J",
    //         //           "qr_code_text": "00020101021230830016A000000677010112011501055600681274802180000002410071017380318000241007154429E9J530376454041.005802TH5910GBPrimePay6304B66F",
    //         //           "reference_no": "9d5AqjauCKxysLQG"
    //         //       }
    //         //   }
    //         // }

    //         console.log('respose_data')
    //         console.log(data)

    //         if(
    //         status === 200 
    //             && data?.success === true
    //         ){
                
    //             console.log('payTransaction_success')


    //             // setLoading(false)

    //             // return data;
    //             return {success:true, data:{...data?.data}};
    //         } else {
    //             // setLoading(false)

    //             // {
    //             //     success: false,
    //             //     response: { error_code: '404', error_message: 'Not Found Merchant' }
    //             // }

    //             return {success:false, data:{...data?.data}};
    //         }
        
    //     }catch(error){
    //         // setLoading(false)

    //         console.log('paymentGateway_error')

    //         // Check if error has a response from the server
    //         if (error.response) {
    //             // The request was made and the server responded with a status code
    //             // that falls out of the range of 2xx
    //             console.log('Error data:', error.response.data); // The data returned by the server
    //             console.log('Error status:', error.response.status); // The HTTP status code
    //             console.log('Error headers:', error.response.headers); // The response headers

    //             return {success:false, data:{...error.response.data}};
    //         } else if (error.request) {
    //             // The request was made but no response was received
    //             console.log('Error request:', error.request);


    //             if (error.code === 'ECONNABORTED') {
    //               // Specific check for timeout error (ECONNABORTED)
    //               console.log('Request timeout (ECONNABORTED)');
    //               return { success: false, data: { message: 'request-time-out' } };
    //             }else{
    //               return {success:false, data:{...error.request}};
    //             }

    //         } else {
    //             // Something happened in setting up the request that triggered an Error
    //             console.log('Error message:', error.message);
                
    //             return {success:false, data:{message:error.message}};
    //         }

    //     }

    // }

    
  return (
    <div  >
        <Modal_Loading show={loading||modal_Care} />
        <Modal_Success show={success_Modal} />
   
      <h1 style={{textAlign:'center'}} >Restaurant Care</h1>
      {/* <Button onClick={testPack} >testPack</Button> */}
      <div style={{display:'flex'}} >
            &emsp;
            <SearchControl {...{ placeholder:'ค้นหาด้วยชื่อร้าน', search, setSearch }} />&emsp;
            <OneButton {...{ variant:'success', text:'เพิ่มร้านใหม่', submit:()=>{setFranchise_Modal(true);setCurrent(initialStore)} }} />&emsp;
      </div>
        <br/>
        <div style={{paddingLeft:'1rem',paddingRight:'1rem',overflowX:'auto'}} >
            <Button style={{minWidth:'140px',marginRight:'1rem',marginBottom:'1rem',color:dark}} >Schedule</Button>
            {initialProcess.map((item)=>{
                const { id, color } = item;
                let status = currentProcess === id 
                let length = portStores.filter(a=>a.process===id).length
                return <Button onClick={()=>{setCurrentProcess(id)}} key={id} color={color} appearance={status?"primary":"ghost"} style={{minWidth:'140px',marginRight:'1rem',marginBottom:'1rem'}}  >{id} ({length})</Button>
            })}
        </div>
        {currentProcess==='demo'
            ?<DemoRender {...{ handleProfile, portStores:display }} />
            :currentProcess==='payment'
            ?<PaymentRender {...{ handleProfile, portStores:display, setLoading }} />
            :currentProcess==='setup'
            ?<SetupRender {...{ handleProfile, portStores:display, setLoading }} />
            :currentProcess==='implementation'
            ?<ImplementationRender {...{ handleProfile, portStores:display, setLoading }} />
            :currentProcess==='training'
            ?<TrainingRender {...{ handleProfile, portStores:display, setLoading }} />
            :<LaunchRender {...{ handleProfile, portStores:display, setLoading }} />
        }
    </div>
  );
}

export default StorePort;