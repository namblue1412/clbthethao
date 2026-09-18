import { motion, useScroll, useTransform } from "framer-motion";

export default function Floating3DObjects() {
  const { scrollYProgress } = useScroll();

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 500]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const rot1 = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const rot2 = useTransform(scrollYProgress, [0, 1], [0, -280]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-5">
      
      {/* 1. QUẢ BÓNG PICKLEBALL VÀNG CÓ LỖ LƠ LỬNG PHÍA TRÊN PHẢI */}
      <motion.div
        style={{ y: y1, rotate: rot1 }}
        className="absolute top-[18%] -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 shadow-[0_0_40px_rgba(250,204,21,0.35)] opacity-35 blur-[0.5px] flex items-center justify-center text-xs font-mono text-amber-900"
      >
        <div className="w-4 h-4 rounded-full bg-amber-600/60 m-1"></div>
        <div className="w-3 h-3 rounded-full bg-amber-600/60 m-1"></div>
        <div className="w-3 h-3 rounded-full bg-amber-600/60 m-1"></div>
      </motion.div>

      {/* 2. QUẢ CẦU LỤC EMERALD PHÁT QUANG GẦN GIỚI THIỆU */}
      <motion.div
        style={{ y: y2, rotate: rot2 }}
        className="absolute top-[48%] -left-12 w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-400 to-lime-300 shadow-[0_0_60px_rgba(16,185,129,0.3)] opacity-25 blur-[1px]"
      />

      {/* 3. VÒNG KHUYÊN THỂ THAO 3D GẦN BAN SECTION */}
      <motion.div
        style={{ y: y3, rotate: rot1 }}
        className="absolute top-[75%] right-[5%] w-28 h-28 rounded-full border-4 border-dashed border-emerald-400/25 opacity-30 shadow-[0_0_30px_rgba(52,211,153,0.2)]"
      />

    </div>
  );
}
