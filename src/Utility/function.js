import { v4 as uuidv4 } from 'uuid';
import { stringYMDHMS3, stringYMDHMS, minusDays, plusDays } from './dateTime';
import { normalSort } from './sort';
import { toast } from 'react-toastify';

export function toastSuccess(text='🟢 Updated successful!'){
  toast.success(text);
};

export function mergeArrays(arr1, arr2) {
  // Step 1: Create a new array to store the merged objects
  const newArr = setDifference(arr1,arr2)
  let mergedArray = [...newArr,...arr2];


  // Step 5: The new array now contains the merged objects without duplicates
  return mergedArray;
};

export   const goToTop = () => {
  window.scrollTo({
      top: 0,
      behavior: 'smooth',
  });
};

export function formatTime(dateInput) {
  let date;

  if (dateInput instanceof Date) {
    return dateInput;
  }

  // Check if the input is in the {seconds, nanoseconds} format
  if (dateInput && typeof dateInput === 'object' && 'seconds' in dateInput && 'nanoseconds' in dateInput) {
    date = new Date(dateInput.seconds * 1000 + dateInput.nanoseconds / 1000000);
  } else if(dateInput && typeof dateInput === 'object' && '_seconds' in dateInput && '_nanoseconds' in dateInput){
    date = new Date(dateInput._seconds * 1000 + dateInput._nanoseconds / 1000000);
  } else {
    // Assume the input is already a Date object or a string date
    date = new Date(dateInput);
  }

  // Format the date
  return new Date(date)
};

export   const formatCurrency = (number) => number?.toLocaleString(undefined, { 
  minimumFractionDigits: 2, 
  maximumFractionDigits: 2 
});

export   const formatCurrency2 = (number) => number?.toLocaleString();

export const searchMultiFunction = (arr, search, properties = ['name']) => {
  if (!search) return arr; // If no search term, return original array

  const searchUpper = search.toUpperCase();
  return arr.filter(item => {
    // Handle single property as a string or multiple properties as an array
    const itemValues = Array.isArray(properties) 
      ? properties.map(prop => item[prop] ? item[prop].toUpperCase() : "") 
      : [item[properties] ? item[properties].toUpperCase() : ""];
    
    // Check if any of the property values include the search text
    return itemValues.some(value => value.indexOf(searchUpper) > -1);
  });
};

export function daysBetween(startDate, endDate) {
  // Parse dates to remove any time components
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate the difference in milliseconds
  const differenceInMs = end - start;

  // Convert milliseconds to days (1 day = 24 * 60 * 60 * 1000 ms)
  const daysDifference = differenceInMs / (1000 * 60 * 60 * 24);

  return Math.floor(daysDifference); // Returns the number of days
}



export function daysDifference(endDate,startDate){
  const timeDifference = endDate - startDate;
  return Math.floor(timeDifference / (1000 * 60 * 60 * 24))
}

export function createLabel(hr){
  let hour = Math.floor(hr)
  let arr = []
  for (let i = 0; i <= 23; i++) {
    let newHour = hour +i
    if(newHour > 23){
      arr.push(String(newHour - 24))
    } else {
      arr.push(String(newHour))
    }
  }
  return arr
}

export const  setDifference = (setA,setB) => setA.filter(objA => !setB.some(objB => objB.id === objA.id));

export function arrayToNewArray(arr,proterties){
  let res = []
  for(const item of arr){
    res = [...res,item[proterties]]
  }
  return res
};

export function haveCommonElement(arr1, arr2) { // เช็ค 2 array ที่มีสมาชิกเหมือนกันอย่างน้อย 1 ตัว
  return arr1.some(item1 => arr2.includes(item1));
} // return เป็น true/false

  export function checkCategory2(allSelectedCategory,thisLevel){ // เพื่อหาดูว่ามี value กี่ตัว(ใน level mี่ต่ำกว่า) ที่มี aboveId ตรงกับ level ก่อนหน้า
    const { level, value } = thisLevel;
    const above = findInArray(allSelectedCategory,'level',level-1)
    let res = []
    if(level ===1){ // แปลว่าแสดงทั้งหมดใน value นั้นๆ
      res = value
    } else {
      if(above && above.id){ //ต้องเช็คว่ามี level ก่อนหน้า แสดงอยู่มั้ย
        res = filterInCompareArray(value,'aboveId',[...above.aboveId,above.id])
      }
    }
    return res;
  };

  export function summary(arr,propertise){
    let sum = arr?.reduce((a, b) => Number(a) + (Number(b[propertise]) || 0), 0);
    return sum
  };

  export function filterInCompareArray(arr,propertise,value){
    let res = []
    for(const item of arr){
      if(compareArrays(item[propertise],value)){
        res.push(item)
      }
    }
    return res
};

