/**
 * registrationConfig.js
 * Quản lý cấu hình thời gian thu thập form đăng ký thành viên
 * Cổng đăng ký sẽ mở và đóng theo ngày cài đặt.
 */

const STORAGE_KEY = "clb_duoc_registration_config";

export const DEFAULT_REGISTRATION_CONFIG = {
  mode: "auto", // "auto": Theo ngày cài đặt | "open": Luôn mở | "closed": Khóa ngay
  startDate: "2026-09-01",
  endDate: "2026-10-31",
  title: "Đợt Tuyển Thành Viên Mùa 2026",
  closedMessage: "Thời hạn nhận đơn gia nhập CLB hiện đã kết thúc. Hẹn gặp bạn ở các đợt tuyển tiếp theo của CLB Thể Thao Trường Dược!",
  contactEmail: "clbthethaotruongduoc@gmail.com",
  contactPhone: "0912 345 678",
};

/**
 * Lấy cấu hình đăng ký từ localStorage (hoặc mặc định)
 */
export function getStoredRegistrationConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_REGISTRATION_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error("Lỗi đọc cấu hình đăng ký:", err);
  }
  return { ...DEFAULT_REGISTRATION_CONFIG };
}

/**
 * Lưu cấu hình đăng ký vào localStorage và đồng bộ Firebase RTDB nếu có
 */
export function saveStoredRegistrationConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Phát event để các component cập nhật tức thì nếu ở cùng trang
    window.dispatchEvent(new CustomEvent("clb_registration_config_changed", { detail: config }));
  } catch (err) {
    console.error("Lỗi lưu cấu hình đăng ký:", err);
  }

  // Đồng bộ Firebase Realtime Database (không chặn giao diện)
  syncToFirebaseRTDB(config);
}

/**
 * Format ngày YYYY-MM-DD sang DD/MM/YYYY để hiển thị tiếng Việt
 */
export function formatDateVN(dateStr) {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }
  } catch {
    // Fallback
  }
  return dateStr;
}

/**
 * Kiểm tra trạng thái mở/khóa của form đăng ký
 * Trả về thông tin chi tiết để giao diện hiển thị cho người dùng
 */
export function checkRegistrationStatus(config = getStoredRegistrationConfig()) {
  const { mode, startDate, endDate, closedMessage } = config;

  const startFormatted = formatDateVN(startDate);
  const endFormatted = formatDateVN(endDate);

  // 1. Chế độ cưỡng chế mở
  if (mode === "open") {
    return {
      isOpen: true,
      status: "open",
      badgeText: "Đang mở nhận đơn",
      badgeColor: "emerald",
      startDateFormatted: startFormatted,
      endDateFormatted: endFormatted,
      dateRangeText: `Từ ${startFormatted} đến ${endFormatted}`,
      daysLeft: null,
      message: "Cổng đăng ký đang mở nhận đơn.",
    };
  }

  // 2. Chế độ cưỡng chế đóng
  if (mode === "closed") {
    return {
      isOpen: false,
      status: "closed",
      badgeText: "Cổng đăng ký đã đóng",
      badgeColor: "rose",
      startDateFormatted: startFormatted,
      endDateFormatted: endFormatted,
      dateRangeText: `Từ ${startFormatted} đến ${endFormatted}`,
      daysLeft: 0,
      message: closedMessage || "Cổng đăng ký hiện đang tạm thời đóng.",
    };
  }

  // 3. Chế độ theo lịch cài đặt (theo ngày startDate & endDate)
  const now = new Date();
  
  // Tính mốc bắt đầu: 00:00:00 ngày startDate
  let startTime = null;
  if (startDate) {
    const [sY, sM, sD] = startDate.split("-").map(Number);
    startTime = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
  }

  // Tính mốc kết thúc: 23:59:59.999 ngày endDate
  let endTime = null;
  if (endDate) {
    const [eY, eM, eD] = endDate.split("-").map(Number);
    endTime = new Date(eY, eM - 1, eD, 23, 59, 59, 999);
  }

  // A. Chưa tới ngày mở
  if (startTime && now < startTime) {
    const diffMs = startTime.getTime() - now.getTime();
    const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return {
      isOpen: false,
      status: "upcoming",
      badgeText: "Sắp mở đơn",
      badgeColor: "amber",
      startDateFormatted: startFormatted,
      endDateFormatted: endFormatted,
      dateRangeText: `Từ ${startFormatted} đến ${endFormatted}`,
      daysLeft: daysUntil,
      message: `Cổng đăng ký sẽ mở vào ngày ${startFormatted} (còn ${daysUntil} ngày nữa).`,
    };
  }

  // B. Đã quá ngày kết thúc (Hết hạn nhận đơn)
  if (endTime && now > endTime) {
    return {
      isOpen: false,
      status: "expired",
      badgeText: "Đã hết hạn nhận đơn",
      badgeColor: "rose",
      startDateFormatted: startFormatted,
      endDateFormatted: endFormatted,
      dateRangeText: `Từ ${startFormatted} đến ${endFormatted}`,
      daysLeft: 0,
      message: closedMessage || `Thời hạn nhận đơn đã kết thúc vào ngày ${endFormatted}.`,
    };
  }

  // C. Đang trong khung thời gian mở
  let daysLeft = null;
  if (endTime) {
    const diffMs = endTime.getTime() - now.getTime();
    daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  return {
    isOpen: true,
    status: "active",
    badgeText: "Đang mở nhận đơn",
    badgeColor: "emerald",
    startDateFormatted: startFormatted,
    endDateFormatted: endFormatted,
    dateRangeText: `Từ ${startFormatted} đến ${endFormatted}`,
    daysLeft,
    message: daysLeft !== null 
      ? (daysLeft === 0 ? "Hôm nay là hạn chót điền đơn!" : `Còn ${daysLeft} ngày để gửi đơn đăng ký.`) 
      : "Cổng đăng ký đang mở tiếp nhận hồ sơ.",
  };
}

/**
 * Đồng bộ cấu hình lên Firebase Realtime Database
 */
async function syncToFirebaseRTDB(config) {
  try {
    const url = "https://clbthehao-default-rtdb.firebaseio.com/registrationConfig.json";
    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
  } catch {
    // Bỏ qua lỗi nếu không có mạng hoặc chưa cấp quyền
  }
}

/**
 * Tải cấu hình từ Firebase Realtime Database khi khởi động
 */
export async function fetchRemoteRegistrationConfig() {
  try {
    const url = "https://clbthehao-default-rtdb.firebaseio.com/registrationConfig.json";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object" && data.startDate) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent("clb_registration_config_changed", { detail: data }));
        return data;
      }
    }
  } catch {
    // Fallback sang localStorage
  }
  return null;
}
