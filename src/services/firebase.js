/**
 * firebase.js
 * Dịch vụ xác thực Firebase Authentication cho CLB Thể Thao Trường Dược
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  FIREBASE_CONFIG,
  ALLOWED_ADMIN_EMAILS,
  isFirebaseConfigured,
} from "../config/firebaseConfig";

let auth = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Khởi tạo Firebase nếu đã cấu hình
if (isFirebaseConfigured()) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
    auth = getAuth(app);
  } catch (error) {
    console.error("Lỗi khởi tạo Firebase:", error);
  }
}

/**
 * Đăng nhập bằng Email và Mật khẩu
 */
export async function loginWithEmail(email, password) {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error("NOT_CONFIGURED");
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    // Kiểm tra danh sách giới hạn email (nếu có cấu hình)
    if (ALLOWED_ADMIN_EMAILS.length > 0 && !ALLOWED_ADMIN_EMAILS.includes(user.email)) {
      await signOut(auth);
      throw new Error("EMAIL_NOT_AUTHORIZED");
    }

    return user;
  } catch (err) {
    throw formatAuthError(err);
  }
}

/**
 * Đăng nhập 1 chạm bằng tài khoản Google (Gmail)
 */
export async function loginWithGoogle() {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error("NOT_CONFIGURED");
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Kiểm tra danh sách giới hạn email
    if (ALLOWED_ADMIN_EMAILS.length > 0 && !ALLOWED_ADMIN_EMAILS.includes(user.email)) {
      await signOut(auth);
      throw new Error("EMAIL_NOT_AUTHORIZED");
    }

    return user;
  } catch (err) {
    throw formatAuthError(err);
  }
}

/**
 * Đăng xuất khỏi hệ thống
 */
export async function logoutAdmin() {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Lỗi đăng xuất:", err);
  }
}

/**
 * Gửi email đặt lại mật khẩu khi quên
 */
export async function resetAdminPassword(email) {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error("NOT_CONFIGURED");
  }
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (err) {
    throw formatAuthError(err);
  }
}

/**
 * Lắng nghe trạng thái đăng nhập (tự động khôi phục phiên khi tải lại trang)
 */
export function subscribeAuth(callback) {
  if (!isFirebaseConfigured() || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => {
    if (user && ALLOWED_ADMIN_EMAILS.length > 0 && !ALLOWED_ADMIN_EMAILS.includes(user.email)) {
      signOut(auth);
      callback(null);
    } else {
      callback(user);
    }
  });
}

/**
 * Kiểm tra xem Firebase đã sẵn sàng hoạt động hay chưa
 */
export function isFirebaseReady() {
  return isFirebaseConfigured() && auth !== null;
}

/**
 * Chuyển đổi mã lỗi Firebase sang tiếng Việt thân thiện
 */
function formatAuthError(err) {
  if (err.message === "EMAIL_NOT_AUTHORIZED") {
    return new Error("Email của bạn không nằm trong danh sách Ban Chủ Nhiệm được cấp quyền!");
  }
  if (err.message === "NOT_CONFIGURED") {
    return new Error("Chưa cấu hình Firebase API key.");
  }

  const code = err.code || "";
  switch (code) {
    case "auth/user-not-found":
      return new Error("Email quản trị không tồn tại trên hệ thống!");
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return new Error("Mật khẩu không chính xác. Vui lòng kiểm tra lại!");
    case "auth/invalid-email":
      return new Error("Định dạng email không hợp lệ!");
    case "auth/user-disabled":
      return new Error("Tài khoản quản trị này đã bị vô hiệu hóa!");
    case "auth/too-many-requests":
      return new Error("Bạn đã thử sai quá nhiều lần. Vui lòng chờ ít phút rồi thử lại!");
    case "auth/popup-closed-by-user":
      return new Error("Bạn đã đóng cửa sổ đăng nhập Google.");
    case "auth/unauthorized-domain":
      return new Error("Tên miền này chưa được cấp phép trong Firebase Auth (vào Settings > Authorized domains).");
    case "auth/network-request-failed":
      return new Error("Lỗi kết nối mạng, vui lòng kiểm tra lại đường truyền internet!");
    default:
      return new Error(err.message || "Đăng nhập thất bại. Vui lòng thử lại!");
  }
}
