// frontend/src/components/common/Calendar.jsx
import React from 'react';
import Flatpickr from 'react-flatpickr';
// Import CSS của Flatpickr (Nếu bạn chưa import ở index.js/App.js thì giữ dòng này)
import "flatpickr/dist/themes/material_blue.css"; 
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"; // Import tiếng Việt cho lịch

const Calendar = ({
    value,
    onChange,
    disabled = false,
    label = "Chọn thời gian",
    enableTime = false, // True: Chọn Ngày + Giờ | False: Chỉ Ngày
    placeholder = "Chọn..."
}) => {
    return (
        <div className="space-y-2 w-full">
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
                        // Trả về chuỗi ISO (2023-11-20T14:30:00.000Z) để Backend dễ xử lý
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
                        dateFormat: enableTime ? "d/m/Y H:i" : "d/m/Y", // Hiển thị kiểu Việt Nam
                        enableTime: enableTime,
                        time_24hr: true,
                        disableMobile: "true",
                        allowInput: true,
                        locale: Vietnamese // Set tiếng Việt
                    }}
                    placeholder={placeholder}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    {enableTime ? <Clock size={18} /> : <CalendarIcon size={18} />}
                </div>
            </div>
        </div>
    );
};

export default Calendar;