// src/components/Checkout/AddressForm.jsx
import React, { useEffect, useState } from 'react';

const AddressForm = ({ address, setAddress }) => {
    // State lưu danh sách từ API
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // 1. Tải danh sách Tỉnh/Thành
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                // Dùng fetch thay vì axios
                const response = await fetch("https://provinces.open-api.vn/api/?depth=1");
                const data = await response.json();
                setProvinces(data);
            } catch (error) {
                console.error("Lỗi tải danh sách tỉnh:", error);
            }
        };
        fetchProvinces();
    }, []);

    // 2. Xử lý khi chọn Tỉnh -> Tải Huyện
    const handleProvinceChange = async (e) => {
        const provinceCode = e.target.value;
        const selectedProvince = provinces.find(p => p.code == provinceCode);
        
        setAddress(prev => ({ 
            ...prev, 
            city: selectedProvince ? selectedProvince.name : "", 
            district: "", 
            ward: "" 
        }));
        
        setDistricts([]);
        setWards([]);

        if (provinceCode) {
            try {
                const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
                const data = await response.json();
                setDistricts(data.districts);
            } catch (error) { console.error("Lỗi tải huyện:", error); }
        }
    };

    // 3. Xử lý khi chọn Huyện -> Tải Xã
    const handleDistrictChange = async (e) => {
        const districtCode = e.target.value;
        const selectedDistrict = districts.find(d => d.code == districtCode);

        setAddress(prev => ({ 
            ...prev, 
            district: selectedDistrict ? selectedDistrict.name : "", 
            ward: "" 
        }));
        
        setWards([]);

        if (districtCode) {
            try {
                const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
                const data = await response.json();
                setWards(data.wards);
            } catch (error) { console.error("Lỗi tải xã:", error); }
        }
    };

    // 4. Xử lý khi chọn Xã
    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const selectedWard = wards.find(w => w.code == wardCode);
        
        setAddress(prev => ({ 
            ...prev, 
            ward: selectedWard ? selectedWard.name : "" 
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-4">
            {/* Họ tên */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                <input 
                    type="text" name="name" value={address.name} onChange={handleChange}
                    placeholder="Vui lòng nhập tên người nhận" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* SĐT & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                    <input 
                        type="tel" name="phone" value={address.phone} onChange={handleChange}
                        placeholder="Nhập số điện thoại" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input 
                        type="email" name="email" value={address.email} onChange={handleChange}
                        placeholder="Nhập email của bạn" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Địa chỉ hành chính (Tự động từ API) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Tỉnh/Thành */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                    <select 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-blue-500"
                        onChange={handleProvinceChange}
                        defaultValue="" 
                    >
                        <option value="" disabled>-- Chọn Tỉnh --</option>
                        {provinces.map(p => (
                            <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                    </select>
                    {address.city && <p className="text-xs text-blue-600 mt-1">Đã chọn: {address.city}</p>}
                </div>

                {/* Quận/Huyện */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện <span className="text-red-500">*</span></label>
                    <select 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-blue-500 disabled:bg-gray-100"
                        onChange={handleDistrictChange}
                        disabled={districts.length === 0}
                        defaultValue=""
                    >
                        <option value="" disabled>-- Chọn Quận --</option>
                        {districts.map(d => (
                            <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                    </select>
                    {address.district && <p className="text-xs text-blue-600 mt-1">Đã chọn: {address.district}</p>}
                </div>

                {/* Phường/Xã */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã <span className="text-red-500">*</span></label>
                    <select 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-blue-500 disabled:bg-gray-100"
                        onChange={handleWardChange}
                        disabled={wards.length === 0}
                        defaultValue=""
                    >
                        <option value="" disabled>-- Chọn Phường --</option>
                        {wards.map(w => (
                            <option key={w.code} value={w.code}>{w.name}</option>
                        ))}
                    </select>
                    {address.ward && <p className="text-xs text-blue-600 mt-1">Đã chọn: {address.ward}</p>}
                </div>
            </div>

            {/* Địa chỉ cụ thể */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                <input 
                    type="text" name="fullAddress" value={address.fullAddress} onChange={handleChange}
                    placeholder="Số nhà, tên đường, tòa nhà..." 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
        </div>
    );
};

export default AddressForm;