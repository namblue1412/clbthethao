import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Calendar,
  ExternalLink,
  Search,
  Lock,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";
import { THEME } from "../data/clubData";
import { sound } from "../utils/audio";

export default function ActivitiesSection({
  activities,
  onOpenAdmin,
}) {
  const [selectedYear, setSelectedYear] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Trích xuất danh sách các năm học duy nhất để làm bộ lọc
  const availableYears = useMemo(() => {
    const years = new Set(activities.map((a) => a.year).filter(Boolean));
    return ["all", ...Array.from(years)];
  }, [activities]);

  // Lọc hoạt động theo năm học và từ khóa tìm kiếm
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchYear = selectedYear === "all" || act.year === selectedYear;
      const matchSearch =
        searchQuery.trim() === "" ||
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.rolesPoints?.some((rp) => rp.role.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchYear && matchSearch;
    });
  }, [activities, selectedYear, searchQuery]);

  return (
    <section id="activities" className="relative py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* TIÊU ĐỀ SECTION & NÚT QUẢN TRỊ ADMIN */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Hoạt Động & Quyền Lợi Sinh Viên
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white"
            >
              Hoạt Động &{" "}
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${THEME.primary}`}>
                Điểm Rèn Luyện
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-sm sm:text-base text-white/65 max-w-2xl leading-relaxed"
            >
              Theo dõi các giải đấu trong năm và tra cứu danh sách điểm rèn luyện của bạn.
            </motion.p>
          </div>

          {/* NÚT MỞ BẢNG QUẢN TRỊ CHO CHỦ NHIỆM (CHỈ HIỆN KHI ĐƯỢC CẤP QUYỀN) */}
          {onOpenAdmin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 shrink-0"
            >
              <button
                onClick={() => {
                  sound.playSpark();
                  onOpenAdmin();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-emerald-500/20 border border-white/15 hover:border-emerald-400/50 text-white hover:text-emerald-300 text-xs font-bold backdrop-blur-md shadow-lg transition active:scale-95"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quản Trị Hoạt Động</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* BỘ LỌC NĂM HỌC & THANH TÌM KIẾM */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          {/* TABS NĂM HỌC */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => {
                  sound.playPop();
                  setSelectedYear(year);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  selectedYear === year
                    ? "bg-gradient-to-r from-emerald-500 to-lime-400 text-neutral-950 shadow-md shadow-emerald-500/20 scale-105"
                    : "bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/10"
                }`}
              >
                {year === "all" ? "Tất cả các năm" : year}
              </button>
            ))}
          </div>

          {/* Ô TÌM KIẾM HOẠT ĐỘNG */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm giải đấu, vai trò..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-400 transition"
            />
          </div>
        </div>

        {/* LƯỚI DANH SÁCH CÁC THẺ HOẠT ĐỘNG */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredActivities.map((activity, idx) => (
            <ActivityCard key={activity.id || idx} activity={activity} />
          ))}
        </div>

        {/* TRẠNG THÁI TRỐNG NẾU KHÔNG CÓ KẾT QUẢ */}
        {filteredActivities.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 my-8">
            <AlertCircle className="w-8 h-8 text-white/30 mx-auto mb-3" />
            <p className="text-white/60 text-sm">Không tìm thấy hoạt động nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}

      </div>
    </section>
  );
}

/**
 * Thẻ hiển thị một hoạt động với huy hiệu ĐRL đa vai trò
 */
