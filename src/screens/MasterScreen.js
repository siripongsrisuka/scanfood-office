import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Outlet, NavLink } from 'react-router-dom';
import { colors, initialAlert } from "../configs";
import { useSelector, useDispatch } from "react-redux";
import '../styles/Restaurant.css'
import { logout } from "../redux/authSlice";
import { Modal_Alert } from "../modal";
import { Dropdown, Accordion } from 'rsuite';
import { transformData } from "../Utility/function";
import { RootImage } from "../components";


const { white, purpleRed, softWhite, backgroundColor, dark } = colors;




function MasterScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [alert_Modal, setAlert_Modal] = useState(initialAlert);
  const { status, content, onClick, variant } = alert_Modal;
  const [short, setShort] = useState(false); // คือการย่อแถบข้าง
  const [listDisplay, setListDisplay] = useState([]);

  const sidebars = [
    {
        label: '1. ภาพรวมธุรกิจ',
    },
    {
        topic: '1.1 แดชบอร์ด',
        to:'dashboard',
    },

  
    {
        label: 'ออกจากระบบ',
    },
  ]




  useEffect(() => {  // เอาไว้กำหนด display ของ sidebar
    // Function to update the window width state
   
    setListDisplay(transformData(sidebars.filter(a=>a.label!=='ออกจากระบบ')))

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Event listener to update the window width state on resize
    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


    function exit(){
      dispatch(logout()).then(()=>{
        navigate('/')
      })
    };

    const data = {
        timestamp:'',

    }

    // สร้างวันเวลา
    // เลือกหัวข้อ
    // เลิอกร้านค้า
    // ประวัติร้านค้า
    // shopProfile
    // ปัญหาที่พบบ่าย
    // note



  
  return (
    <div style={{backgroundColor:'white'}} >
        <Modal_Alert
            show={status}
            onHide={()=>{setAlert_Modal(initialAlert)}}
            content={content}
            onClick={onClick}
            variant={variant}
        />
        
        {windowWidth < 576 || short 
                ?<div>
                  
                  <div style={styles.container} >
                  
                      <div style={styles.container2} >
                      
                        <Dropdown title="&emsp;&emsp;&emsp;เมนู&emsp;&emsp;&emsp;" trigger='click' style={styles.container3}  >
                            <Accordion style={{minWidth:'200px'}} defaultActiveKey={0}  >
                              {listDisplay.map((item,index)=>{
                                const { topic, value } = item;
                                return <Accordion.Panel key={index} header={topic} eventKey={index+1}  >
                                          {value.map((a)=>{
                                            const { id, name, to } = a
                                            return <Dropdown.Item key={id} onClick={()=>{navigate(to)}} >{name}</Dropdown.Item>
                                          })}
                                      </Accordion.Panel>
                              })}
                            </Accordion>
                            <Dropdown.Item onClick={() => {
                              setAlert_Modal({
                                status:true,
                                content:`ยืนยันการออกจากระบบ`,
                                onClick:()=>{exit();setAlert_Modal(initialAlert)},
                                variant:'danger'
                              })
                            }} >&emsp;<i class="bi bi-box-arrow-left"></i>&emsp;ออกจากระบบ</Dropdown.Item>
                        </Dropdown>
                      </div>
                      
                      <div onClick={()=>{setShort(false)}} style={styles.container4} > 
                        <i class="bi bi-list"></i>
                      </div>
                  </div>
                  {windowWidth < 900
                      ?<br/>
                      :null
                  }
                  
                  <div style={styles.container5}>
                      <Outlet />
                  </div> 
                </div>
                :<div>
                <div style={styles.container7}>
                    <div style={styles.container8} >
                      <div onClick={()=>{setShort(true)}} style={styles.container9} > 
                        <i class="bi bi-list"></i>
                      </div>
                      
                    </div>
                      <div style={styles.container11}>
                        <div className="resSidebar">
                          {sidebars.map((item, index) => (
                              <React.Fragment key={index}>
                              {item.label && (
                                  <div
                                  style={styles.container12}
                                  >
                                  {item.label}
                                  </div>
                              )}
                              {item.to && (
                                  <NavLink
                                  exact
                                  to={item.to}
                                  // activeClassName='resSidebar a.active'
                                  // onMouseEnter={() => handleMouseEnter(index)}
                                  // onMouseLeave={handleMouseLeave}
                                  >
                                  {item.topic}
                                  </NavLink>
                              )}
                              </React.Fragment>
                          ))}
                        </div>
                        <div style={{display:'flex',justifyContent:'center',color:white,backgroundColor:dark,padding:10,cursor:'pointer'}} onClick={()=>{setAlert_Modal({ ...initialAlert,status:true, content:`ยืนยัน ออกจากระบบ`, onClick:()=>{exit()}, variant:'danger' })}} >
                          Logout
                        </div>
                      </div>
                     
              </div> 
              <div style={{width:windowWidth < 576 || short ? '100%' : 'calc(100% - 212px)', marginLeft: windowWidth < 576 ? 0 : '210px',backgroundColor:backgroundColor, height:'100%'}}>
                <Outlet />
            </div>
              </div>
            }
        
    </div>
  );
};

const styles = {
  container : {
    paddingTop:'1rem',paddingBottom:'1rem',backgroundColor:softWhite,width:'100%',display:'flex',paddingRight:'3rem',position:'fixed',top:0,backgroundColor:white,zIndex:99
  },
  container2 : {
     whiteSpace: 'nowrap', scrollbarWidth:'thin',zIndex:999,marginLeft:'3rem', display:'flex'
    // maxWidth:'80vw', whiteSpace: 'nowrap', scrollbarWidth:'thin',zIndex:999,marginLeft:'3rem'
  },
  container3 : {
    paddingLeft:'5px',paddingRight:'5px'
  },
  container4 : {
    position:'absolute',top:10,left:10,fontSize:30,cursor:'pointer'
  },
  container5 : {
    width:'100%',paddingTop:'5rem',backgroundColor:backgroundColor, height:'100%',marginLeft:'1rem'
  },
  container6 : {
    minWidth:'150px'
  },
  container7 : {
    width: '200px', minWidth: '200px', position: 'fixed',backgroundColor:'#343333'
  },
  container8 : {
    display:'flex',justifyContent:'center'
  },
  container9 : {
    position:'absolute',top:10,left:10,color:white,fontSize:30,cursor:'pointer'
  },
  container10 : {
    width:'100px',height:'100px',backgroundColor:'#343333',borderRadius:'100px',objectFit:'cover'
  },
  container11 : {
    maxHeight: '100vh', overflowY: 'auto',paddingBottom:'6rem'
  },
  container12 : {
    width: '100%',fontWeight: 'bold',fontSize: 12,
  },
  container13 : {
    backgroundColor: purpleRed,
    color: white,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 20,
    marginLeft: 5,
  }

}

export default MasterScreen;