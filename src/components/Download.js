import React, { useEffect, useState } from "react";
import {
    Button
  } from "react-bootstrap";

function Download({ exportToXlsx}) {
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
  

  return <React.Fragment>
            &nbsp;&nbsp;
            {windowWidth < 576
                ?<Button variant="dark" onClick={exportToXlsx} ><i class="bi bi-download"></i></Button>
                :<Button variant="dark" onClick={exportToXlsx} style={styles.container} >
                    ดาวน์โหลด
                </Button>
            }
            &nbsp;&nbsp;
        </React.Fragment>
};

const styles = {
    container : {
        minWidth:'200px'
    },
}

export default Download;
