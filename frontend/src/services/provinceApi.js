// frontend/src/services/provinceApi.js
import axios from "axios";
// Axios instance riêng cho API tỉnh/thành miễn phí

const provinceApi = axios.create({
    baseURL: "https://provinces.open-api.vn/api"
});

export default provinceApi;