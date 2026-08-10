import axios from "axios";
import { firebaseAuth } from "../db/firestore";

export const scanfoodAPI = axios.create({
    baseURL:'https://asia-southeast2-shopchamp-restaurant.cloudfunctions.net/',
});

// แนบ Firebase ID token ให้ทุก request อัตโนมัติ
// ไม่มีคนล็อกอิน = ไม่แนบ (ปล่อยผ่าน ให้ server เป็นคนปัด)
scanfoodAPI.interceptors.request.use(async (config) => {
    try {
        const currentUser = firebaseAuth.currentUser;
        if (currentUser) {
            const idToken = await currentUser.getIdToken();
            config.headers = { ...config.headers, Authorization: `Bearer ${idToken}` };
        }
    } catch (err) {
        // ขอ token ไม่ได้ = ปล่อย request ออกไปแบบไม่มี header ให้ server ปัดเอง
        console.log('scanfoodAPI: attach id token failed', err);
    }
    return config;
});
