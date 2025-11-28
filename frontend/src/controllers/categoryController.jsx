// frontend/src/controllers/categoryController.jsx
import { toast } from 'react-toastify';

// Dữ liệu mẫu
let mockCategories = [
    { _id: '1', name: 'iPhone', slug: 'iphone', description: 'Các dòng điện thoại Apple', productCount: 15, image: 'https://cdn-icons-png.flaticon.com/512/0/191.png', status: 'active' },
    { _id: '2', name: 'Samsung', slug: 'samsung', description: 'Điện thoại Samsung Galaxy', productCount: 24, image: 'https://cdn-icons-png.flaticon.com/512/5969/5969116.png', status: 'active' },
    { _id: '3', name: 'Xiaomi', slug: 'xiaomi', description: 'Điện thoại giá rẻ cấu hình cao', productCount: 10, image: 'https://cdn-icons-png.flaticon.com/512/25/25231.png', status: 'inactive' },
    { _id: '4', name: 'Oppo', slug: 'oppo', description: 'Camera phone đỉnh cao', productCount: 8, image: 'https://cdn-icons-png.flaticon.com/512/882/882731.png', status: 'active' },
];

export const CategoryController = {
    getAll: async () => {
        // Giả lập delay mạng
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockCategories), 500);
        });
    },

    create: async (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newItem = { ...data, _id: Date.now().toString(), productCount: 0 };
                mockCategories = [newItem, ...mockCategories];
                toast.success("Thêm danh mục thành công!");
                resolve(newItem);
            }, 500);
        });
    },

    update: async (id, data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                mockCategories = mockCategories.map(item => item._id === id ? { ...item, ...data } : item);
                toast.success("Cập nhật thành công!");
                resolve(true);
            }, 500);
        });
    },

    delete: async (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                mockCategories = mockCategories.filter(item => item._id !== id);
                toast.success("Đã xóa danh mục!");
                resolve(true);
            }, 500);
        });
    }
};