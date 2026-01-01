import React from "react";
import { Button } from "react-bootstrap";

function DeleteButton({ text, submit }) {

    function handle(){
        submit()
    };

    return <Button style={styles.container} variant='danger' onClick={handle} >
                <i class="bi bi-trash"  ></i>&emsp;{text}
            </Button>
};

const styles = {
    container : {
        minWidth:"170px"
    }
}


export default DeleteButton;
