import { stringYMDHMS3 } from "../Utility/dateTime";

export default {
    shopId:'',
    shopName:'',
    profileId:'',
    profileName:'',
    timestamp:'',
    imageId:'',
    net:'',
    status:'order',
    vat:false,
    email:'',
    tel:'',
    suggestCode:'',
    requestDate:new Date(),
    requestBillDate:stringYMDHMS3(new Date()),
};
