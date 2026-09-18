# HƯỚNG DẪN ĐỒNG BỘ TOÀN BỘ WEBSITE VỚI 1 FILE GOOGLE SHEET DUY NHẤT
**CLB Thể Thao Trường Dược**

Tài liệu này là hướng dẫn **duy nhất** bạn cần làm. Website được thiết kế thông minh để quản lý **cả 2 chức năng** chỉ trong **1 file Google Sheet duy nhất** với **1 đường link kết nối duy nhất**:
1. 📝 **Trang tính 1 (`DonDangKy`)**: Tự động nhận đơn đăng ký thành viên mới khi sinh viên bấm gửi đơn.
2. 🏆 **Trang tính 2 (`HoatDongDRL`)**: Lưu trữ và đồng bộ 2 chiều các hoạt động trong năm & điểm rèn luyện (có thể thêm/sửa/xóa trực tiếp trên website hoặc trên Google Sheet).

---

## 🚀 HƯỚNG DẪN 4 BƯỚC (CHỈ MẤT 2 PHÚT)

### BƯỚC 1: Tạo 1 file Google Sheet có 2 trang tính (Tabs)
1. Truy cập [Google Sheets (Trang tính)](https://sheets.google.com) và bấm tạo một bảng tính trống mới.
2. Đặt tên bảng tính ở góc trên bên trái: **CLB Thể Thao Trường Dược - Quản Lý Tổng Hợp**.
3. Ở góc dưới cùng bên trái của trang tính, bạn tạo **2 Tab (Trang tính)**:

#### 📌 Tab thứ nhất: Đổi tên thành `DonDangKy`
Tại **Dòng 1 (Hàng tiêu đề)**, nhập các cột:
- **Cột A**: `Thời gian`
- **Cột B**: `Họ và tên`
- **Cột C**: `Lớp`
- **Cột D**: `MSSV`
- **Cột E**: `Số điện thoại`
- **Cột F**: `Email`
- **Cột G**: `Facebook`
- **Cột H**: `Phân ban đăng ký`

#### 📌 Tab thứ hai: Bấm dấu `+` ở góc dưới để thêm trang tính mới và đổi tên thành `HoatDongDRL`
Tại **Dòng 1 (Hàng tiêu đề)**, nhập các cột:
- **Cột A**: `id`
- **Cột B**: `title`
- **Cột C**: `year`
- **Cột D**: `semester`
- **Cột E**: `date`
- **Cột F**: `roles_points`
- **Cột G**: `status`
- **Cột H**: `drl_link`
- **Cột I**: `post_link`
- **Cột J**: `image_url`
- **Cột K**: `description`

*(Ghi chú: Nếu bạn chưa kịp tạo tab hay gõ cột, đoạn code ở Bước 2 dưới đây cũng sẽ **tự động khởi tạo** giúp bạn).*

---

### BƯỚC 2: Thêm đoạn mã Google Apps Script duy nhất
1. Trên thanh menu trên cùng của Google Sheet, bấm vào **Tiện ích mở rộng (Extensions)** ➔ Chọn **Apps Script**.
2. Xóa toàn bộ đoạn code mặc định có sẵn và **dán toàn bộ đoạn mã dưới đây vào**:

```javascript
/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT TỔNG HỢP CHO CLB THỂ THAO TRƯỜNG DƯỢC
 * Quản lý chung cả:
 *   1. Đơn đăng ký thành viên mới (Tab "DonDangKy")
 *   2. Hoạt động trong năm & Điểm rèn luyện (Tab "HoatDongDRL")
 * ==============================================================================
 */

// Hàm hỗ trợ lấy hoặc tự động tạo tab nếu chưa có
function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0 && headers && headers.length > 0) {
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#e8f5e9");
  }
  return sheet;
}

// 1. GET: Website tự động tải danh sách hoạt động từ Tab "HoatDongDRL"
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateSheet(ss, "HoatDongDRL", [
      "id", "title", "year", "semester", "date", 
      "roles_points", "status", "drl_link", "post_link", "image_url", "description"
    ]);

    var data = sheet.getDataRange().getValues();
    var activities = [];

    // Bỏ qua dòng tiêu đề (dòng 0), duyệt các dòng từ dòng 1
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0] && !row[1]) continue; // Bỏ qua dòng trống

      var rolesPoints = [];
      try {
        rolesPoints = JSON.parse(row[5]);
      } catch (err) {
        rolesPoints = [{ role: "Tham gia", points: row[5] || "+ ĐRL" }];
      }

      activities.push({
        id: String(row[0]),
        title: String(row[1]),
        year: String(row[2] || ""),
        semester: String(row[3] || ""),
        date: String(row[4] || ""),
        rolesPoints: rolesPoints,
        status: String(row[6] || "available"),
        drlLink: String(row[7] || ""),
        postLink: String(row[8] || ""),
        imageUrl: String(row[9] || ""),
        description: String(row[10] || "")
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: activities }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. POST: Xử lý cả Gửi đơn đăng ký & Quản lý hoạt động (Thêm/Sửa/Xóa)
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";

    // -------------------------------------------------------------
    // A. QUẢN LÝ HOẠT ĐỘNG (action = "create" | "update" | "delete")
    // -------------------------------------------------------------
    if (action === "create" || action === "update" || action === "delete") {
      var actSheet = getOrCreateSheet(ss, "HoatDongDRL", [
        "id", "title", "year", "semester", "date", 
        "roles_points", "status", "drl_link", "post_link", "image_url", "description"
      ]);

      var rawData = e.parameter.data;
      var item = JSON.parse(rawData);
      var rows = actSheet.getDataRange().getValues();

      if (action === "create") {
        actSheet.appendRow([
          item.id,
          item.title,
          item.year,
          item.semester,
          item.date,
          JSON.stringify(item.rolesPoints || []),
          item.status,
          item.drlLink || "",
          item.postLink || "",
          item.imageUrl || "",
          item.description || ""
        ]);
      } else if (action === "update") {
        for (var i = 1; i < rows.length; i++) {
          if (String(rows[i][0]) === String(item.id)) {
            actSheet.getRange(i + 1, 1, 1, 11).setValues([[
              item.id,
              item.title,
              item.year,
              item.semester,
              item.date,
              JSON.stringify(item.rolesPoints || []),
              item.status,
              item.drlLink || "",
              item.postLink || "",
              item.imageUrl || "",
              item.description || ""
            ]]);
            break;
          }
        }
      } else if (action === "delete") {
        for (var i = 1; i < rows.length; i++) {
          if (String(rows[i][0]) === String(item.id)) {
            actSheet.deleteRow(i + 1);
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------
    // B. SINH VIÊN GỬI ĐƠN ĐĂNG KÝ THÀNH VIÊN (Ghi vào Tab "DonDangKy")
    // -------------------------------------------------------------
    var regSheet = getOrCreateSheet(ss, "DonDangKy", [
      "Thời gian", "Họ và tên", "Lớp", "MSSV", "Số điện thoại", "Email", "Facebook", "Phân ban đăng ký"
    ]);

    var timestamp = (e && e.parameter && e.parameter.timestamp) || new Date().toLocaleString("vi-VN");
    var name = (e && e.parameter && e.parameter.name) || "";
    var lop = (e && e.parameter && e.parameter.lop) || "";
    var mssv = (e && e.parameter && e.parameter.mssv) || "";
    var phone = (e && e.parameter && e.parameter.phone) || "";
    var email = (e && e.parameter && e.parameter.email) || "";
    var facebook = (e && e.parameter && e.parameter.facebook) || "";
    var ban = (e && e.parameter && e.parameter.ban) || "";

    var banNames = {
      pickleball: "Ban Pickleball",
      football: "Ban Bóng đá",
      volleyball: "Ban Bóng chuyền",
      badminton: "Ban Cầu lông",
      cheerleading: "Đội Cheerleading",
      media: "Ban Truyền thông"
    };
    var banTitle = banNames[ban] || ban;

    regSheet.appendRow([
      timestamp,
      name,
      lop,
      mssv,
      "'" + phone, // Dấu ' giúp giữ số 0 đầu số điện thoại
      email,
      facebook,
      banTitle
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Bấm biểu tượng **💾 Lưu dự án (Save)** (hoặc ấn tổ hợp phím `Ctrl + S` / `Cmd + S`).

---

### BƯỚC 3: Triển khai thành Web App (Deploy)
1. Ở góc trên cùng bên phải màn hình Apps Script, bấm nút **Triển khai (Deploy)** ➔ Chọn **Tùy chọn triển khai mới (New deployment)**.
2. Tại mục bánh răng (Chọn loại), chọn: **Ứng dụng web (Web app)**.
3. Cài đặt chính xác các mục sau:
   - **Mô tả (Description)**: `CLB Duoc Master API`
   - **Thực thi dưới dạng (Execute as)**: `Tôi (địa chỉ email của bạn)`
   - **Ai có quyền truy cập (Who has access)**: 👉 Chọn **Bất kỳ ai (Anyone)** *(Bắt buộc chọn Anyone để sinh viên có thể nộp đơn và xem hoạt động mà không cần đăng nhập tài khoản Google của bạn)*.
4. Bấm nút **Triển khai (Deploy)**.
   *(Nếu Google hiện cửa sổ yêu cầu cấp quyền: Bấm chọn tài khoản Gmail của bạn ➔ Bấm "Advanced / Nâng cao" ở góc dưới ➔ Bấm "Go to Untitled project (unsafe) / Đi tới dự án (Không an toàn)" ➔ Bấm "Allow / Cho phép")*.
5. Sau khi triển khai xong, bạn sẽ nhận được một **URL Ứng dụng web (Web app URL)** có dạng kết thúc bằng `/exec`.  
   *Ví dụ: `https://script.google.com/macros/s/AKfycbzAbCdEf123456789.../exec`*
6. Bấm nút **Sao chép (Copy)** đường link này.

---

### BƯỚC 4: Dán Link vào Website CLB
Mở file mã nguồn website tại:  
👉 **`src/data/clubData.js`**

Tìm đến dòng 28:
```javascript
export const GOOGLE_SHEET_MASTER_CONFIG = {
  SCRIPT_URL: "", // Dán đường link bạn vừa sao chép vào giữa 2 dấu ngoặc kép này
  ADMIN_PASSWORD: "clbduocadmin", // Mật khẩu quản trị (có thể đổi nếu muốn)
};
```

👉 **Chỉ cần dán vào đúng 1 chỗ này là XONG!** Website sẽ tự động kết nối cả Form đăng ký lẫn Bảng quản trị Hoạt động & Điểm rèn luyện.

---

## 💡 CÁCH SỬ DỤNG HẰNG NGÀY

### 1. Quản lý Hoạt động & Điểm rèn luyện
- Trên website, kéo xuống mục **"Hoạt Động & Điểm Rèn Luyện"**, bấm nút **"🔒 Quản Trị Hoạt Động"** ở góc phải.
- Nhập mật khẩu: `clbduocadmin`.
- Bạn có thể:
  - **Thêm hoạt động mới**: Điền tên, chọn năm học, học kỳ, ngày tổ chức.
  - **Tùy chỉnh điểm theo vai trò**: Bấm `+ Thêm vai trò` để thêm nhiều mức điểm khác nhau (Ví dụ: BTC: +5 ĐRL, VĐV: +4 ĐRL, Cổ vũ: +2 ĐRL...).
  - **Link danh sách ĐRL**: Dán link Google Drive/Sheet danh sách sinh viên được cộng điểm.  
    *(Lưu ý: Đối với các hoạt động cũ từ năm trước, bạn chỉ cần để trống ô Link này, website sẽ tự động hiển thị nhãn **"Không còn hiệu lực"** đúng theo yêu cầu của bạn!)*.
  - Mọi thay đổi Thêm / Sửa / Xóa trên web sẽ được tự động lưu lên Tab `HoatDongDRL` của Google Sheet.

### 2. Xem sinh viên đăng ký gia nhập CLB
- Mở file Google Sheet của bạn, chọn tab **`DonDangKy`**.
- Mọi đơn sinh viên điền trên web sẽ xuất hiện ngay lập tức theo từng hàng với đầy đủ Họ tên, Lớp, MSSV, SĐT, Email, Facebook và Phân ban họ chọn.
