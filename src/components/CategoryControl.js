import React from "react";
import { colors } from "../configs";
import { checkCategory2, manageCategory, someInArray } from "../Utility/function";

const { white, redOrange } = colors;

function CategoryControl({ warehouseCategory, categorySetting, setCategorySetting }) {


  return <React.Fragment>
            {warehouseCategory.map((item,index)=>{
                let length = categorySetting.length===0?true:false
                return(
                <div key={index} style={styles.container3} className="custom-scrollbar" >
                    <div style={{ display: 'flex' }}>
                    {item.level === 1 ? (
                        <div
                        onClick={() => {
                            setCategorySetting([]);
                        }}
                        className="category"
                        style={{
                            backgroundColor: length ? redOrange : null,
                            color: length ? white : null,
                            minWidth: '12rem',
                            display:'flex',
                            justifyContent:'center',
                            alignItems:'center',
                        }}
                        >
                        ทั้งหมด
                        </div>
                    ) : null}

                    {checkCategory2(categorySetting, item).map((a, i) => {
                        let status = someInArray(categorySetting, 'id', a.id);
                        return (
                        <div
                            onClick={() => {
                                setCategorySetting(manageCategory(item.value, categorySetting, a));
                            }}
                            key={i}
                            className="category"
                            style={{
                                backgroundColor: status ? redOrange : null,
                                color: status ? white : null,
                                padding: '10px', // Adjust padding for a smaller bar
                                // minWidth: '8rem',
                                minWidth: '12rem',
                                maxHeight: '5em',
                                overflow: 'hidden',
                                marginRight: '5px', // Add some spacing between items
                                borderRadius: '16px', // Add rounded corners for a nicer look
                                display:'flex',
                                justifyContent:'center',
                                alignItems:'center',
                                whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '100%'
                            }}
                        >
                            &emsp;{a.name}&emsp;
                        </div>
                        );
                    })}
                    </div>
                </div>
                )
            })}
        </React.Fragment>
};

const styles = {
    container3 : {
        width: '100%', overflowX: 'auto'
    },
}

export default CategoryControl;
