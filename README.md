# Website Đặt Bàn Nhà Hàng Ratatouille

Hệ thống web hỗ trợ khách hàng **đặt bàn tại nhà hàng Ratatouille**, chọn menu món ăn trước, thanh toán trực tuyến qua **MoMo (sandbox)**, theo dõi trạng thái đơn; đồng thời cung cấp giao diện **admin** để quản lý món ăn, danh mục, sơ đồ bàn, danh sách đặt bàn và lịch sử thanh toán.

Ban đầu đây là website chia sẻ công thức nấu ăn, sau đó được mở rộng thành một hệ thống **đặt bàn + quản lý thực đơn + thanh toán online** với kiến trúc microservices.

## Tính năng chính

- **Đối với khách hàng**
  - Đăng ký / đăng nhập tài khoản (bao gồm đăng nhập Google).
  - Đặt bàn theo chi nhánh, ngày, giờ, số khách, tầng & bàn cụ thể.
  - Chọn trước **sản phẩm dịch vụ** của nhà hàng: món ăn, combo, set menu, phòng/bàn VIP...
  - Thanh toán trực tuyến bằng **MoMo sandbox** cho đơn đặt bàn và gói dịch vụ đã chọn.
  - Xem lịch sử đặt bàn và **lịch sử thanh toán của riêng mình** ở trang `/my-bookings` và `/my-payments`.
  - Tham khảo công thức món ăn, bài viết blog, lưu món yêu thích.

- **Đối với admin**
  - Quản lý món ăn (recipes) và danh mục (categories).
  - Quản lý sơ đồ bàn theo chi nhánh (tables).
  - Xem, lọc, tìm kiếm danh sách đặt bàn, xử lý yêu cầu hủy, xóa booking.
  - Theo dõi lịch sử thanh toán qua payment-service (không cần nhập tay, được cập nhật từ MoMo / job quá hạn).

> Trong hệ thống, “sản phẩm” được hiểu là **các món ăn, combo và gói dịch vụ ăn uống** (set menu, gói sinh nhật, phòng VIP…) tại nhà hàng. Người dùng có thể đặt bàn, chọn trước các sản phẩm dịch vụ này và thanh toán trực tuyến. Như vậy, hệ thống vẫn là một **nền tảng mua bán trực tuyến**, nhưng tập trung vào **dịch vụ nhà hàng** thay vì hàng hoá vật lý.

- **Cơ chế giữ bàn 15 phút sau khi chốt menu**
  - Sau khi khách chốt menu, order-service set `status = PENDING_PAYMENT`, `paymentStatus = PENDING` và `paymentExpiresAt = now + 15 phút`.
  - Nếu quá thời gian mà chưa thanh toán, **job nền của order-service** sẽ tự:
    - Gọi payment-service tạo bản ghi payment `EXPIRED`.
    - Cập nhật booking sang `status = CANCELLED`, `paymentStatus = EXPIRED`.

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
- Tích hợp **cổng thanh toán MoMo sandbox** trong payment-service.
- Kiến trúc microservices:
  - Backend monolith (auth, user, upload, blog,...)
  - Product-service (recipes, categories, comments, favorites)
  - Cart-service (giỏ món theo booking)
  - Order-service (bookings, tables, logic giữ bàn 15 phút)
  - Payment-service (payments, MoMo, lịch sử thanh toán)

## Cấu trúc thư mục

