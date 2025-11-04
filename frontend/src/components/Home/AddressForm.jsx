// frontend/src/components/Home/AddressForm.jsx
// (Component này giờ chỉ làm nhiệm vụ hiển thị, toàn bộ logic nằm ở trang cha)

import { useState } from "react";

// (Component Toggle Switch giữ nguyên từ file gốc của fen)
const ToggleSwitch = ({ checked, onChange }) => {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors
                ${checked ? "bg-blue-600" : "bg-gray-300"}`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform
                    ${checked ? "translate-x-6" : "translate-x-1"}`}
            />
        </button>
    );
};

// === COMPONENT FORM ĐỊA CHỈ (ĐÃ SỬA) ===
// (Đây là "Controlled Component", nhận data và handlers từ props)
const AddressForm = ({
    // Data cho 3 dropdowns
    provinces = [],
    districts = [],
    wards = [],

    // State của Tỉnh
    selectedProvince,       // { code, name }
    onProvinceChange,       // (value, name) => {}

    // State của Quận
    selectedDistrict,       // { code, name }
    onDistrictChange,       // (value, name) => {}

    // State của Phường
    selectedWard,           // { code, name }
    onWardChange,           // (value, name) => {}

    // State của Chi tiết
    addressDetail,          // string
    onAddressDetailChange,  // (value) => {}

    // State của Mặc định
    isDefault,              // boolean
    onIsDefaultChange,      // (value) => {}

    // State loading (để vô hiệu hóa)
    isLoading = false
}) => {

    return (
        <div className="space-y-4">

            {/* 1. Tỉnh/Thành */}
            <div>
                <label htmlFor="province" className="block text-sm font-medium mb-1">Tỉnh / Thành phố</label>
                <select
                    id="province"
                    value={selectedProvince.code || ""}
                    onChange={(e) => onProvinceChange(
                        e.target.value,
                        e.target.options[e.target.selectedIndex].text
                    )}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading && provinces.length === 0}
                >
                    <option value="" disabled>-- Chọn Tỉnh/Thành --</option>
                    {provinces.map(p => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* 2. Quận/Huyện */}
            <div>
                <label htmlFor="district" className="block text-sm font-medium mb-1">Quận / Huyện</label>
                <select
                    id="district"
                    value={selectedDistrict.code || ""}
                    onChange={(e) => onDistrictChange(
                        e.target.value,
                        e.target.options[e.target.selectedIndex].text
                    )}
                    required
                    disabled={!selectedProvince.code || isLoading} // Vô hiệu hóa nếu chưa chọn Tỉnh
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                    <option value="" disabled>-- Chọn Quận/Huyện --</option>
                    {districts.map(d => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                </select>
            </div>

            {/* 3. Phường/Xã */}
            <div>
                <label htmlFor="ward" className="block text-sm font-medium mb-1">Phường / Xã</label>
                <select
                    id="ward"
                    value={selectedWard.code || ""}
                    onChange={(e) => onWardChange(
                        e.target.value,
                        e.target.options[e.target.selectedIndex].text
                    )}
                    required
                    disabled={!selectedDistrict.code || isLoading} // Vô hiệu hóa nếu chưa chọn Quận
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                    <option value="" disabled>-- Chọn Phường/Xã --</option>
                    {wards.map(w => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                </select>
            </div>

            {/* 4. Chi tiết địa chỉ */}
            <div>
                <label htmlFor="addressDetail" className="block text-sm font-medium mb-1">Số nhà, tên đường</label>
                <input
                    type="text"
                    id="addressDetail"
                    name="addressDetail"
                    value={addressDetail}
                    onChange={(e) => onAddressDetailChange(e.target.value)}
                    placeholder="Ví dụ: 123 Nguyễn Văn Cừ, Tòa nhà ABC"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* 5. Đặt làm mặc định */}
            <div className="flex items-center justify-between py-2">
                <label htmlFor="isDefault" className="text-sm font-medium">Đặt làm địa chỉ giao hàng mặc định</label>
                <ToggleSwitch
                    checked={isDefault}
                    onChange={onIsDefaultChange}
                />
            </div>
        </div>
    );
};

export default AddressForm;