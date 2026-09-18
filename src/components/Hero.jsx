import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  ChevronRight,
  Flame,
  Camera,
  ChevronDown
} from "lucide-react";
import { THEME, STATS } from "../data/clubData";

export default function Hero() {
  return (
    <section id="home" className="relative pt-8 pb-20 md:pt-14 md:pb-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* BỐ CỤC 2 CỘT SPLIT-HERO: TIÊU ĐỀ BÊN TRÁI & ẢNH TẬP THỂ BÊN PHẢI */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center">
          
          {/* CỘT TRÁI: TIÊU ĐỀ, THÔNG ĐIỆP ĐOÀN KẾT & KÊU GỌI HÀNH ĐỘNG */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center text-left"
          >
            {/* HUY HIỆU NỔI BẬT TRÊN ĐẦU */}
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> Tuyển thành viên 2026
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-full border border-lime-400/40 bg-lime-400/10 text-lime-300 backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Mở mới Ban Pickleball
              </span>
            </div>

            {/* TIÊU ĐỀ CHÍNH MẠNH MẼ VÀ ĐẲNG CẤP */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Bứt phá Giới hạn, <br />
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${THEME.primary} drop-shadow-[0_0_35px_rgba(52,211,153,0.35)]`}>
                Kiến tạo Đam mê
              </span>
            </h1>

            {/* MÔ TẢ TINH THẦN ĐỒNG ĐỘI & THỂ THAO TRƯỜNG DƯỢC */}
            <p className="mt-5 text-base sm:text-lg text-white/75 leading-relaxed max-w-xl">
              Môi trường thể thao năng động và chuyên nghiệp dành cho sinh viên Trường Dược. Nơi tôi luyện thể lực, rèn giũa bản lĩnh và gắn kết hơn 300 thành viên thành một đại gia đình vững mạnh.
            </p>

            {/* NÚT KÊU GỌI HÀNH ĐỘNG (CTA) */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#join"
                className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold bg-gradient-to-r ${THEME.primary} text-neutral-950 shadow-[0_0_30px_rgba(52,211,153,0.35)] hover:shadow-[0_0_50px_rgba(52,211,153,0.55)] hover:scale-105 active:scale-95 transition-all duration-300`}
              >
                Đăng ký gia nhập ngay <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="#ban"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/15 text-white hover:border-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-md"
              >
                Khám phá 6 Phân ban
              </a>
            </div>

            {/* KHỐI CHỨNG THỰC TINH THẦN ĐOÀN KẾT (SOCIAL PROOF) */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Cụm avatar chữ đại diện sinh viên Trường Dược */}
              <div className="flex -space-x-2.5 overflow-hidden shrink-0">
                <div className="inline-flex h-10 w-10 rounded-full ring-2 ring-neutral-950 bg-gradient-to-tr from-emerald-400 to-lime-300 items-center justify-center text-xs font-black text-neutral-950 shadow-md">
                  D
                </div>
                <div className="inline-flex h-10 w-10 rounded-full ring-2 ring-neutral-950 bg-gradient-to-tr from-lime-400 to-emerald-600 items-center justify-center text-xs font-black text-neutral-950 shadow-md">
                  Ư
                </div>
                <div className="inline-flex h-10 w-10 rounded-full ring-2 ring-neutral-950 bg-gradient-to-tr from-teal-400 to-emerald-500 items-center justify-center text-xs font-black text-neutral-950 shadow-md">
                  Ợ
                </div>
                <div className="inline-flex h-10 w-10 rounded-full ring-2 ring-neutral-950 bg-gradient-to-tr from-emerald-500 to-yellow-400 items-center justify-center text-xs font-black text-neutral-950 shadow-md">
                  C
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <span>Hơn 300+ Dược Sĩ Trẻ Đang Hoạt Động</span>
                  <span className="text-emerald-400">⚡</span>
                </div>
                <p className="text-xs text-white/55 mt-0.5">
                  Đoàn kết • Nhiệt huyết • Tự hào Đại gia đình Thể thao Trường Dược
                </p>
              </div>
            </div>

            {/* CHỈ DẪN CUỘN XUỐNG DƯỚI */}
            <div className="mt-6">
              <a
                href="#ban"
                className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400/80 hover:text-emerald-300 transition-colors group"
              >
                <span className="w-6 h-6 rounded-full border border-emerald-400/30 flex items-center justify-center group-hover:border-emerald-400 transition-colors">
                  <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                </span>
                Cuộn xuống khám phá các phân ban & giải đấu
              </a>
            </div>
          </motion.div>

          {/* CỘT PHẢI: TẤM ẢNH TẬP THỂ CLB (TAPTHE.JPG) KHỔNG LỒ, KHÔNG VIỀN, 3D TILT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-7 xl:col-span-7 flex justify-center w-full"
          >
            <GroupPhotoCard />
          </motion.div>

        </div>

        {/* STATS COUNTER BAR DƯỚI CÙNG HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {STATS.map((s, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.06] transition-all group"
            >
              <span className="text-3xl lg:text-4xl font-black text-white group-hover:text-emerald-300 transition-colors">
                {s.value}
              </span>
              <p className="text-xs sm:text-sm font-medium text-emerald-400/90 mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

/**
 * Thẻ ảnh tập thể CLB (tapthe.jpg)
 * Thiết kế to lớn, không viền, hiệu ứng nghiêng 3D (tilt) và huy hiệu đoàn kết
 */
function GroupPhotoCard() {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [imgError, setImgError] = useState(false);

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
      className="relative w-full perspective-1000 flex flex-col gap-4"
    >
      {/* VẦNG HÀO QUANG AMBIENT GLOW MÀU NGỌC BÍCH PHÍA SAU ẢNH */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/25 via-lime-500/15 to-teal-500/25 rounded-[3rem] blur-3xl opacity-50 pointer-events-none -z-10" />

      {/* TẤM ẢNH TẬP THỂ CLB (TAPTHE.JPG) - HOÀN TOÀN TRỌN VẸN 100%, KHÔNG BỊ ĐÈ */}
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 240, damping: 25 }}
        className="relative rounded-[2.2rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.9)] group w-full bg-neutral-950"
      >
        {/* CONTAINER CHÍNH CỦA ẢNH - KHÔNG VIỀN, RỘNG LỚN, RÕ NÉT TOÀN BỘ KHUNG HÌNH */}
        <div className="relative aspect-[16/11] sm:aspect-[16/10] lg:aspect-[16/10.5] min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] w-full overflow-hidden">
          {!imgError ? (
            <img
              src="/tapthe.jpg"
              alt="Đại gia đình CLB Thể thao Trường Dược"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            />
          ) : (
            // FALLBACK NẾU FILE TAPTHE.JPG BỊ LỖI
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-emerald-950/40">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-4 shadow-lg animate-pulse">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ảnh Tập Thể CLB</h3>
              <p className="text-xs sm:text-sm text-emerald-400/90 max-w-sm mb-4 font-mono bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                public/tapthe.jpg
              </p>
              <p className="text-xs text-white/50 max-w-xs">
                (Hãy đặt ảnh tập thể vào thư mục public với tên <b>tapthe.jpg</b> để hiển thị ảnh thực tế)
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* BẢNG THÔNG TIN ĐƯỢC ĐẶT XUỐNG PHÍA DƯỚI ẢNH - HOÀN TOÀN KHÔNG ĐÈ LÊN HÌNH */}
      <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
            Đoàn Kết — Nhiệt Huyết — Cống Hiến
          </span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
            CLB Thể Thao Trường Dược
          </h2>
          <p className="text-xs text-white/60 mt-0.5 max-w-md">
            Hơn 300 trái tim chung một nhịp đập nhiệt huyết — Nơi gắn kết sinh viên qua từng trận đấu
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-center">
            <div className="text-base font-black text-white">300+</div>
            <div className="text-[10px] text-emerald-300 font-bold uppercase">Thành viên</div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-center">
            <div className="text-base font-black text-white">2026</div>
            <div className="text-[10px] text-lime-300 font-bold uppercase">Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}
