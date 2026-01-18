import React from "react";
import { colorIndex, colors } from "../configs";
import '../styles/CartScreen.css'


const { white, softWhite, dark } = colors;

function CategoryRender({ options, option, setOption }) {


  return <div className="custom-scrollbar" >
            <div style={{ display:'flex' }} >
                {options.map((a,i)=>{
                    const { id, name, value = '' } = a;
                    const status = id===option;
                    const backgroundColor = status?colorIndex[i]:softWhite;
                    const color = status?white:dark;

                    return <div onClick={()=>{setOption(a)}} key={id} 
                            style={{
                                padding:10,
                                margin:10,
                                borderRadius:20,
                                backgroundColor,
                                color,
                                cursor:'pointer',
                                minWidth:'150px',
                                textAlign:'center',
                                position:'relative'
                            }} >
                                {name}
                                {value
                                    ?<div style={{ width:"30px", height:'30px', borderRadius:30, backgroundColor:colorIndex[i], position:'absolute', top:-10, right:-10 }} >
                                        {value}
                                    </div>
                                    :null
                                }
                                
                            </div>
                })}
            </div>
        </div>
};

export default CategoryRender;
