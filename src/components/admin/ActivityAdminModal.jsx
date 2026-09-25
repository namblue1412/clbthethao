import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Lock,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle,
  LogOut,
  Sparkles,
  Mail,
  ArrowRight,
  UserCheck,
  Loader2,
  KeyRound,
  Clock,
  Calendar,
  CalendarClock,
  Unlock,
  Save
} from "lucide-react";
import {
  GOOGLE_SHEET_ACTIVITIES_CONFIG,
  saveStoredActivities
} from "../../data/activitiesData";
import {
  getStoredRegistrationConfig,
  saveStoredRegistrationConfig,
  checkRegistrationStatus,
  formatDateVN
} from "../../data/registrationConfig";
import { sound } from "../../utils/audio";
import {
  loginWithEmail,
  loginWithGoogle,
  logoutAdmin,
  resetAdminPassword,
  subscribeAuth,
  isFirebaseReady,
} from "../../services/firebase";

function generateId() {
  return `act-${Date.now()}`;
}

function getCurrentDate() {
  return new Date().toLocaleDateString("vi-VN");
}

export default function ActivityAdminModal({
  isOpen,
  onClose,
  activities,
  setActivities,
  initialTab = "activities",
}) {
  // Trạng thái xác thực
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isLocalAuth, setIsLocalAuth] = useState(false);
  const isAuthenticated = Boolean(firebaseUser || isLocalAuth);

  // Phân hệ Tab: "activities" (Hoạt động & ĐRL) hoặc "registration" (Thời gian mở form)
  const [activeTab, setActiveTab] = useState(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);

  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  // Cấu hình thời gian thu thập form
  const [regConfigState, setRegConfigState] = useState(getStoredRegistrationConfig);

  // Lắng nghe cập nhật cấu hình từ hệ thống bên ngoài (localStorage/event)
  useEffect(() => {
    const handleConfigEvent = (e) => {
      if (e?.detail) {
        setRegConfigState(e.detail);
      }
    };
    window.addEventListener("clb_registration_config_changed", handleConfigEvent);
    return () => window.removeEventListener("clb_registration_config_changed", handleConfigEvent);
  }, []);

  // Form đăng nhập
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quên mật khẩu
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Trạng thái Form thêm / sửa hoạt động
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Dữ liệu form hoạt động
  const emptyForm = {
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
  const [formData, setFormData] = useState(emptyForm);

  // Lắng nghe phiên đăng nhập Firebase (Tự động giữ trạng thái khi tải lại trang)
  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Xử lý đăng nhập Email & Mật khẩu
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setAuthError("");

    // Nếu chưa cấu hình Firebase, dùng cơ chế Fallback mật khẩu nội bộ
    if (!isFirebaseReady()) {
      const correctPassword = GOOGLE_SHEET_ACTIVITIES_CONFIG.ADMIN_PASSWORD || "clbduocadmin";
      if (passwordInput.trim() === correctPassword) {
        setIsLocalAuth(true);
        sound.playSpark();
        showToast("Đã mở bảng quản trị (Chế độ nội bộ)!");
      } else {
        setAuthError("Mật khẩu dự phòng chưa chính xác!");
        sound.playPop();
      }
      return;
    }

    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError("Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithEmail(emailInput, passwordInput);
      sound.playSpark();
      showToast("Đăng nhập Firebase thành công!");
    } catch (err) {
      sound.playPop();
      setAuthError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Đăng nhập 1 chạm với Google
  const handleGoogleLogin = async () => {
    setAuthError("");
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      sound.playSpark();
      showToast("Đăng nhập bằng Google thành công!");
    } catch (err) {
      sound.playPop();
      setAuthError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gửi email khôi phục mật khẩu khi quên
  const handleSendResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setAuthError("Vui lòng nhập email quản trị để nhận liên kết khôi phục!");
      return;
    }
    setIsSubmitting(true);
    setAuthError("");
    try {
      await resetAdminPassword(forgotEmail);
      setForgotSuccess(true);
      sound.playSpark();
    } catch (err) {
      sound.playPop();
      setAuthError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Đăng xuất Admin an toàn
  const handleLogout = async () => {
    await logoutAdmin();
    setIsLocalAuth(false);
    setFirebaseUser(null);
    setPasswordInput("");
    setEmailInput("");
    setAuthError("");
    setIsFormOpen(false);
    sound.playPop();
    showToast("Đã đăng xuất tài khoản quản trị.");
  };

  // Mở form thêm mới
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  // Mở form chỉnh sửa
  const handleOpenEdit = (act) => {
    setEditingId(act.id);
    const initialPostLinks =
      Array.isArray(act.postLinks) && act.postLinks.length > 0
        ? JSON.parse(JSON.stringify(act.postLinks))
        : act.postLink && act.postLink.trim()
        ? [{ title: "Bài viết", url: act.postLink.trim() }]
        : [{ title: "Bài viết", url: "" }];

    setFormData({
      title: act.title || "",
      year: act.year || "2025 - 2026",
      semester: act.semester || "Học kỳ 2",
      date: act.date || "",
      rolesPoints: act.rolesPoints && act.rolesPoints.length > 0
        ? JSON.parse(JSON.stringify(act.rolesPoints))
        : [{ role: "Ban Tổ Chức", points: "+5 ĐRL" }],
      status: act.status || (act.drlLink ? "available" : "in_progress"),
      drlLink: act.drlLink || "",
      postLinks: initialPostLinks,
      imageUrl: act.imageUrl || "",
      description: act.description || "",
    });
    setIsFormOpen(true);
  };

  // Thao tác với danh sách link bài viết
  const handleAddPostLink = () => {
    setFormData((prev) => ({
      ...prev,
      postLinks: [...prev.postLinks, { title: "", url: "" }],
    }));
  };

  const handleRemovePostLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      postLinks: prev.postLinks.filter((_, i) => i !== index),
    }));
  };

  const handlePostLinkChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.postLinks];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, postLinks: updated };
    });
  };

  // Thêm dòng vai trò mới
  const handleAddRole = () => {
    setFormData((prev) => ({
      ...prev,
      rolesPoints: [...prev.rolesPoints, { role: "", points: "+ ĐRL" }],
    }));
  };

  // Xóa dòng vai trò
  const handleRemoveRole = (index) => {
    setFormData((prev) => ({
      ...prev,
      rolesPoints: prev.rolesPoints.filter((_, i) => i !== index),
    }));
  };

  // Thay đổi nội dung dòng vai trò
  const handleRoleChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.rolesPoints];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, rolesPoints: updated };
    });
  };

  // Xóa hoạt động
  const handleDeleteActivity = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hoạt động này?")) {
      const updated = activities.filter((a) => a.id !== id);
      setActivities(updated);
      saveStoredActivities(updated);
      showToast("Đã xóa hoạt động thành công!");
      sound.playPop();

      // Đồng bộ xóa lên Google Sheet nếu có SCRIPT_URL
      syncToGoogleSheet("delete", { id });
    }
  };

  // Lưu hoạt động (Thêm mới hoặc Cập nhật)
  const handleSaveActivity = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tên hoạt động!");
      return;
    }

    const filteredPostLinks = formData.postLinks.filter((p) => p.url && p.url.trim() !== "");
    const primaryPostLink = filteredPostLinks.length > 0 ? filteredPostLinks[0].url : "";

    const activityPayload = {
      id: editingId || generateId(),
      title: formData.title.trim(),
      year: formData.year,
      semester: formData.semester,
      date: formData.date.trim() || getCurrentDate(),
      rolesPoints: formData.rolesPoints.filter((r) => r.role.trim() !== ""),
      status: formData.status,
      drlLink: formData.drlLink.trim(),
      postLink: primaryPostLink,
      postLinks: filteredPostLinks,
      imageUrl: formData.imageUrl.trim() || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      description: formData.description.trim(),
    };

    let updatedList;
    if (editingId) {
      updatedList = activities.map((a) => (a.id === editingId ? activityPayload : a));
      showToast("Đã cập nhật hoạt động thành công!");
    } else {
      updatedList = [activityPayload, ...activities];
      showToast("Đã thêm hoạt động mới thành công!");
    }

    setActivities(updatedList);
    saveStoredActivities(updatedList);
    sound.playSpark();
    setIsFormOpen(false);

    // Đồng bộ lên Google Sheet
    syncToGoogleSheet(editingId ? "update" : "create", activityPayload);
  };

  // Hàm đồng bộ lên Google Sheet (chạy nền không gây chậm giao diện)
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Lưu cài đặt thời gian mở form
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

  // Trạng thái tính toán xem trước cho Admin
  const regPreviewStatus = checkRegistrationStatus(regConfigState);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl my-8 bg-neutral-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-white"
      >
        {/* TOAST THÔNG BÁO */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-emerald-500 text-neutral-950 font-bold text-xs shadow-xl flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-500 flex items-center justify-center text-neutral-950 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Quản Trị Hoạt Động & ĐRL</h2>
                {isAuthenticated && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    <UserCheck className="w-3 h-3" />
                    {firebaseUser ? (firebaseUser.email || "Firebase Admin") : "Admin Cục Bộ"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-400 font-medium">
                Ban Chủ Nhiệm CLB Thể Thao Trường Dược
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                title="Đăng xuất khỏi phiên quản trị"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition border border-white/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NỘI DUNG: CHƯA ĐĂNG NHẬP HOẶC ĐÃ ĐĂNG NHẬP */}
        <div className="p-6">
          {!isAuthenticated ? (
            /* MÀN HÌNH ĐĂNG NHẬP FIREBASE AUTHENTICATION */
            <div className="max-w-md mx-auto py-6 text-center">
              {isForgotModalOpen ? (
                /* PHÂN HỆ QUÊN MẬT KHẨU */
                <form onSubmit={handleSendResetPassword} className="space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-3 shadow-lg">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-white">Khôi Phục Mật Khẩu Admin</h3>
                  <p className="text-xs text-white/60">
                    Nhập email tài khoản quản trị để Google gửi liên kết đặt lại mật khẩu an toàn.
                  </p>

                  {forgotSuccess ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-left">
                      <p className="text-xs text-emerald-300 font-semibold mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Đã gửi email khôi phục thành công!
                      </p>
                      <p className="text-[11px] text-white/70">
                        Vui lòng kiểm tra hộp thư (bao gồm cả mục Thư rác/Spam) của email <b>{forgotEmail}</b> và làm theo hướng dẫn của Google.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-left">
                        <label className="block text-xs font-semibold text-white/80 mb-1.5">
                          Email Quản Trị
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
                        <p className="text-xs text-red-400 text-left flex items-center gap-1.5 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                          <AlertCircle className="w-4 h-4 shrink-0" /> {authError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-neutral-950 font-bold text-xs shadow-lg hover:shadow-emerald-500/30 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi yêu cầu...
                          </>
                        ) : (
                          "Gửi Liên Kết Đặt Lại Mật Khẩu"
                        )}
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
                    className="text-xs text-white/60 hover:text-white transition pt-2"
                  >
                    ← Quay lại màn hình đăng nhập
                  </button>
                </form>
              ) : (
                /* PHÂN HỆ ĐĂNG NHẬP CHÍNH */
                <div>
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-3 shadow-lg">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-1">Xác Thực Quyền Chủ Nhiệm</h3>
                  <p className="text-xs text-white/60 mb-5">
                    {isFirebaseReady()
                      ? "Bảo mật tài khoản Ban Chủ Nhiệm qua Google Firebase Authentication."
                      : "Bảo mật đăng nhập bảng quản trị CLB Thể Thao Trường Dược."}
                  </p>

                  {/* THÔNG BÁO NẾU CHƯA CẤU HÌNH FIREBASE API KEY */}
                  {!isFirebaseReady() && (
                    <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-left">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] space-y-1">
                          <p className="font-bold text-amber-300">Firebase chưa được kết nối API Key</p>
                          <p className="text-white/70">
                            Website đang chạy chế độ bảo mật dự phòng nội bộ. Bạn có thể nhập mật khẩu mặc định (<code>clbduocadmin</code>) hoặc xem file <span className="text-emerald-400 font-semibold underline">HUONG_DAN_FIREBASE_AUTH.md</span> để gắn API Key.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORM ĐĂNG NHẬP */}
                  <form onSubmit={handleEmailLogin} className="space-y-3.5 text-left">
                    {isFirebaseReady() && (
                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1">
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
                      <div className="flex items-center justify-between mb-1">
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
                          placeholder={isFirebaseReady() ? "Nhập mật khẩu tài khoản..." : "Nhập mật khẩu admin..."}
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
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-neutral-950 font-bold text-xs shadow-lg hover:shadow-emerald-500/30 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Đang xác thực...
                        </>
                      ) : (
                        <>
                          <span>{isFirebaseReady() ? "Đăng Nhập Firebase" : "Mở Bảng Quản Trị"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* NÚT ĐĂNG NHẬP 1 CHẠM BẰNG GOOGLE (NẾU ĐÃ KẾT NỐI FIREBASE) */}
                  {isFirebaseReady() && (
                    <div className="mt-5 pt-5 border-t border-white/10">
                      <p className="text-[11px] text-white/40 mb-3">HOẶC TIỆN LỢI HƠN</p>
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isSubmitting}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                      >
                        {/* Biểu tượng Google SVG chuẩn */}
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
                </div>
              )}
            </div>
          ) : (
            /* MÀN HÌNH DASHBOARD QUẢN TRỊ */
            <div>
              {/* THANH CHUYỂN TAB QUẢN TRỊ */}
              <div className="flex border-b border-white/10 mb-6 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setActiveTab("activities");
                  }}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition -mb-px rounded-t-xl ${
                    activeTab === "activities"
                      ? "border-emerald-400 text-emerald-300 bg-white/[0.04]"
                      : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Hoạt Động & ĐRL ({activities.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setActiveTab("registration");
                  }}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition -mb-px rounded-t-xl ${
                    activeTab === "registration"
                      ? "border-emerald-400 text-emerald-300 bg-white/[0.04]"
                      : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <CalendarClock className="w-4 h-4 text-lime-400" />
                  <span>Thời Gian Thu Thập Form</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      regPreviewStatus.isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                    }`}
                    title={regPreviewStatus.isOpen ? "Đang mở nhận đơn" : "Đã khóa cổng"}
                  />
                </button>
              </div>

              {/* TAB 1: QUẢN TRỊ HOẠT ĐỘNG */}
              {activeTab === "activities" && (
                <div>
                  {/* THANH TRẠNG THÁI VÀ NÚT THÊM */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>
                    Google Sheets Sync:{" "}
                    {GOOGLE_SHEET_ACTIVITIES_CONFIG.SCRIPT_URL ? (
                      <b className="text-emerald-300">Đã kết nối trực tiếp</b>
                    ) : (
                      <b className="text-yellow-400">Đang lưu cục bộ (Chưa gắn SCRIPT_URL)</b>
                    )}
                  </span>
                </div>

                {!isFormOpen && (
                  <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-neutral-950 font-bold text-xs shadow-md hover:scale-105 transition"
                  >
                    <Plus className="w-4 h-4" /> Thêm Hoạt Động Mới
                  </button>
                )}
              </div>

              {/* FORM THÊM / SỬA */}
              {isFormOpen ? (
                <form onSubmit={handleSaveActivity} className="py-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {editingId ? "Chỉnh Sửa Hoạt Động" : "Thêm Hoạt Động Mới"}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      Hủy bỏ
                    </button>
                  </div>

                  {/* Tên hoạt động */}
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Tên Hoạt Động *
                    </label>
                    <input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="VD: Giải Cầu Lông Dược Sĩ Trẻ Mở Rộng 2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Hàng 3 cột: Năm học, Học kỳ, Ngày tổ chức */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1">
                        Năm Học *
                      </label>
                      <input
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="VD: 2025 - 2026"
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1">
                        Học Kỳ
                      </label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-black/80 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                      >
                        <option value="Học kỳ 1">Học kỳ 1</option>
                        <option value="Học kỳ 2">Học kỳ 2</option>
                        <option value="Học kỳ Hè">Học kỳ Hè</option>
                        <option value="Cả năm">Cả năm</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1">
                        Ngày Tổ Chức
                      </label>
                      <input
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        placeholder="VD: 15/03/2026"
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {/* THANH ĐIỀU CHỈNH TRẠNG THÁI HOẠT ĐỘNG */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                    <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Trạng Thái Hoạt Động & Danh Sách ĐRL *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
                    >
                      <option value="in_progress">🟡 Đang diễn ra (Hiển thị: Chưa có danh sách chính thức)</option>
                      <option value="available">🟢 Đã có danh sách điểm rèn luyện (Mở link file)</option>
                      <option value="upcoming">🔵 Sắp diễn ra (Chưa mở danh sách)</option>
                      <option value="expired">⚪ Đã kết thúc (Hiển thị: Không còn hiệu lực)</option>
                    </select>
                    <p className="text-[11px] text-white/50">
                      {formData.status === "in_progress" && "👉 Sinh viên sẽ thấy nhãn 'Đang diễn ra' và nút 'Chưa có danh sách chính thức'."}
                      {formData.status === "available" && "👉 Sinh viên có thể bấm vào nút để mở trực tiếp file danh sách điểm."}
                      {formData.status === "expired" && "👉 Dành cho các hoạt động cũ từ năm trước (nút 'Không còn hiệu lực')."}
                      {formData.status === "upcoming" && "👉 Dành cho giải đấu sắp diễn ra."}
                    </p>
                  </div>

                  {/* KHU VỰC QUẢN LÝ MỨC ĐIỂM THEO VAI TRÒ */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-emerald-300">
                        Phân Chia Điểm Rèn Luyện Theo Vai Trò
                      </label>
                      <button
                        type="button"
                        onClick={handleAddRole}
                        className="text-[11px] font-bold text-lime-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Thêm vai trò khác
                      </button>
                    </div>
                    <p className="text-[11px] text-white/50 mb-3">
                      Nhập vai trò (BTC, VĐV, Cổ vũ...) và số điểm tương ứng để sinh viên tra cứu.
                    </p>

                    <div className="space-y-2">
                      {formData.rolesPoints.map((rp, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            value={rp.role}
                            onChange={(e) => handleRoleChange(index, "role", e.target.value)}
                            placeholder="Tên vai trò (VD: Ban Tổ Chức)"
                            className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs"
                          />
                          <input
                            value={rp.points}
                            onChange={(e) => handleRoleChange(index, "points", e.target.value)}
                            placeholder="Điểm (VD: +5 ĐRL)"
                            className="w-32 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-emerald-300 font-bold text-xs"
                          />
                          {formData.rolesPoints.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRole(index)}
                              className="p-1.5 text-white/40 hover:text-red-400 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Link Danh Sách ĐRL (KHÔNG BẮT BUỘC) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-white/80">
                        Link File Danh Sách ĐRL <span className="text-white/40 font-normal">(Không bắt buộc)</span>
                      </label>
                      <span className="text-[10px] text-yellow-300/80">
                        Nếu để trống và đang diễn ra ➔ Hiện "Chưa có danh sách chính thức"
                      </span>
                    </div>
                    <input
                      value={formData.drlLink}
                      onChange={(e) => setFormData({ ...formData, drlLink: e.target.value })}
                      placeholder="Dán link Google Sheet / Drive danh sách sinh viên được nhận ĐRL..."
                      className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* LINK CÁC BÀI VIẾT FANPAGE / TRUYỀN THÔNG (HỖ TRỢ NHIỀU LINK) */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                        Các Link Bài Viết / Truyền Thông (Facebook, Fanpage...)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddPostLink}
                        className="text-[11px] font-bold text-lime-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Thêm link bài viết
                      </button>
                    </div>
                    <p className="text-[11px] text-white/50">
                      Bạn có thể nhập nhiều link (Ví dụ: bài phát động, album ảnh, bài tổng kết giải...).
                    </p>

                    <div className="space-y-2">
                      {formData.postLinks.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            value={p.title}
                            onChange={(e) => handlePostLinkChange(idx, "title", e.target.value)}
                            placeholder="Tiêu đề link (VD: Bài phát động, Album ảnh...)"
                            className="w-1/3 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs"
                          />
                          <input
                            value={p.url}
                            onChange={(e) => handlePostLinkChange(idx, "url", e.target.value)}
                            placeholder="Dán link bài viết (https://...)"
                            className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs"
                          />
                          {formData.postLinks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePostLink(idx)}
                              className="p-1.5 text-white/40 hover:text-red-400 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Link Ảnh Bìa Hoạt Động */}
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Link Ảnh Bìa Hoạt Động <span className="text-white/40 font-normal">(Tùy chọn)</span>
                    </label>
                    <input
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="URL hình ảnh đại diện..."
                      className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Mô tả hoạt động */}
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Mô Tả Ngắn / Ghi Chú
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Ghi chú ngắn về hoạt động, điều kiện cộng điểm..."
                      className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Nút bấm Lưu */}
                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-neutral-950 text-xs font-bold shadow-lg hover:scale-105 transition"
                    >
                      {editingId ? "Cập Nhật Hoạt Động" : "Lưu Hoạt Động"}
                    </button>
                  </div>
                </form>
              ) : (
                /* DANH SÁCH HOẠT ĐỘNG HIỆN CÓ ĐỂ QUẢN LÝ */
                <div className="py-4 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-400/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={act.imageUrl || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=300&q=80"}
                          alt={act.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {act.year}
                            </span>
                            <span className="text-[10px] text-white/50">{act.date}</span>
                            {!act.drlLink && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-amber-300 border border-amber-400/30 font-medium">
                                Không còn hiệu lực
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{act.title}</h4>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
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

                      {/* Các nút hành động */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {act.drlLink && (
                          <a
                            href={act.drlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-emerald-300 transition"
                            title="Mở link danh sách ĐRL"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEdit(act)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-white/70 hover:text-emerald-300 transition"
                          title="Sửa hoạt động"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition"
                          title="Xóa hoạt động"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {activities.length === 0 && (
                    <div className="text-center py-12 text-white/50 text-xs">
                      Chưa có hoạt động nào. Hãy bấm "Thêm Hoạt Động Mới" ở trên!
                    </div>
                  )}
                </div>
              )}
                </div>
              )}

              {/* TAB 2: CÀI ĐẶT THỜI GIAN FORM ĐĂNG KÝ */}
              {activeTab === "registration" && (
                <form onSubmit={handleSaveRegistrationSettings} className="py-2 space-y-6">
                  {/* TIÊU ĐỀ & GIỚI THIỆU */}
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
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-neutral-950 font-bold text-xs shadow-lg hover:scale-105 transition active:scale-95 shrink-0 self-start sm:self-auto"
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
                            setRegConfigState((prev) => ({ ...prev, startDate: e.target.value }))
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
                            setRegConfigState((prev) => ({ ...prev, endDate: e.target.value }))
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
                        setRegConfigState((prev) => ({ ...prev, closedMessage: e.target.value }))
                      }
                      placeholder="Nhập thông báo gửi đến sinh viên khi đợt nhận đơn kết thúc..."
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder-white/30 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* 4. XEM TRƯỚC TRỰC QUAN (LIVE PREVIEW) */}
                  <div className="p-4 rounded-2xl bg-neutral-950/80 border border-white/15 space-y-2">
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
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
