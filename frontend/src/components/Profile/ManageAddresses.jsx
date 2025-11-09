// frontend/src/components/Profile/ManageAddresses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { UserController } from '../../controllers/userController';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
// === THÊM MỚI ===
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
// =================

// === (Component AddressForm) ===
const AddressForm = ({ initialData, onSubmit, onCancel }) => {
    // (Logic state cũ của bạn được giữ nguyên)
    const [formData, setFormData] = useState(
        initialData || {
            fullName: '', phoneNumber: '', address: '', 
            ward: '', district: '', city: '', isDefault: false
        }
    );
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);

    // (Logic cũ: Load Tỉnh/Thành)
    const loadProvinces = useCallback(async () => {
        try {
            const data = await UserController.getProvinces();
            setProvinces(data);
        } catch (error) {
            // (userController.jsx đã tự động gọi toast.error)
            console.error("Lỗi tải Tỉnh/Thành:", error);
        }
    }, []);

    // (Logic cũ: Load Quận/Huyện)
    const loadDistricts = useCallback(async (provinceId) => {
        try {
            const data = await UserController.getDistricts(provinceId);
            setDistricts(data);
        } catch (error) {
            setDistricts([]);
            console.error("Lỗi tải Quận/Huyện:", error);
        }
    }, []);

    // (Logic cũ: Load Phường/Xã)
    const loadWards = useCallback(async (districtId) => {
        try {
            const data = await UserController.getWards(districtId);
            setWards(data);
        } catch (error) {
            setWards([]);
            console.error("Lỗi tải Phường/Xã:", error);
        }
    }, []);

    // (Logic cũ: Load Tỉnh/Thành lần đầu)
    useEffect(() => {
        loadProvinces();
    }, [loadProvinces]);

    // (Logic cũ: Xử lý khi Sửa - setupInitialDropdowns)
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            const setupInitialDropdowns = async () => {
                if (initialData.city && initialData.district && initialData.ward) {
                    try {
                        const allProvinces = await UserController.getProvinces();
                        setProvinces(allProvinces);
                        const currentProvince = allProvinces.find(p => p.Name === initialData.city);
                        
                        if (currentProvince) {
                            setSelectedProvinceId(currentProvince.ProvinceID);
                            const allDistricts = await UserController.getDistricts(currentProvince.ProvinceID);
                            setDistricts(allDistricts);
                            const currentDistrict = allDistricts.find(d => d.Name === initialData.district);
                            
                            if (currentDistrict) {
                                setSelectedDistrictId(currentDistrict.DistrictID);
                                const allWards = await UserController.getWards(currentDistrict.DistrictID);
                                setWards(allWards);
                            }
                        }
                    } catch (error) {
                        toast.error(error.message || "Lỗi khi tải dữ liệu địa chỉ cũ.");
                    }
                }
            };
            setupInitialDropdowns();
        }
    }, [initialData, loadProvinces, loadDistricts, loadWards]); // Thêm dependencies

    // (Logic cũ: Tải Huyện khi Tỉnh thay đổi)
    useEffect(() => {
        if (selectedProvinceId) {
            loadDistricts(selectedProvinceId);
        }
    }, [selectedProvinceId, loadDistricts]);

    // (Logic cũ: Tải Xã khi Huyện thay đổi)
    useEffect(() => {
        if (selectedDistrictId) {
            loadWards(selectedDistrictId);
        }
    }, [selectedDistrictId, loadWards]);

    // (Logic cũ: Xử lý chọn Tỉnh)
    const handleProvinceChange = (e) => {
        const provinceId = e.target.value;
        const provinceName = e.target.options[e.target.selectedIndex].text;
        setSelectedProvinceId(provinceId);
        setFormData({ ...formData, city: provinceName, district: '', ward: '' });
        setDistricts([]);
        setWards([]);
    };

    // (Logic cũ: Xử lý chọn Huyện)
    const handleDistrictChange = (e) => {
        const districtId = e.target.value;
        const districtName = e.target.options[e.target.selectedIndex].text;
        setSelectedDistrictId(districtId);
        setFormData({ ...formData, district: districtName, ward: '' });
        setWards([]);
    };

    // (Logic cũ: Xử lý các input khác)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'city') return handleProvinceChange(e);
        if (name === 'district') return handleDistrictChange(e);
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    // (Logic cũ: Gửi form)
    const internalHandleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={internalHandleSubmit} className="space-y-4 mt-4 p-4 border rounded-lg bg-background">
            <h3 className="text-lg font-semibold text-text-primary">
                {initialData ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h3>
            
            {/* (Các input/select dùng class 'input-field' - Giữ nguyên) */}
             <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary">Họ và Tên</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="input-field" />
            </div>
             <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-secondary">Số điện thoại</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="input-field" />
            </div>
             <div>
                <label htmlFor="address" className="block text-sm font-medium text-text-secondary">Địa chỉ (Số nhà, tên đường)</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required className="input-field" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label htmlFor="city" className="block text-sm font-medium text-text-secondary">Tỉnh/Thành phố</label>
                    <select name="city" value={selectedProvinceId || ''} onChange={handleProvinceChange} required className="input-field">
                        <option value="">Chọn Tỉnh/Thành</option>
                        {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.Name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="district" className="block text-sm font-medium text-text-secondary">Quận/Huyện</label>
                    <select name="district" value={selectedDistrictId || ''} onChange={handleDistrictChange} required className="input-field" disabled={!districts.length}>
                        <option value="">Chọn Quận/Huyện</option>
                        {districts.map(d => <option key={d.DistrictID} value={d.DistrictID}>{d.Name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="ward" className="block text-sm font-medium text-text-secondary">Phường/Xã</label>
                    <select name="ward" value={formData.ward} onChange={handleChange} required className="input-field" disabled={!wards.length}>
                        <option value="">Chọn Phường/Xã</option>
                        {wards.map(w => <option key={w.WardCode} value={w.Name}>{w.Name}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex items-center">
                <input type="checkbox" name="isDefault" id="isDefault" checked={formData.isDefault} onChange={handleChange} className="h-4 w-4 text-accent focus:ring-accent-hover border-gray-300 rounded" />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-text-secondary">Đặt làm địa chỉ mặc định</label>
            </div>


            {/* === SỬA LẠI: Nút bấm của Form (Thêm motion) === */}
            <div className="flex gap-4 pt-2">
                <motion.button 
                    type="submit" 
                    className="btn-accent-profile" // Dùng class chung
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {initialData ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
                </motion.button>
                <motion.button 
                    type="button" 
                    onClick={onCancel}
                    className="px-4 py-2 bg-surface text-text-secondary border border-gray-300 rounded-lg hover:bg-gray-100"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Hủy
                </motion.button>
            </div>
        </form>
    );
};


// === (Component ManageAddresses chính - ĐÃ SỬA LỖI VÀ THÊM TOAST/MOTION) ===
const ManageAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    // === SỬA LỖI: TÊN HÀM ===
    const loadAddresses = useCallback(async () => {
        setIsLoading(true);
        try {
            // Lỗi của bạn ở đây:
            // const data = await UserController.getAddresses(); // 👈 SAI
            const data = await UserController.getMyAddresses(); // 👈 SỬA LẠI
            
            setAddresses(data.addresses || []);
        } catch (error) {
            // (userController.jsx đã tự động hiển thị toast.error rồi)
            console.error("Lỗi tải địa chỉ:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);
    // ========================

    useEffect(() => {
        loadAddresses();
    }, [loadAddresses]);

    const handleSubmit = async (formData) => {
        try {
            if (editingAddress) {
                await UserController.updateShippingAddress(editingAddress._id, formData);
                toast.success("Cập nhật địa chỉ thành công!"); // 👈 THÊM TOAST
            } else {
                await UserController.addAddress(formData);
                toast.success("Thêm địa chỉ mới thành công!"); // 👈 THÊM TOAST
            }
            loadAddresses(); 
            setIsFormOpen(false);
            setEditingAddress(null);
        } catch (error) {
            // (userController.jsx đã tự động hiển thị toast.error rồi)
            console.error("Lỗi submit địa chỉ:", error);
        }
    };

    const handleDelete = async (addressId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
            try {
                await UserController.deleteAddress(addressId);
                toast.success("Đã xóa địa chỉ."); // 👈 THÊM TOAST
                loadAddresses(); 
            } catch (error) {
                 // (userController.jsx đã tự động hiển thị toast.error rồi)
                console.error("Lỗi xóa địa chỉ:", error);
            }
        }
    };
    
    const handleEdit = (addr) => {
        setEditingAddress(addr);
        setIsFormOpen(true);
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingAddress(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-text-primary">Địa chỉ của tôi</h2>
                {/* === THÊM MOTION === */}
                {!isFormOpen && (
                    <motion.button 
                        onClick={() => { setIsFormOpen(true); setEditingAddress(null); }}
                        className="btn-accent-profile flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaPlus /> Thêm địa chỉ mới
                    </motion.button>
                )}
            </div>

            {isFormOpen && (
                <AddressForm 
                    initialData={editingAddress}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            )}

            <div className="space-y-4 mt-6">
                {isLoading && <p className="text-text-secondary">Đang tải...</p>}
                {!isLoading && addresses.length === 0 && !isFormOpen && (
                    <p className="text-text-secondary">Bạn chưa có địa chỉ nào.</p>
                )}
                {!isLoading && addresses.map(addr => (
                    <div key={addr._id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-text-primary">{addr.fullName}</h3>
                                {addr.isDefault && (
                                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Mặc định</span>
                                )}
                            </div>
                            <p className="text-text-secondary">{addr.phoneNumber}</p>
                            <p className="text-text-secondary">{addr.address}, {addr.ward}, {addr.district}, {addr.city}</p>
                        </div>
                        
                        {/* === THÊM MOTION VÀ SỬA MÀU NÚT === */}
                        <div className="flex gap-2 flex-shrink-0">
                            <motion.button 
                                onClick={() => handleEdit(addr)} 
                                className="p-2 text-text-accent hover:text-accent-hover transition-colors"
                                whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                            >
                                <FaEdit />
                            </motion.button>
                            <motion.button 
                                onClick={() => handleDelete(addr._id)} 
                                className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                            >
                                <FaTrash />
                            </motion.button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ManageAddresses;