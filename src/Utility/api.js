import axios from "axios";

export const scanfoodAPI = axios.create({
    baseURL:'https://asia-southeast2-shopchamp-restaurant.cloudfunctions.net/',
});

