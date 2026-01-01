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
import RedStar from "./RedStar";

function InputArea({
    name='name',
    placeholder="Put here...",
    onChange,
    value,
    strict=false,
    style
}) {

  return (
    <Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
        {strict
            ?<Form.Label column sm="3" style={{display:'flex'}} >
                {name}
                <RedStar/>
            </Form.Label>
            :<Form.Label column sm="3">
                {name}
            </Form.Label>
        }
        <Col sm="9">
        <Form.Control 
            as="textarea" rows={7}
            placeholder={placeholder} 
            onChange={onChange}
            value={value}
            name={name}
            style={style}
        />
        </Col>
    </Form.Group>
  );
}

export default InputArea;
