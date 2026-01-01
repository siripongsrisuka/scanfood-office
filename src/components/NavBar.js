import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { colors, mainImage } from '../configs';
import { useDispatch } from "react-redux";
import { logout } from '../redux/authSlice';
import { Button } from 'react-bootstrap';

const { white } = colors;
const { minilogo } = mainImage;

function NavBar({ name, setPassword_Modal }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();


  return (
    <Navbar bg="dark" style={styles.container} >
        <div>
            <Navbar.Brand  style={styles.container2} >
              <img  src={minilogo} style={styles.image} />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </div>
        <div onDoubleClick={()=>{setPassword_Modal(true)}} style={{color:white}} >
          <h3  >{name}</h3>
        </div>
        
        
        <div>
          <Navbar.Collapse id="basic-navbar-nav"  >
            <Nav className="me-auto">
              <Nav.Link style={{color:white}} onClick={()=>{dispatch(logout()).then(()=>{navigate('/');alert('ออกจากระบบ เรียบร้อยแล้ว')})}}>ออกจากระบบ</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </div>
    </Navbar>
  );
};

const styles = {
  container : {
    paddingTop:0,paddingBottom:0,display:'flex',justifyContent:'space-between'
  },
  container2 : {
    paddingTop:0,paddingBottom:0
  },
  image : {
    width:80,borderRadius:10
  }
}

export default NavBar;