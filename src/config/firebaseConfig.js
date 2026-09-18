/**
 * firebaseConfig.js
 * Cấu hình kết nối Google Firebase Authentication cho CLB Thể Thao Trường Dược
 * 
 * Hướng dẫn lấy thông số xem tại file: HUONG_DAN_FIREBASE_AUTH.md
 */

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCnWESZjmJkFDg4V_Eu7RPYz_0QJIwN5ik",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "clbthehao.firebaseapp.com",
  databaseURL: "https://clbthehao-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "clbthehao",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "clbthehao.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "201769736807",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:201769736807:web:a2b3e3751127efad4a92c2",
  measurementId: "G-SFKHVPBLF9",
};

/**
 * Danh sách email Google của Ban Chủ Nhiệm được phép truy cập Admin khi dùng "Đăng nhập với Google".
 * Để trống mảng [] nếu muốn cho phép bất kỳ tài khoản nào đã tạo trên Firebase Auth của bạn.
 */
export const ALLOWED_ADMIN_EMAILS = [
  // "chunhiemclb@gmail.com",
  // "phochunhiem@gmail.com",
];

/**
 * Kiểm tra xem Firebase đã được điền thông số cấu hình thật hay chưa
 */
export function isFirebaseConfigured() {
  return Boolean(
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.apiKey.trim() !== "" &&
    FIREBASE_CONFIG.apiKey !== "AIzaSy..." &&
    FIREBASE_CONFIG.projectId &&
    FIREBASE_CONFIG.projectId.trim() !== ""
  );
}
