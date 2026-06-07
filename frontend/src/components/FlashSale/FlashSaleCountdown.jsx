// frontend/src/components/FlashSale/FlashSaleCountdown.jsx
import React, { useState, useEffect, useRef } from 'react';

const FlashSaleCountdown = ({ endTime, onExpire, showLabel = false }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isEnded, setIsEnded] = useState(false);
    const hasCalledOnExpire = useRef(false);

    useEffect(() => {
        hasCalledOnExpire.current = false;
        
        const calculateTimeLeft = () => {
            const difference = new Date(endTime) - new Date();
            
            if (difference <= 0) {
                setIsEnded(true);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                // Call onExpire only once
                if (onExpire && !hasCalledOnExpire.current) {
                    hasCalledOnExpire.current = true;
                    setTimeout(onExpire, 1000); // Delay to allow UI update
                }
                return;
            }

            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [endTime, onExpire]);

    if (isEnded) {
        return (
            <div className="text-yellow-300 font-bold text-sm animate-pulse">
                ⏰ Đã kết thúc
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {showLabel && <span className="text-sm font-medium text-white/80">Còn:</span>}
            <div className="flex gap-1 items-center">
                {timeLeft.days > 0 && (
                    <>
                        <TimeBox value={timeLeft.days} label="ngày" />
                        <span className="text-xl font-bold text-white">:</span>
                    </>
                )}
                <TimeBox value={String(timeLeft.hours).padStart(2, '0')} />
                <span className="text-sm font-extrabold text-red-500/80">:</span>
                <TimeBox value={String(timeLeft.minutes).padStart(2, '0')} />
                <span className="text-sm font-extrabold text-red-500/80">:</span>
                <TimeBox value={String(timeLeft.seconds).padStart(2, '0')} />
            </div>
        </div>
    );
};

const TimeBox = ({ value, label }) => (
    <div className="bg-red-500/10 border border-red-500/20 text-red-500 font-black text-sm md:text-base px-2.5 py-1 rounded-xl min-w-[32px] md:min-w-[38px] text-center shadow-sm">
        {value}
        {label && <span className="text-[9px] block font-bold uppercase">{label}</span>}
    </div>
);

export default FlashSaleCountdown;
