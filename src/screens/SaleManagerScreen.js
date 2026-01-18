import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Table,
} from "react-bootstrap";
import { SlideOptions } from "../components";
import { fetchCustomer, fetchMemo, fetchPayment, fetchSuccessCases, formatCurrency, summary } from "../Utility/function";
import { Modal_Loading } from "../modal";
import { normalSort } from "../Utility/sort";
import { stringDateTimeReceipt } from "../Utility/dateTime";
import { initialProcess } from "../configs";

const target = 220000;

const options = [
        {id:'1',name:'ภาพรวม', value:'1'},
        {id:'2',name:'memo', value:'2'},
        {id:'3',name:'lead', value:'3'},
];

function SaleManagerScreen() {
    const { office: { humanRight } } = useSelector(state=>state.office);
    const { profile } = useSelector(state=>state.profile);
    const { saleManagerTeam = 'A' } = profile;
    const [loading, setLoading] = useState(false);
    const [successCase, setSuccessCase] = useState([]);
    const [payments, setPayments] = useState([]);
    const [memo, setMemo] = useState([]);
    const [option, setOption] = useState({id:'1',name:'lead', value:'1' });
    const { id:optionId, name:optinName, value } = option;
    const [customers, setCustomers] = useState([]);

    const colorMap = useMemo(
        () => new Map(initialProcess.map(a=>[a.id,a.color]))
    ,[])

    const processMap = useMemo(
        () => new Map(initialProcess.map(a=>[a.id,a.name]))
    ,[])

    const handleChange = (value) => {
      const option = options.find(a=>a.value === value)
        setOption(option);
    };


    useEffect(()=>{
        handlefetch()
    },[]);


    async function handlefetch(){
        setLoading(true);
        try {
            const [ successCase, payments, memo, customers ] = await Promise.all([
                fetchSuccessCases('',saleManagerTeam),
                fetchPayment('',saleManagerTeam),
                fetchMemo('',saleManagerTeam),
                fetchCustomer('',saleManagerTeam),
            ])
            setPayments(payments);
            setSuccessCase(successCase);
            setMemo(memo);
            setCustomers(customers);
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    const sales = useMemo(()=>{

        const sales = humanRight.map(item=>{
            if(item.team !==saleManagerTeam) return null;
            const thisSales = payments.filter(a=>a.profileId === item.id);
            const sc = successCase.filter(a=>a.profileId === item.id).length

            const totalSale = summary(thisSales,'softwarePrice');
            const b= sc>0?formatCurrency(totalSale/sc):0;

            return {
                ...item,
                totalSale,
                achieve:formatCurrency(totalSale*100/target),
                b,
                sc
            }

        }).filter(a=>Boolean(a))

        return normalSort('totalSale',sales);
    },[saleManagerTeam,humanRight,payments,successCase]);



  return (
    <div style={styles.container} >
        <h1>Sale Manager</h1>
        <Modal_Loading show={loading} />
        <SlideOptions {...{ value, handleChange, options }} />
        {optionId==='1'
            ?<Table striped bordered hover responsive  variant="light"   >
                <thead  >
                <tr>
                    <th style={styles.container2}>อันดับ</th>
                    <th style={styles.container3}>ชื่อ</th>
                    <th style={styles.container2}>SC</th>
                    <th style={styles.container2}>L</th>
                    <th style={styles.container2}>R</th>
                    <th style={styles.container2}>B</th>
                    <th style={styles.container3}>ยอดขาย</th>
                    <th style={styles.container2}>เป้า</th>
                </tr>
                </thead>
                <tbody  >
                {sales.map((item, index) => {
                    const { id, name, l, r, b, achieve, totalSale, sc } = item;
                    return <tr  key={id} >
                                <td style={styles.container4}>{index+1}.</td>
                                <td >{name}</td>
                                <td style={styles.container4}>{sc}</td>
                                <td style={styles.container4}>{l}</td>
                                <td style={styles.container4}>{r}</td>
                                <td style={styles.container4}>{b}</td>
                                <td style={styles.container4}>{formatCurrency(totalSale)}</td>
                                <td style={styles.container4}>{achieve}</td>
                            </tr>
                })}
                </tbody>
            </Table>
            :optionId==='2'
            ?<Table striped bordered hover responsive  variant="light"   >
                <thead  >
                <tr>
                    <th style={styles.container2}>เวลา</th>
                    <th style={styles.container3}>เซล</th>
                    <th style={styles.container5}>งาน</th>
                </tr>
                </thead>
                <tbody  >
                {memo.map((item, index) => {
                    const { id, content, profileName, createdAt } = item;
                    return <tr  key={id} >
                                <td >{stringDateTimeReceipt(createdAt)}</td>
                                <td style={styles.container4}>{profileName}</td>
                                <td >
                                    {content.split('\n').map((line, index) => (
                                        <React.Fragment key={index}>
                                            &emsp;&nbsp;{line}
                                            <br />
                                        </React.Fragment>
                                        ))}

                                </td>
                            </tr>
                })}
                </tbody>
            </Table>
            :<Table striped bordered hover responsive  variant="light"   >
                <thead  >
                <tr>
                    <th style={styles.container2}>เวลา</th>
                    <th style={styles.container3}>เซล</th>
                    <th style={styles.container3}>ลูกค้า</th>
                    <th style={styles.container2}>จำนวนโต๊ะ</th>
                    <th style={styles.container5}>รายละเอียด</th>
                    <th style={styles.container3}>สถานะ</th>
                </tr>
                </thead>
                <tbody  >
                {customers.map((item, index) => {
                    const { id, name, storeSize, shopType, note, process, day, shopId, profileName, createdAt } = item;
                    const color = colorMap.get(process);
                    const processName = processMap.get(process);
                    return <tr  key={id} >
                                <td >{stringDateTimeReceipt(createdAt)}</td>
                                <td >{profileName}</td>
                                <td >{name}</td>
                                <td style={styles.container4}>{storeSize}</td>
                                <td >{note}</td>
                                <td ><i style={{ color }} class="bi bi-circle-fill"></i>{processName}</td>
                            </tr>
                })}
                </tbody>
            </Table>
        }
    </div>
  );
};

const styles = {
  container : {
    minHeight:'100vh'
  },
  container2 : {
    width:'10%',
    minWidth:'70px',
    textAlign:'center'
  },
  container3 : {
    width:'15%',
    minWidth:'120px',
    textAlign:'center'
  },
  container4 : {
    textAlign:'center'
  },
  container5 : {
    width:'15%',
    minWidth:'250px',
    textAlign:'center'
  },
}

export default SaleManagerScreen;