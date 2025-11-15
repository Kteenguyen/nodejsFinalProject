// src/components/common/Calendar.jsx
import React from 'react';
import Flatpickr from 'react-flatpickr';
import { Calendar as CalendarIcon } from 'lucide-react';

const Calendar = ({
    value,
    onChange,
    disabled,
    label = "Ngày sinh",
    rightContent = null // 👈 Nhận giao diện từ bên ngoài (Badge tuổi hoặc Icon)
}) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <CalendarIcon size={16} />
                {label}
            </label>
            <div className="relative">
                <Flatpickr
                    value={value}
                    onChange={([date]) => {
                        onChange(date ? date.toISOString() : null);
                    }}
                    disabled={disabled}
                    className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none
                        ${disabled
                            ? 'bg-gray-50 border-gray-200 text-text-secondary cursor-not-allowed'
                            : 'bg-white border-gray-300 text-text-primary focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer'
                        }
                    `}
                    options={{
                        dateFormat: "d/m/Y",
                        maxDate: "today",
                        disableMobile: "true",
                        allowInput: true,
                        locale: { firstDayOfWeek: 1 }
                    }}
                    placeholder="Chọn ngày sinh"
                />

                {/* Hiển thị nội dung góc phải (đã thêm pointer-events-none để click xuyên qua) */}
                {rightContent && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                        {rightContent}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;