export function startCutoff(startDate,cutOff){
  let res = new Date()
  let cutOfftime = manageCutOff(cutOff,new Date())
  if(new Date().getDate()===startDate.getDate()){ // เป็นวันเดียวกัน
      if(stringYMDHMS(cutOfftime) > stringYMDHMS(new Date())){
        res = manageCutOff(cutOff,minusDays(startDate,1)) 
      } else {
        res = manageCutOff(cutOff,startDate) 
      }
  } else {
    res = manageCutOff(cutOff,startDate) 
  }
  return res
}

export function endCutoff(endDate,cutOff){
  let res = new Date()
  let cutOfftime = manageCutOff(cutOff,new Date())
  if(new Date().getDay()===endDate.getDay()){ // เป็นวันเดียวกัน
      if(stringYMDHMS(cutOfftime) > stringYMDHMS(new Date())){
        res = manageCutOff(cutOff,endDate) 
      } else {
        res = manageCutOff(cutOff,plusDays(endDate,1)) 
      }
  } else {
    res = manageCutOff(cutOff,plusDays(endDate,1)) 
  }
  return res
}

export function manageCutOff(cutOff,date){
  let day = new Date(date)
    day.setHours(cutOff.getHours());
    day.setMinutes(cutOff.getMinutes());
return day
};


  export function findTotalPrice(option,channelId,net,qty){
    let allChosen = []
    for(const a of option){
        a.choice.forEach((item)=>{
            if(item.chose===true){
                allChosen.push(item)
            }
        })
    }
    let totalPrice = 0  // คือ totalprice ของเมนูย่อย
    allChosen.forEach((item)=>{
        totalPrice += Number(findInArray(item.price,'id',channelId)?.price|| 0)
    })

    return (Number(net)+ totalPrice)*qty
  };


export const searchFilterFunction = (arr,search,properties='name') => {
  let display = []
  if (search) {
    const newData = arr.filter(function (item) {
      const itemData = item[properties]
        ? item[properties].toUpperCase()
        : "".toUpperCase();
      const textData = search.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
  display = newData;
  } else {
      display = arr
  }
  return display
};


export function totalField(arr,field){
  let newArr = []
  arr.forEach((item)=>{
      newArr.push(item[field])
  })
  return newArr
};


export function leanProduct(product){
  const { BOM, addOn, category, id, option, qty, totalPrice, name } = product;
  return {
      BOM, addOn, category, id, option, qty, totalPrice, name,
      tempId:uuidv4(),
      process:'ordered',
      productStaffs:[],
  }
};

export function handleDigit(value){
  return value?.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})
};

    export function checkAddCategory(smartCategory,thisLevel,productCategory,callBack){
    const { level, value, } = thisLevel;
    let res = []
   
      if(level>1){
        let previousLevel = findInArray(smartCategory,'level',level-1)
        let havePreviousLevel = false
        let previousId = ''
        let previousValue = {}
        for(const item of productCategory){
          previousValue = findInArray(previousLevel.value,'id',item.id)
          if(previousValue && previousValue.id){
            havePreviousLevel = true
            previousId = previousValue.id
            break;
          }
        }
        if(havePreviousLevel){
          for(const item of value){
            if(compareArrays(item.aboveId,[...previousValue.aboveId,previousId])){
              res.push(item)
            }
          }
          if(res.length >0){
            callBack()
          } else {
            alert('ยังไม่มีหมวดหมู่ย่อยนี้')
          }
        } else {
          alert('กรุณาเลือกหมวดหมู่ในลำดับข้างบนก่อน')
        }
      } else {
        res = value
        callBack()
      }
    
   
    return res;
  };

  export function mapInArray(arr,propertise,key,value){
    return arr.map((item)=>{
      return item[propertise] === key
          ?value
          :item
    })
  };

      export function includesOutInArray(arr,propertise,value){
    let res = []
    for(const item of arr){
      if(!item[propertise].includes(value)){
        res.push(item)
      }
    }
    return res
  };

    export function onlyNumberValue(value){
  return Number(value.replace(/[^0-9]/g, ''))
};

export function transformData(input) {
  
  let result = [];

  input.forEach(item => {
    if (item.label) {
      // Create a new group for items related to the label
      result.push({
        topic: item.label,
        value: []
      });
    } else if (item.topic && item.to) {
      // Push the items with 'topic' and 'to' into the last group's value array
      if (result.length > 0) {
        result[result.length - 1].value.push({
          name: item.topic,
          to: item.to
        });
      }
    }
  });

  return result;
};

  export function onlyNumberValue2(value){
    return value.replace(/[^0-9]/g, '')
  }

export  function diffDaysFloor(ts1, ts2) {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const diffMs = Math.abs(ts2 - ts1);
    return Math.floor(diffMs / MS_PER_DAY);
};

export  function diffDaysCeil(ts1, ts2) {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const diffMs = Math.abs(ts2 - ts1);
    return Math.ceil(diffMs / MS_PER_DAY);
}