```bash
Restaurant_Website/
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

#### Phân loại "sản phẩm" trong hệ thống

Trong hệ thống, “sản phẩm” được hiểu theo nghĩa rộng là **các dịch vụ mà nhà hàng cung cấp**:

- **Dịch vụ chỗ ngồi** (bàn, phòng VIP…)
  - Có **giá tối thiểu** (`minPrice` / `basePrice`).
  - Được **quản lý theo thời gian thực** khi đặt bàn: giữ chỗ 15 phút, huỷ nếu quá hạn, cập nhật trạng thái bàn.

- **Dịch vụ ăn uống** (món, combo, set menu…)
  - Được lưu trong `product-service` dưới dạng `recipes`, `categories`, được dùng cho nhiều chức năng: trang công thức, blog, yêu thích, gợi ý món.

Về triển khai:

- **Món ăn** nằm trong **product-service** vì đây là **danh mục sản phẩm ăn uống** dùng lại ở nhiều nơi (recipes, blog, favorite...).
- **Bàn** nằm trong **order-service** vì gắn chặt với **quy trình đặt bàn**:
  - Giữ chỗ 15 phút.
  - Job tự huỷ booking quá hạn và trả bàn.
  - Cập nhật trạng thái booking (`PENDING_PAYMENT`, `PAID`, `CANCELLED`, `EXPIRED`) và trạng thái bàn.

Nhờ tách như vậy, logic **đặt bàn & giữ bàn** chỉ tập trung ở `order-service`; nếu sau này thay đổi quy tắc giữ bàn (thời gian giữ, cách tính basePrice, v.v.), chỉ cần chỉnh ở `order-service` mà không ảnh hưởng tới phần **catalog món ăn** trong `product-service`.

- **Cart-service**
  - Lưu tạm giỏ món của từng booking: `bookingId`, `userId`, `items[]`.
  - Database: `Restaurant_carts`.

- **Order-service**
  - Quản lý đặt bàn (bookings) và sơ đồ bàn (tables).
  - Chịu trách nhiệm logic **giữ bàn 15 phút sau khi chốt menu**:
    - Khi `confirm-menu`: tính tổng tiền, set `status = PENDING_PAYMENT`, `paymentStatus = PENDING`, `paymentExpiresAt = now + 15 phút`.
    - Job nền chạy mỗi phút: nếu đã quá `paymentExpiresAt` mà chưa thanh toán thì tự hủy booking và tạo bản ghi payment `EXPIRED`.
  - Database: `Restaurant_orders`.

- **Payment-service**
  - Lưu lịch sử thanh toán và tích hợp MoMo sandbox.
  - Một số API chính:
    - `POST /api/payments`:
      - Lấy thông tin booking từ order-service.
      - Tạo bản ghi `Payment` trạng thái `PENDING`.
      - Gọi MoMo sandbox tạo giao dịch và trả về `payUrl` cho frontend redirect.
    - `POST /api/payments/complete`:
      - Được frontend gọi sau khi MoMo redirect về `/payment-result`.
      - Cập nhật `Payment` sang `SUCCESS`/`FAILED` dựa trên `resultCode`.
      - Nếu thành công: gọi order-service `POST /api/bookings/:bookingId/mark-paid` để set booking `PAID`.
    - `POST /api/payments/momo-ipn` (tuỳ chọn khi deploy có public URL):
      - Nhận IPN từ MoMo, cập nhật `Payment` & booking tương tự `/complete`.
    - `POST /api/payments/expired`:
      - Được order-service gọi khi booking quá hạn 15 phút.
      - Tạo `Payment` trạng thái `EXPIRED` để lưu lịch sử.
    - `GET /api/payments/booking/:bookingId`:
      - Lấy danh sách payment của một booking (dùng cho trang chi tiết nếu cần).
    - `GET /api/payments/user/:userId`:
      - Dùng cho trang **"Lịch sử thanh toán"** của user (`/my-payments`).
      - Gộp toàn bộ payments của các booking thuộc user đó, kèm thông tin booking cơ bản.
  - Database: `Restaurant_payments`.

**Luồng chính (tóm tắt):**

- Client → Backend: đăng ký/đăng nhập, user profile, upload.
- Client → Product-service: lấy danh sách món/danh mục, chi tiết recipe.
- Client → Cart-service: thêm/sửa/xóa món trong giỏ theo `bookingId`.
- Client → Order-service: tạo booking, chốt menu (`confirm-menu`), xem danh sách booking.
- Client → Payment-service: tạo giao dịch MoMo, nhận kết quả thanh toán, trả lịch sử thanh toán cho user.
- Order-service ↔ Cart-service: đọc giỏ món khi chốt menu.
- Payment-service ↔ Order-service: cập nhật trạng thái booking sau thanh toán hoặc khi quá hạn.

## Mức độ đáp ứng yêu cầu đồ án (tóm tắt)

- **Kiến trúc microservices**
  - Có ít nhất 3 service tách biệt: product-service, cart-service, order-service, payment-service.
  - Mỗi service có database riêng trên MongoDB Atlas.

- **Quy trình nghiệp vụ rõ ràng**
  - Luồng đặt bàn 5 bước: chọn chi nhánh → chọn ngày/giờ → chọn tầng & bàn → chọn menu → xác nhận & thanh toán.
  - Sơ đồ bàn trực quan (tầng 1, tầng 2), phân biệt bàn thường, VIP, bàn đã được đặt.

- **Giữ bàn & xử lý quá hạn thanh toán**
  - Sau khi chốt menu, hệ thống giữ bàn trong 15 phút bằng trường `paymentExpiresAt`.
  - Job nền trong order-service tự động hủy các booking quá hạn và tạo bản ghi payment `EXPIRED` qua payment-service.

- **Tích hợp cổng thanh toán bên thứ ba (MoMo sandbox)**
  - payment-service gọi trực tiếp API MoMo (sandbox) để tạo `payUrl`.
  - Frontend redirect sang MoMo, sau thanh toán MoMo redirect về `/payment-result`.
  - Trang `/payment-result` gọi `POST /api/payments/complete` để cập nhật payment & booking.

- **Giao diện người dùng & phân quyền**
  - Khách hàng: đặt bàn, chọn menu, thanh toán MoMo, xem `/my-bookings` và `/my-payments`.
  - Admin: quản lý món ăn, danh mục, sơ đồ bàn, bookings, theo dõi lịch sử thanh toán.

- **Lưu vết & báo cáo**
  - Bảng `payments` lưu toàn bộ lịch sử thanh toán (SUCCESS/FAILED/EXPIRED) để truy vết.
  - Trang "Lịch sử thanh toán" tổng hợp giao dịch theo từng user.

### Sơ đồ kiến trúc (tổng quan)

```text
                 +--------------------+
                 |     Client (FE)    |
                 |   React / Browser  |
                 +----------+---------+
                            |
                            | HTTP (REST API)
                            v
    +-----------------------+------------------------+
    |                 Backend & Services             |
    |                                                |
    |  +-------------------+    +----------------+   |
    |  |  Backend monolith |    | Product-service|   |
    |  |  (auth, user,     |    | (recipes,      |   |
    |  |   blog, upload...)|    |  categories...)|   |
    |  +---------+---------+    +--------+-------+   |
    |            |                     |           |
    |            |                     |           |
    |  +---------v---------+   +-------v--------+  |
    |  |   Cart-service    |   | Order-service  |  |
    |  | (giỏ món theo     |   | (bookings,     |  |
    |  |  bookingId)       |   |  tables, 15')  |  |
    |  +---------+---------+   +-------+--------+  |
    |            |                     |           |
    |            |                     |           |
    |        +---v---------------------v---+       |
    |        |       Payment-service       |       |
    |        | (MoMo, lịch sử thanh toán) |       |
    |        +---------------+------------+       |
    +------------------------|--------------------+
                             |
                             | MongoDB (Atlas)
                             v
        +--------------------+--------------------+
        |  Restaurant_Website / _orders / _carts |
        |  _products / _payments (các database)  |
        +----------------------------------------+
```

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
  - `method`: phương thức (MOMO, MOCK cho bản ghi EXPIRED,...).
  - `status`: `PENDING | SUCCESS | FAILED | EXPIRED`.
  - `transactionId`: mã giao dịch từ MoMo hoặc sinh nội bộ.
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

```bash
git clone https://github.com/HuwikynH/Restaurant_Website.git
cd Restaurant_Website
```

### 1. Backend monolith

```bash
cd backend
npm install
npm run dev
```

### 2. Các microservice

Mỗi service chạy ở một terminal khác nhau:

```bash
# product-service (recipes, categories,...)
cd microservices/product-service
npm install
npm start

# cart-service (giỏ món)
cd ../cart-service
npm install
npm start

# order-service (bookings, tables, job hết hạn 15 phút)
cd ../order-service
npm install
npm start

# payment-service (MoMo, lịch sử thanh toán)
cd ../payment-service
npm install
npm start
```

### 3. Frontend (React)

```bash
cd ../frontend
npm install
npm start
```

## Thành viên thực hiện
```bash
Họ tên Mã sinh viên Lớp 
Nguyễn Đức Lộc N22DCCN150 D22CQCN02-N 
Nguyễn Hữu Huynh N22DCCN135 D22CQCN02-N 
```
## Ghi chú

Đây là đồ án môn học nhằm rèn luyện kỹ năng **fullstack web development** với kiến trúc microservices và **tích hợp cổng thanh toán MoMo sandbox**.
