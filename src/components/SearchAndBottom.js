import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";

function SearchAndBottom({ placeholder, search, setSearch, exportToXlsx, sort=false, onClick, text='ดาวน์โหลดไฟล์', download=true, variant = 'dark' }) {

    function handleSearch(event){
        event.preventDefault()
        setSearch(event.target.value)

    };

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {  // เอาไว้กำหนด display ของ sidebar
        // Function to update the window width state
        const handleResize = () => {
          setWindowWidth(window.innerWidth);
        };
    
        // Event listener to update the window width state on resize
        window.addEventListener('resize', handleResize);
    
        // Clean up the event listener when the component unmounts
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

    return <div style={{display:'flex', marginBottom:10,}} >
                <Form.Control 
                    type="search" 
                    placeholder={placeholder}
                    onChange={handleSearch}
                    value={search}
                />&emsp;
                {windowWidth < 576
                    ?download
                        ?<Button variant={variant}onClick={exportToXlsx} ><i class="bi bi-download"></i></Button>
                        :<Button variant={variant} onClick={exportToXlsx} ><i class="bi bi-plus-circle"></i></Button>
                    :<Button variant={variant} onClick={exportToXlsx} style={styles.container} >
                        {text}
                    </Button>
                }&emsp;
                {sort
                    ?<i onClick={onClick} style={{ fontSize:30, cursor:'pointer' }} class="bi bi-funnel"></i> 
                    :null
                }
                
            </div>
};

const styles = {
    container : {
        minWidth:'200px'
    },
}



export default SearchAndBottom;
