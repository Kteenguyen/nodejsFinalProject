import api from "../services/api";

const API = "/users";
export const fetchUsers = async (page = 1, limit = 5, search = "") => {
    const response = await api.get("/users", {
        params: { page, limit, search }
    });
    return response.data;
};


export const fetchUserDetail = async (userId) => {
    const res = await api.get(`${API}/${userId}`);
    return res.data;
};
