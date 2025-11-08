// frontend/src/services/provinceApi.js
import axios from "axios";
// Axios instance riêng cho API tỉnh/thành miễn phí
// Đổi từ API GHN sang API Sơn Đặng (miễn phí, không cần token)
const provinceApi = axios.create({
    baseURL: "https://provinces.open-api.vn/api/",
    // headers: {
    //     // Token này là public, không cần giấu
    //     'Token': '6893e2c0-a39c-11ee-a59f-a260851ba65c'
    // }
});

export default provinceApi;