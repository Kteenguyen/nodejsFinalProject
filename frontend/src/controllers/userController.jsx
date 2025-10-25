import axiosInstance from "../utils/axiosInstance";

const API = "/users";
export const fetchUsers = async (page = 1, limit = 5, search = "") => {
    const response = await axiosInstance.get("/users", {
        params: { page, limit, search }
    });
    return response.data;
};


export const fetchUserDetail = async (userId) => {
    const res = await axiosInstance.get(`${API}/${userId}`);
    return res.data;
};
