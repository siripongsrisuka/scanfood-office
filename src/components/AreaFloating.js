import React from "react";
import {
  Form,
} from "react-bootstrap";

function AreaFloating({
    placeholder="ชื่อประเภทร้านค้า",
    onChange,
    value,
    disabled=false
}) {

    function handleChange(event){
        event.preventDefault()
        onChange(event.target.value)
    };

  return (
    <Form.Floating className="mb-3">
        <Form.Control 
            as="textarea" rows={3}
            placeholder={placeholder}
            onChange={handleChange}
            value={value}
            name={placeholder}
            style={styles.text}
            disabled={disabled}
        />
        <label style={styles.text2} >{placeholder}</label>
    </Form.Floating>
  );
};

const styles = {
    text : {
        width: '100%', fontWeight:'bold', height: '120px',
    },
    text2 : {
        color: '#BF932A'
    }
}

export default AreaFloating;
