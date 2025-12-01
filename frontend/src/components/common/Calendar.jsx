import React from 'react';
import Flatpickr from 'react-flatpickr';
import "flatpickr/dist/themes/material_blue.css"; 
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"; 

const Calendar = ({
    value,
    onChange,
    disabled = false,
    label, // 👈 Đã bỏ giá trị mặc định "Chọn thời gian"
    enableTime = false, 
    placeholder = "Chọn thời gian...",
    rightContent = null // Hỗ trợ render content bên phải (như badge tuổi)
}) => {
    return (
        <div className="space-y-2 w-full">
            {/* Chỉ hiển thị label khi có props truyền vào */}
            {label && (
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {enableTime ? <Clock size={16} className="text-blue-600"/> : <CalendarIcon size={16} />}
                    {label}
                </label>
            )}
            
            <div className="relative">
                <Flatpickr
                    value={value}
                    onChange={([date]) => {
                        onChange(date ? date.toISOString() : "");
                    }}
                    disabled={disabled}
                    className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none
                        ${disabled
                            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer'
                        }
                    `}
                    options={{
                        dateFormat: enableTime ? "d/m/Y H:i" : "d/m/Y",
                        enableTime: enableTime,
                        time_24hr: true,
                        disableMobile: "true",
                        allowInput: true,
                        locale: Vietnamese
                    }}
                    placeholder={placeholder}
                />

                {/* Icon mặc định bên phải (nếu không có rightContent) */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 z-0">
                    {enableTime ? <Clock size={18} /> : <CalendarIcon size={18} />}
                </div>

                {/* Content tùy chỉnh bên phải (ví dụ: Badge tuổi) */}
                {rightContent && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                        {rightContent}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;