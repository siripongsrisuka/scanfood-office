import axios from "axios";

export const shopchampRestaurantAPI = axios.create({
    baseURL:'https://asia-southeast2-shopchamp-restaurant.cloudfunctions.net/',
});


export const shopchampRestaurantTestAPI = axios.create({
    baseURL:'http://localhost:9000/shopchamp-restaurant/asia-southeast2',
});


// export const morrisPaymentTestAPI = axios.create({
//     baseURL:'http://api-morris.natachat.com/service/v1',
// });



// export const morrisPaymentAPI = axios.create({
//     baseURL:'https://api.morrispayment.com/service/v1',
// });

