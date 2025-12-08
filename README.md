# Website Đặt Bàn Nhà Hàng Ratatouille

Hệ thống web hỗ trợ khách hàng **đặt bàn tại nhà hàng Ratatouille**, chọn menu món ăn trước, theo dõi trạng thái thanh toán; đồng thời cung cấp giao diện **admin** để quản lý món ăn, danh mục, sơ đồ bàn, danh sách đặt bàn và lịch sử thanh toán.

Ngoài chức năng chia sẻ công thức, dự án đã được mở rộng thành một hệ thống **đặt bàn + quản lý thực đơn** với kiến trúc microservices.

## Tính năng chính

- **Đối với khách hàng**
  - Đăng ký / đăng nhập tài khoản.
  - Đặt bàn theo chi nhánh, ngày, giờ, số khách, loại bàn.
  - Chọn menu món ăn cho từng booking, chỉnh số lượng, ghi chú.
  - Xem lịch sử đặt bàn, trạng thái thanh toán.

- **Đối với admin**
  - Quản lý món ăn (recipes) và danh mục (categories).
  - Quản lý sơ đồ bàn theo chi nhánh (tables).
  - Xem, lọc, tìm kiếm danh sách đặt bàn.
  - Đánh dấu đã thanh toán, xử lý yêu cầu hủy, xóa booking.
  - Theo dõi lịch sử thanh toán qua payment-service.

- **Cơ chế giữ bàn 15 phút sau khi chốt menu**
  - Sau khi khách chốt menu, hệ thống giữ bàn và giỏ món trong 15 phút.
  - Trong khoảng thời gian này, admin có thể đánh dấu đã thanh toán.
  - Nếu hết 15 phút chưa thanh toán, booking sẽ tự hủy và được ghi nhận là **quá hạn thanh toán**.

## Công nghệ sử dụng

### Frontend

- React.js
- React Router
- Fetch / Axios để gọi API
- Bootstrap / CSS thuần (tùy từng màn hình)

### Backend & Microservices

- Node.js + Express
- MongoDB Atlas
- Mongoose
- Bcrypt (xử lý mật khẩu người dùng)
- Kiến trúc microservices:
  - Backend monolith (auth, user, upload, blog,...)
  - Product-service (recipes, categories, comments, favorites)
  - Cart-service (giỏ món theo booking)
  - Order-service (bookings, tables, logic giữ bàn 15 phút)
  - Payment-service (payments, trạng thái SUCCESS/EXPIRED)

## Cấu trúc thư mục

```bash
Recipe_Website/
├── backend/                # Backend monolith (auth, user, blog, upload,...)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seeds/
│   ├── utils/
│   └── server/
│
├── frontend/               # Giao diện người dùng (React)
│   ├── public/
│   └── src/
│
├── microservices/          # Các service tách riêng cho đặt bàn
│   ├── product-service/    # Recipes, categories, comments, favorites
│   ├── cart-service/       # Giỏ món theo bookingId + userId
│   ├── order-service/      # Bookings, tables, logic giữ bàn 15 phút
│   └── payment-service/    # Payments, trạng thái SUCCESS / EXPIRED
│
├── docker-compose.yml      # (tuỳ chọn) cấu hình chạy nhiều service
├── package-lock.json
└── README.md
```

## Kiến trúc hệ thống

Hệ thống được tổ chức theo mô hình **microservices**, frontend giao tiếp với từng service qua REST API.

- **Client / Frontend (React)**
  - Giao diện đặt bàn, chọn menu, quản lý tài khoản, admin dashboard.
  - Gửi request trực tiếp tới backend, product-service, cart-service, order-service, payment-service (qua các URL cấu hình trong `.env`).

- **Backend (Monolith)**
  - Xử lý: đăng ký/đăng nhập, thông tin người dùng, upload ảnh, một số API cũ.
  - Kết nối MongoDB Atlas database: `Restaurant_Website`.

- **Product-service**
  - Quản lý: công thức (recipes), danh mục (categories), đánh giá/bình luận, yêu thích.
  - Database: `Restaurant_products`.

- **Cart-service**
  - Lưu tạm giỏ món của từng booking: `bookingId`, `userId`, `items[]`.
  - Database: `Restaurant_carts`.

