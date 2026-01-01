import React from "react";
import { Checkbox } from 'rsuite';

const MasterCheckBox = ({ status, color, onClick, value='', disabled=false }) =>{
    return  <Checkbox 
              checked={status}
              // className="custom-checkbox"
              style={{
                '--rs-checkbox-checked-bg': color,
                '--rs-checkbox-checked-border': color,
                '--rs-checkbox-checked-tick': '#FFFFFF', // To customize the tick color
                minWidth:'150px',
                display:'flex',
                // justifyContent:'center'
              }}
              onClick={onClick}
              disabled={disabled}
            >
              {value}
            </Checkbox>
}

export default MasterCheckBox;
