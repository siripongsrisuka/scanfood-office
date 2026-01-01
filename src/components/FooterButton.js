import React from "react";
import { Modal } from "react-bootstrap";
import OneButton from "./OneButton";

function FooterButton({ submit, onHide }) {

    return <Modal.Footer>
                <OneButton {...{ text:'ยกเลิก', variant:'secondary', submit:onHide }} />
                <OneButton {...{ text:'บันทึก', variant:'success', submit:submit }} />
            </Modal.Footer>
};


export default FooterButton;