function ActivityCard({ activity }) {
  const hasDrl = Boolean(activity.drlLink && activity.drlLink.trim() !== "");
  const isOngoing = activity.status === "in_progress";
  const isUpcoming = activity.status === "upcoming";

  // Xử lý danh sách bài viết (hỗ trợ cả 1 link lẫn nhiều link)
  const postLinks = useMemo(() => {
    if (Array.isArray(activity.postLinks) && activity.postLinks.length > 0) {
      return activity.postLinks.filter((p) => p && p.url && p.url.trim() !== "");
    }
    if (activity.postLink && activity.postLink.trim() !== "") {
      return [{ title: "Xem bài viết", url: activity.postLink.trim() }];
    }
    return [];
  }, [activity.postLinks, activity.postLink]);

  // Phân biệt biểu tượng và màu sắc theo tên vai trò
  const getRoleBadgeStyle = (roleName = "") => {
    const lower = roleName.toLowerCase();
    if (lower.includes("tổ chức") || lower.includes("btc") || lower.includes("hậu cần") || lower.includes("điều phối")) {
      return "bg-amber-500/15 border-amber-400/40 text-amber-300";
    }
    if (lower.includes("vận động viên") || lower.includes("vđv") || lower.includes("thi đấu") || lower.includes("cầu thủ")) {
      return "bg-emerald-500/15 border-emerald-400/40 text-emerald-300";
    }
    return "bg-cyan-500/15 border-cyan-400/40 text-cyan-300";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="group relative rounded-[2rem] bg-neutral-900/85 border border-white/10 hover:border-emerald-500/40 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5"
    >
      {/* VẦNG HÀO QUANG HOVER */}
      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/15 via-lime-400/10 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />

      <div>
        {/* BANNER ẢNH BÌA HOẠT ĐỘNG */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-950">
          <img
            src={activity.imageUrl || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80"}
            alt={activity.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

          {/* HUY HIỆU NĂM HỌC & HỌC KỲ */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-neutral-950/80 border border-white/20 text-white font-bold text-[11px] backdrop-blur-md shadow-md">
              {activity.year}
            </span>
            {activity.semester && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold text-[11px] backdrop-blur-md shadow-md">
                {activity.semester}
              </span>
            )}
          </div>

          {/* TRẠNG THÁI HIỆU LỰC DANH SÁCH ĐIỂM */}
          <div className="absolute top-4 right-4 z-10">
            {isOngoing ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/90 text-neutral-950 font-black text-[11px] shadow-lg inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Đang diễn ra
              </span>
            ) : isUpcoming ? (
              <span className="px-3 py-1 rounded-full bg-cyan-500/90 text-neutral-950 font-black text-[11px] shadow-lg inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Sắp diễn ra
              </span>
            ) : hasDrl ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-neutral-950 font-black text-[11px] shadow-lg inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã Có DS Điểm
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-neutral-900/90 border border-white/20 text-white/60 font-semibold text-[11px] shadow-lg inline-flex items-center gap-1.5">
                Không còn hiệu lực
              </span>
            )}
          </div>

          {/* NGÀY TỔ CHỨC Ở ĐÁY ẢNH */}
          {activity.date && (
            <div className="absolute bottom-3 left-5 z-10 flex items-center gap-1.5 text-xs text-white/70 font-medium drop-shadow">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activity.date}</span>
            </div>
          )}
        </div>

        {/* NỘI DUNG CHI TIẾT CỦA THẺ */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
            {activity.title}
          </h3>

          {activity.description && (
            <p className="mt-2 text-xs text-white/60 line-clamp-2 leading-relaxed">
              {activity.description}
            </p>
          )}

          {/* KHU VỰC HUY HIỆU PHÂN CHIA ĐIỂM THEO TỪNG VAI TRÒ */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-400/90 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Mức điểm rèn luyện theo vai trò:
            </div>

            <div className="flex flex-wrap gap-2">
              {activity.rolesPoints && activity.rolesPoints.length > 0 ? (
                activity.rolesPoints.map((rp, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md flex items-center gap-2 ${getRoleBadgeStyle(
                      rp.role
                    )}`}
                  >
                    <span>{rp.role}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-black/40 font-black text-white text-[11px]">
                      {rp.points}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-white/40 italic">Chưa cập nhật chi tiết vai trò</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CÁC NÚT BẤM HÀNH ĐỘNG DƯỚI CÙNG THẺ */}
      <div className="p-6 pt-0 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* NÚT XEM DANH SÁCH ĐRL HOẶC THÔNG BÁO CHƯA CÓ / KHÔNG CÒN HIỆU LỰC */}
          {hasDrl ? (
            <a
              href={activity.drlLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playSpark()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-neutral-950 font-bold text-xs shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xem Danh Sách ĐRL</span>
            </a>
          ) : isOngoing || isUpcoming ? (
            <div
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 font-semibold text-xs select-none"
              title="Hoạt động đang diễn ra, chưa có danh sách chính thức"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Chưa có danh sách chính thức</span>
            </div>
          ) : (
            <div
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/40 font-medium text-xs cursor-not-allowed select-none"
              title="Hoạt động này không còn hiệu lực tra cứu danh sách điểm rèn luyện"
            >
              <FileSpreadsheet className="w-4 h-4 text-white/30" />
              <span>Không còn hiệu lực</span>
            </div>
          )}

          {/* NẾU CHỈ CÓ 1 LINK BÀI VIẾT THÌ HIỂN THỊ CÙNG DÒNG */}
          {postLinks.length === 1 && (
            <a
              href={postLinks[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white text-xs font-semibold transition hover:border-emerald-400/40"
            >
              <span>{postLinks[0].title || "Xem Bài Viết"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* NẾU CÓ TỪ 2 LINK BÀI VIẾT TRỞ LÊN THÌ HIỂN THỊ THÀNH DANH SÁCH RÕ RÀNG */}
        {postLinks.length > 1 && (
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-white/50 flex items-center gap-1 font-medium">
              <ExternalLink className="w-3 h-3 text-emerald-400" /> Bài viết:
            </span>
            {postLinks.map((p, pIdx) => (
              <a
                key={pIdx}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/15 hover:border-emerald-400/40 text-white/85 hover:text-emerald-300 text-xs font-medium transition"
              >
                <span>{p.title || `Bài viết ${pIdx + 1}`}</span>
                <ExternalLink className="w-3 h-3 text-white/40" />
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
