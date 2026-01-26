import React from "react";
import {
  Form,
} from "react-bootstrap";

function FloatingArea({
    name='name',
    placeholder="Put here...",
    onChange,
    value,
    disabled=false,
    height='100px',
    onClick=()=>{}
}) {

  return (
  // <Form.Floating className="mb-3" >
  <Form.Floating style={{ width: '100%', marginBottom:10 }} >
    <Form.Control 
        as="textarea" rows={1}
        onChange={onChange}
        value={value}
        name={name}
        style={{width:'100%',height }}
        disabled={disabled}
        onClick={onClick}
    />
        <label >{placeholder}</label>
    </Form.Floating>
  );
}

export default FloatingArea;
