export const getHoursMinute = (today) => {
    const day = new Date(today)
    const cDateTime =
        day.getHours().toString().padStart(2,"0")+":"+
        day.getMinutes().toString().padStart(2,"0") 

    return cDateTime;  //00:25 น.
}

export function plusDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}   //plusDays(new Date(), 14)

export const stringYMDHMS = (day) => {
    const today = new Date(day);
    const cDateTime =
        today.getFullYear().toString().padStart(4,"0")+
        parseInt(today.getMonth()+1).toString().padStart(2,"0") +
        today.getDate().toString().padStart(2,"0") +
        today.getHours().toString().padStart(2,"0")+
        today.getMinutes().toString().padStart(2,"0")+
        today.getSeconds().toString().padStart(2,"0");

    return cDateTime;  // 20210627002526
};

export const stringDateTime = (dateTime) => {
    const today = new Date(dateTime);
    const cDateTime =
        today.getDate().toString().padStart(2,"0") + "/"+
        parseInt(today.getMonth()+1).toString().padStart(2,"0") +"/"+
        today.getFullYear().toString().padStart(4,"0")+" " +
        today.getHours().toString().padStart(2,"0")+":"+
        today.getMinutes().toString().padStart(2,"0")+":"+
        today.getSeconds().toString().padStart(2,"0");

    return cDateTime;  // 27/06/2021 00:25:26
}

export const stringDayMonth = (date) => {
    const today = new Date(date);
    let xx = 10
    if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '01'){
        xx = 'ม.ค.'
    } else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '02'){
        xx = 'ก.พ.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '03'){
        xx = 'มี.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '04'){
        xx = 'เม.ย.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '05'){
        xx = 'พ.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '06'){
        xx = 'มิ.ย.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '07'){
        xx = 'ก.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '08'){
        xx = 'ส.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '09'){
        xx = 'ก.ย.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '10'){
        xx = 'ต.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '11'){
        xx = 'พ.ย.'
    }else{
        xx = 'ธ.ค.'
    }

    const cDateTime = today.getDate().toString().padStart(2,"0") + "  "+xx 
    return cDateTime;  // 12 ม.ค.
};

export function minusMinutes(date, minutes) {
    var result = new Date(date);
    result.setTime(result.getTime() - (minutes * 60000)); // 1 minute = 60,000 milliseconds
    return result;
}

export const setTimeStart = (date) => {
    var result = new Date(date)
    result.setHours(0);
    result.setMinutes(0);
    result.setSeconds(0);
    result.setMilliseconds(0)
    return result;  //for startDate
};

export const setTimeEnd = (date) => {
    var result = new Date(date)
    result.setHours(23);
    result.setMinutes(59);
    result.setSeconds(59);
    result.setMilliseconds(59)
    return result;  //for expireDate
}

export const stringReceiptNumber = (receipts) => {
    const date = new Date()
    const cDateTime =
        date.getFullYear().toString().padStart(4,"0")+"" +
        parseInt(date.getMonth()+1).toString().padStart(2,"0") +""+
        receipts.toString().padStart(6,"0")

    return cDateTime;  // 202309000123
};
export const stringFullDate = (day) => {
    const today = new Date(day);
    let xx = 10
    if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '01'){
        xx = 'ม.ค.'
    } else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '02'){
        xx = 'ก.พ.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '03'){
        xx = 'มี.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '04'){
        xx = 'เม.ย.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '05'){
        xx = 'พ.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '06'){
        xx = 'มิ.ย.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '07'){
        xx = 'ก.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '08'){
        xx = 'ส.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '09'){
        xx = 'ก.ย.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '10'){
        xx = 'ต.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '11'){
        xx = 'พ.ย.'
    }else{
        xx = 'ธ.ค.'
    }

    let year = Number(today.getFullYear().toString().padStart(4,"0")) + 543
    const cDateTime =
        today.getDate().toString().padStart(2,"0") + "  "+
        xx +" "+
        year+"   " 
    return cDateTime;  // 12/ม.ค./2021 
}

