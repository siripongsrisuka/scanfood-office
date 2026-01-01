import React from "react";
import { useSelector } from "react-redux";
import { stringFullDate } from "../Utility/dateTime";
import { colors } from "../configs";
import { formatCurrency } from "../Utility/function";

const { white, green } = colors

function DemoBar({price=''}) {
    const { demo } = useSelector(state=>state.care)

    const { staffTakeOrder, staffRight,
      kitchenAmount, shift, vat, channels, promotions, payments, 
      table, tableAmount, staffNationality, customerNationality, endDate,
      posUsed, oldPos, posDevice, workingTime, network, shopType
     } = demo;


  return (
    <div style={{padding:'1rem',position:'sticky',width:'100%',top:0,backgroundColor:white,zIndex:99}} >
     <div style={{display:'flex',flexWrap:'wrap'}} >
            {shopType
              ?<div>{shopType}&nbsp;/&nbsp;</div>
              :null
          }
          {posUsed && oldPos
            ?<div>
                {oldPos}&emsp;{stringFullDate(endDate)}&nbsp;/&nbsp;
            </div>
            :null
          }
          {table==='มีหน้าร้านและมีโต๊ะ'
              ?<div>{tableAmount} โต๊ะ&nbsp;/&nbsp;</div>
              :<div>{table}&nbsp;/&nbsp;</div>
          }
          {staffRight
              ?<div>แยกสิทธิ์พนักงาน&nbsp;/&nbsp;</div>
              :null
          }
          {staffTakeOrder
              ?<div>พนักงานรับออเดอร์&nbsp;/&nbsp;</div>
              :null
          }
          {staffNationality.filter(a=>a!=='ไทย').length>0
              ?<div>พนักงาน:{staffNationality.join(',')}&nbsp;/&nbsp;</div>
              :null
          }
          {customerNationality.filter(a=>a!=='ไทย').length>0
              ?<div>ลูกค้า:{customerNationality.join(',')}&nbsp;/&nbsp;</div>
              :null
          }
          {promotions.filter(a=>a!=='ไม่มีโปร').length>0
              ?<div>{promotions.join(',')}&nbsp;/&nbsp;</div>
              :null
          }
          {channels.filter(a=>a!=='หน้าร้าน').length>0
              ?<div>{channels.join(',')}&nbsp;/&nbsp;</div>
              :null
          }
          {payments.filter(a=>a!=='เงินสด').length>0
              ?<div>{payments.join(',')}&nbsp;/&nbsp;</div>
              :null
          }
          {shift
              ?<div>ระบบกะ&nbsp;/&nbsp;</div>
              :null
          }
          {vat
              ?<div>ภาษี&nbsp;/&nbsp;</div>
              :null
          }
          <div>{kitchenAmount} ครัว&nbsp;/&nbsp;</div>
          {posDevice
              ?<div>POS:{posDevice}&nbsp;/&nbsp;</div>
              :<div>POS:ไม่มี&nbsp;/&nbsp;</div>
          }
          {workingTime
              ?<div>ทำการ:{workingTime}&nbsp;/&nbsp;</div>
              :null
          }
          {network
              ?<div>เครือข่าย:{network}&nbsp;/&nbsp;</div>
              :null
          }
        {price && <h6 style={{color:green}} >ราคาสุทธิ : {formatCurrency(Number(price))}</h6> }

        </div>
    </div>
  );
}


export default DemoBar;