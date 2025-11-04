// frontend/src/pages/RegisterAddress.jsx
import { useNavigate } from "react-router-dom";
import AddressForm from "../components/Home/AddressForm"; // 👈 SỬ DỤNG COMPONENT CỦA FEN
import { AuthController } from "../controllers/AuthController";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth để lấy thông tin user
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterAddress = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Lấy thông tin user (đã login)

    // === TOÀN BỘ STATE ĐƯỢC QUẢN LÝ Ở TRANG CHA ===

    // State cho form (Họ tên, SĐT)
    const [fullName, setFullName] = useState(user?.name || ""); // Lấy sẵn tên user
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || ""); // Lấy sẵn SĐT

    // State cho AddressForm (Tỉnh/Quận/Phường/Chi tiết/Mặc định)
    const [addressDetail, setAddressDetail] = useState("");
    const [isDefault, setIsDefault] = useState(true);

    // State cho data Tỉnh/Quận/Phường
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // State lưu lựa chọn (lưu cả code và tên)
    const [selectedProvince, setSelectedProvince] = useState({ code: null, name: "" });
    const [selectedDistrict, setSelectedDistrict] = useState({ code: null, name: "" });
    const [selectedWard, setSelectedWard] = useState({ code: null, name: "" });

    const [isLoading, setIsLoading] = useState(false);

    // --- EFFECT: Tải Tỉnh/Thành khi component mount ---
    useEffect(() => {
        const loadProvinces = async () => {
            setIsLoading(true);
            try {
                const data = await AuthController.getProvinces();
                setProvinces(data);
            } catch (err) {
                toast.error(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadProvinces();
    }, []);

    // --- EFFECT: Tải Quận/Huyện khi Tỉnh thay đổi ---
    useEffect(() => {
        const loadDistricts = async () => {
            if (selectedProvince.code) {
                setIsLoading(true);
                setDistricts([]); // Reset districts
                setWards([]);     // Reset wards
                setSelectedDistrict({ code: null, name: "" });
                setSelectedWard({ code: null, name: "" });

                try {
                    const data = await AuthController.getDistricts(selectedProvince.code);
                    setDistricts(data);
                } catch (err) {
                    toast.error(err.message);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadDistricts();
    }, [selectedProvince.code]);

    // --- EFFECT: Tải Phường/Xã khi Quận thay đổi ---
    useEffect(() => {
        const loadWards = async () => {
            if (selectedDistrict.code) {
                setIsLoading(true);
                setWards([]); // Reset wards
                setSelectedWard({ code: null, name: "" });

                try {
                    const data = await AuthController.getWards(selectedDistrict.code);
                    setWards(data);
                } catch (err) {
                    toast.error(err.message);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadWards();
    }, [selectedDistrict.code]);

    // --- Xử lý Lưu địa chỉ ---
    const handleSaveAddress = async (e) => {
        e.preventDefault();

        if (!fullName || !phoneNumber || !addressDetail || !selectedProvince.code || !selectedDistrict.code || !selectedWard.code) {
            toast.error("Vui lòng điền đầy đủ thông tin giao hàng.");
            return;
        }

        setIsLoading(true);
        try {
            const addressData = {
                recipientName: fullName,
                phoneNumber: phoneNumber,
                street: addressDetail,
                ward: selectedWard.name,
                district: selectedDistrict.name,
                city: selectedProvince.name,
                isDefault: isDefault
            };

            await AuthController.addShippingAddress(addressData);

            toast.success("Đã thêm địa chỉ mới!");
            setTimeout(() => navigate("/"), 1500); // 👈 Chuyển về TRANG CHỦ

        } catch (error) {
            toast.error(error.message);
            setIsLoading(false);
        }
    };

    // --- Bỏ qua và về trang chủ ---
    const handleSkip = () => {
        navigate("/"); // 👈 Chuyển về TRANG CHỦ
    };

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">
            <ToastContainer autoClose={2000} position="top-right" />

            {/* 👈 HÌNH BÊN TRÁI (GIỐNG TRANG REGISTER) */}
            <div className="hidden md:flex w-1/2 bg-[#f3f5ff] items-center justify-center relative">
                <img
                    src="/img/illustration.svg"
                    alt="Address Illustration"
                    className="max-w-md w-4/5"
                    onError={(e) => (e.target.src = "/img/default-illustration.svg")}
                />
                <div className="absolute top-6 left-6 flex items-center space-x-2">
                    <img src="/img/logo.svg" alt="Logo" className="h-24 w-auto" />
                </div>
            </div>

            {/* FORM NẰM BÊN PHẢI (CHO PHÉP CUỘN) */}
            <div className="flex flex-col justify-start items-center w-full md:w-1/2 px-8 py-10 overflow-y-auto">
                <div className="max-w-lg w-full">

                    {/* Header */}
                    <div className="text-center mb-6">
                        <img src="/img/logo.svg" alt="Logo" className="md:hidden h-24 w-auto mx-auto mb-2" />
                        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
                            Địa chỉ giao hàng
                        </h2>
                        <p className="text-gray-600">
                            Thêm địa chỉ để chúng tôi giao hàng nhanh hơn. (Có thể bỏ qua)
                        </p>
                    </div>

                    <form onSubmit={handleSaveAddress} className="space-y-4">
                        {/* Họ tên và SĐT (Nằm ngoài AddressForm) */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label htmlFor="fullName" className="block text-sm font-medium mb-1">Họ và tên người nhận</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    required
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">Số điện thoại</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Ví dụ: 0912345678"
                                    required
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* 👈 TRUYỀN PROPS VÀO ADDRESSFORM.JSX */}
                        <AddressForm
                            provinces={provinces}
                            districts={districts}
                            wards={wards}

                            selectedProvince={selectedProvince}
                            onProvinceChange={(code, name) => setSelectedProvince({ code, name })}

                            selectedDistrict={selectedDistrict}
                            onDistrictChange={(code, name) => setSelectedDistrict({ code, name })}

                            selectedWard={selectedWard}
                            onWardChange={(code, name) => setSelectedWard({ code, name })}

                            addressDetail={addressDetail}
                            onAddressDetailChange={setAddressDetail}

                            isDefault={isDefault}
                            onIsDefaultChange={setIsDefault}

                            isLoading={isLoading}
                        />

                        {/* Nút bấm */}
                        <div className="mt-8 flex flex-col gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white rounded-md py-3 font-medium hover:bg-blue-700 transition disabled:bg-blue-300"
                            >
                                {isLoading ? "Đang lưu..." : "Lưu địa chỉ"}
                            </button>
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="w-full bg-gray-100 text-gray-700 rounded-md py-3 font-medium hover:bg-gray-200 transition"
                            >
                                Bỏ qua, về trang chủ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterAddress;