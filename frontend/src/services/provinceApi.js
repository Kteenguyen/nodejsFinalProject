// frontend/src/services/provinceApi.js
import axios from "axios";
// Axios instance riêng cho API tỉnh/thành miễn phí

const provinceApi = axios.create({
    baseURL: "https://online-gateway.ghn.vn/shiip/public-api/master-data",
    headers: {
        // Token này là public, không cần giấu
        'Token': '6893e2c0-a39c-11ee-a59f-a260851ba65c'
    }
});

export default provinceApi;