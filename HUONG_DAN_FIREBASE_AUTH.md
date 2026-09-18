# HƯỚNG DẪN THIẾT LẬP BẢO MẬT ADMIN BẰNG FIREBASE AUTHENTICATION
**CLB Thể Thao Trường Dược**

Tài liệu này hướng dẫn Chủ nhiệm CLB cách cài đặt hệ thống bảo mật cấp cao bằng **Google Firebase Authentication** (Miễn phí 100% của Google). 

Sau khi cài đặt xong:
- 🛡️ **Mật khẩu được mã hóa an toàn tuyệt đối** trên máy chủ của Google, không bao giờ lộ ra trong mã nguồn hay khi ai đó bấm F12 (Inspect).
- 🔑 Bạn có thể đăng nhập bằng **Email & Mật khẩu riêng** hoặc **1 chạm bằng Google (Gmail cá nhân)**.
- 📩 Có sẵn tính năng **"Quên mật khẩu"** để tự động nhận liên kết khôi phục qua email.

---

## 🚀 4 BƯỚC THIẾT LẬP NHANH (CHỈ MẤT 2 PHÚT)

### BƯỚC 1: Tạo dự án Firebase (Miễn phí)
1. Truy cập vào [Google Firebase Console](https://console.firebase.google.com) và đăng nhập bằng tài khoản Google của bạn.
2. Bấm nút **"Thêm dự án" (Add project)** hoặc **"Tạo dự án"**.
3. Đặt tên cho dự án (Ví dụ: `CLB The Thao Duoc`) ➔ Bấm **Tiếp tục**.
4. Ở bước Google Analytics, bạn có thể tắt công tắc Analytics đi cho nhanh ➔ Bấm **Tạo dự án (Create project)**.
5. Chờ vài giây rồi bấm **Tiếp tục** để vào trang quản trị Firebase.

---

### BƯỚC 2: Bật dịch vụ Authentication (Xác thực)
1. Ở menu bên trái, bấm vào **Build (Xây dựng)** ➔ Chọn **Authentication**.
2. Bấm nút **Get started (Bắt đầu)**.
3. Tại tab **Sign-in method (Phương thức đăng nhập)**, bạn kích hoạt các phương thức:
   - **Email/Password**: Bấm vào dòng này ➔ Gạt công tắc **Enable (Bật)** ở mục đầu tiên ➔ Bấm **Save (Lưu)**.
   - **Google (Tùy chọn nếu muốn đăng nhập 1 chạm)**: Bấm vào dòng Google ➔ Gạt công tắc **Enable** ➔ Chọn Email hỗ trợ của bạn ở ô bên dưới ➔ Bấm **Save (Lưu)**.

---

### BƯỚC 3: Tạo tài khoản Admin cho bạn
1. Vẫn trong trang **Authentication**, bấm vào tab **Users (Người dùng)** ở thanh trên cùng.
2. Bấm nút **Add user (Thêm người dùng)**.
3. Nhập thông tin tài khoản bạn muốn dùng làm Admin:
   - **Identifier (Email)**: Nhập email quản trị của bạn (Ví dụ: `admin@clbduoc.vn` hoặc gmail cá nhân của bạn).
   - **Password (Mật khẩu)**: Đặt mật khẩu an toàn theo ý bạn (tối thiểu 6 ký tự).
4. Bấm **Add user**. Tài khoản Admin của bạn đã được lưu an toàn trong máy chủ Google!

---

### BƯỚC 4: Lấy thông số cấu hình dán vào Website
1. Bấm vào biểu tượng **Bánh răng cài đặt ⚙️** ở góc trên bên trái (cạnh chữ Project Overview) ➔ Chọn **Project settings (Cài đặt dự án)**.
2. Cuộn xuống phần **Your apps (Ứng dụng của bạn)** ➔ Bấm vào biểu tượng Web: **`</>`**.
3. Đặt biệt danh cho app: `CLB Web` ➔ Bấm **Register app (Đăng ký ứng dụng)**.
4. Firebase sẽ hiển thị đoạn mã `firebaseConfig` giống như sau:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-Xxxxxxxxxxxxxxxxxx",
  authDomain: "clb-the-thao-duoc.firebaseapp.com",
  projectId: "clb-the-thao-duoc",
  storageBucket: "clb-the-thao-duoc.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

5. Mở file mã nguồn website tại:  
   👉 **`src/config/firebaseConfig.js`**

6. Dán các thông số tương ứng vào:
```javascript
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD-Xxxxxxxxxxxxxxxxxx",
  authDomain: "clb-the-thao-duoc.firebaseapp.com",
  projectId: "clb-the-thao-duoc",
  storageBucket: "clb-the-thao-duoc.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
};
```

*(Hoặc nếu dùng file `.env`, bạn có thể đổi tên file `.env.example` thành `.env` và dán vào đó).*

---

## 🎯 CÁCH SỬ DỤNG VÀ KIỂM TRA
1. Mở website CLB tại **http://localhost:5173/**.
2. Cuộn xuống mục **"Hoạt Động & Điểm Rèn Luyện"** ➔ Bấm nút **"🔒 Quản Trị Hoạt Động"**.
3. Bạn sẽ thấy màn hình đăng nhập Firebase chuyên nghiệp:
   - Nhập Email & Mật khẩu Admin bạn vừa tạo ở Bước 3 để đăng nhập.
   - Hoặc bấm nút **"Đăng nhập 1 chạm với Google"**.
   - Nếu lỡ quên mật khẩu, bấm **"Quên mật khẩu?"** để Google tự động gửi email đặt lại mật khẩu về hòm thư của bạn!
4. Sau khi đăng nhập thành công, bạn sẽ thấy huy hiệu xanh lá cây **"Firebase Verified"** và có thể thoải mái quản lý hoạt động của CLB.
