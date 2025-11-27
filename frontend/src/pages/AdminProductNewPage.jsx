// src/pages/AdminProductNewPage.jsx
import { useState, useEffect } from "react"; // Thêm useEffect
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = "https://localhost:3001/api";

const emptyVariant = () => ({
  variantId: "",
  name: "",
  price: 0,
  stock: 0,
});

export default function AdminProductNewPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // State cho danh mục
  const [categories, setCategories] = useState([]);
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Khởi tạo state
  const [product, setProduct] = useState({
    productName: "",
    productId: "",
    brand: "",
    category: { categoryId: "", name: "" },
    description: "",
    images: ["", "", ""],
    variants: [emptyVariant()],
  });

  // 1. Load danh sách Category khi vào trang
  useEffect(() => {
    axios.get(`${API_BASE}/products/categories`)
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      })
      .catch((err) => console.error("Lỗi load category", err));
  }, []);

  const updateField = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const updateCategoryName = (value) => {
    setProduct((prev) => ({
      ...prev,
      category: { ...(prev.category || {}), name: value },
    }));
  };

  // Xử lý khi chọn Dropdown danh mục
  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (val === "NEW") {
      setIsNewCategory(true);
      setProduct((prev) => ({
        ...prev,
        category: { categoryId: "", name: "" },
      }));
    } else {
      setIsNewCategory(false);
      const selected = categories.find((c) => c.id === val);
      if (selected) {
        setProduct((prev) => ({
          ...prev,
          category: { categoryId: selected.id, name: selected.name },
        }));
      } else {
        // Trường hợp reset về rỗng
        setProduct((prev) => ({
          ...prev,
          category: { categoryId: "", name: "" },
        }));
      }
    }
  };

  // --- Xử lý Ảnh ---
  const handleImageChange = (index, value) => {
    const newImages = [...product.images];
    newImages[index] = value;
    setProduct((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setProduct((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index) => {
    setProduct((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: newImages };
    });
  };

  // --- Xử lý Biến thể ---
  const updateVariantField = (index, field, value) => {
    setProduct((prev) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, variants };
    });
  };

  const addVariant = () => {
    setProduct((prev) => ({
      ...prev,
      variants: [...prev.variants, emptyVariant()],
    }));
  };

  const removeVariant = (index) => {
    setProduct((prev) => {
      const variants = prev.variants.filter((_, i) => i !== index);
      return { ...prev, variants: variants.length ? variants : [emptyVariant()] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.productName.trim()) return toast.error("Thiếu tên sản phẩm.");
    if (!product.productId.trim()) return toast.error("Thiếu mã sản phẩm.");
    if (!product.variants.length) return toast.error("Cần ít nhất 1 biến thể.");

    const validImages = product.images.filter((img) => img && img.trim() !== "");
    if (validImages.length < 3) {
      toast.warning("Nên có ít nhất 3 ảnh minh họa để đạt điểm tối đa.");
    }

    try {
      setSaving(true);

      // Xử lý Category ID tự động nếu nhập mới
      const catName = product.category?.name?.trim() || "Uncategorized";
      let catId = product.category?.categoryId?.trim();
      
      // Nếu là category mới hoặc chưa có ID -> tự tạo ID
      if (!catId || isNewCategory) {
        catId = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
      }

      const payload = {
        productId: product.productId.trim(),
        productName: product.productName.trim(),
        brand: product.brand?.trim() || "",
        productDescription: product.description || "",
        category: {
          categoryId: catId,
          categoryName: catName,
        },
        images: validImages,
        variants: product.variants.map((v) => ({
          variantId: v.variantId.trim() || `v-${Date.now()}`,
          name: v.name.trim(),
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
        })),
        status: 'available',
        isNewProduct: true
      };

      await axios.post(`${API_BASE}/products`, payload, { withCredentials: true });
      toast.success("Tạo sản phẩm thành công");
      navigate("/admin/products");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Lỗi tạo sản phẩm";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-sm mt-4 rounded">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Thêm sản phẩm mới</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin chung */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={product.productName}
              onChange={(e) => updateField("productName", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã sản phẩm (ID) *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={product.productId}
              onChange={(e) => updateField("productId", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={product.brand}
              onChange={(e) => updateField("brand", e.target.value)}
            />
          </div>
          
          {/* --- KHU VỰC DANH MỤC ĐÃ SỬA ĐỔI --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            {!isNewCategory ? (
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                onChange={handleCategorySelect}
                value={product.category?.categoryId || ""}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="NEW" className="font-bold text-blue-600 bg-blue-50">
                  + Tạo danh mục mới...
                </option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nhập tên danh mục mới..."
                  value={product.category?.name || ""}
                  onChange={(e) => updateCategoryName(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsNewCategory(false)}
                  className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
          {/* ----------------------------------- */}
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 outline-none"
            value={product.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        {/* Quản lý ảnh */}
        <div className="border p-4 rounded bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-bold text-gray-700">Hình ảnh sản phẩm (URL)</label>
            <button
              type="button"
              onClick={addImageField}
              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
            >
              + Thêm dòng ảnh
            </button>
          </div>
          <div className="space-y-2">
            {product.images.map((imgUrl, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  value={imgUrl}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeImageField(idx)}
                  className="text-red-500 hover:text-red-700 font-bold px-2"
                >
                  ✕
                </button>
              </div>
            ))}
            <p className="text-xs text-gray-500 mt-1 italic">
              * Nhập đường dẫn ảnh (URL) từ internet. Cần tối thiểu 3 ảnh.
            </p>
          </div>
        </div>

        {/* Biến thể */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Biến thể & Tồn kho</h2>
            <button
              type="button"
              onClick={addVariant}
              className="px-3 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200"
            >
              + Thêm biến thể
            </button>
          </div>

          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2 border-b">Tên biến thể</th>
                  <th className="px-3 py-2 border-b">Mã (SKU)</th>
                  <th className="px-3 py-2 border-b">Giá (VNĐ)</th>
                  <th className="px-3 py-2 border-b">Kho</th>
                  <th className="px-3 py-2 border-b text-center">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="p-2">
                      <input
                        className="w-full border rounded px-2 py-1"
                        value={v.name}
                        onChange={(e) => updateVariantField(idx, "name", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className="w-full border rounded px-2 py-1"
                        value={v.variantId}
                        onChange={(e) => updateVariantField(idx, "variantId", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1"
                        value={v.price}
                        onChange={(e) => updateVariantField(idx, "price", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1"
                        value={v.stock}
                        onChange={(e) => updateVariantField(idx, "stock", e.target.value)}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="text-red-500 hover:underline"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nút Submit */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Đang xử lý..." : "Tạo sản phẩm"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Hủy bỏ
          </button>
        </div>
      </form>
    </div>
  );
}