- **Order-service**
  - Quản lý đặt bàn (bookings) và sơ đồ bàn (tables).
  - Chịu trách nhiệm logic **giữ bàn 15 phút sau khi chốt menu**:
    - Khi `confirm-menu`: tính tổng tiền, set `status = PENDING_PAYMENT`, `paymentStatus = PENDING`, `paymentExpiresAt = now + 15 phút`.
    - Job nền chạy mỗi phút: nếu đã quá `paymentExpiresAt` mà chưa thanh toán thì tự hủy booking và tạo bản ghi payment EXPIRED.
  - Database: `Restaurant_orders`.

- **Payment-service**
  - Lưu lịch sử thanh toán của từng booking.
  - API chính:
    - `POST /api/payments`: admin đánh dấu đã thanh toán → tạo `Payment` trạng thái `SUCCESS` và gọi order-service `mark-paid`.
    - `POST /api/payments/expired`: được order-service gọi khi đơn quá hạn 15 phút → tạo `Payment` trạng thái `EXPIRED`.
  - Database: `Restaurant_payments`.

**Luồng chính (tóm tắt):**

- Client → Backend: đăng ký/đăng nhập, user profile, upload.
- Client → Product-service: lấy danh sách món/danh mục, chi tiết recipe.
- Client → Cart-service: thêm/sửa/xóa món trong giỏ theo `bookingId`.
- Client → Order-service: tạo booking, chốt menu (`confirm-menu`), xem danh sách booking.
- Admin → Payment-service: đánh dấu đã thanh toán booking.
- Order-service ↔ Cart-service: đọc giỏ món khi chốt menu.
- Payment-service ↔ Order-service: cập nhật trạng thái booking sau thanh toán hoặc khi quá hạn.

## Thiết kế cơ sở dữ liệu (tóm tắt)

### Restaurant_orders

- **bookings**
  - Các trường chính:
    - `userId`, `date`, `time`, `numberOfGuests`
    - `branchId`, `branchName`, `tables[] { code, floorId, floorName }`
    - `items[] { productId, name, price, quantity, note }`
    - `basePrice`, `totalFoodPrice`, `totalPrice`
    - `status`: `PENDING_MENU | PENDING_PAYMENT | PAID | CANCELLED`
    - `paymentStatus`: `PENDING | PAID | EXPIRED`
    - `paymentExpiresAt`: thời điểm hết hạn giữ bàn (sau khi chốt menu 15 phút).

- **tables**
  - Lưu thông tin từng bàn: `code`, `branchId`, `floorId`, `capacity`, `minPrice`, `type`, `status`.

### Restaurant_carts

- **carts**
  - `bookingId`, `userId`.
  - `items[] { productId, name, price, quantity, note }` – giỏ món tạm thời cho bước chọn menu.

### Restaurant_payments

- **payments**
  - `bookingId`: tham chiếu tới booking.
  - `amount`: số tiền thanh toán.
  - `method`: phương thức (hiện tại giả lập `MOCK`).
  - `status`: `PENDING | SUCCESS | FAILED | EXPIRED`.
  - `transactionId`: mã giao dịch phục vụ tra cứu.
  - `createdAt`, `updatedAt`.

### Restaurant_products

- `recipes`: công thức món ăn (tên, mô tả, giá, hình ảnh, danh mục,...).
- `categories`: danh mục món.
- (có thể có) `comments`, `favorites`, `ratings`.

### Restaurant_Website

- `users`: thông tin tài khoản người dùng và admin.

**Quan hệ chính giữa các collection:**

- `users._id` (Restaurant_Website) ↔ `bookings.userId` (Restaurant_orders).
- `bookings._id` (Restaurant_orders) ↔ `carts.bookingId` (Restaurant_carts), `payments.bookingId` (Restaurant_payments).
- `recipes._id` (Restaurant_products) ↔ `bookings.items[].productId` và `carts.items[].productId`.

## Chạy và cài đặt dự án

git clone https://github.com/WebsiteRatatouille/Recipe_Website.git
cd recipe_website

### Cài đặt backend
```bash
cd backend 
npm install 
npm run dev 
```
### Cài đặt frontend
```bash
cd frontend 
npm install 
npm start
```

## Thành viên thực hiện
```bash
Họ tên Mã sinh viên Lớp 
Nguyễn Đức Lộc N22DCCN150 D22CQCN02-N 
Nguyễn Hữu Huynh N22DCCN135 D22CQCN02-N 
Mai Vũ Tuấn Minh N22DCCN152 D22CQCN02-N 
```
## Ghi chú

Đây là đồ án môn học nhằm rèn luyện kỹ năng fullstack web development
