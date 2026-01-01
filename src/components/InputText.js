import React, { useState, useContext } from "react";
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
} from "react-bootstrap";

function InputText({
    name='name',
    placeholder="Put here...",
    onChange,
    value
}) {

  return (
    <Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
        <Form.Label column sm="3">
            {name}
        </Form.Label>
        <Col sm="9">
        <Form.Control 
            type="text" 
            placeholder={placeholder} 
            onChange={onChange}
            value={value}
            name={name}
        />
        </Col>
    </Form.Group>
  );
}

export default InputText;
