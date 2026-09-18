/**
 * activitiesData.js
 * Quản lý dữ liệu hoạt động & điểm rèn luyện của CLB Thể Thao Trường Dược
 */

import { GOOGLE_SHEET_MASTER_CONFIG } from "./clubData";

export const GOOGLE_SHEET_ACTIVITIES_CONFIG = GOOGLE_SHEET_MASTER_CONFIG;

// Khóa lưu trữ LocalStorage khi chưa gắn link Google Sheets
export const LOCAL_STORAGE_ACTIVITIES_KEY = "clb_duoc_activities_v1";

/**
 * Danh sách hoạt động mẫu ban đầu
 * Bao gồm cả hoạt động mới (có link ĐRL) và hoạt động cũ (để trống link ĐRL -> hiển thị Không còn hiệu lực)
 */
export const INITIAL_ACTIVITIES = [
  {
    id: "act-2026-01",
    title: "Giải Cầu Lông Dược Sĩ Trẻ Mở Rộng 2026",
    year: "2025 - 2026",
    semester: "Học kỳ 2",
    date: "15/03/2026",
    rolesPoints: [
      { role: "Ban Tổ Chức", points: "+5 ĐRL" },
      { role: "Vận Động Viên", points: "+4 ĐRL" },
      { role: "Cổ Động Viên", points: "+2 ĐRL" },
    ],
    status: "available", // available | in_progress | upcoming | expired
    drlLink: "https://docs.google.com/spreadsheets/d/sample-cau-long-2026",
    postLink: "https://facebook.com",
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
    description: "Giải đấu thường niên quy tụ hơn 60 tay vợt sinh viên Trường Dược tranh tài tại Nhà thi đấu trường.",
  },
  {
    id: "act-2026-02",
    title: "Ngày Hội Giao Lưu & Trải Nghiệm Pickleball 2026",
    year: "2025 - 2026",
    semester: "Học kỳ 2",
    date: "28/02/2026",
    rolesPoints: [
      { role: "Ban Tổ Chức", points: "+5 ĐRL" },
      { role: "Tham gia trải nghiệm", points: "+3 ĐRL" },
    ],
    status: "in_progress",
    drlLink: "https://docs.google.com/spreadsheets/d/sample-pickleball-2026",
    postLink: "https://facebook.com",
    imageUrl: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=1200&q=80",
    description: "Sự kiện ra mắt Ban Pickleball mới thành lập năm 2026, hướng dẫn kỹ thuật cơ bản cho tân sinh viên.",
  },
  {
    id: "act-2025-01",
    title: "Giải Bóng Đá Nam Sinh Viên Dược Khoa Cup 2025",
    year: "2024 - 2025",
    semester: "Học kỳ 1",
    date: "10/11/2025",
    rolesPoints: [
      { role: "Ban Tổ Chức", points: "+5 ĐRL" },
      { role: "Cầu Thủ Thi Đấu", points: "+4 ĐRL" },
      { role: "Cổ Động Viên", points: "+2 ĐRL" },
    ],
    status: "expired",
    drlLink: "", // ĐỂ TRỐNG -> TỰ ĐỘNG HIỂN THỊ: KHÔNG CÒN HIỆU LỰC
    postLink: "https://facebook.com",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    description: "Giải bóng đá truyền thống giữa các khóa K24, K25, K26 với 12 đội bóng tranh cúp vô địch.",
  },
  {
    id: "act-2025-02",
    title: "Hội Thao Khỏe Để Phụng Sự 2025",
    year: "2024 - 2025",
    semester: "Học kỳ 2",
    date: "26/03/2025",
    rolesPoints: [
      { role: "Ban Hậu Cần & Điều Phối", points: "+5 ĐRL" },
      { role: "Vận Động Viên Kéo Co", points: "+3 ĐRL" },
      { role: "Cổ Vũ Đoàn", points: "+2 ĐRL" },
    ],
    status: "expired",
    drlLink: "", // ĐỂ TRỐNG -> KHÔNG CÒN HIỆU LỰC
    postLink: "https://facebook.com",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    description: "Chuỗi hoạt động thể thao chào mừng Ngày thành lập Đoàn 26/3 dành cho toàn thể sinh viên Trường Dược.",
  },
];

/**
 * Đọc danh sách hoạt động từ LocalStorage hoặc dữ liệu mẫu
 */
export function getStoredActivities() {
  if (typeof window === "undefined") return INITIAL_ACTIVITIES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACTIVITIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Lỗi đọc LocalStorage hoạt động:", err);
  }
  return INITIAL_ACTIVITIES;
}

/**
 * Lưu danh sách hoạt động vào LocalStorage
 */
export function saveStoredActivities(activities) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_ACTIVITIES_KEY, JSON.stringify(activities));
  } catch (err) {
    console.error("Lỗi lưu LocalStorage hoạt động:", err);
  }
}
