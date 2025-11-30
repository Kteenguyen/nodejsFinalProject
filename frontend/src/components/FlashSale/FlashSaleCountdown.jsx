// frontend/src/components/FlashSale/FlashSaleCountdown.jsx
import React, { useState, useEffect } from 'react';

const FlashSaleCountdown = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(endTime) - new Date();
            
            if (difference <= 0) {
                setIsEnded(true);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    if (isEnded) {
        return (
            <div className="text-red-600 font-bold text-sm">
                ⏰ Đã kết thúc
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Kết thúc sau:</span>
            <div className="flex gap-1">
                <TimeBox value={String(timeLeft.hours).padStart(2, '0')} />
                <span className="text-xl font-bold text-red-600">:</span>
                <TimeBox value={String(timeLeft.minutes).padStart(2, '0')} />
                <span className="text-xl font-bold text-red-600">:</span>
                <TimeBox value={String(timeLeft.seconds).padStart(2, '0')} />
            </div>
        </div>
    );
};

const TimeBox = ({ value }) => (
    <div className="bg-black text-white font-bold text-lg px-2 py-1 rounded min-w-[40px] text-center">
        {value}
    </div>
);

export default FlashSaleCountdown;
