import React from "react";
import { Button } from "react-bootstrap";

function OneButton({ text, submit, variant='warning' }) {

    function handle(){
        submit()
    };

    return <Button style={styles.container} variant={variant} onClick={handle} >
                {text}
            </Button>
};

const styles = {
    container : {
        minWidth:"150px",
        margin:'1rem'
    }
}


export default OneButton;
