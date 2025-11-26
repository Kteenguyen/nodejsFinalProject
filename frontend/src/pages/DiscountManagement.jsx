import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api"; // Đảm bảo đường dẫn đúng tới file cấu hình axios

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal tạo mới
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form data khớp với discountControllers.js
  const [formData, setFormData] = useState({
    discountName: "",
    discountCode: "",
    percent: "",
    maxUses: "1"
  });

  // 1. Load danh sách mã
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      // Gọi GET /api/discounts (theo discountRoutes.js)
      const res = await api.get("/discounts"); 
      if (res.data.success) {
        setDiscounts(res.data.discounts);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // 2. Xử lý tạo mới
  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (!formData.discountName || !formData.percent) {
        return toast.warning("Vui lòng nhập tên và phần trăm giảm");
    }
    if (Number(formData.percent) < 0 || Number(formData.percent) > 100) {
        return toast.warning("Phần trăm phải từ 0 - 100");
    }
    if (Number(formData.maxUses) > 10) {
        return toast.warning("Giới hạn tối đa là 10 lần sử dụng (theo quy định BE)");
    }

    try {
      setCreating(true);
      // Gọi POST /api/discounts
      const res = await api.post("/discounts", {
          ...formData,
          percent: Number(formData.percent),
          maxUses: Number(formData.maxUses)
      });

      if (res.data.success) {
          toast.success(`Tạo mã thành công: ${res.data.discount.discountCode}`);
          setShowModal(false);
          setFormData({ discountName: "", discountCode: "", percent: "", maxUses: "1" }); // Reset form
          fetchDiscounts(); // Reload danh sách
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi tạo mã";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Mã Giảm Giá</h1>
            <p className="text-sm text-gray-500">Danh sách các chương trình khuyến mãi</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm font-medium transition-colors"
        >
          + Tạo mã mới
        </button>
      </div>

      {/* Danh sách Cards */}
      {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
      ) : discounts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-dashed">
              <p className="text-gray-500">Chưa có mã giảm giá nào.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discounts.map((d) => (
                <div key={d._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Mã Code</span>
                                <div className="text-xl font-mono font-bold text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded inline-block border border-blue-100">
                                    {d.discountCode}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-red-500">{d.percent}%</span>
                                <span className="text-xs text-gray-500 block">GIẢM</span>
                            </div>
                        </div>
                        
                        <h3 className="font-semibold text-gray-800 mt-4 text-lg line-clamp-1" title={d.discountName}>
                            {d.discountName}
                        </h3>
                        
                        {/* Thanh tiến độ sử dụng */}
                        <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Đã sử dụng</span>
                                <span className={`font-bold ${d.uses >= d.maxUses ? 'text-red-500' : 'text-green-600'}`}>
                                    {d.uses} / {d.maxUses}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full ${d.uses >= d.maxUses ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min((d.uses / d.maxUses) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                            <span>Ngày tạo: {new Date(d.createdAt).toLocaleDateString('vi-VN')}</span>
                            {d.uses >= d.maxUses && (
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">Hết lượt</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Modal Tạo mới */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg text-gray-800">Tạo mã giảm giá mới</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương trình *</label>
                    <input 
                        type="text" 
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="VD: Khuyến mãi mùa hè"
                        value={formData.discountName}
                        onChange={e => setFormData({...formData, discountName: e.target.value})}
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã Code (5 ký tự)</label>
                    <input 
                        type="text" 
                        className="w-full border rounded-lg px-3 py-2 uppercase font-mono tracking-wide focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Để trống sẽ tự tạo ngẫu nhiên"
                        maxLength={5}
                        value={formData.discountCode}
                        onChange={e => setFormData({...formData, discountCode: e.target.value.toUpperCase()})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Chỉ chấp nhận A-Z và 0-9.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mức giảm (%) *</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                min="0" max="100"
                                className="w-full border rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0-100"
                                value={formData.percent}
                                onChange={e => setFormData({...formData, percent: e.target.value})}
                            />
                            <span className="absolute right-3 top-2 text-gray-400 font-bold">%</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tối đa</label>
                        <input 
                            type="number" 
                            min="1" max="10"
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Max 10"
                            value={formData.maxUses}
                            onChange={e => setFormData({...formData, maxUses: e.target.value})}
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Tối đa 10 mã (theo BE)</p>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button 
                        type="button" 
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        type="submit" 
                        disabled={creating}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                    >
                        {creating ? "Đang tạo..." : "Xác nhận tạo"}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}