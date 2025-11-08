// frontend/src/pages/RegisterAddress.jsx
import { useNavigate } from "react-router-dom";
import AddressForm from "../components/Home/AddressForm";
// 1. Thêm UserController và useCallback
import { AuthController } from "../controllers/AuthController"; 
import { UserController } from "../controllers/userController"; 
import { useState, useEffect, useCallback } from "react"; 
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const RegisterAddress = () => {
    const navigate = useNavigate();
    const { user, checkAuthStatus } = useAuth(); // Thêm checkAuthStatus để refresh user sau khi lưu
    
    // === TOÀN BỘ STATE ĐƯỢC QUẢN LÝ Ở TRANG CHA ===

    // State cho form (Họ tên, SĐT)
    const [fullName, setFullName] = useState(user?.name || "");
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");

    // State cho AddressForm (Tỉnh/Quận/Phường/Chi tiết/Mặc định)
    const [addressDetail, setAddressDetail] = useState("");
    const [isDefault, setIsDefault] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // State cho data Tỉnh/Quận/Phường
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // State lưu object { code, name } của lựa chọn hiện tại
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);


    // ===================================================
    // 2. LOGIC GỌI API ĐỂ LẤY TỈNH/THÀNH PHỐ
    // ===================================================

    // 👉 2.1. Lấy danh sách Tỉnh/Thành phố (Chỉ gọi 1 lần khi component mount)
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                // Đảm bảo UserController đã được import đúng
                const data = await UserController.getProvinces(); 
                setProvinces(data);
            } catch (error) {
                // Lỗi đã được xử lý trong UserController (có toast.error)
            }
        };
        fetchProvinces();
    }, []);

    // 👉 2.2. Lấy danh sách Quận/Huyện (Gọi khi selectedProvince thay đổi)
    useEffect(() => {
        const fetchDistricts = async () => {
            if (!selectedProvince) {
                setDistricts([]);
                setSelectedDistrict(null);
                return;
            }
            try {
                // Sử dụng ProvinceID (Code) của Tỉnh đã chọn để gọi API
                const data = await UserController.getDistricts(selectedProvince.code);
                setDistricts(data);
                // Reset Quận/Huyện và Phường/Xã khi Tỉnh thay đổi
                setSelectedDistrict(null);
                setSelectedWard(null); 
            } catch (error) {
                // Xử lý lỗi
            }
        };
        fetchDistricts();
    }, [selectedProvince]); // Dependency: selectedProvince


    // 👉 2.3. Lấy danh sách Phường/Xã (Gọi khi selectedDistrict thay đổi)
    useEffect(() => {
        const fetchWards = async () => {
            if (!selectedDistrict) {
                setWards([]);
                setSelectedWard(null);
                return;
            }
            try {
                // Sử dụng DistrictID (Code) của Huyện đã chọn để gọi API
                const data = await UserController.getWards(selectedDistrict.code);
                setWards(data);
                setSelectedWard(null); // Reset Phường/Xã khi Huyện thay đổi
            } catch (error) {
                // Xử lý lỗi
            }
        };
        fetchWards();
    }, [selectedDistrict]); // Dependency: selectedDistrict

    // ===================================================
    // 3. HÀM XỬ LÝ SUBMIT VÀ ĐIỀU HƯỚNG
    // ===================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra validation
        if (!fullName || !phoneNumber || !addressDetail || !selectedProvince || !selectedDistrict || !selectedWard) {
            toast.error("Vui lòng điền đầy đủ thông tin địa chỉ.");
            return;
        }

        setIsLoading(true);

        const addressData = {
            fullName,
            phoneNumber,
            address: addressDetail,
            city: selectedProvince.name, // Tên Tỉnh/Thành
            district: selectedDistrict.name, // Tên Quận/Huyện
            ward: selectedWard.name, // Tên Phường/Xã
            isDefault,
        };

        try {
            await AuthController.addShippingAddress(addressData); // Sử dụng hàm đã có
            toast.success("Đã lưu địa chỉ mặc định!");
            await checkAuthStatus(); // Tải lại thông tin user để đảm bảo data mới nhất
            navigate("/"); // Quay về trang chủ
        } catch (error) {
            // Lỗi đã được xử lý trong controller
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        navigate("/");
    };

    // ===================================================
    // 4. TRẢ VỀ UI (GIỮ NGUYÊN)
    // ===================================================
    
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-lg">
                <div className="bg-white p-8 rounded-lg shadow-xl">
                    <h2 className="text-2xl font-bold text-center text-text-primary mb-4">
                        Thiết lập địa chỉ giao hàng
                    </h2>
                    <p className="text-center text-gray-500 mb-6">
                        Vui lòng thêm địa chỉ mặc định để tiếp tục.
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* Input Họ tên */}
                        <div className="mb-4">
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Họ và tên</label>
                            <input
                                id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập họ và tên"
                                required
                            />
                        </div>

                        {/* Input SĐT */}
                        <div className="mb-4">
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                            <input
                                id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập số điện thoại"
                                required
                            />
                        </div>

                        {/* Component AddressForm (Đã có sẵn logic render Selects) */}
                        <AddressForm
                            provinces={provinces}
                            selectedProvince={selectedProvince}
                            onProvinceChange={(code, name) => setSelectedProvince({ code, name })}

                            districts={districts}
                            selectedDistrict={selectedDistrict}
                            onDistrictChange={(code, name) => setSelectedDistrict({ code, name })}

                            wards={wards}
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
                                disabled={isLoading || !selectedProvince || !selectedDistrict || !selectedWard} // Thêm điều kiện disable khi chưa chọn đủ
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
            <ToastContainer />
        </div>
    );
};

export default RegisterAddress;