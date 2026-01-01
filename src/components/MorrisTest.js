import React,{ useState } from "react";
import { Row, Button, Form } from "react-bootstrap";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode.react';



const morrisPaymentTestAPI = 'http://api-morris.natachat.com/service/v1';
const morrisPaymentAPI = 'https://api.morrispayment.com/service/v1';



function MorrisTest() {
  const [val_ServerOption, setVal_ServerOption] = useState('1');
  const [val_ServerOptionLabel, setVal_ServerOptionLabel] = useState('mock_server');
  const [ homeRoute, setHomeRoute] = useState(morrisPaymentTestAPI);
  const [ morris_profile_token,setMorris_profile_token ] = useState("fE57wzoS8iQa7jkrElazOJLx05CJixIP");
  const [ promptPayQrUrl, setPromptPayQrUrl ] = useState("");
  const [ promptPayQrString, setPromptPayQrString ] = useState("");

  const handleSelectedServerOption = (event) => {
    setVal_ServerOption(event.target.value);

    switch(event.target.value){
      case '1':   // // mock_server
        setVal_ServerOptionLabel("mock_server")
        setHomeRoute(morrisPaymentTestAPI)
        setMorris_profile_token("fE57wzoS8iQa7jkrElazOJLx05CJixIP")
        break;
      case '2':   // // production_server
        setVal_ServerOptionLabel("production_server")
        setHomeRoute(morrisPaymentAPI)
        setMorris_profile_token("OomYamyeKbBcpQx1z3Es5t2RicwI6Vz8")
        break;
      default:   // // mock_server
        setVal_ServerOptionLabel("mock_server")
        setHomeRoute(morrisPaymentTestAPI)
        setMorris_profile_token("fE57wzoS8iQa7jkrElazOJLx05CJixIP")
        break;
    }

  };

  async function testMorisPayment({paymentType=""}) {
    const mock_reference_no = uuidv4();

    console.log('mock_reference_no')
    console.log(mock_reference_no)

    let apiReq = {};
    switch(paymentType){
      case 'qr_code':

        apiReq = {
          method: 'POST',
          url: `${homeRoute}/payment/qr_code`,
          headers: {
            Authorization: morris_profile_token,
            // // from demo
            'content-type': 'application/json',
            accept: 'image/png',

            // // direcct ask provider
            // responseType: 'blob',
          },
          data: {
            amount:"1",
            reference_no: mock_reference_no,
            background_url: "http://your-backend-api/payment/response",
            detail: "detail",
            customer_name: "customer_name",
            customer_email: "morris@example.com",
            customer_address: "customer_address",
            customer_telephone: "0987654321",
            merchant_defined1: "any"
          }
        };
        break;
      case 'qr_code_text':

        apiReq = {
          method: 'POST',
          url: `${homeRoute}/payment/qr_code/text`,
          headers: {
            Authorization: morris_profile_token,
            'content-type': 'application/json',
            accept: 'application/json',
          },
          data: {
            // "amount": 234.52,
            // "amount": "234.52",
            amount: "1",
            reference_no: "9d5AqjauCKxysLQG",
            // background_url: "http://api-morris.natachat.com/payment/response",
            background_url: "https://asia-southeast2-shopchamp-restaurant.cloudfunctions.net/paymentGateway/pgWebhook",
            detail: "T-Shirt",
            customer_name: "customer_name",
            customer_email: "customer_email",
            customer_address: "customer_address",
            customer_telephone: "customer_telephone",
            merchant_defined1: "merchant_defined1",
            merchant_defined2: "merchant_defined2",
            merchant_defined3: "merchant_defined3",
            merchant_defined4: "merchant_defined4",
            merchant_defined5: "merchant_defined5"
          }
        };
        break;
      case 'credit_card':

        apiReq = {
          method: 'POST',
          // url: `${homeRoute}/payment/credit_card`,
          headers: {
            Authorization: morris_profile_token,
            'content-type': 'application/json',
            accept: 'application/json',
          },
          data: {
            card: {
              number: "4535017710535741",
              expiration_month: "05",
              expiration_year: "28",
              security_code: "184",
              name: "name credit demo"
            },
            amount: 12.33,
            // reference_no: "9d5AqjauCKxysLQG",
            reference_no: mock_reference_no,
            // background_url: "http://your-backend-api/payment/response",
            background_url: "https://asia-southeast2-shopchamp-restaurant.cloudfunctions.net/paymentGateway/pgWebhook",
            response_url: "http://your-frontend/payment/complete",
            detail: "detail",
            customer_name: "customer_name",
            customer_email: "morris@example.com",
            customer_address: "customer_address",
            customer_telephone: "0987654321",
            merchant_defined1: "any"
          }
        };
        break;
      default:
        apiReq = {};
    }


    try{

      console.log('morrisPaymentReq')
      // homeRoute:${homeRoute},\n
      console.log(`
        val_ServerOption:${val_ServerOption},\n
       
        morris_profile_token:${morris_profile_token},\n
        paymentType:${paymentType},\n
      `)

      const response = await axios.request(apiReq);

      // {
      //   "success": true,
      //   "data": {
      //     "public_key": "TLIBwbeMKvwSuBMDaXwCrLQOdV4HaTGj",
      //     "endpoint_api_gb_3d_secured": "https://api.globalprimepay.com/v2/tokens/3d_secured",
      //     "gbp_reference_no": "gbp000211913860"
      //   }
      // }

      console.log('response.status')
      console.log(response.status)
      console.log('typeof_response.data')
      console.log(typeof response.data)




      if (paymentType === "qr_code"){
        // const base64Image = "data:image/png;base64, "+response.data;

        // console.log('base64Image')
        // console.log(base64Image)

        // const qrBlobImage = response.data;
        // const qrImageUrl = URL.createObjectURL(qrBlobImage);

        // // !!! not error but not work
        const qrBlobImage = new Blob([response.data], { type : 'image/png' });
        const qrImageUrl = URL.createObjectURL(qrBlobImage);

        setPromptPayQrUrl(qrImageUrl)

        console.log('qrImageUrl')
        console.log(qrImageUrl)
      }else{
        console.log('response.data')
        console.log(response.data)
      }

      if (paymentType === "qr_code_text"){

        console.log('paymentType === "qr_code_text"')
        const {data:{morris_reference_no, qr_code_text, reference_no}} = response.data;

        console.log('qr_code_text')
        console.log(qr_code_text)

        setPromptPayQrString(qr_code_text)
      }





      

      if(
        response?.data?.status === 200 
        && response?.data?.success === true
      ){


        // const mockData ={
        //   public_key: "TLIBwbeMKvwSuBMDaXwCrLQOdV4HaTGj",
        //   endpoint_api_gb_3d_secured: "https://api.globalprimepay.com/v2/tokens/3d_secured",
        //   gbp_reference_no: "gbp000211913860"
        // }


        // const { 
        //   public_key, 
        //   endpoint_api_gb_3d_secured, 
        //   gbp_reference_no 
        // // } = response.data;
        // } = mockData;



        
        // // const data = // data in the response api
        // const f = document.createElement('form')
        // f.setAttribute('id', 'form-3d')
        // f.setAttribute('method', 'post')
        // f.setAttribute('action', data.endpoint_api_gb_3d_secured)

        // const publicKey = document.createElement('input')
        // publicKey.setAttribute('type', 'hidden')
        // publicKey.setAttribute('name', 'publicKey')
        // publicKey.setAttribute('value', data.public_key)

        // const gbpReferenceNo = document.createElement('input')
        // gbpReferenceNo.setAttribute('type', 'hidden')
        // gbpReferenceNo.setAttribute('name', 'gbpReferenceNo')
        // gbpReferenceNo.setAttribute('value', data.gbp_reference_no)

        // const s = document.createElement('input')
        // s.setAttribute('type', 'submit')
        // s.setAttribute('value', 'Submit')
        // s.style.visibility = 'hidden'

        // f.appendChild(publicKey)
        // f.appendChild(gbpReferenceNo)
        // f.appendChild(s)

        // document.getElementById('form-3d-wrapper')?.appendChild?.(f);
        // (document.getElementById('form-3d') as HTMLFormElement)?.submit?.();

        // // ...
        // // in html
        // <div id='form-3d-wrapper' />



        // const providerUrl = endpoint_api_gb_3d_secured;
        const providerUrl = "";
      }
      

    }catch(error){
      console.log('morris_error')
      // console.log(error)


      // Check if error has a response from the server
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Error data:', error.response.data); // The data returned by the server
        console.log('Error status:', error.response.status); // The HTTP status code
        console.log('Error headers:', error.response.headers); // The response headers
      } else if (error.request) {
        // The request was made but no response was received
        console.log('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error message:', error.message);
      }
        console.log('Error config:', error.config); // The request configuration
      }


    
  };



  async function testLineNotify (){
    let apiReq = '';

    const chatRoomToken = `8AlwzGsVaRo7LwQUJSZj2UBkKv1vsmTsZJr1fgEeuCm`
    const message = 'Test Message!'

    apiReq = {
      method: 'POST',
      url: `https://notify-api.line.me/api/notify`,
      headers: {
        Authorization : 'Bearer ' + chatRoomToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: 'message='+ message
    };

    const response = await axios.request(apiReq);

  }

  return (
    <div style={{display:'flex',justifyContent:'center',flexDirection:'column',alignItems:'center'}}  >
        <hr/>
        <h4>ทดสอบ Payment Gateway</h4>
        <hr/>
        <Form.Group controlId="exampleSelect">
          <Form.Label>Select an option</Form.Label>
          <Form.Select value={val_ServerOption} onChange={handleSelectedServerOption}>
            <option value="">Choose...</option>
            <option value="1">Mock Server</option>
            <option value="2">Production Server</option>
          </Form.Select>
        </Form.Group>
        <hr/>
        <Row>
          <Button onClick={()=>{ testMorisPayment({paymentType:'credit_card'}) }} style={{padding:'24px 24px 24px 24px'}} variant="success" ><h4>credit_card</h4></Button>
          <Button onClick={()=>{ testMorisPayment({paymentType:'qr_code'}) }} style={{padding:'24px 24px 24px 24px'}} variant="success" ><h4>qr_code</h4></Button>
          <Button onClick={()=>{ testMorisPayment({paymentType:'qr_code_text'}) }} style={{padding:'24px 24px 24px 24px'}} variant="success" ><h4>qr_code_text</h4></Button>
          <Button onClick={()=>{ testLineNotify() }} style={{padding:'24px 24px 24px 24px'}} variant="success" ><h4>testLineNotify</h4></Button>
          <h4>{val_ServerOptionLabel}</h4>
          {!!promptPayQrUrl?
            <>
              <h1>Promptpay QR</h1>
              <img src={promptPayQrString} />
              <hr/>
              <hr/>

            </>
            :
            null
          }
          {!!promptPayQrString?
            <>
              <h1>Promptpay QR</h1>
              <QRCode value={promptPayQrString} size={256} />
              <hr/>
              <hr/>

            </>
            :
            null
          }

        </Row>
    </div>
  );
}

export default MorrisTest;
