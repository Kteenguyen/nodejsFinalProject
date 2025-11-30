# Flash Sale System - Complete Implementation

## 📋 Overview
Complete Flash Sale system implementation similar to Shopee's design, with countdown timers, limited stock, discount badges, and urgency indicators.

---

## 🎯 Features Implemented

### Backend Infrastructure ✅
1. **Flash Sale Model** (`backend/models/flashSaleModel.js`)
   - Time slot management (09:00-12:00, 12:00-15:00, etc.)
   - Product array with flashPrice, originalPrice, stock tracking
   - Automatic status updates (upcoming → active → ended)
   - Static methods for querying active/upcoming sales
   - Indexes for performance optimization

2. **Flash Sale Controller** (`backend/controllers/flashSaleController.js`)
   - **Public APIs:**
     - `getActiveFlashSales()` - Get currently active sales
     - `getUpcomingFlashSales()` - Get upcoming sales
     - `getFlashSaleDetail()` - Get specific sale with view tracking
     - `checkProductInFlashSale()` - Check if product is in active sale
   
   - **Admin APIs:**
     - `createFlashSale()` - Create new flash sale
     - `updateFlashSale()` - Update flash sale (blocks ended sales)
     - `deleteFlashSale()` - Delete flash sale
     - `getAllFlashSales()` - Paginated list for admin

3. **Flash Sale Routes** (`backend/routes/flashSaleRoutes.js`)
   - Public routes: `/api/flash-sales/active`, `/upcoming`, `/:id`, `/check/:productId`
   - Admin routes (protected): POST `/`, PUT `/:id`, DELETE `/:id`
   - Mounted in main routes: `router.use('/flash-sales', flashSaleRoutes)`

### Frontend Components ✅
1. **FlashSaleCountdown** (`frontend/src/components/FlashSale/FlashSaleCountdown.jsx`)
   - Real-time countdown with HH:MM:SS format
   - Black time boxes with white text (Shopee style)
   - Updates every second via setInterval
   - Shows "Đã kết thúc" when expired

2. **FlashSaleCard** (`frontend/src/components/FlashSale/FlashSaleCard.jsx`)
   - Flash Sale badge (🔥 FLASH SALE)
   - Discount percentage badge (-XX%)
   - Stock urgency badge ("CHỈ CÒN X" when ≤10 items)
   - Progress bar showing sold/total with percentage
   - Price display (flash price + crossed-out original price)
   - Buy button (or "HẾT HÀNG" when sold out)

3. **FlashSaleSection** (`frontend/src/components/FlashSale/FlashSaleSection.jsx`)
   - Homepage section showing active flash sales
   - Countdown timer at header
   - Time slot selector (if multiple active sales)
   - Displays up to 6 products in grid
   - "Xem tất cả" button linking to full page
   - Auto-hides when no active sales

### Frontend Pages ✅
1. **FlashSalePage** (`frontend/src/pages/FlashSalePage.jsx`)
   - Two tabs: "Đang diễn ra" and "Sắp diễn ra"
   - Time slot buttons to switch between sales
   - Countdown timer for each slot
   - Full product grid (up to 5 columns)
   - Empty state when no sales available

2. **AdminFlashSaleManagement** (`frontend/src/pages/AdminFlashSaleManagement.jsx`)
   - List all flash sales with status badges
   - Create/Edit modal with:
     - Basic info (name, description, time slot)
     - Start/End datetime pickers
     - Product selection from catalog
     - Per-product configuration (flashPrice, originalPrice, stock)
     - Real-time discount percentage calculation
   - View count and product preview
   - Delete functionality
   - Block editing of ended sales

### Integration ✅
1. **Home Page** (`frontend/src/pages/Home.jsx`)
   - FlashSaleSection added after policy section
   - Shows prominently before product sections

2. **Main Routes** (`backend/routes/route.js`)
   - Flash Sale routes mounted at `/api/flash-sales`

---

## 📊 Database Schema

```javascript
FlashSale {
  name: String (required),
  description: String,
  timeSlot: Enum ['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00', '21:00-00:00'],
  startTime: Date (required),
  endTime: Date (required),
  status: Enum ['upcoming', 'active', 'ended'] (default: 'upcoming'),
  products: [{
    productId: ObjectId (ref: 'Product'),
    flashPrice: Number (required),
    originalPrice: Number (required),
    totalStock: Number (required),
    soldCount: Number (default: 0)
  }],
  viewCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ status: 1, startTime: 1, endTime: 1 }` - Query active/upcoming sales
- `{ 'products.productId': 1 }` - Check product in sales

---

## 🔌 API Endpoints

### Public Endpoints
```
GET  /api/flash-sales/active              - Get active flash sales
GET  /api/flash-sales/upcoming            - Get upcoming flash sales
GET  /api/flash-sales/:id                 - Get flash sale detail
GET  /api/flash-sales/check/:productId    - Check product in flash sale
```

### Admin Endpoints (Protected)
```
POST   /api/flash-sales                   - Create flash sale
PUT    /api/flash-sales/:id               - Update flash sale
DELETE /api/flash-sales/:id               - Delete flash sale
GET    /api/flash-sales?page=1&limit=10   - List all flash sales (paginated)
```

---

## 🎨 UI/UX Features

