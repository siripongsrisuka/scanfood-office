import { yearMonth } from './dateTime';
import { normalSort } from './sort';
import { toast } from 'react-toastify';
import { db } from '../db/firestore';
import initialCustomer from '../configs/initialCustomer';

export function isApprover (profileId){
  return ['cZ7XkJeZzNOrr5HEZKEPgAjtMrx2'].includes(profileId)
};

export function isApproverPen(profileId){
  if(['cZ7XkJeZzNOrr5HEZKEPgAjtMrx2'].includes(profileId)) return <i class="bi bi-pen"></i>
  return ''
};

export function isGodIt (profileId){
  return ['xL8vqnyJ8OfkVpHJBPJvEei2D3B3','cZ7XkJeZzNOrr5HEZKEPgAjtMrx2'].includes(profileId)
}

export function toastSuccess(text='🟢 Updated successful!'){
  toast.success(text);
};

export   async function fetchLicense(){
    const licenseDoc = await db.collection('admin').doc('package').get();
    const { value } = licenseDoc.data();
    return value;
};


export   async function fetchHardware(profileId){
    const query = await db.collection('hardwareOrder')
        .where('profileId','==',profileId)
        .where('status','==','prepare')
        .get();
    
    const results = query.docs.map(doc=>{
        const { timestamp, ...rest } = doc.data();
        return {
            ...rest,
            timestamp:formatTime(timestamp),
            id:doc.id,
        }
    });
    return normalSort('timestamp',results)
};
export  async function fetchSoftware(profileId){
   const query = await db.collection('packageOrder')
        .where('profileId','==',profileId)
        .where('status','==','request')
        .get();
    
    const results = query.docs.map(doc=>{
        const { timestamp, requestDate, ...rest } = doc.data();
        return {
            ...rest,
            timestamp:formatTime(timestamp),
            requestDate:formatTime(requestDate),
            id:doc.id,
        }
    });
    return normalSort('timestamp',results)
};

export   async function fetchPayment(profileId,teamId){
      const thisYearMonth = yearMonth(new Date());
      const query = teamId
        ?await db.collection('autoPayment')
          .where('team','==',teamId)
          .where('yearMonth','==',thisYearMonth)
          .get()
        :await db.collection('autoPayment')
          .where('profileId','==',profileId)
          .orderBy('createdAt','desc')
          .limit(30)
          .get()
      const results = query.docs.map(doc=>{
          const { createdAt, requestDate, ...rest } = doc.data();
          return {
              ...rest,
              createdAt:formatTime(createdAt),
              requestDate:formatTime(requestDate),
              id:doc.id,
          }
      });
      return normalSort('createdAt',results)
};

export   async function fetchWaste(profileId){
    const thisYearMonth = yearMonth(new Date());
    const query = await db.collection('customer')
        .where('profileId','==',profileId)
        .where('status','==','cancel')
        .where('yearMonth','==',thisYearMonth)
        .get();
    const results = query.docs.map(doc=>{
        const { createdAt, ...rest } = doc.data();
        return {
            ...initialCustomer,
            ...rest,
            createdAt:formatTime(createdAt),
            id:doc.id,
        }
    });
    return normalSort('createdAt',results)
};

export     async function fetchSuccessCases(profileId,teamId){
  const thisYearMonth = yearMonth(new Date());
  const query = teamId
    ?await db.collection('customer')
      .where('team','==',teamId)
      .where('status','==','paid')
      .where('yearMonth','==',thisYearMonth)
      .get()
    :await db.collection('customer')
      .where('profileId','==',profileId)
      .where('status','==','paid')
      .where('yearMonth','==',thisYearMonth)
      .get()
  const results = query.docs.map(doc=>{
      const { createdAt, ...rest } = doc.data();
      return {
          ...initialCustomer,
          ...rest,
          createdAt:formatTime(createdAt),
          id:doc.id,
      }
  });
  return normalSort('createdAt',results)
};

export    async function fetchCustomer(profileId,teamId){
    const today = new Date().getTime();
    const query = teamId
      ?await db.collection('customer')
        .where('team','==',teamId)
        .where('status','==','waiting')
        .get()
      :await db.collection('customer')
        .where('profileId','==',profileId)
        .where('status','==','waiting')
        .get()
    const results = query.docs.map(doc=>{
        const { createdAt, ...rest } = doc.data();
        return {
            ...initialCustomer,
            ...rest,
            createdAt:formatTime(createdAt),
            id:doc.id,
            day:diffDaysCeil(formatTime(createdAt).getTime(),today)
        }
    });
    return normalSort('createdAt',results)
};

export   async function fetchMemo(profileId,teamId){
    const query = teamId
      ?await db.collection('memo')
        .where('team','==',teamId)
        .orderBy('createdAt','desc')
        .limit(90)
        .get()
      :await db.collection('memo')
        .where('profileId','==',profileId)
        .orderBy('createdAt','desc')
        .limit(30)
        .get()
    const results = query.docs.map(doc=>{
        const { createdAt, ...rest } = doc.data();
        return {
            ...rest,
            createdAt:formatTime(createdAt),
            id:doc.id,
        }
    });
    return normalSort('createdAt',results)
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

  export function multiDigitNumber(inputValue){
  inputValue = inputValue.replace(/[^0-9\.]/g,'')
  var afterDot = '';
  var beforeDots = inputValue.split('.'); 
  var beforeDot = beforeDots[0];
  if(beforeDots[1]){
      var afterDot = beforeDots[1];
      // if(afterDot.length > 2 ){
      //      afterDot = afterDot.slice(0, 2);               
      // }
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
}

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

export const  setDifference = (setA,setB) => setA.filter(objA => !setB.some(objB => objB.id === objA.id));


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
};

export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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


  export function someInArray(arr,propertise,value){
    return arr.some(item=>item[propertise] === value)
  };

  export function findInArray(arr,propertise,value){
    return arr.find(item=>item[propertise] === value)
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