export function findDay(packageId){
  let day = 0;
  let packageType = 'qrcode';
  let months = new Set(['1','4','7','10','13','16','19','22','25','28','30','32','34','36','38'])

  const qrcode = new Set(['1','3', '4', '6', '7', '9'])
  const staff = new Set(['10', '12', '13', '15', '16','18'])
  const language = new Set(['19','21', '22','24', '25', '27'])
  const premium = new Set(['28', '29', '30','31', '32', '33'])
  const member = new Set(['34', '35', '36', '37','38','39'])
  
  if(months.has(packageId)){
    day = 31
  } else { // years
    day = 365
  }

  if(qrcode.has(packageId)){
    packageType = 'qrcode';
  } else if(staff.has(packageId)){
    packageType = 'staff';
  } else if(language.has(packageId)){
    packageType = 'language';
  } else if(premium.has(packageId)){
    packageType = 'premium';
  } else if(member.has(packageId)){
    packageType = 'member';
  } 


  return { day, packageId, packageType }
}




export const useToLocale = (value) => value?.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})||'';
export const useToLocale2 = (value) => value?.toLocaleString()||'';

export function managePromotion(products){
    return products.map((item)=>{
      return item.promotion.status
        ?item.promotion.type==='bath'
            ?{...item,price:item.price[0].price,net:item.price[0].price-Number(item.promotion.value)}
            :{...item,price:item.price[0].price,net:(item.price[0].price*(100-Number(item.promotion.value)))/100}
        :{...item,price:item.price[0].price,net:item.price[0].price}
    })
}


  export function someInArray(arr,propertise,value){
    return arr.some(item=>item[propertise] === value)
  };

  export function findInArray(arr,propertise,value){
    return arr.find(item=>item[propertise] === value)
  };
  
  export function filterInArray(arr,propertise,value){
    return arr.filter(item=>item[propertise] === value)
  };

  export function filterChoice(option){
    let choice = []
    for(const item of option){
        choice = [...choice,...filterInArray(item.choice,'chose',true)]
    }
    return choice
  };

  export function filterDeleteInArray(arr,propertise,value){
    return arr.filter(item=>item[propertise] !== value)
  };
  
  
  export function compareArrays(a, b){
    return  a.length === b.length && a.every((element, index) => element === b[index]);
  } 


  export function manageCategory(thisLevel_Value,allSelectedCategory,selectedCategory){
    const newCategory = []
    for(const item of allSelectedCategory){
      if(!someInArray(thisLevel_Value,'id',item.id)){ // เอาไว้ลบ ตัวอื่นใน level เดียวกันออก
        newCategory.push(item)
      }
    }
    return [...newCategory,selectedCategory].filter(a=>a.level <= selectedCategory.level)
  };

  export function manageDashboard({ selectedBill, smartCategory}){
    let newProduct = []
    let newCategory = []
  
    for(const item of selectedBill){
      let thisProduct = item.product.filter(a=>a.process!=='cancel')
      
      for(const product of thisProduct){
        const { id, qty, totalPrice, category } = product;

        // 1. แยกตามสินค้า
        let checkProduct = findInArray(newProduct,'id',id)  // สำหรับการเรียง product
        if(checkProduct && checkProduct.id){
          checkProduct.allQty = checkProduct.allQty + qty
          checkProduct.allTotalPrice = checkProduct.allTotalPrice + totalPrice
        } else {
          newProduct.push({...product,allQty:qty,allTotalPrice:totalPrice})
        }

        //2. แยกตามหมวดหมู๋
        if(category.length===0){
            let checkCategory = findInArray(newCategory,'id','x') // หมวดหมู่ชั่นที่ 1
            if(checkCategory && checkCategory.id){
              checkCategory.allQty += qty
              checkCategory.allTotalPrice += totalPrice
            } else {
              newCategory.push({id:'x',allQty:qty,allTotalPrice:totalPrice,name:'ไม่มีหมวดหมู่'})
            }
        } else {
          let checkCategory = findInArray(newCategory,'id',category[0]) // หมวดหมู่ชั่นที่ 1
          if(checkCategory && checkCategory.id){
            checkCategory.allQty += qty
            checkCategory.allTotalPrice += totalPrice
          } else {
            newCategory.push({id:category[0],allQty:qty,allTotalPrice:totalPrice,name:findInArray(smartCategory[0]?.value,'id',category[0])?.name||'ไม่ทราบหมวดหมู่'})
          }
        }

      }
    }

    return {
      category:newCategory,
      product:newProduct,
    }
  };

  export function twoDigitNumber(inputValue){
    inputValue = inputValue.replace(/[^0-9\.]/g,'')
    var afterDot = '';
    var beforeDots = inputValue.split('.'); 
    var beforeDot = beforeDots[0];
    if(beforeDots[1]){
        var afterDot = beforeDots[1];
        if(afterDot.length > 2 ){
             afterDot = afterDot.slice(0, 2);               
        }
        afterDot = '.'+ afterDot;
  
    }
    if(beforeDot){                  
        // if(beforeDot.length > 6 ){          
        //     beforeDot = beforeDot.slice(0, 6);                      
        // }
        if(beforeDots[1] == ''){
            beforeDot = beforeDot + '.';
        }
    }
    inputValue = beforeDot + afterDot;
    return inputValue;
  };
