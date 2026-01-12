import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Form,
  Row,
  Col,
  Container,
  Table,
  Modal,
  Card,
  Image,
  Collapse,
  InputGroup,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { OneButton } from "../components";
import { fetchPayment, fetchSuccessCases, formatCurrency, summary } from "../Utility/function";
import { Modal_Loading } from "../modal";
import { normalSort } from "../Utility/sort";

const target = 220000;

function SaleManagerScreen() {
    const { office: { humanRight } } = useSelector(state=>state.office);
    const { profile:{ saleManagerTeam = 'A' } } = useSelector(state=>state.profile);
    const [loading, setLoading] = useState(false);
    const [successCase, setSuccessCase] = useState([]);
    const [payments, setPayments] = useState([]);


    useEffect(()=>{
        handlefetch()
    },[]);

    async function handlefetch(){
        setLoading(true);
        try {
            const [ successCase, payments ] = await Promise.all([
                fetchSuccessCases('',saleManagerTeam),
                fetchPayment('',saleManagerTeam),

            ])
            setPayments(payments);
            setSuccessCase(successCase);
            console.log(successCase)
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
        <Table striped bordered hover responsive  variant="light"   >
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
  }
}

export default SaleManagerScreen;