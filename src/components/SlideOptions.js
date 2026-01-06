import React from "react";
import { Radio, RadioGroup } from 'rsuite';

function SlideOptions({ value, handleChange, options }) {

    return <RadioGroup
            name="radio-group-inline-picker"
            inline
            appearance="picker"
            value={value} // Set the current value from state
            onChange={handleChange} // Update state on change
            style={{ marginBottom:'1rem' }}
        >
            {options.map(item=><Radio  value={item.value}>{item.name}</Radio>)}
        </RadioGroup>
};


export default SlideOptions;
