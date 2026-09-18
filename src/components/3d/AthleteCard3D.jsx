import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, ShieldCheck, Sparkles } from "lucide-react";
import { SECTIONS } from "../../data/clubData";

export default function AthleteCard3D({ form }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const selectedBan =
    SECTIONS.find((s) => s.key === form.ban)?.name || "Ban Pickleball";

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (py - 0.5) * -22,
      y: (px - 0.5) * 22,
    });
    setGlare({
      x: px * 100,
      y: py * 100,
      opacity: 0.6,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[420px] mx-auto perspective-1000 py-4 cursor-grab active:cursor-grabbing select-none"
    >
      {/* VẦNG SÁNG NEON BẢO VỆ PHÍA SAU */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/25 via-lime-400/20 to-teal-500/25 blur-3xl rounded-[2.5rem] pointer-events-none -z-10"></div>

      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative aspect-[1.6/1] w-full rounded-[2rem] border border-white/25 bg-gradient-to-br from-neutral-900/95 via-neutral-950/90 to-emerald-950/80 p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl group"
      >
        {/* HIỆU ỨNG HOLOGRAM GLARE CHẠY THEO CHUỘT */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-[2rem]"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.22) 0%, rgba(52,211,153,0.15) 30%, transparent 65%)`,
            opacity: glare.opacity,
          }}
        />

        {/* HỌA TIẾT VÂN THẺ ĐIỆN TỬ */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* PHẦN TRÊN: HEADER THẺ */}
        <div
          className="relative z-10 flex items-center justify-between"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-500 flex items-center justify-center text-neutral-950 shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-widest text-emerald-400 font-extrabold">
                Thẻ Vận Động Viên CLB
              </div>
              <div className="text-xs font-bold text-white tracking-wide">
                TRƯỜNG DƯỢC
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-mono font-bold text-emerald-300">
            ATHLETE-2026
          </span>
        </div>

        {/* PHẦN GIỮA: TÊN VẬN ĐỘNG VIÊN & MSSV */}
        <div
          className="relative z-10 mt-6 sm:mt-7"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
            Họ và tên thành viên
          </div>
          <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-lime-200 truncate drop-shadow-md">
            {form.name ? form.name.toUpperCase() : "NGUYỄN VĂN A"}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/10">
            <div>
              <span className="text-[9px] uppercase font-semibold text-white/40 block">
                Mã số sinh viên
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-emerald-300">
                {form.mssv || "5112xxxxx"}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-semibold text-white/40 block">
                Lớp sinh hoạt
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white/90 truncate block">
                {form.lop || "Dược K26"}
              </span>
            </div>
          </div>
        </div>

        {/* PHẦN DƯỚI: PHÂN BAN ỨNG TUYỂN & CON DẤU HOLOGRAPHIC */}
        <div
          className="relative z-10 mt-5 flex items-end justify-between"
          style={{ transform: "translateZ(35px)" }}
        >
          <div>
            <span className="text-[9px] uppercase font-bold text-lime-400 block tracking-wider">
              Phân ban đăng ký
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              {selectedBan}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/70">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
