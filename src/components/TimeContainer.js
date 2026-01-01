import React, { forwardRef } from "react";
import {
    Container,
  } from "react-bootstrap";
  import DatePicker from "react-datepicker";
import { SlCalender } from "react-icons/sl";
import { colors } from "../configs";
import '../App.css';
import { Button } from 'rsuite';

const { white } = colors;

function TimeContainer({
    startDate,
    endDate,
    onChangeStart,
    onChangeEnd,
    search
}) {
    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <div style={styles.container} onClick={onClick} ref={ref}>
          {value}
        </div>
    ));

  return (
    <Container
            fluid
            style={styles.container2}
            >
            <div style={styles.container3} >
                <SlCalender />
                <div style={styles.container4} >  เริ่่ม: </div>
                <DatePicker
                    dateFormat="dd/MM/yyyy"
                    selected={startDate}
                    onChange={onChangeStart}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    customInput={<ExampleCustomInput />}
                    withPortal
                />
            </div>
            <div style={styles.container5} >
                <SlCalender />
                <div style={styles.container4} >  ถึง: </div>
                <DatePicker
                    dateFormat="dd/MM/yyyy"
                    selected={endDate}
                    onChange={onChangeEnd}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    customInput={<ExampleCustomInput />}
                    withPortal
                />
            </div>&emsp;
            <Button style={{minWidth:'100px'}} onClick={search} color="orange" appearance="primary" >ค้นหา</Button>
        </Container>
  );
};

const styles = {
    container : {
        borderRadius:20
    },
    container2 : {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems:'center',
        marginTop:10,
        marginBottom:10
    },
    container3 : {
        display:'flex',padding:5,borderRadius:10,border: '1px solid grey',backgroundColor:white,alignItems:'center'
    },
    container4 : {
        paddingLeft:10,paddingRight:10
    },
    container5 : {
        display:'flex',padding:5,borderRadius:10,border: '1px solid grey',backgroundColor:white,marginLeft:20,alignItems:'center'
    }
}

export default TimeContainer;
