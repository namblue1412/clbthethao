import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Calendar,
  CalendarClock,
  Clock,
  Lock,
  Unlock,
  Save,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  AlertCircle,
  LogOut,
  Sparkles,
  Mail,
  UserCheck,
  Loader2,
  KeyRound,
  ArrowLeft,
  Search,
} from "lucide-react";
import {
  getStoredActivities,
  saveStoredActivities,
  GOOGLE_SHEET_ACTIVITIES_CONFIG,
} from "../data/activitiesData";
import {
  getStoredRegistrationConfig,
  saveStoredRegistrationConfig,
  checkRegistrationStatus,
  formatDateVN,
} from "../data/registrationConfig";
import { GOOGLE_SHEET_CONFIG } from "../data/clubData";
import { sound } from "../utils/audio";
import {
  loginWithEmail,
  loginWithGoogle,
  logoutAdmin,
  resetAdminPassword,
  subscribeAuth,
  isFirebaseReady,
} from "../services/firebase";

function generateId() {
  return `act-${Date.now()}`;
}

function getCurrentDate() {
  return new Date().toLocaleDateString("vi-VN");
}

export default function AdminPage({ onBackToHome }) {
  // Trạng thái xác thực
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isLocalAuth, setIsLocalAuth] = useState(false);
  const isAuthenticated = Boolean(firebaseUser || isLocalAuth);

  // Form đăng nhập
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quên mật khẩu
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Tabs quản trị: "activities" | "registration" | "sheets"
  const [activeTab, setActiveTab] = useState("activities");

  // Dữ liệu hoạt động
  const [activities, setActivities] = useState(getStoredActivities);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const emptyActivityForm = {
    title: "",
    year: "2025 - 2026",
    semester: "Học kỳ 2",
    date: "",
    rolesPoints: [
      { role: "Ban Tổ Chức", points: "+5 ĐRL" },
      { role: "Vận Động Viên", points: "+4 ĐRL" },
      { role: "Cổ Động Viên", points: "+2 ĐRL" },
    ],
    status: "in_progress", // available | in_progress | upcoming | expired
    drlLink: "",
    postLinks: [{ title: "Bài viết phát động", url: "" }],
    imageUrl: "",
    description: "",
  };
  const [activityFormData, setActivityFormData] = useState(emptyActivityForm);

  // Cấu hình thời gian thu thập form
  const [regConfigState, setRegConfigState] = useState(getStoredRegistrationConfig);

  // Lắng nghe phiên đăng nhập Firebase
  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Lắng nghe cập nhật hoạt động từ Google Sheets (nếu có)
  useEffect(() => {
    if (!GOOGLE_SHEET_ACTIVITIES_CONFIG.SCRIPT_URL) return;
    fetch(GOOGLE_SHEET_ACTIVITIES_CONFIG.SCRIPT_URL)
      .then((res) => res.json())
      .then((resData) => {
        if (
          resData.status === "success" &&
          Array.isArray(resData.data) &&
          resData.data.length > 0
        ) {
          setActivities(resData.data);
          saveStoredActivities(resData.data);
        }
      })
      .catch((err) => console.log("Lỗi đồng bộ Google Sheets:", err));
  }, []);

  // Lắng nghe thay đổi cấu hình form từ sự kiện hệ thống
  useEffect(() => {
    const handleConfigEvent = (e) => {
      if (e?.detail) setRegConfigState(e.detail);
    };
    window.addEventListener("clb_registration_config_changed", handleConfigEvent);
    return () =>
      window.removeEventListener("clb_registration_config_changed", handleConfigEvent);
  }, []);

  // Hiển thị thông báo Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Đăng nhập Email
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!isFirebaseReady()) {
      const correctPassword =
        GOOGLE_SHEET_ACTIVITIES_CONFIG.ADMIN_PASSWORD || "clbduocadmin";
      if (passwordInput.trim() === correctPassword) {
        setIsLocalAuth(true);
        sound.playSpark();
        showToast("Đã mở bảng quản trị (Chế độ mật khẩu nội bộ)!");
        setPasswordInput("");
        return;
      } else {
        setAuthError("Mật khẩu quản trị không chính xác!");
        sound.playPop();
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await loginWithEmail(emailInput, passwordInput);
      sound.playSpark();
      showToast("Đăng nhập quản trị thành công!");
      setEmailInput("");
      setPasswordInput("");
    } catch (err) {
      setAuthError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại!");
      sound.playPop();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Đăng nhập Google
  const handleGoogleLogin = async () => {
    setAuthError("");
    try {
      setIsSubmitting(true);
      await loginWithGoogle();
      sound.playSpark();
      showToast("Đăng nhập Google thành công!");
    } catch (err) {
      setAuthError(err.message || "Đăng nhập Google không thành công!");
      sound.playPop();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gửi email khôi phục mật khẩu
  const handleSendResetPassword = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      setIsSubmitting(true);
      await resetAdminPassword(forgotEmail);
      setForgotSuccess(true);
      sound.playSpark();
    } catch (err) {
      setAuthError(err.message || "Không thể gửi email khôi phục!");
      sound.playPop();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Đăng xuất
  const handleLogout = async () => {
    await logoutAdmin();
    setIsLocalAuth(false);
    setFirebaseUser(null);
    sound.playPop();
    showToast("Đã đăng xuất khỏi phiên quản trị.");
  };

  // Mở form thêm mới hoạt động
  const handleOpenAddActivity = () => {
    setActivityFormData(emptyActivityForm);
    setEditingId(null);
    setIsFormOpen(true);
    sound.playPop();
  };

  // Mở form sửa hoạt động
  const handleOpenEditActivity = (act) => {
    let postLinksArray;
    if (Array.isArray(act.postLinks) && act.postLinks.length > 0) {
      postLinksArray = act.postLinks;
    } else if (act.postLink) {
      postLinksArray = [{ title: "Bài viết phát động", url: act.postLink }];
    } else {
      postLinksArray = [{ title: "Bài viết phát động", url: "" }];
    }

    setActivityFormData({
      title: act.title || "",
      year: act.year || "2025 - 2026",
      semester: act.semester || "Học kỳ 2",
      date: act.date || "",
      rolesPoints:
        Array.isArray(act.rolesPoints) && act.rolesPoints.length > 0
          ? act.rolesPoints
          : [
              { role: "Ban Tổ Chức", points: "+5 ĐRL" },
              { role: "Vận Động Viên", points: "+4 ĐRL" },
              { role: "Cổ Động Viên", points: "+2 ĐRL" },
            ],
      status: act.status || "in_progress",
      drlLink: act.drlLink || "",
      postLinks: postLinksArray,
      imageUrl: act.imageUrl || "",
      description: act.description || "",
    });
    setEditingId(act.id);
    setIsFormOpen(true);
    sound.playPop();
  };

  // Lưu hoạt động
  const handleSaveActivity = (e) => {
    e.preventDefault();
    if (!activityFormData.title.trim()) {
      alert("Vui lòng nhập tên hoạt động!");
      return;
    }

    const filteredPostLinks = activityFormData.postLinks.filter(
      (p) => p.url && p.url.trim() !== ""
    );
    const primaryPostLink =
      filteredPostLinks.length > 0 ? filteredPostLinks[0].url : "";

    const payload = {
      id: editingId || generateId(),
      title: activityFormData.title.trim(),
      year: activityFormData.year,
      semester: activityFormData.semester,
      date: activityFormData.date.trim() || getCurrentDate(),
      rolesPoints: activityFormData.rolesPoints.filter(
        (r) => r.role.trim() !== ""
      ),
      status: activityFormData.status,
      drlLink: activityFormData.drlLink.trim(),
      postLink: primaryPostLink,
      postLinks: filteredPostLinks,
      imageUrl:
        activityFormData.imageUrl.trim() ||
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      description: activityFormData.description.trim(),
    };

    let updatedList;
    if (editingId) {
      updatedList = activities.map((a) =>
        a.id === editingId ? payload : a
      );
      showToast("Đã cập nhật hoạt động thành công!");
    } else {
      updatedList = [payload, ...activities];
      showToast("Đã thêm hoạt động mới thành công!");
    }

    setActivities(updatedList);
    saveStoredActivities(updatedList);
    sound.playSpark();
    setIsFormOpen(false);

    // Đồng bộ nền Google Sheet
    syncToGoogleSheet(editingId ? "update" : "create", payload);
  };

  // Xóa hoạt động
  const handleDeleteActivity = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hoạt động này?")) {
      const updated = activities.filter((a) => a.id !== id);
      setActivities(updated);
      saveStoredActivities(updated);
      showToast("Đã xóa hoạt động thành công!");
      sound.playPop();
      syncToGoogleSheet("delete", { id });
    }
  };

  // Đồng bộ Google Sheet
  const syncToGoogleSheet = async (action, data) => {
    if (!GOOGLE_SHEET_ACTIVITIES_CONFIG.SCRIPT_URL) return;
    try {
      const payload = new FormData();
      payload.append("action", action);
      payload.append("data", JSON.stringify(data));
      await fetch(GOOGLE_SHEET_ACTIVITIES_CONFIG.SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      });
    } catch (err) {
      console.error("Lỗi đồng bộ Google Sheet:", err);
    }
  };

  // Thêm/Xóa vai trò ĐRL
  const handleAddRole = () => {
    setActivityFormData((prev) => ({
      ...prev,
      rolesPoints: [...prev.rolesPoints, { role: "", points: "+2 ĐRL" }],
    }));
  };

  const handleRemoveRole = (index) => {
    setActivityFormData((prev) => ({
      ...prev,
      rolesPoints: prev.rolesPoints.filter((_, i) => i !== index),
    }));
  };

  const handleRoleChange = (index, field, value) => {
    setActivityFormData((prev) => {
      const updated = [...prev.rolesPoints];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, rolesPoints: updated };
    });
  };

  // Thêm/Xóa link bài viết
  const handleAddPostLink = () => {
    setActivityFormData((prev) => ({
      ...prev,
      postLinks: [
        ...prev.postLinks,
        { title: `Bài viết ${prev.postLinks.length + 1}`, url: "" },
      ],
    }));
  };

  const handleRemovePostLink = (index) => {
    setActivityFormData((prev) => ({
      ...prev,
      postLinks: prev.postLinks.filter((_, i) => i !== index),
    }));
  };

  const handlePostLinkChange = (index, field, value) => {
    setActivityFormData((prev) => {
      const updated = [...prev.postLinks];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, postLinks: updated };
    });
  };

  // Lưu cài đặt thời gian điền form
  const handleSaveRegistrationSettings = (e) => {
    e.preventDefault();
    if (!regConfigState.startDate || !regConfigState.endDate) {
      alert("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc!");
      return;
    }
    saveStoredRegistrationConfig(regConfigState);
    showToast("Đã lưu thời gian thu thập form thành công!");
    sound.playSpark();
  };

  const regPreviewStatus = checkRegistrationStatus(regConfigState);

  // Lọc hoạt động theo ô tìm kiếm
  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;
    const query = searchQuery.toLowerCase();
    return activities.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.year.toLowerCase().includes(query) ||
        a.semester.toLowerCase().includes(query)
    );
  }, [activities, searchQuery]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-emerald-500/30">
      {/* QUẦNG SÁNG NỀN TRANG TRÍ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-1/4 w-[40vw] h-[40vw] rounded-full blur-[140px] opacity-15 bg-gradient-to-br from-emerald-500 to-lime-500" />
        <div className="absolute bottom-[-10%] right-1/4 w-[35vw] h-[35vw] rounded-full blur-[140px] opacity-10 bg-gradient-to-br from-teal-500 to-emerald-600" />
      </div>

      {/* TOAST THÔNG BÁO */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-emerald-500 text-neutral-950 font-bold text-xs shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER QUẢN TRỊ RIÊNG BIỆT */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-neutral-950/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-lime-500 to-emerald-500 flex items-center justify-center text-neutral-950 shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Cổng Quản Trị CLB Thể Thao
                </h1>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Dược UMP
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                Trang điều hành nội bộ dành riêng cho Ban Chủ Nhiệm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nút Xem Trang Chủ */}
            <button
              onClick={() => {
                sound.playPop();
                if (onBackToHome) onBackToHome();
                else window.location.href = "/";
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 transition border border-white/10"
              title="Về trang chủ của khán giả"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xem Trang Web</span>
            </button>

            {/* Nút Đăng Xuất nếu đã xác thực */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 transition border border-rose-500/20"
                title="Đăng xuất khỏi phiên quản trị"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* NỘI DUNG CHÍNH */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!isAuthenticated ? (
          /* MÀN HÌNH ĐĂNG NHẬP BẢO MẬT KHI CHƯA XÁC THỰC */
          <div className="max-w-md mx-auto py-12">
            <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl text-center">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-6 shadow-lg shadow-emerald-500/10">
                <Lock className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-black text-white mb-2">
                Đăng Nhập Quản Trị
              </h2>
              <p className="text-xs text-white/60 mb-6">
                Vui lòng xác thực tài khoản Ban Chủ Nhiệm để truy cập hệ thống quản trị.
              </p>

              {isForgotModalOpen ? (
                /* PHÂN HỆ QUÊN MẬT KHẨU */
                <form onSubmit={handleSendResetPassword} className="space-y-4 text-left">
                  {forgotSuccess ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/40">
                      <p className="text-xs text-emerald-300 font-semibold mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Đã gửi email khôi phục thành công!
                      </p>
                      <p className="text-[11px] text-white/70">
                        Vui lòng kiểm tra hộp thư của <b>{forgotEmail}</b> để đặt lại mật khẩu.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1.5">
                          Email Quản Trị Cần Khôi Phục
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="admin@clbduoc.vn hoặc gmail của bạn"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-400"
                          />
                        </div>
                      </div>

                      {authError && (
                        <p className="text-xs text-red-400 flex items-center gap-1.5 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                          <AlertCircle className="w-4 h-4 shrink-0" /> {authError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-neutral-950 text-xs font-bold shadow-lg hover:scale-[1.01] transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <KeyRound className="w-4 h-4" />
                        )}
                        <span>Gửi Liên Kết Đặt Lại Mật Khẩu</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(false);
                      setForgotSuccess(false);
                      setAuthError("");
                    }}
                    className="w-full text-center text-xs text-white/50 hover:text-white pt-2 transition"
                  >
                    Quay lại màn hình đăng nhập
                  </button>
                </form>
              ) : (
                /* FORM ĐĂNG NHẬP */
                <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
                  {isFirebaseReady() && (
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1.5">
                        Email Quản Trị
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="admin@clbduoc.vn hoặc gmail của bạn"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-400"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-white/80">
                        {isFirebaseReady() ? "Mật Khẩu Admin" : "Mật Khẩu Quản Trị"}
                      </label>
                      {isFirebaseReady() && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotModalOpen(true);
                            setAuthError("");
                          }}
                          className="text-[11px] text-emerald-400 hover:underline"
                        >
                          Quên mật khẩu?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder={
                          isFirebaseReady()
                            ? "Nhập mật khẩu tài khoản..."
                            : "Nhập mật khẩu admin..."
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-400"
                        autoFocus={!isFirebaseReady()}
                      />
                    </div>
                  </div>

                  {authError && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {authError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-neutral-950 text-xs font-bold shadow-lg hover:scale-[1.01] transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    <span>Xác Nhận Đăng Nhập Quản Trị</span>
                  </button>

                  {/* NÚT GOOGLE 1 CHẠM */}
                  {isFirebaseReady() && (
                    <div className="mt-5 pt-5 border-t border-white/10">
                      <p className="text-[11px] text-white/40 mb-3 text-center">
                        HOẶC TIỆN LỢI HƠN
                      </p>
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isSubmitting}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Đăng nhập 1 chạm với Google</span>
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        ) : (
          /* MÀN HÌNH DASHBOARD TOÀN DIỆN (KHI ĐÃ ĐĂNG NHẬP) */
          <div className="space-y-6">
            {/* THÔNG TIN TÀI KHOẢN & METRICS TỔNG QUAN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Thẻ 1: Tài khoản đăng nhập */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Phiên Quản Trị</span>
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {firebaseUser ? (firebaseUser.email || "Firebase Admin") : "Admin Cục Bộ"}
                </div>
                <p className="text-[11px] text-emerald-400 mt-1">
                  Ban Chủ Nhiệm CLB Thể Thao
                </p>
              </div>

              {/* Thẻ 2: Trạng thái điền form */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between gap-2 text-xs text-white/50 mb-1">
                  <span className="flex items-center gap-1.5">
                    <CalendarClock className="w-4 h-4 text-lime-400" />
                    Cổng Điền Form Tuyển Quân
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      regPreviewStatus.isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                    }`}
                  />
                </div>
                <div className="text-sm font-bold text-white">
                  {regPreviewStatus.isOpen ? "🟢 Đang Mở Điền Form" : "🔴 Cổng Đã Đóng (Hết Hạn)"}
                </div>
                <p className="text-[11px] text-white/50 mt-1 truncate">
                  {regPreviewStatus.dateRangeText}
                </p>
              </div>

              {/* Thẻ 3: Đồng bộ Google Sheets */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Google Sheets Sync</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {GOOGLE_SHEET_ACTIVITIES_CONFIG.SCRIPT_URL ? (
                    <span className="text-emerald-300">Đã Kết Nối Trực Tiếp</span>
                  ) : (
                    <span className="text-yellow-400">Lưu Trữ Cục Bộ</span>
                  )}
                </div>
                <p className="text-[11px] text-white/50 mt-1">
                  {activities.length} hoạt động trong hệ thống
                </p>
              </div>
            </div>

            {/* THANH CHUYỂN TABS DASHBOARD */}
            <div className="flex border-b border-white/10 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setActiveTab("activities");
                }}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition -mb-px rounded-t-2xl shrink-0 ${
                  activeTab === "activities"
                    ? "border-emerald-400 text-emerald-300 bg-white/[0.04]"
                    : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Hoạt Động & Điểm Rèn Luyện ({activities.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setActiveTab("registration");
                }}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition -mb-px rounded-t-2xl shrink-0 ${
                  activeTab === "registration"
                    ? "border-emerald-400 text-emerald-300 bg-white/[0.04]"
                    : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                <CalendarClock className="w-4 h-4 text-lime-400" />
                <span>Cài Đặt Thời Gian Điền Form</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    regPreviewStatus.isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setActiveTab("sheets");
                }}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition -mb-px rounded-t-2xl shrink-0 ${
                  activeTab === "sheets"
                    ? "border-emerald-400 text-emerald-300 bg-white/[0.04]"
                    : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Đơn Đăng Ký & Trang Tính</span>
              </button>
            </div>

            {/* TAB 1: QUẢN TRỊ HOẠT ĐỘNG */}
            {activeTab === "activities" && (
              <div className="space-y-6">
                {/* THANH TÌM KIẾM & NÚT THÊM */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm theo tên hoạt động, năm học, học kỳ..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {!isFormOpen && (
                    <button
                      onClick={handleOpenAddActivity}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-neutral-950 font-bold text-xs shadow-lg hover:scale-105 transition active:scale-95 shrink-0 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" /> Thêm Hoạt Động Mới
                    </button>
                  )}
                </div>

                {/* FORM THÊM / SỬA HOẠT ĐỘNG */}
                {isFormOpen ? (
                  <form
                    onSubmit={handleSaveActivity}
                    className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-white/15 space-y-6 shadow-2xl"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <h3 className="text-base font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {editingId ? "Chỉnh Sửa Hoạt Động" : "Thêm Hoạt Động Mới"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="text-xs text-white/50 hover:text-white transition"
                      >
                        Đóng lại
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-white/80 mb-1.5">
                          Tên Hoạt Động / Giải Đấu *
                        </label>
                        <input
                          type="text"
                          required
                          value={activityFormData.title}
                          onChange={(e) =>
                            setActivityFormData((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Ví dụ: Giải Cầu Lông Mở Rộng Dược UMP 2026"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1.5">
                          Năm Học
                        </label>
                        <input
                          type="text"
                          value={activityFormData.year}
                          onChange={(e) =>
                            setActivityFormData((prev) => ({
                              ...prev,
                              year: e.target.value,
                            }))
                          }
                          placeholder="2025 - 2026"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1.5">
                          Học Kỳ
                        </label>
                        <select
                          value={activityFormData.semester}
                          onChange={(e) =>
                            setActivityFormData((prev) => ({
                              ...prev,
                              semester: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                        >
                          <option value="Học kỳ 1">Học kỳ 1</option>
                          <option value="Học kỳ 2">Học kỳ 2</option>
                          <option value="Học kỳ Hè">Học kỳ Hè</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1.5">
                          Ngày Tổ Chức / Diễn Ra
                        </label>
                        <input
                          type="text"
                          value={activityFormData.date}
                          onChange={(e) =>
                            setActivityFormData((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          placeholder="Ví dụ: 15/10/2026"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1.5">
                          Trạng Thái Hoạt Động
                        </label>
                        <select
                          value={activityFormData.status}
                          onChange={(e) =>
                            setActivityFormData((prev) => ({
                              ...prev,
                              status: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                        >
                          <option value="in_progress">🟡 Đang diễn ra (Chưa có danh sách chính thức)</option>
                          <option value="available">🟢 Đã có danh sách ĐRL chính thức</option>
                          <option value="upcoming">🔵 Sắp diễn ra</option>
                          <option value="expired">⚪ Đã kết thúc</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-white/80 mb-1.5">
                          Link Bảng Danh Sách Điểm Rèn Luyện (Google Sheets / Drive)
                        </label>
                        <input
                          type="url"
                          value={activityFormData.drlLink}
                          onChange={(e) =>
                            setActivityFormData((prev) => ({
                              ...prev,
                              drlLink: e.target.value,
                            }))
                          }
                          placeholder="https://docs.google.com/spreadsheets/..."
                          className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                        <p className="text-[11px] text-white/50 mt-1">
                          Khi trạng thái là "Đang diễn ra", nếu để trống link thì sinh viên sẽ thấy thông báo "Chưa có danh sách chính thức".
                        </p>
                      </div>

                      {/* DANH SÁCH LINK BÀI VIẾT (NHIỀU LINK) */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-white/80">
                            Liên Kết Bài Viết / Fanpage CLB ({activityFormData.postLinks.length})
                          </label>
                          <button
                            type="button"
                            onClick={handleAddPostLink}
                            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Thêm Link Bài Viết
                          </button>
                        </div>
                        <div className="space-y-2">
                          {activityFormData.postLinks.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) =>
                                  handlePostLinkChange(idx, "title", e.target.value)
                                }
                                placeholder="Tiêu đề link (ví dụ: Bài phát động, Ảnh trao giải...)"
                                className="w-1/3 px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                              />
                              <input
                                type="url"
                                value={item.url}
                                onChange={(e) =>
                                  handlePostLinkChange(idx, "url", e.target.value)
                                }
                                placeholder="https://facebook.com/..."
                                className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                              />
                              {activityFormData.postLinks.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePostLink(idx)}
                                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-white/80 mb-1.5">
                          Link Ảnh Bìa Hoạt Động (Tùy chọn)
                        </label>
                        <input
                          type="url"
                          value={activityFormData.imageUrl}
                          onChange={(e) =>
                            setActivityFormData((prev) => ({
                              ...prev,
                              imageUrl: e.target.value,
                            }))
                          }
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      {/* VAI TRÒ VÀ ĐIỂM RÈN LUYỆN */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-white/80">
                            Cấu Hình Vai Trò & Điểm Rèn Luyện
                          </label>
                          <button
                            type="button"
                            onClick={handleAddRole}
                            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Thêm Vai Trò
                          </button>
                        </div>
                        <div className="space-y-2">
                          {activityFormData.rolesPoints.map((rp, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={rp.role}
                                onChange={(e) =>
                                  handleRoleChange(idx, "role", e.target.value)
                                }
                                placeholder="Vai trò (Ví dụ: Vận Động Viên)"
                                className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                              />
                              <input
                                type="text"
                                value={rp.points}
                                onChange={(e) =>
                                  handleRoleChange(idx, "points", e.target.value)
                                }
                                placeholder="+3 ĐRL"
                                className="w-32 px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                              />
                              {activityFormData.rolesPoints.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRole(idx)}
                                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-white/80 mb-1.5">
                          Mô Tả Hoạt Động (Tùy chọn)
                        </label>
                        <textarea
                          rows={2}
                          value={activityFormData.description}
                          onChange={(e) =>
                            setActivityFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Mô tả ngắn gọn về quy mô, thể lệ hoặc kết quả giải đấu..."
                          className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
                      >
                        Hủy Bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-neutral-950 text-xs font-bold shadow-lg hover:scale-105 transition"
                      >
                        {editingId ? "Cập Nhật Hoạt Động" : "Lưu Hoạt Động"}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* DANH SÁCH HOẠT ĐỘNG */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredActivities.map((act) => (
                      <div
                        key={act.id}
                        className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-emerald-400/30 transition flex flex-col justify-between gap-4 backdrop-blur-sm"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={
                              act.imageUrl ||
                              "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=300&q=80"
                            }
                            alt={act.title}
                            className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-white/10"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {act.year}
                              </span>
                              <span className="text-[10px] text-white/50">
                                {act.semester} • {act.date}
                              </span>
                              {act.status === "in_progress" && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-semibold">
                                  🟡 Đang diễn ra
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-white line-clamp-2 mb-2">
                              {act.title}
                            </h4>

                            <div className="flex flex-wrap gap-1.5">
                              {act.rolesPoints?.map((rp, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-black/50 text-white/80 border border-white/10"
                                >
                                  {rp.role}: <b className="text-emerald-300">{rp.points}</b>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* HÀNH ĐỘNG */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            {act.drlLink && (
                              <a
                                href={act.drlLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Link ĐRL</span>
                              </a>
                            )}
                            {act.postLinks?.length > 0 && (
                              <span className="text-[11px] text-white/40">
                                • {act.postLinks.length} bài viết
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditActivity(act)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-white/70 hover:text-emerald-300 transition"
                              title="Sửa hoạt động"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(act.id)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-400 transition"
                              title="Xóa hoạt động"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredActivities.length === 0 && (
                      <div className="col-span-full py-16 text-center text-white/40 text-xs">
                        Không tìm thấy hoạt động nào phù hợp.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CÀI ĐẶT THỜI GIAN FORM ĐĂNG KÝ */}
            {activeTab === "registration" && (
              <form
                onSubmit={handleSaveRegistrationSettings}
                className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-white/10 space-y-6 shadow-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <CalendarClock className="w-5 h-5 text-emerald-400" />
                      Cài Đặt Thời Gian Thu Thập Form
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Admin cài đặt ngày mở và ngày kết thúc nhận đơn. Cổng đăng ký sẽ mở và đóng theo đúng thời gian đã chọn.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-neutral-950 font-bold text-xs shadow-lg hover:scale-105 transition active:scale-95 shrink-0 self-start sm:self-auto"
                  >
                    <Save className="w-4 h-4" /> Lưu Cài Đặt
                  </button>
                </div>

                {/* 1. CHỌN CHẾ ĐỘ HOẠT ĐỘNG */}
                <div>
                  <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">
                    1. Chế Độ Mở Cổng Điền Form
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Tự động theo ngày */}
                    <div
                      onClick={() => {
                        sound.playPop();
                        setRegConfigState((prev) => ({ ...prev, mode: "auto" }));
                      }}
                      className={`relative p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        regConfigState.mode === "auto"
                          ? "bg-emerald-500/15 border-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                          : "bg-white/[0.03] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          Theo Lịch Cài Đặt
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Khuyên dùng
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 leading-relaxed">
                        Mở cổng từ ngày bắt đầu và <b>đóng form sau 23:59 ngày kết thúc</b>.
                      </p>
                    </div>

                    {/* Luôn mở */}
                    <div
                      onClick={() => {
                        sound.playPop();
                        setRegConfigState((prev) => ({ ...prev, mode: "open" }));
                      }}
                      className={`relative p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        regConfigState.mode === "open"
                          ? "bg-emerald-500/15 border-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                          : "bg-white/[0.03] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                          Luôn Mở Nhận Đơn
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 leading-relaxed">
                        Form mở liên tục cho sinh viên đăng ký, không tính ngày hết hạn.
                      </p>
                    </div>

                    {/* Khóa ngay */}
                    <div
                      onClick={() => {
                        sound.playPop();
                        setRegConfigState((prev) => ({ ...prev, mode: "closed" }));
                      }}
                      className={`relative p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        regConfigState.mode === "closed"
                          ? "bg-rose-500/15 border-rose-400/80 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                          : "bg-white/[0.03] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-rose-400" />
                          Đóng Cổng Ngay
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 leading-relaxed">
                        Đóng cổng đăng ký ngay lập tức và ngừng nhận đơn mới.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. CHỌN KHOẢNG NGÀY ĐƯỢC ĐIỀN FORM */}
                <div>
                  <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">
                    2. Khoảng Ngày Được Điền Form
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                      <label className="block text-xs font-semibold text-white/80 mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        Từ Ngày (Bắt đầu nhận form) *
                      </label>
                      <input
                        type="date"
                        required
                        value={regConfigState.startDate}
                        onChange={(e) =>
                          setRegConfigState((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                      />
                      <p className="text-[11px] text-white/50 mt-2">
                        Mở cổng từ 00:00 ngày:{" "}
                        <b className="text-emerald-300">
                          {formatDateVN(regConfigState.startDate) || "--/--/----"}
                        </b>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                      <label className="block text-xs font-semibold text-white/80 mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        Đến Ngày (Kết thúc nhận đơn) *
                      </label>
                      <input
                        type="date"
                        required
                        value={regConfigState.endDate}
                        onChange={(e) =>
                          setRegConfigState((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                      />
                      <p className="text-[11px] text-white/50 mt-2">
                        Hết hạn nhận đơn sau 23:59 ngày:{" "}
                        <b className="text-rose-300">
                          {formatDateVN(regConfigState.endDate) || "--/--/----"}
                        </b>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. LỜI NHẮN HIỂN THỊ KHI ĐÓNG FORM */}
                <div>
                  <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">
                    3. Thông Báo Hiển Thị Cho Sinh Viên Khi Cổng Khóa
                  </label>
                  <textarea
                    rows={3}
                    value={regConfigState.closedMessage}
                    onChange={(e) =>
                      setRegConfigState((prev) => ({
                        ...prev,
                        closedMessage: e.target.value,
                      }))
                    }
                    placeholder="Nhập thông báo gửi đến sinh viên khi đợt nhận đơn kết thúc..."
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder-white/30 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* 4. XEM TRƯỚC TRỰC QUAN (LIVE PREVIEW) */}
                <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Trạng Thái Thực Tế (Sinh viên thấy trên website)
                    </span>
                    {regPreviewStatus.isOpen ? (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        ĐANG MỞ ĐIỀN FORM
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-rose-400" />
                        CỔNG ĐĂNG KÝ ĐÃ ĐÓNG
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-white/70 space-y-1 pt-1">
                    <p>
                      • <b>Thời gian hiển thị:</b>{" "}
                      <span className="text-emerald-300">{regPreviewStatus.dateRangeText}</span>
                    </p>
                    <p>
                      • <b>Thông báo đính kèm:</b>{" "}
                      <span className="text-white/90">{regPreviewStatus.message}</span>
                    </p>
                  </div>
                </div>

                {/* NÚT LƯU CÀI ĐẶT */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-neutral-950 text-xs font-bold shadow-lg hover:scale-105 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Xác Nhận Lưu Cấu Hình Thời Gian
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: TRANG TÍNH & DANH SÁCH ĐĂNG KÝ */}
            {activeTab === "sheets" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-white/10 space-y-6 shadow-2xl">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    Quản Lý Dữ Liệu Google Sheets
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    Toàn bộ đơn đăng ký thành viên mới và bảng điểm rèn luyện được lưu trữ tập trung tại Google Sheets của CLB.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white">
                        Google Apps Script Web App
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Đã kết nối
                    </span>
                  </div>

                  <div className="bg-black/50 p-3 rounded-xl border border-white/10 font-mono text-[11px] text-white/60 truncate">
                    {GOOGLE_SHEET_CONFIG.SCRIPT_URL}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <a
                      href="https://docs.google.com/spreadsheets"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition"
                    >
                      <ExternalLink className="w-4 h-4" /> Mở Trang Tính Google Sheets
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
