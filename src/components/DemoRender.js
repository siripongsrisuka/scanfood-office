import React from "react";
import { Table, Form } from "react-bootstrap";
import DatePicker from 'react-datepicker';
import OneButton from "./OneButton";
import { useDispatch, useSelector } from "react-redux";
import { updateDemo, updateFieldStore } from "../redux/careSlice";

const initialProcess = ['demo','payment','setup','implementation','training','softlaunch','cancel'];

function DemoRender({ handleProfile, portStores }) {
    const dispatch = useDispatch();
    const { demo } = useSelector(state=>state.care)
    const { process } = demo;
    function updateDemoDate(doc,date){
        dispatch(updateFieldStore({ doc, field:{ demoDate:date }}))
    }

  return    <Table  bordered   variant="light" style={styles.container}  >
                <thead  >
                <tr>
                    <th style={styles.table1}>No.</th>
                    <th style={styles.table2}>โปรไฟล์</th>
                    <th style={styles.table2}>วันเวลา เดโม่</th>
                    <th style={styles.table2}>รายละเอียด</th>
                </tr>
                </thead>
                <tbody  >
                {portStores.map((item, index) => {
                    const { ownerName, storeName, tel, demoDate, id:doc } = item;
                    return  <tr  key={index} >
                                <td style={styles.text}>{index+1}.</td>
                                <td >
                                    <h6>ชื่อร้าน : {storeName}</h6>
                                    <h6>ชื่อลูกค้า : {ownerName}</h6>
                                    <h6>ติดต่อ : {tel}</h6>
                                </td>
                                <td style={styles.text}>
                                <DatePicker
                                    selected={demoDate}
                                    onChange={(date) => updateDemoDate(doc,date)}
                                    showTimeSelect
                                    withPortal
                                    dateFormat="dd/MM/yyyy h:mm aa" // Format as DD/MM/YYYY h:mm AM/PM
                                />
                                </td>
                                <td style={styles.text}>
                                    <OneButton {...{ text:'รายละเอียด', submit:()=>{handleProfile(item)} }} />
                                    <Form.Select 
                                        aria-label="Default select example" 
                                        value={process} 
                                        onChange={(event)=>{dispatch(updateFieldStore({ doc, field:{ process:event.target.value }}))}}
                                        style={{marginTop:'1rem',marginBottom:'1rem',width:'100%'}}
                                    >
                                        <option value='' disabled >เลือก process</option>
                                        {initialProcess.map((item,index)=>{
                                            return <option key={index} value={item} >{item}</option>
                                        })}
                                    </Form.Select>
                                </td>
                            </tr>
                })}
                </tbody>
            </Table>
};

const styles = {
    container : {
        marginLeft:'1rem',marginRight:'1rem'
    },
    table1 : {
        width:'5%', textAlign:'center', minWidth:'50px'
    },
    table2 : {
        width: '19%', textAlign:'center', minWidth:'120px'
    },
    text : {
        textAlign:'center'
    }
}

export default DemoRender;