export function getWeek(date) {
    var day = date.getDay()
    let startDate = date
    let endDate = date
    if(day == 0){
        endDate = plusDays(date,7)
    } else if(day == 1){
        startDate = minusDays(date,0)
        endDate = plusDays(date,6)
    }else if(day == 2){
        startDate = minusDays(date,1)
        endDate = plusDays(date,5)
    }else if(day == 3){
        startDate = minusDays(date,2)
        endDate = plusDays(date,4)
    }else if(day == 4){
        startDate = minusDays(date,3)
        endDate = plusDays(date,3)
    }else if(day == 5){
        startDate = minusDays(date,4)
        endDate = plusDays(date,2)
    }else {
        startDate = minusDays(date,1)
    }
    let lastDay = getLastDayOfYear(date)
    if(endDate > lastDay){
        endDate = lastDay
    }
    return {startDate:startDate,endDate:endDate}
}

export const stringDateTime3 = (today) => {
    // const today = new Date();
    let xx = 10
    if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '01'){
        xx = 'ม.ค.'
    } else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '02'){
        xx = 'ก.พ.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '03'){
        xx = 'มี.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '04'){
        xx = 'เม.ย.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '05'){
        xx = 'พ.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '06'){
        xx = 'มิ.ย.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '07'){
        xx = 'ก.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '08'){
        xx = 'ส.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '09'){
        xx = 'ก.ย.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '10'){
        xx = 'ต.ค.'
    }else if(parseInt(today.getMonth()+1).toString().padStart(2,"0") == '11'){
        xx = 'พ.ย.'
    }else{
        xx = 'ธ.ค.'
    }

    let year = Number(today.getFullYear().toString().padStart(4,"0")) + 543
    const cDateTime =
        today.getDate().toString().padStart(2,"0") + "  "+
        xx +" "+
        year+"   " 
    return cDateTime;  // 27/06/2021 
};

export const stringDateTimeReceipt = (day) => {
    const date = new Date(day)
    const cDateTime =
        date.getDate().toString().padStart(2,"0") + "/"+
        parseInt(date.getMonth()+1).toString().padStart(2,"0") +"/"+
        date.getFullYear().toString().padStart(4,"0")+" " +
        date.getHours().toString().padStart(2,"0")+":"+
        date.getMinutes().toString().padStart(2,"0")

    return cDateTime;  // 27/06/2021 00:25:26
};

export function getLastDayOfYear(date) {
    const currentYear = date.getFullYear();
    return new Date(currentYear, 11, 31); // 11 represents December (months are 0-indexed)
};

export const NumberYMD = (date) => {
    let dat = new Date(date)
    const cDateTime =
    dat.getFullYear().toString().padStart(4,"0")+
        parseInt(dat.getMonth()+1).toString().padStart(2,"0") +
        dat.getDate().toString().padStart(2,"0") 

    return Number(cDateTime);  // 20210627
};

export function minusDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
}  

export const stringYMDHMS3 = (day) => {
    const cDateTime =
        day.getFullYear().toString().padStart(4,"0")+
        parseInt(day.getMonth()+1).toString().padStart(2,"0") +
        day.getDate().toString().padStart(2,"0")

    return String(cDateTime);  // 20210627
};

export function plusSecond(date, second) {
    var result = new Date(date);
    result.setSeconds(result.getSeconds() + second);
    return result;
};

export const firstDayOfMonth = (today=new Date()) =>{
    return new Date(today.getFullYear(), today.getMonth(), 1);
};

export const lastDayOfMonth = (today=new Date()) =>{
    return new Date(today.getFullYear(), today.getMonth()+1, 0);
};

export const yearMonth = (today) => {
    // const today = new Date();
    const cDateTime =
        today.getFullYear().toString().padStart(4,"0")+
        parseInt(today.getMonth()+1).toString().padStart(2,"0") 

    return cDateTime;  // 202211
}

export function minusMonth(date, month) {
    var result = new Date(date);
    result.setMonth(result.getMonth() - month);
    return result;
}
