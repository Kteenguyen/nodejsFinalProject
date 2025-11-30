// frontend/src/components/Profile/ManageAddresses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { UserController } from '../../controllers/userController';
import { FaPlus, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

// === (Component AddressForm) ===
// (Component này render bên trong ManageAddresses, nên không cần bọc nền)
const AddressForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(
        initialData || {
            fullName: '', phoneNumber: '', address: '',
            ward: '', district: '', city: '', isDefault: false
        }
    );
    // (Các state cho GHN API)
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    
    // NÂNG CẤP: Giữ state cho ID để điều khiển dropdown
    const [selectedProvinceId, setSelectedProvinceId] = useState(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);

    // (Logic Load Tỉnh/Thành)
    const loadProvinces = useCallback(async () => {
        try {
            const data = await UserController.getProvinces();
            setProvinces(data);
            return data; // Trả về data để xử lý logic Edit
        } catch (error) {
            console.error("Lỗi load tỉnh thành:", error);
            // NÂNG CẤP: Thêm toast error
            toast.error("Lỗi khi tải danh sách Tỉnh/Thành.");
        }
    }, []);

    // (Logic Load Quận/Huyện)
    const loadDistricts = useCallback(async (provinceId) => {
        try {
            const data = await UserController.getDistricts(provinceId);
            setDistricts(data);
            setWards([]); // Reset xã
            return data; // Trả về data
        } catch (error) {
            console.error("Lỗi load quận huyện:", error);
            // NÂNG CẤP: Thêm toast error
            toast.error("Lỗi khi tải danh sách Quận/Huyện.");
        }
    }, []);

    // (Logic Load Xã/Phường)
    const loadWards = useCallback(async (districtId) => {
        try {
            const data = await UserController.getWards(districtId);
            setWards(data);
        } catch (error) {
            console.error("Lỗi load xã phường:", error);
            // NÂNG CẤP: Thêm toast error
            toast.error("Lỗi khi tải danh sách Xã/Phường.");
        }
    }, []);

    /**
     * NÂNG CẤP: Thêm logic xử lý khi "Edit" (initialData)
     * Tự động load và chọn các dropdown khi form được mở
     */
    useEffect(() => {
        const setupEditForm = async () => {
            // 1. Luôn load tỉnh
            const allProvinces = await loadProvinces();

            // 2. Nếu là form Edit và đã có Tỉnh
            if (initialData && allProvinces) {
                // 3. Tìm ID Tỉnh từ tên
                const currentProvince = allProvinces.find(p => p.ProvinceName === initialData.city);
                if (currentProvince) {
                    setSelectedProvinceId(currentProvince.ProvinceID);

                    // 4. Load Quận
                    const allDistricts = await loadDistricts(currentProvince.ProvinceID);
                    if (allDistricts) {
                        // 5. Tìm ID Quận từ tên
                        const currentDistrict = allDistricts.find(d => d.DistrictName === initialData.district);
                        if (currentDistrict) {
                            setSelectedDistrictId(currentDistrict.DistrictID);
                            // 6. Load Xã
                            await loadWards(currentDistrict.DistrictID);
                            // (Tên xã đã có sẵn trong formData.ward từ initialData)
                        }
                    }
                }
            }
        };
        setupEditForm();
        // Thêm các dependencies để đảm bảo hàm chạy đúng
    }, [initialData, loadProvinces, loadDistricts, loadWards]);

    // (Các hàm HandleChange, HandleSubmit cho Form)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleProvinceChange = (e) => {
        const provinceId = e.target.value;
        // Lấy tên Tỉnh từ text của option
        const provinceName = provinceId ? e.target.options[e.target.selectedIndex].text : "";
        setSelectedProvinceId(provinceId);
        setFormData(prev => ({ ...prev, city: provinceName, district: '', ward: '' }));
        if (provinceId) {
            loadDistricts(provinceId);
        } else {
            setDistricts([]);
            setWards([]);
        }
    };

    const handleDistrictChange = (e) => {
        const districtId = e.target.value;
        // Lấy tên Quận từ text của option
        const districtName = districtId ? e.target.options[e.target.selectedIndex].text : "";
        setSelectedDistrictId(districtId);
        setFormData(prev => ({ ...prev, district: districtName, ward: '' }));
        if (districtId) {
            loadWards(districtId);
        } else {
            setWards([]);
        }
    };

    const handleWardChange = (e) => {
        // Lấy tên Xã từ text của option
        const wardName = e.target.value ? e.target.options[e.target.selectedIndex].text : "";
        setFormData(prev => ({ ...prev, ward: wardName }));
    };

    const localHandleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={localHandleSubmit} className="space-y-4">
            <h2 className="text-lg font-medium text-text-primary mb-4">
                {initialData ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h2>

            {/* (Hàng 1: Tên, SĐT) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label-field">Họ và tên</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                    <label className="label-field">Số điện thoại</label>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="input-field" />
                </div>
            </div>

            {/* (Hàng 2: Tỉnh, Quận, Xã) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="label-field">Tỉnh/Thành phố</label>
                    {/* NÂNG CẤP: value dùng selectedProvinceId */}
                    <select value={selectedProvinceId || ''} onChange={handleProvinceChange} required className="input-field">
                        <option value="">Chọn Tỉnh/Thành</option>
                        {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>)}
                    </select>
                </div>
                <div>
                    <label className="label-field">Quận/Huyện</label>
                    {/* NÂNG CẤP: value dùng selectedDistrictId */}
                    <select value={selectedDistrictId || ''} onChange={handleDistrictChange} required className="input-field" disabled={!districts.length}>
                        <option value="">Chọn Quận/Huyện</option>
                        {districts.map(d => <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>)}
                    </select>
                </div>
                <div>
                    <label className="label-field">Xã/Phường</label>
                    {/* NÂNG CẤP: value dùng formData.ward (vì đây là tên) */}
                    <select name="ward" value={formData.ward} onChange={handleWardChange} required className="input-field" disabled={!wards.length}>
                        <option value="">Chọn Xã/Phường</option>
                        {/* NÂNG CẤP: value là WardName để khớp với formData */}
                        {wards.map(w => <option key={w.WardCode} value={w.WardName}>{w.WardName}</option>)}
                    </select>
                </div>
            </div>

            {/* (Hàng 3: Địa chỉ cụ thể) */}
            <div>
                <label className="label-field">Địa chỉ cụ thể (Số nhà, tên đường...)</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required className="input-field" />
            </div>

            {/* (Hàng 4: Checkbox) */}
            <div className="flex items-center">
                <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} id="isDefault" className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent-hover" />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-text-primary">Đặt làm địa chỉ mặc định</label>
            </div>

            {/* (Hàng 5: Nút bấm) */}
            <div className="flex gap-4">
                <motion.button
                    type="submit"
                    className="btn-accent-profile"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Lưu địa chỉ
                </motion.button>
                <button type="button" onClick={onCancel} className="btn-secondary-profile">
                    Hủy
                </button>
            </div>
        </form>
    );
};
// =============================

const ManageAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    // (Load địa chỉ)
    const loadAddresses = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await UserController.getMyAddresses();
            setAddresses(data.addresses || []);
        } catch (error) {
            console.error("Lỗi load địa chỉ:", error);
            // NÂNG CẤP: Thêm toast error
            toast.error("Không thể tải danh sách địa chỉ.");
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadAddresses();
    }, [loadAddresses]);

    // (Xử lý Edit, Delete, Add New)
    const handleEdit = (address) => {
        setEditingAddress(address);
        setIsFormOpen(true);
    };

    const handleDelete = async (addressId) => {
        if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
            try {
                await UserController.deleteAddress(addressId);
                toast.success("Đã xóa địa chỉ.");
                loadAddresses(); // Tải lại
            } catch (error) {
                console.error("Lỗi xóa địa chỉ:", error);
                // NÂNG CẤP: Thêm toast error
                toast.error(error.message || "Xóa địa chỉ thất bại.");
            }
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await UserController.setDefaultAddress(addressId);
            toast.success("Đã đặt làm địa chỉ mặc định.");
            loadAddresses(); // Tải lại
        } catch (error) {
            console.error("Lỗi đặt mặc định:", error);
            toast.error(error.message || "Đặt mặc định thất bại.");
        }
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        setIsFormOpen(true);
    };

    const handleCancelForm = () => {
        setIsFormOpen(false);
        setEditingAddress(null); // Đảm bảo reset khi hủy
    }

    // (Xử lý Submit Form)
    const handleSubmit = async (formData) => {
        try {
            if (editingAddress) {
                // Update
                await UserController.updateAddress(editingAddress._id, formData);
                toast.success("Đã cập nhật địa chỉ.");
            } else {
                // Create
                await UserController.addAddress(formData);
                toast.success("Đã thêm địa chỉ mới.");
            }
            setIsFormOpen(false);
            setEditingAddress(null);
            loadAddresses(); // Tải lại
        } catch (error) {
            console.error("Lỗi lưu địa chỉ:", error);
            // NÂNG CẤP: Thêm toast error
            toast.error(error.message || "Lưu địa chỉ thất bại.");
        }
    };


    return (
        // === BỌC NỀN TRẮNG (GIỐNG USERDETAIL) ===
        <div className="bg-surface rounded-lg shadow-md p-6">
            {isFormOpen ? (
                // 1. Giao diện Form
                <AddressForm
                    initialData={editingAddress}
                    onSubmit={handleSubmit}
                    onCancel={handleCancelForm} // Dùng hàm hủy mới
                />
            ) : (
                // 2. Giao diện Danh sách
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-text-primary">Địa chỉ của tôi</h2>
                        <motion.button
                            onClick={handleAddNew}
                            className="btn-accent-profile flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaPlus size={12} /> Thêm địa chỉ mới
                        </motion.button>
                    </div>

                    {/* Danh sách địa chỉ */}
                    {isLoading ? (
                        <p className="text-text-secondary">Đang tải địa chỉ...</p>
                    ) : (
                        <div className="space-y-4">
                            {addresses.length === 0 ? (
                                <p className="text-text-secondary">Bạn chưa có địa chỉ nào.</p>
                            ) : (
                                addresses.map(addr => (
                                    <div key={addr._id} className="flex justify-between items-start p-4 border rounded-lg hover:border-accent transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-text-primary">{addr.fullName}</h3>
                                                <span className="text-gray-400">|</span>
                                                <span className="text-text-secondary">{addr.phoneNumber}</span>
                                                {addr.isDefault && (
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Mặc định</span>
                                                )}
                                            </div>
                                            <p className="text-text-secondary text-sm">{addr.address}</p>
                                            <p className="text-text-secondary text-sm">{addr.ward}, {addr.district}, {addr.city}</p>
                                            
                                            {/* Nút hành động */}
                                            <div className="flex gap-3 mt-3">
                                                <button
                                                    onClick={() => handleEdit(addr)}
                                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    Sửa
                                                </button>
                                                {!addr.isDefault && (
                                                    <>
                                                        <span className="text-gray-300">|</span>
                                                        <button
                                                            onClick={() => handleSetDefault(addr._id)}
                                                            className="text-sm text-orange-600 hover:text-orange-800 hover:underline"
                                                        >
                                                            Đặt làm mặc định
                                                        </button>
                                                    </>
                                                )}
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    onClick={() => handleDelete(addr._id)}
                                                    className="text-sm text-red-600 hover:text-red-800 hover:underline"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
        // ======================================
    );
};

export default ManageAddresses;