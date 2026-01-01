import React from "react";
import {
  Form,
} from "react-bootstrap";

function FloatingText({
    name='name',
    placeholder="Put here...",
    onChange,
    value
}) {

  return (
    <Form.Floating  style={{ width: '100%', marginBottom:10 }}>
      <Form.Control
          name={name}
          type="text"
          onChange={onChange}
          value={value}
      />
      <label>{placeholder}</label>
  </Form.Floating>
  );
}

export default FloatingText;
