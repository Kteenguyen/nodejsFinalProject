import axiosInstance from "../utils/axiosInstance";

const API = "/api/users";

export const fetchUsers = async ({ page, limit, search }) => {
    const res = await axiosInstance.get(
        `${API}?page=${page}&limit=${limit}&search=${search}`
    );
    return res.data;
};

export const fetchUserDetail = async (userId) => {
    const res = await axiosInstance.get(`${API}/${userId}`);
    return res.data;
};
