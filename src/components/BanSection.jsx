import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  ChevronRight,
  Star,
  Sparkles
} from "lucide-react";
import { SECTIONS, CATEGORIES } from "../data/clubData";

export default function BanSection() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredSections =
    activeCategory === "all"
      ? SECTIONS
      : SECTIONS.filter((s) => s.category === activeCategory);

  return (
    <section id="ban" className="relative py-28 bg-neutral-950/70 overflow-hidden">
      {/* NỀN ÁNH SÁNG 3D MỜ */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      <div className="mx-auto max-w-7xl px-4">
        
        {/* HEADER TIÊU ĐỀ */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" /> 6 Phân Ban Hoạt Động
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white"
          >
            Lựa Chọn Sân Chơi Của Bạn
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-white/60 text-base"
          >
            Từ những pha bóng nảy lửa, đường cầu chuẩn xác đến bộ môn <b>Pickleball mới ra mắt 2026</b> hay đam mê sáng tạo nội dung — luôn có vị trí xứng đáng dành cho bạn.
          </motion.p>

          {/* BỘ LỌC PHÂN BAN THÔNG MINH */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-2.5"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-gradient-to-r from-emerald-500 to-lime-500 text-neutral-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105"
                    : "bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* LƯỚI HIỂN THỊ CÁC THẺ BAN CÓ HIỆU ỨNG NỔI 3D */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredSections.map((s, idx) => (
              <motion.div
                key={s.key}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
              >
                <BanCard section={s} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

/**
 * BanCard với hiệu ứng 3D perspective tilt khi rê chuột
 * Kết hợp linh vật Mascot 3D riêng cho từng môn thể thao
 */
function BanCard({ section }) {
  const [tab, setTab] = useState("goals");
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const Icon = section.icon;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (py - 0.5) * -10,
      y: (px - 0.5) * 10,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-full pt-14 perspective-1000"
    >
      {/* LINH VẬT PIKACHU ANIMATION RIÊNG CHO TỪNG BAN */}
      <PikachuMascot type={section.key} />

      {/* THẺ CHÍNH VỚI 3D TILT */}
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative rounded-[2.2rem] overflow-hidden border border-white/10 bg-neutral-900/60 backdrop-blur-xl hover:border-emerald-500/40 transition-colors duration-500 flex flex-col h-full shadow-2xl group"
      >
        {/* NỀN COVER SVG NGHỆ THUẬT */}
        <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none">
          <SectionCoverSVG type={section.coverType} />
        </div>

        {/* NỘI DUNG THẺ */}
        <div className="relative p-7 flex-grow flex flex-col z-10">
          
          {/* HEADER THẺ: ICON + TÊN BAN + TRƯỞNG BAN */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-neutral-950 shadow-lg ${section.accent} group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{section.name}</h3>
                  {section.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-lime-400 text-neutral-950 shadow-[0_0_12px_rgba(163,230,53,0.6)] animate-pulse">
                      {section.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-400 mt-1 font-medium">
                  {section.leader}
                </p>
              </div>
            </div>
          </div>

          {/* SLOGAN BAN */}
          <div className="mb-5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/5 text-xs text-white/70 italic">
            "{section.slogan}"
          </div>

          {/* CÁC TAB CHUYỂN ĐỔI: ĐỊNH HƯỚNG / DẤU ẤN / THÀNH TÍCH */}
          <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl backdrop-blur-sm mb-5 w-fit border border-white/5">
            <TabBtn active={tab === "goals"} onClick={() => setTab("goals")}>
              Định hướng
            </TabBtn>
            <TabBtn active={tab === "history"} onClick={() => setTab("history")}>
              Dấu ấn
            </TabBtn>
            <TabBtn active={tab === "achievements"} onClick={() => setTab("achievements")}>
              Thành tích
            </TabBtn>
          </div>

          {/* KHU VỰC HIỂN THỊ NỘI DUNG TỪNG TAB */}
          <div className="min-h-[190px] flex-grow">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {tab === "goals" && (
                  <ul className="space-y-3">
                    {section.goals.map((g, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-white/75 text-xs sm:text-sm leading-relaxed"
                      >
                        <Target className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {tab === "history" && (
                  <ul className="space-y-3.5 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-white/10">
                    {section.history.map((h, i) => (
                      <li key={i} className="relative pl-8 text-xs sm:text-sm">
                        <span className="absolute left-0 top-1 w-6 h-6 rounded-full bg-neutral-900 border-2 border-emerald-500 flex items-center justify-center z-10">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        </span>
                        <span className="block text-emerald-300 font-bold mb-0.5">
                          {h.year}
                        </span>
                        <span className="text-white/70 leading-relaxed">{h.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {tab === "achievements" && (
                  <ul className="space-y-2.5">
                    {section.achievements.map((a, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/5 text-xs sm:text-sm text-white/85"
                      >
                        <Star className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5 fill-yellow-400/30" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* NÚT ĐĂNG KÝ VÀO BAN */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <a
              href="#join"
              className="w-full inline-flex justify-center items-center gap-2 text-xs sm:text-sm font-bold px-5 py-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-neutral-950 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-300 group/btn"
            >
              Đăng ký vào {section.name}{" "}
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </a>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

/**
 * Nút chuyển Tab nhỏ gọn
 */
function TabBtn({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
        active
          ? "bg-white text-neutral-950 shadow-md scale-105 font-bold"
          : "text-white/60 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Linh vật Pikachu Mascot chuyển động cho từng môn (kèm Ban Pickleball mới)
 */
function PikachuMascot({ type }) {
  let mascotAnim = {};
  let itemAnim = {};
  let itemDisplay = "";

  if (type === "pickleball") {
    // PICKLEBALL: Pikachu nghiêng người vung vợt, quả bóng nhựa vàng nảy dập dềnh
    mascotAnim = {
      rotate: [-5, 12, -5],
      y: [0, -8, 0],
      transition: { repeat: Infinity, duration: 0.7, ease: "easeInOut" },
    };
    itemAnim = {
      y: [0, -45, -5],
      x: [-5, 25, 40],
      rotate: [0, 180, 360],
      transition: { repeat: Infinity, duration: 0.7, ease: "easeOut" },
    };
    itemDisplay = "🟡"; // Bóng pickleball có lỗ vàng đặc trưng
  } else if (type === "football") {
    // BÓNG ĐÁ: Tâng bóng chân
    mascotAnim = {
      y: [0, -10, 0],
      transition: { repeat: Infinity, duration: 0.5, ease: "easeOut" },
    };
    itemAnim = {
      y: [0, -40, 0],
      x: [0, 10, 0],
      rotate: [0, 180, 360],
      transition: { repeat: Infinity, duration: 0.5, ease: "easeOut" },
    };
    itemDisplay = "⚽";
  } else if (type === "volleyball") {
    // BÓNG CHUYỀN: Pikachu vươn người, bóng bay theo hình vòng cung
    mascotAnim = {
      y: [0, -5, 0],
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 0.8 },
    };
    itemAnim = {
      y: [-15, -60, -15],
      x: [-10, 0, 15],
      transition: { repeat: Infinity, duration: 0.8, ease: "easeInOut" },
    };
    itemDisplay = "🏐";
  } else if (type === "badminton") {
    // CẦU LÔNG: Vung vợt đập cầu
    mascotAnim = {
      rotate: [0, 15, -5, 0],
      transition: { repeat: Infinity, duration: 0.6 },
    };
    itemAnim = {
      y: [0, -50, 10],
      x: [0, 30, 50],
      rotate: [0, 45, 90],
      transition: { repeat: Infinity, duration: 0.6 },
    };
    itemDisplay = "🏸";
  } else if (type === "cheerleading") {
    // CHEERLEADING: Nhún nhảy hoa pompom rung bần bật
    mascotAnim = {
      y: [0, -20, 0],
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 0.5 },
    };
    itemAnim = {
      rotate: [-20, 20, -20],
      scale: [1, 1.3, 1],
      transition: { repeat: Infinity, duration: 0.25 },
    };
    itemDisplay = "✨";
  } else if (type === "media") {
    // TRUYỀN THÔNG: Lắc lư, gõ phím máy tính
    mascotAnim = {
      rotate: [-3, 3, -3],
      transition: { repeat: Infinity, duration: 2 },
    };
    itemAnim = {
      y: [0, -4, 0],
      transition: { repeat: Infinity, duration: 0.15 },
    };
    itemDisplay = "💻";
  }

  return (
    <div className="absolute top-0 right-6 z-20 pointer-events-none flex items-end justify-center">
      {/* Vầng hào quang điện */}
      <div className="absolute top-0 left-2 w-16 h-16 bg-yellow-400/30 rounded-full blur-xl animate-pulse"></div>

      {/* Pikachu Mascot */}
      <motion.div
        animate={mascotAnim}
        className="relative z-10 text-5xl drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
      >
        <img
          src="/pikachu.png"
          alt="Pikachu Mascot"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "block";
          }}
        />
        <span style={{ display: "none" }}>⚡</span>
      </motion.div>

      {/* Dụng cụ thể thao tương tác bay xung quanh */}
      <motion.div
        animate={itemAnim}
        className="absolute top-1 -right-3 text-2xl sm:text-3xl z-20 drop-shadow-lg"
      >
        {itemDisplay}
      </motion.div>
    </div>
  );
}

/**
 * Background SVGs cho từng môn
 */
function SectionCoverSVG({ type }) {
  if (type === "pickleball") {
    return (
      <svg viewBox="0 0 600 260" className="w-full h-full">
        {/* Lưới sân Pickleball và đường kẻ sân đặc trưng */}
        <line x1="50" y1="130" x2="550" y2="130" stroke="#84cc16" strokeOpacity="0.35" strokeWidth="3" strokeDasharray="6 4" />
        <rect x="80" y="50" width="440" height="160" rx="20" stroke="#10b981" strokeOpacity="0.25" fill="none" strokeWidth="2" />
        <circle cx="480" cy="100" r="30" stroke="#84cc16" strokeOpacity="0.3" fill="none" strokeWidth="2" />
      </svg>
    );
  }
  if (type === "football") {
    return (
      <svg viewBox="0 0 600 260" className="w-full h-full">
        <path d="M0 220 C 120 180 240 260 360 220 S 600 200 600 200" stroke="#10b981" strokeOpacity="0.3" fill="none" strokeWidth="2" />
      </svg>
    );
  }
  if (type === "volleyball") {
    return (
      <svg viewBox="0 0 600 260" className="w-full h-full">
        <path d="M100 40 Q 300 180 500 40" stroke="#10b981" strokeOpacity="0.3" fill="none" strokeWidth="2" />
      </svg>
    );
  }
  if (type === "badminton") {
    return (
      <svg viewBox="0 0 600 260" className="w-full h-full">
        <circle cx="300" cy="130" r="100" stroke="#10b981" strokeOpacity="0.15" fill="none" strokeWidth="15" />
      </svg>
    );
  }
  if (type === "cheerleading") {
    return (
      <svg viewBox="0 0 600 260" className="w-full h-full">
        <path d="M 200 130 C 250 50, 350 50, 400 130 C 450 210, 350 210, 300 210 C 250 210, 150 210, 200 130 Z" stroke="#ec4899" strokeOpacity="0.3" fill="none" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 600 260" className="w-full h-full">
      <rect x="100" y="60" width="400" height="140" rx="16" stroke="#10b981" strokeOpacity="0.2" fill="none" strokeWidth="2" />
    </svg>
  );
}
