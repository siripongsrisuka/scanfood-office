import React from "react";
import { Form } from "react-bootstrap";

function SearchControl({ placeholder, search, setSearch }) {

    function handleSearch(event){
        event.preventDefault()
        setSearch(event.target.value)

    }
    return <Form.Control 
                type="search" 
                placeholder={placeholder}
                onChange={handleSearch}
                value={search}
            />
};


export default SearchControl;
