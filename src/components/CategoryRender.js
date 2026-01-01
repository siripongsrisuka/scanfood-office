import React from "react";
import { colors } from "../configs";
import '../styles/CartScreen.css'


const { white, softWhite, dark } = colors;

function CategoryRender({ options, option, setOption }) {


  return <div className="custom-scrollbar" >
            <div style={{ display:'flex' }} >
                {options.map((a,i)=>{
                    const { id, name } = a;
                    const status = id===option;
                    const backgroundColor = status?dark:softWhite;
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
                                textAlign:'center'
                            }} >
                                {name}
                            </div>
                })}
            </div>
        </div>
};

export default CategoryRender;