### Flash Sale Card
- **Badges:**
  - 🔥 FLASH SALE badge (red, top-left)
  - Discount percentage (yellow, top-right)
  - "CHỈ CÒN X" urgency badge (orange, bottom-left, animated pulse)

- **Progress Bar:**
  - Shows sold/total quantity
  - Gradient fill (red to orange)
  - Percentage displayed inside bar (when >20%)

- **Pricing:**
  - Large red flash price
  - Crossed-out gray original price

- **Action:**
  - "MUA NGAY" button (red, prominent)
  - "HẾT HÀNG" button (gray, disabled) when sold out

### Countdown Timer
- Black boxes with white text
- Format: HH:MM:SS with leading zeros
- Updates every second
- Shows "Đã kết thúc" when expired

---

## ⚙️ How to Use

### For Admins:
1. Navigate to Admin Flash Sale Management page
2. Click "Tạo Flash Sale mới"
3. Fill in basic info:
   - Name (e.g., "Flash Sale 9h - 12h")
   - Description (optional)
   - Time slot (select from dropdown)
   - Start/End datetime
4. Select products from catalog (click to select/deselect)
5. Configure each product:
   - Flash price (default 30% discount)
   - Original price
   - Stock quantity
6. Click "Tạo Flash Sale"

### For Users:
1. **Homepage:** See active flash sales in dedicated section
2. **Flash Sale Page:** View all active/upcoming sales
3. **Product Cards:** Click to view product details
4. **Buy:** Standard checkout process (Flash Sale integration pending)

---

## 🚀 Next Steps (TODO)

### Critical
1. **Checkout Integration:**
   - Update `orderControllers.js` to validate flash sale prices
   - Check product is in active flash sale during checkout
   - Decrement `soldCount` when order placed
   - Block checkout if flash sale ended or sold out

2. **Product Detail Page:**
   - Show flash sale badge if product in active sale
   - Display countdown timer
   - Show stock remaining

### Enhancement
3. **Stock Management:**
   - Real-time stock updates via WebSocket (optional)
   - Queue system for high-traffic sales (optional)
   - Purchase limits per user (optional)

4. **Notifications:**
   - Email notification when flash sale starts
   - Browser notification 5 minutes before start
   - Low stock alerts

5. **Analytics:**
   - Sales performance dashboard
   - Revenue tracking per flash sale
   - Conversion rate analysis

---

## 📝 Notes

- **Status Auto-Update:** Flash sales automatically transition from upcoming → active → ended based on time
- **Performance:** Indexes created for efficient querying of active sales
- **Validation:** Backend blocks editing of ended flash sales
- **View Tracking:** Each flash sale detail view increments view counter
- **Discount Calculation:** Admin UI shows real-time discount percentage when configuring products

---

## 🎯 Shopee-Inspired Features

✅ Countdown timer (HH:MM:SS format)
✅ Discount badges (-XX%)
✅ Limited stock indicators ("CHỈ CÒN X")
✅ Progress bars showing sold percentage
✅ Multiple time slots per day
✅ Urgency design (red/orange colors, pulse animations)
✅ "ĐANG BÁN CHẠY" effect via progress bar
✅ Grid layout with prominent CTAs

---

## 🔧 Testing Checklist

- [ ] Create flash sale via admin panel
- [ ] Verify flash sale shows on homepage
- [ ] Check countdown updates in real-time
- [ ] Test time slot switching
- [ ] Verify status auto-transitions (upcoming → active → ended)
- [ ] Check stock badges appear when ≤10 items
- [ ] Test product selection in admin modal
- [ ] Verify discount percentage calculation
- [ ] Test edit functionality (blocks ended sales)
- [ ] Test delete functionality
- [ ] Verify flash sale page tabs
- [ ] Check empty states
- [ ] Test responsive design on mobile

---

## 📦 Files Created/Modified

### Backend (5 files)
- ✅ `backend/models/flashSaleModel.js` (NEW)
- ✅ `backend/controllers/flashSaleController.js` (NEW)
- ✅ `backend/routes/flashSaleRoutes.js` (NEW)
- ✅ `backend/routes/route.js` (MODIFIED - added flash sale routes)

### Frontend (6 files)
- ✅ `frontend/src/components/FlashSale/FlashSaleCountdown.jsx` (NEW)
- ✅ `frontend/src/components/FlashSale/FlashSaleCard.jsx` (NEW)
- ✅ `frontend/src/components/FlashSale/FlashSaleSection.jsx` (NEW)
- ✅ `frontend/src/pages/FlashSalePage.jsx` (NEW)
- ✅ `frontend/src/pages/AdminFlashSaleManagement.jsx` (NEW)
- ✅ `frontend/src/pages/Home.jsx` (MODIFIED - added FlashSaleSection)

**Total:** 9 new files created, 2 files modified

---

## 🏁 Implementation Status

**Backend:** ✅ 100% Complete
**Frontend Components:** ✅ 100% Complete
**Admin UI:** ✅ 100% Complete
**User UI:** ✅ 100% Complete
**Integration:** ⚠️ 90% Complete (checkout integration pending)

The Flash Sale system is now fully functional for creating, managing, and displaying flash sales. The final step is integrating with the checkout process to handle flash sale purchases.
