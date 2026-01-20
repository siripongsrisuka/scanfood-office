import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Outlet, NavLink } from 'react-router-dom';
import { initialOffice, colors, initialAlert } from "../configs";
import { useSelector, useDispatch } from "react-redux";
import '../styles/Restaurant.css'
import { logout } from "../redux/authSlice";
import { Modal_Alert } from "../modal";
import { Dropdown, Accordion } from 'rsuite';
import { transformData } from "../Utility/function";
import { fetchOffice } from "../redux/officeSlice";
import { fetchWarehouse } from "../redux/warehouseSlice";

const { white, softWhite, backgroundColor, dark } = colors;


function OfficeScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [alert_Modal, setAlert_Modal] = useState(initialAlert);
  const { status, content, onClick, variant } = alert_Modal;
  const [short, setShort] = useState(false); // คือการย่อแถบข้าง
  const { profile } = useSelector((state)=> state.profile);
  const { id:profileId } = profile;
  const { office : {  humanRight }  } = useSelector((state)=> state.office);

  useEffect(() => {  // เอาไว้กำหนด display ของ sidebar
    // Function to update the window width state
    dispatch(fetchOffice());
    dispatch(fetchWarehouse())



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

  
  

  const { sideBar, listDisplay } = useMemo(()=>{
      let sideBar = initialOffice;
      const { rights } = humanRight.find(a=>a.id===profileId) || { rights:[] }
      sideBar = sideBar.filter(a=>a.label || rights.includes(a.id))
    return {
      sideBar,
      listDisplay:transformData(sideBar.filter(a=>a.label!=='ออกจากระบบ'))
    }
  },[humanRight,profileId])



    function exit(){
      dispatch(logout()).then(()=>{
        navigate('/')
      })
    };

  
  return (
    <div  >
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
                        </Dropdown>&emsp;&emsp;&emsp;&emsp;
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
                      <img style={styles.container10} src="/logo512.png" />
                    </div>
                      <div style={styles.container11}>
                        <div className="resSidebar">
                          {sideBar.map((item, index) => (
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
    paddingTop:'1rem',
    paddingBottom:'1rem',
    backgroundColor:softWhite,
    width:'100%',display:'flex',paddingRight:'3rem',position:'fixed',top:0,backgroundColor:white,zIndex:99
  },
  container2 : {
    maxWidth:'80vw', whiteSpace: 'nowrap', scrollbarWidth:'thin',zIndex:999,marginLeft:'3rem'
  },
  container3 : {
    paddingLeft:'5px',paddingRight:'5px'
  },
  container4 : {
    position:'absolute',top:10,left:10,fontSize:30,cursor:'pointer'
  },
  container5 : {
    width:'100%',
    paddingTop:'3rem',
    backgroundColor:backgroundColor, height:'100%',
    marginLeft:'0.5rem',
    maxWidth:'95vw', minWidth:'95vw'
  },

  container7 : {
    width: '200px', minWidth: '200px', position: 'fixed',backgroundColor:'#343333', zIndex:999
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
 

}

export default OfficeScreen;