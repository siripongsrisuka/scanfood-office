import React from "react";
import { Radio, RadioGroup } from 'rsuite';
import { colorIndex } from "../configs";

function SlideOptions({ value, handleChange, options, show = false }) {

    return <RadioGroup
            name="radio-group-inline-picker"
            inline
            appearance="picker"
            value={value} // Set the current value from state
            onChange={handleChange} // Update state on change
            style={{ marginBottom:'1rem' }}
        >
            {options.map((item,index)=><Radio style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:'40px' }} value={item.value}>
                {show
                ?<div style={{ backgroundColor:colorIndex[index], width:'20px', height:'20px', display:'flex', justifyContent:'center', alignItems:'center', borderRadius:40, color:'black' }} >{item?.length||0}</div>
                :null
        }
                {/* <div style={{ backgroundColor:colorIndex[index], width:'20px', height:'20px', display:'flex', justifyContent:'center', alignItems:'center', borderRadius:40, color:'black' }} >3</div> */}
                {item.name}
                </Radio>)}
        </RadioGroup>
};


export default SlideOptions;
