// frontend/src/components/Profile/ManageAddresses.jsx
import React, { useState, useEffect, useCallback } from 'react'; // 👈 THÊM useCallback
import { UserController } from '../../controllers/userController'; // 👈 CHỈ IMPORT userController
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

// Form thêm/sửa địa chỉ (ĐÃ NÂNG CẤP)
const AddressForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(
        initialData || {
            fullName: '', phoneNumber: '', address: '', 
            ward: '', district: '', city: '', isDefault: false
        }
    );

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // === CÁC ID ĐỂ GỌI API (KHÔNG LƯU VÀO formData) ===
    const [selectedProvinceId, setSelectedProvinceId] = useState(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);

    // === FIX: HIỂN THỊ DỮ LIỆU CŨ KHI EDIT ===
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            // Cần tìm ID của tỉnh/huyện/xã từ tên để pre-select dropdowns
            const setupInitialDropdowns = async () => {
                if (initialData.city) {
                    const allProvinces = await UserController.getProvinces();
                    setProvinces(allProvinces); // Tải toàn bộ tỉnh
                    const initialProvince = allProvinces.find(p => p.ProvinceName === initialData.city);
                    if (initialProvince) {
                        setSelectedProvinceId(initialProvince.ProvinceID);
                        
                        const allDistricts = await UserController.getDistricts(initialProvince.ProvinceID);
                        setDistricts(allDistricts); // Tải toàn bộ huyện của tỉnh đó
                        const initialDistrict = allDistricts.find(d => d.DistrictName === initialData.district);
                        if (initialDistrict) {
                            setSelectedDistrictId(initialDistrict.DistrictID);

                            const allWards = await UserController.getWards(initialDistrict.DistrictID);
                            setWards(allWards); // Tải toàn bộ xã của huyện đó
                            // Không cần setSelectedWardId vì formData.ward đã có tên
                        }
                    }
                }
            };
            setupInitialDropdowns();
        } else {
            // Nếu là thêm mới, chỉ tải tỉnh
            const fetchProvinces = async () => {
                const data = await UserController.getProvinces();
                setProvinces(data);
            };
            fetchProvinces();
        }
    }, [initialData]); // Chỉ chạy khi initialData thay đổi

    // Tải Quận/Huyện khi Tỉnh thay đổi
    useEffect(() => {
        if (selectedProvinceId) {
            const fetchDistricts = async () => {
                setDistricts([]); // Xóa huyện cũ
                setWards([]);     // Xóa xã cũ
                setFormData(prev => ({ ...prev, district: '', ward: '' })); // Reset formData
                const data = await UserController.getDistricts(selectedProvinceId);
                setDistricts(data);
            };
            fetchDistricts();
        }
    }, [selectedProvinceId]);

    // Tải Phường/Xã khi Huyện thay đổi
    useEffect(() => {
        if (selectedDistrictId) {
            const fetchWards = async () => {
                setWards([]); // Xóa xã cũ
                setFormData(prev => ({ ...prev, ward: '' })); // Reset formData
                const data = await UserController.getWards(selectedDistrictId);
                setWards(data);
            };
            fetchWards();
        }
    }, [selectedDistrictId]);
    
    // HÀM XỬ LÝ CHUNG (Cho input text)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // CÁC HÀM XỬ LÝ DROPDOWN (Lưu cả ID và TÊN)
    const handleProvinceChange = (e) => {
        const provinceId = e.target.value;
        const provinceName = e.target.options[e.target.selectedIndex].text;
        
        setSelectedProvinceId(provinceId);
        setSelectedDistrictId(null); // Reset
        
        setFormData(prev => ({
            ...prev,
            city: provinceId ? provinceName : '',
            district: '', // Reset huyện
            ward: ''      // Reset xã
        }));
    };

    const handleDistrictChange = (e) => {
        const districtId = e.target.value;
        const districtName = e.target.options[e.target.selectedIndex].text;
        
        setSelectedDistrictId(districtId);
        
        setFormData(prev => ({
            ...prev,
            district: districtId ? districtName : '',
            ward: '' // Reset xã
        }));
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const wardName = e.target.options[e.target.selectedIndex].text;
        
        setFormData(prev => ({ 
            ...prev, 
            ward: wardCode ? wardName : '' 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-background rounded-lg space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Họ và tên" className="input-field" required />
                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Số điện thoại" className="input-field" required />
            </div>
            <input name="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ (Số nhà, tên đường)" className="input-field w-full" required />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tỉnh/Thành phố */}
                <select 
                    name="city" 
                    value={selectedProvinceId || ''} // Dùng selectedProvinceId làm giá trị chính
                    onChange={handleProvinceChange} 
                    className="input-field" 
                    required
                >
                    <option value="">
                        {initialData && !selectedProvinceId ? formData.city : 'Chọn Tỉnh/Thành'}
                    </option>
                    {provinces.map(p => (
                        <option key={p.ProvinceID} value={p.ProvinceID}>
                            {p.ProvinceName}
                        </option>
                    ))}
                </select>
                
                {/* Quận/Huyện */}
                <select 
                    name="district" 
                    value={selectedDistrictId || ''} // Dùng selectedDistrictId làm giá trị chính
                    onChange={handleDistrictChange} 
                    className="input-field" 
                    required 
                    disabled={!selectedProvinceId && !initialData?.city} // Sửa điều kiện disable
                >
                    <option value="">
                        {initialData && !selectedDistrictId ? formData.district : 'Chọn Quận/Huyện'}
                    </option>
                    {districts.map(d => (
                        <option key={d.DistrictID} value={d.DistrictID}>
                            {d.DistrictName}
                        </option>
                    ))}
                </select>

                {/* Phường/Xã */}
                <select 
                    name="ward" 
                    value={formData.ward || ''} // Lưu tên phường/xã
                    onChange={handleWardChange} 
                    className="input-field" 
                    required 
                    disabled={!selectedDistrictId && !initialData?.district} // Sửa điều kiện disable
                >
                    <option value="">
                        {initialData && formData.ward ? formData.ward : 'Chọn Phường/Xã'}
                    </option>
                    {wards.map(w => (
                        <option key={w.WardCode} value={w.WardCode}>
                            {w.WardName}
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="flex items-center">
                <input type="checkbox" name="isDefault" id="isDefault" checked={formData.isDefault} onChange={handleChange} className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent" />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-text-secondary">Đặt làm địa chỉ mặc định</label>
            </div>
            <div className="flex gap-2">
                <button type="submit" className="btn-accent-profile">Lưu</button>
                <button type="button" onClick={onCancel} className="btn-secondary-profile">Hủy</button>
            </div>
        </form>
    );
};

// Component chính quản lý địa chỉ (Không thay đổi logic)
const ManageAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null); 

    const fetchAddresses = useCallback(async () => { // 👈 Bọc trong useCallback
        setIsLoading(true);
        try {
            const data = await UserController.getAddresses();
            setAddresses(data || []);
        } catch (error) {
            console.error("Lỗi tải địa chỉ:", error);
        } finally {
            setIsLoading(false);
        }
    }, []); // dependencies rỗng vì không phụ thuộc vào state nào bên ngoài

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]); // 👈 Chỉ chạy khi fetchAddresses thay đổi

    const handleAdd = async (formData) => {
        try {
            const newAddresses = await UserController.addAddress(formData);
            setAddresses(newAddresses);
            setIsFormVisible(false);
        } catch (error) { /* Toast trong controller */ }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setIsFormVisible(true);
    };

    const handleUpdate = async (formData) => {
        try {
            const newAddresses = await UserController.updateAddress(editingAddress._id, formData);
            setAddresses(newAddresses);
            setIsFormVisible(false);
            setEditingAddress(null);
        } catch (error) { /* Toast trong controller */ }
    };

    const handleDelete = async (addressId) => {
        if (window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
            try {
                const newAddresses = await UserController.deleteAddress(addressId);
                setAddresses(newAddresses);
            } catch (error) { /* Toast trong controller */ }
        }
    };

    const handleCancel = () => {
        setIsFormVisible(false);
        setEditingAddress(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-text-primary">Sổ địa chỉ</h2>
                {!isFormVisible && (
                    <button 
                        onClick={() => { setIsFormVisible(true); setEditingAddress(null); }}
                        className="flex items-center gap-2 btn-accent-profile"
                    >
                        <FaPlus /> Thêm địa chỉ mới
                    </button>
                )}
            </div>

            {isFormVisible && (
                <AddressForm 
                    initialData={editingAddress}
                    onSubmit={editingAddress ? handleUpdate : handleAdd}
                    onCancel={handleCancel}
                />
            )}

            {isLoading ? (
                <p className="text-text-secondary">Đang tải địa chỉ...</p>
            ) : (
                <div className="space-y-4">
                    {addresses.length === 0 && !isFormVisible && (
                        <p className="text-text-secondary">Bạn chưa có địa chỉ nào được lưu.</p>
                    )}
                    {addresses.map(addr => (
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
                            <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => handleEdit(addr)} className="p-2 text-text-accent hover:text-accent-hover transition-colors"><FaEdit /></button>
                                <button onClick={() => handleDelete(addr._id)} className="p-2 text-red-500 hover:text-red-700 transition-colors"><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default ManageAddresses;