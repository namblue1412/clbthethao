import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Trophy,
  Megaphone,
  Camera,
  ChevronRight,
  Sparkles,
  Target,
  Users,
  Briefcase,
  CircleCheck,
  Volume2,
  VolumeX,
  Flame,
  Award,
  Calendar,
  Lock,
} from "lucide-react";

import Hero from "./components/Hero";
import BanSection from "./components/BanSection";
import ActivitiesSection from "./components/ActivitiesSection";
import AthleteCard3D from "./components/3d/AthleteCard3D";
import Floating3DObjects from "./components/3d/Floating3DObjects";
import { THEME, SECTIONS, GOOGLE_SHEET_CONFIG } from "./data/clubData";
import {
  getStoredActivities,
  saveStoredActivities,
  GOOGLE_SHEET_ACTIVITIES_CONFIG,
} from "./data/activitiesData";
import {
  getStoredRegistrationConfig,
  checkRegistrationStatus,
  fetchRemoteRegistrationConfig,
} from "./data/registrationConfig";
import { sound } from "./utils/audio";

export default function CLBTheThaoDuoc2026() {
  const [openMenu, setOpenMenu] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [activities, setActivities] = useState(getStoredActivities);
  const [regConfig, setRegConfig] = useState(getStoredRegistrationConfig);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.2,
  });

  // Tự động kéo dữ liệu hoạt động từ Google Sheet nếu đã cấu hình SCRIPT_URL
  useEffect(() => {
    if (!GOOGLE_SHEET_ACTIVITIES_CONFIG.SCRIPT_URL) return;
    fetch(GOOGLE_SHEET_ACTIVITIES_CONFIG.SCRIPT_URL)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === "success" && Array.isArray(resData.data) && resData.data.length > 0) {
          setActivities(resData.data);
          saveStoredActivities(resData.data);
        }
      })
      .catch((err) => console.log("Google Sheets sync hoạt động:", err));
  }, []);

  // Theo dõi toạ độ chuột cho hiệu ứng đèn rọi Radial Spotlight
  useEffect(() => {
    const handler = (e) => {
      document.documentElement.style.setProperty(
        "--cursor-x",
        `${e.clientX ?? 0}px`
      );
      document.documentElement.style.setProperty(
        "--cursor-y",
        `${e.clientY ?? 0}px`
      );
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Đồng bộ cấu hình thời gian mở form từ xa và lắng nghe cập nhật tức thì
  useEffect(() => {
    fetchRemoteRegistrationConfig().then((remote) => {
      if (remote) setRegConfig(remote);
    });

    const handleConfigChange = (e) => {
      if (e.detail) {
        setRegConfig(e.detail);
      } else {
        setRegConfig(getStoredRegistrationConfig());
      }
    };
    window.addEventListener("clb_registration_config_changed", handleConfigChange);
    return () => window.removeEventListener("clb_registration_config_changed", handleConfigChange);
  }, []);

  const toggleSound = () => {
    const nextState = sound.toggle();
    setSoundOn(nextState);
    if (nextState) sound.playPop();
  };

  return (
    <main className="min-h-screen font-sans bg-neutral-950 text-white selection:bg-lime-400/40 pb-10 overflow-x-hidden">
      {/* THANH TIẾN TRÌNH CUỘN TRANG TRÊN ĐỈNH */}
      <motion.div
        style={{ scaleX }}
        className={`fixed top-0 left-0 right-0 h-1 z-50 origin-left bg-gradient-to-r ${THEME.primary} shadow-[0_0_15px_rgba(52,211,153,0.8)]`}
      />

      {/* VẬT THỂ THỂ THAO 3D CHẠY PARALLAX DỌC THEO TRANG */}
      <Floating3DObjects />

      {/* NỀN LƯỚI TOẠ ĐỘ & SPOTLIGHT BÁM CHUỘT */}
      <GradientBackdrop />

      {/* THANH ĐIỀU HƯỚNG NAVBAR */}
      <Navbar
        open={openMenu}
        setOpen={setOpenMenu}
        soundOn={soundOn}
        toggleSound={toggleSound}
      />

      {/* 1. HERO VỚI ẢNH TẬP THỂ (TAPTHE.JPG) TO ĐẸP & TIÊU ĐỀ BÊN TRÁI */}
      <Hero />

      {/* MARQUEE NHỮNG GIÁ TRỊ CỐT LÕI */}
      <MarqueeAchievements />

      {/* 2. CUỘN XUỐNG: GIỚI THIỆU CLB (ABOUT) VỚI HIỆU ỨNG NỔI 3D */}
      <AboutSection />

      {/* 3. GIỚI THIỆU 6 PHÂN BAN (BAO GỒM BAN PICKLEBALL MỚI 2026) */}
      <BanSection />

      {/* 4. HOẠT ĐỘNG TRONG NĂM & ĐIỂM RÈN LUYỆN CHO SINH VIÊN */}
      <ActivitiesSection
        activities={activities}
      />

      {/* 5. ĐỐI TÁC & NHÀ TÀI TRỢ */}
      <SponsorSection />

      {/* 6. THƯ VIỆN KHOẢNH KHẮC PARALLAX 3D */}
      <GalleryParallax />

      {/* 7. FORM ĐĂNG KÝ VỚI THẺ VẬN ĐỘNG VIÊN 3D HOLOGRAPHIC & THỜI GIAN MỞ FORM */}
      <JoinSection
        regConfig={regConfig}
      />

      {/* CHÂN TRANG FOOTER */}
      <Footer />
    </main>
  );
}

/**
 * Navbar với nút bật/tắt âm thanh tương tác
 */
function Navbar({ open, setOpen, soundOn, toggleSound }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl supports-[backdrop-filter]:bg-neutral-950/75 border-b border-white/10 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        
        {/* LOGO CLB */}
        <a
          href="#home"
          onClick={() => sound.playPop()}
          className="group inline-flex items-center gap-3"
        >
          <div className="relative flex items-center justify-center w-9 h-9">
            <span
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${THEME.primary} opacity-50 blur-md group-hover:opacity-100 transition-opacity duration-300`}
            />
            <span
              className={`relative w-9 h-9 rounded-full bg-gradient-to-br ${THEME.primary} shadow-lg flex items-center justify-center text-neutral-950`}
            >
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-widest uppercase text-white/95 group-hover:text-emerald-300 transition">
              CLB Thể Thao Trường Dược
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider">
              Trường Dược
            </span>
          </div>
        </a>

        {/* CÁC ĐƯỜNG LINK TRÊN DESKTOP */}
        <nav className="hidden md:flex items-center gap-7 text-white/75 font-medium text-sm">
          <NavLink href="#about" label="Giới thiệu" />
          <NavLink href="#ban" label="Phân ban" badge="Pickleball Mới" />
          <NavLink href="#activities" label="Hoạt động & ĐRL" badge="ĐRL" />
          <NavLink href="#sponsors" label="Đối tác" />
          <NavLink href="#gallery" label="Thư viện" />
        </nav>

        {/* NÚT ÂM THANH & NÚT ĐĂNG KÝ */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleSound}
            title={soundOn ? "Tắt âm thanh tương tác" : "Bật âm thanh tương tác"}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-emerald-300 transition-all hover:scale-105 active:scale-95"
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/40" />
            )}
          </button>

          <a
            href="#join"
            onClick={() => sound.playPop()}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/15 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm text-emerald-300 hover:text-white`}
          >
            Đăng ký ngay
          </a>
        </div>

        {/* NÚT MENU MOBILE */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70"
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/40" />
            )}
          </button>
          <button
            onClick={() => {
              sound.playPop();
              setOpen(!open);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/10"
          >
            <span className="sr-only">Menu</span>
            <ChevronRight
              className={`w-5 h-5 transition-transform duration-300 ${
                open ? "rotate-90 text-emerald-400" : "rotate-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* DROPDOWN MENU CHO MOBILE */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/10 overflow-hidden bg-neutral-950/95 backdrop-blur-xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 gap-3">
              <MobileLink
                href="#about"
                label="Giới thiệu"
                onClick={() => setOpen(false)}
              />
              <MobileLink
                href="#ban"
                label="6 Phân ban"
                badge="Mới"
                onClick={() => setOpen(false)}
              />
              <MobileLink
                href="#activities"
                label="Hoạt động & ĐRL"
                badge="ĐRL"
                onClick={() => setOpen(false)}
              />
              <MobileLink
                href="#sponsors"
                label="Đối tác"
                onClick={() => setOpen(false)}
              />
              <MobileLink
                href="#gallery"
                label="Thư viện ảnh"
                onClick={() => setOpen(false)}
              />
              <div className="col-span-2">
                <a
                  href="#join"
                  onClick={() => {
                    sound.playPop();
                    setOpen(false);
                  }}
                  className={`w-full block py-3 rounded-xl text-center text-sm font-bold bg-gradient-to-r ${THEME.primary} text-neutral-950`}
                >
                  Đăng ký tuyển thành viên
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, label, badge }) {
  return (
    <a
      href={href}
      onClick={() => sound.playPop()}
      className="text-sm text-white/70 hover:text-white transition-colors relative group flex items-center gap-1.5"
    >
      {label}
      {badge && (
        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-lime-400 text-neutral-950 shadow-sm">
          {badge}
        </span>
      )}
      <span
        className={`absolute left-0 -bottom-1 h-[2px] w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r ${THEME.primary}`}
      />
    </a>
  );
}

function MobileLink({ href, label, badge, onClick }) {
  return (
    <a
      href={href}
      onClick={() => {
        sound.playPop();
        onClick();
      }}
      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition text-sm font-semibold text-center flex items-center justify-center gap-1.5"
    >
      {label}
      {badge && (
        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-lime-400 text-neutral-950">
          {badge}
        </span>
      )}
    </a>
  );
}

function MarqueeAchievements() {
  const items = [
    { icon: Trophy, text: "5 giải đấu các môn thường niên" },
    { icon: Flame, text: "Ra mắt Ban Pickleball 2026 sôi động" },
    { icon: Users, text: "Hơn 300+ thành viên Trường Dược" },
    { icon: Briefcase, text: "150 đơn ứng tuyển phỏng vấn mỗi năm" },
    { icon: Award, text: "Đồng hành cùng đối tác TV TPI" },
  ];
  return (
    <div className="relative border-y border-white/5 bg-white/[0.02] overflow-hidden backdrop-blur-sm">
      <ul className="marquee flex items-center gap-12 py-4">
        {items.concat(items).map((it, idx) => (
          <li
            key={idx}
            className="flex items-center gap-3 whitespace-nowrap text-white/70 text-sm font-medium"
          >
            <it.icon className="w-4 h-4 text-emerald-400" />
            <span>{it.text}</span>
          </li>
        ))}
      </ul>
      <style>{`
        .marquee { animation: marquee 35s linear infinite; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

/**
 * Phần Giới Thiệu (About) với hiệu ứng lật nổi 3D khi cuộn
 */
function AboutSection() {
  return (
    <motion.section
      id="about"
      initial={{ opacity: 0, y: 50, rotateX: 6 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ perspective: 1200 }}
      className="relative py-28"
    >
      <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* CỘT TRÁI: SỨ MỆNH VÀ TẦM NHÌN */}
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 mb-4">
            <Target className="w-3.5 h-3.5" /> Tầm nhìn & Sứ mệnh
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight text-white">
            Nơi Thể Thao Định Hình{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-lime-300 to-teal-300">
              Phong Cách Sống.
            </span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-white/70 leading-relaxed">
            Chúng tôi xây dựng môi trường rèn luyện giúp sinh viên Trường Dược
            cân bằng giữa việc học tập và sức khỏe thể chất. Một tinh thần minh
            mẫn luôn đi cùng một cơ thể khỏe mạnh.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Hoạt động theo cơ cấu 6 phân ban thể thao và chuyên môn.",
              "Mở mới Ban Pickleball năng động phù hợp xu hướng thể thao hiện đại.",
              "Tổ chức 5 giải đấu các môn thường niên cho sinh viên Trường Dược.",
              "Không gian giao lưu, rèn luyện và hỗ trợ nhau trong học tập.",
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.06] transition-all group"
              >
                <CircleCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-white/85 text-sm font-medium leading-relaxed">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: LƯỚI 4 THẺ THÔNG TIN 3D */}
        <div className="grid sm:grid-cols-2 gap-5">
          <InfoCard3D
            icon={Trophy}
            title="Thành tích"
            text="Nhiều danh hiệu tại các giải đấu phong trào và giải đấu sinh viên cấp Trường."
            delay={0}
          />
          <InfoCard3D
            icon={Flame}
            title="Ban Pickleball"
            text="Môn thể thao mới gia nhập đại gia đình CLB trong năm học 2026."
            delay={0.1}
          />
          <InfoCard3D
            icon={Users}
            title="Đồng đội"
            text="Gắn kết các thế hệ sinh viên Trường Dược qua từng trận đấu và buổi tập."
            delay={0.2}
          />
          <InfoCard3D
            icon={Megaphone}
            title="Lan toả"
            text="Ghi lại những khoảnh khắc đẹp và truyền cảm hứng rèn luyện thể thao."
            delay={0.3}
          />
        </div>

      </div>
    </motion.section>
  );
}

/**
 * Thẻ InfoCard với 3D tilt khi rê chuột
 */
function InfoCard3D({ icon: Icon, title, text, delay }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (py - 0.5) * -12,
      y: (px - 0.5) * 12,
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
      className="perspective-1000 h-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ duration: 0.5, delay: delay, type: "spring", stiffness: 300, damping: 25 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 hover:border-emerald-500/40 hover:bg-white/[0.09] transition-all duration-300 group h-full flex flex-col justify-between shadow-lg"
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${THEME.primary} text-neutral-950 shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
            {text}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Đối tác & Nhà tài trợ (Hiện đang có 1 đối tác TV TPI)
 */
function SponsorSection() {
  return (
    <motion.section
      id="sponsors"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8 }}
      className="py-24 border-y border-white/10 bg-gradient-to-b from-neutral-950 to-neutral-900/90"
    >
      <div className="max-w-7xl mx-auto px-4 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 mb-4">
          <Briefcase className="w-3.5 h-3.5" /> Đối Tác Đồng Hành
        </span>
        <h2 className="text-3xl md:text-4xl font-black mb-4">
          Đồng Hành Cùng Sự Phát Triển
        </h2>
        <p className="text-white/60 text-sm max-w-xl mx-auto mb-10 leading-relaxed">
          Trân trọng cảm ơn đối tác đã tin tưởng đồng hành cùng các hoạt động và giải đấu thể thao của CLB Thể thao Trường Dược.
        </p>

        <div className="flex justify-center items-center">
          <div className="h-24 w-60 bg-white/5 rounded-2xl flex items-center justify-center border border-white/15 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all cursor-default group overflow-hidden relative shadow-xl p-4">
            <img
              src="/sponsors/sponsor-1.png"
              alt="TV TPI"
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <span style={{ display: "none" }} className="text-white/70 text-sm font-bold tracking-widest uppercase">
              TV TPI
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/**
 * Thư viện hình ảnh Parallax 3D (10 ảnh: 1.jpg đến 10.jpg trong public)
 */
export function GalleryParallax() {
  // 10 ảnh: 1.jpg đến 10.jpg
  const row1Base = [1, 2, 3, 4, 5];
  const row2Base = [6, 7, 8, 9, 10];
  const row1 = [...row1Base, ...row1Base, ...row1Base, ...row1Base];
  const row2 = [...row2Base, ...row2Base, ...row2Base, ...row2Base];

  return (
    <section
      id="gallery"
      className="relative py-32 overflow-hidden bg-neutral-950 border-t border-white/10"
    >
      <div className="mx-auto max-w-7xl px-4 text-center relative z-10 mb-16">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 mb-4">
          <Camera className="w-3.5 h-3.5" /> Thư viện hình ảnh
        </span>
        <h2 className="mt-2 text-3xl md:text-5xl font-black">
          Khoảnh Khắc Tại CLB
        </h2>
        <p className="mt-4 text-white/60 max-w-2xl mx-auto text-sm leading-relaxed">
          Những nụ cười, từng giọt mồ hôi và những kỷ niệm đáng nhớ của các thành
          viên CLB Thể thao Trường Dược.
        </p>
      </div>

      <div className="relative h-[500px] w-full overflow-hidden rotate-[-2deg] scale-105">
        <motion.div
          animate={{ x: ["0%", "-25%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute top-0 left-0 flex gap-6 w-max"
        >
          {row1.map((imgNum, i) => (
            <GalleryCard key={`top-${i}`} imageNumber={imgNum} />
          ))}
        </motion.div>

        <motion.div
          animate={{ x: ["-25%", "0%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute bottom-0 left-0 flex gap-6 w-max"
        >
          {row2.map((imgNum, i) => (
            <GalleryCard key={`bot-${i}`} imageNumber={imgNum} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function GalleryCard({ imageNumber }) {
  const [hasImg, setHasImg] = useState(true);
  // Đường dẫn ảnh từ public/1.jpg đến public/10.jpg
  const imagePath = `/${imageNumber}.jpg`;

  return (
    <div className="w-72 h-52 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden relative group transition-all hover:border-emerald-500/40 hover:bg-white/10 shrink-0 shadow-lg">
      {hasImg ? (
        <img
          src={imagePath}
          alt={`Khoảnh khắc ${imageNumber}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setHasImg(false)}
        />
      ) : (
        <div className="flex flex-col items-center text-white/30 group-hover:text-emerald-400/60 transition-colors">
          <Camera className="w-8 h-8 mb-2" />
          <span className="text-xs font-bold">Khoảnh khắc #{imageNumber}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Khu vực Đăng ký (Join CTA) tích hợp Thẻ Vận Động Viên 3D tương tác realtime & Thông tin thời gian
 */
function JoinSection({ regConfig }) {
  const [form, setForm] = useState({
    name: "",
    lop: "",
    mssv: "",
    phone: "",
    facebook: "",
    email: "",
    ban: "pickleball", // Mặc định gợi ý Ban Pickleball mới 2026
  });

  const statusInfo = checkRegistrationStatus(regConfig);

  return (
    <motion.section
      id="join"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="relative py-32"
    >
      <div className="mx-auto max-w-7xl px-4">
        
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Tuyển Quân 2026 — 2027
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Trở Thành Mảnh Ghép Của Chúng Tôi
          </h2>
          <p className="mt-4 text-white/60 text-base">
            Hãy điền đầy đủ thông tin bên dưới để Ban điều hành liên hệ và gửi
            lịch hẹn tập trải nghiệm thực tế nhé!
          </p>
        </div>

        {/* BỐ TRÍ 2 CỘT: THẺ VẬN ĐỘNG VIÊN 3D HOLOGRAPHIC (TRÁI) & FORM (PHẢI) */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* CỘT TRÁI: THẺ VẬN ĐỘNG VIÊN 3D REALTIME & LỊCH ĐIỀN FORM */}
          <div className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-32">
            
            {/* THÔNG TIN THỜI GIAN ĐIỀN FORM HIỂN THỊ CHO USER BIẾT */}
            <div className="w-full max-w-[420px] mb-6 p-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[11px] uppercase font-black tracking-wider text-white/70 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Thời Gian Điền Form
                </span>

                {statusInfo.isOpen ? (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Đang Mở Nhận Đơn
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-rose-400" />
                    {statusInfo.status === "upcoming" ? "Chưa Mở Đơn" : "Cổng Đã Đóng"}
                  </span>
                )}
              </div>

              <div className="bg-black/40 rounded-2xl p-3 border border-white/5 space-y-1">
                <div className="text-xs text-white/90 font-medium flex items-center justify-between">
                  <span>Thời gian nhận đơn:</span>
                  <span className="font-bold text-emerald-300">{statusInfo.dateRangeText}</span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed pt-0.5">
                  {statusInfo.isOpen
                    ? (statusInfo.daysLeft !== null
                        ? `⚡ Hạn chót: 23:59 ngày ${statusInfo.endDateFormatted} (còn ${statusInfo.daysLeft} ngày).`
                        : "Cổng đăng ký đang tiếp nhận hồ sơ trực tuyến.")
                    : (statusInfo.status === "upcoming"
                        ? `⏳ Cổng đăng ký sẽ mở vào ngày ${statusInfo.startDateFormatted}.`
                        : `⛔ Đợt nhận đơn đã kết thúc vào ngày ${statusInfo.endDateFormatted}.`)}
                </p>
              </div>
            </div>

            {/* TIÊU ĐỀ THẺ 3D (ĐÃ GỠ BỎ DÒNG CHÚ THÍCH THEO YÊU CẦU CỦA BẠN) */}
            <div className="text-center mb-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Thẻ Vận Động Viên CLB
              </span>
            </div>

            {/* Thẻ 3D - GIỮ NGUYÊN VẸN */}
            <AthleteCard3D form={form} />

            {/* Hướng dẫn các bước */}
            <div className="w-full max-w-[420px] mt-8 space-y-3">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">
                  01
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Gửi đơn đăng ký trực tuyến
                  </h4>
                  <p className="text-[11px] text-white/50">
                    Chọn đúng phân ban bạn đam mê nhất.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-lime-500/20 text-lime-400 font-bold flex items-center justify-center text-sm shrink-0">
                  02
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Nhận thông báo & lịch tập
                  </h4>
                  <p className="text-[11px] text-white/50">
                    Trưởng ban sẽ liên hệ qua SĐT/Zalo/Email.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM ĐĂNG KÝ (HIỂN THỊ THÔNG BÁO ĐÓNG NẾU HẾT HẠN) */}
          <div className="lg:col-span-7">
            <JoinForm
              form={form}
              setForm={setForm}
              statusInfo={statusInfo}
            />
          </div>

        </div>

      </div>
    </motion.section>
  );
}

function JoinForm({ form, setForm, statusInfo }) {
  const [status, setStatus] = useState("idle");

  // NẾU HẾT HẠN HOẶC ĐÃ ĐÓNG: HIỂN THỊ THÔNG BÁO ĐÓNG CỔNG
  if (!statusInfo?.isOpen) {
    const isUpcoming = statusInfo?.status === "upcoming";

    return (
      <div className="relative">
        <div className="absolute -inset-3 bg-gradient-to-r from-rose-500/20 via-amber-500/10 to-rose-500/20 blur-3xl opacity-60 -z-10 rounded-[3rem]" />

        <div className="relative overflow-hidden rounded-[2.5rem] border border-rose-500/30 bg-neutral-900/90 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-3">
            {isUpcoming ? "Chưa Đến Thời Gian Mở Đơn" : "Đã Hết Hạn Nhận Đơn"}
          </span>

          <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">
            {isUpcoming ? "Sắp Mở Đợt Tuyển Thành Viên" : "Thời Hạn Nhận Đơn Đã Kết Thúc"}
          </h3>

          <div className="max-w-md mx-auto space-y-4 text-white/70 text-xs sm:text-sm">
            <p className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white/90 leading-relaxed font-medium">
              {statusInfo?.message || "Thời hạn nhận đơn gia nhập CLB hiện đã kết thúc."}
            </p>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-white/60 space-y-1.5 text-center">
              <p>
                Thời gian nhận đơn đợt này:{" "}
                <span className="text-emerald-300 font-semibold">
                  {statusInfo?.startDateFormatted}
                </span>{" "}
                đến hết ngày{" "}
                <span className="text-emerald-300 font-semibold">
                  {statusInfo?.endDateFormatted}
                </span>
              </p>
              <p className="text-white/40 text-[11px] leading-relaxed">
                Cảm ơn bạn đã quan tâm đến CLB Thể Thao Trường Dược. Mọi thông tin về các đợt tuyển tiếp theo sẽ được cập nhật sớm nhất trên Fanpage và Website!
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#home"
              onClick={() => sound.playPop()}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition border border-white/10"
            >
              Về Trang Chủ
            </a>
          </div>
        </div>
      </div>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!statusInfo?.isOpen) {
      alert("Thời gian điền form đã kết thúc. Cổng đăng ký hiện đang đóng!");
      return;
    }
    sound.playSpark();
    setStatus("submitting");

    // Nếu đã cấu hình SCRIPT_URL thì tự động gửi thẳng vào Google Sheet
    if (GOOGLE_SHEET_CONFIG?.SCRIPT_URL) {
      try {
        const formData = new FormData();
        formData.append("action", "register");
        formData.append("timestamp", new Date().toLocaleString("vi-VN"));
        formData.append("name", form.name);
        formData.append("lop", form.lop);
        formData.append("mssv", form.mssv);
        formData.append("phone", form.phone);
        formData.append("email", form.email);
        formData.append("facebook", form.facebook || "");
        formData.append("ban", form.ban);

        await fetch(GOOGLE_SHEET_CONFIG.SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          body: formData,
        });
      } catch (err) {
        console.error("Lỗi gửi dữ liệu tới Google Sheet:", err);
      }
    }

    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setForm({
          name: "",
          lop: "",
          mssv: "",
          phone: "",
          facebook: "",
          email: "",
          ban: "pickleball",
        });
      }, 5000);
    }, 1000);
  }

  return (
    <div className="relative">
      <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/20 via-lime-500/20 to-teal-500/20 blur-3xl opacity-60 -z-10 rounded-[3rem]" />

      <form
        onSubmit={onSubmit}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/15 bg-neutral-900/85 backdrop-blur-2xl p-7 sm:p-10 shadow-2xl"
      >
        <div className="mb-6">
          <h3 className="text-2xl font-black text-white mb-2">
            Đơn Đăng Ký Thành Viên Mới
          </h3>
          <p className="text-white/60 text-xs sm:text-sm mb-4">
            Vui lòng điền thông tin chính xác để CLB gửi lịch sinh hoạt đến bạn.
          </p>

          {/* BANNER THÔNG BÁO THỜI GIAN ĐIỀN FORM VÀ HẠN CHÓT */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Thời gian mở đơn: <b>{statusInfo.startDateFormatted} — {statusInfo.endDateFormatted}</b></span>
            </span>
            {statusInfo.daysLeft !== null && (
              <span className="font-bold text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/20 self-start sm:self-auto">
                Hạn chót: Còn {statusInfo.daysLeft} ngày
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-7">
          <Field label="Họ và tên *">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
              placeholder="Ví dụ: Nguyễn Văn A"
              disabled={status !== "idle"}
            />
          </Field>

          <Field label="Lớp *">
            <input
              required
              value={form.lop}
              onChange={(e) => setForm({ ...form, lop: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
              placeholder="Ví dụ: Dược K26"
              disabled={status !== "idle"}
            />
          </Field>

          <Field label="Mã số sinh viên (MSSV) *">
            <input
              required
              value={form.mssv}
              onChange={(e) => setForm({ ...form, mssv: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
              placeholder="Ví dụ: 5112xxxxx"
              disabled={status !== "idle"}
            />
          </Field>

          <Field label="Số điện thoại / Zalo *">
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
              placeholder="09xx xxx xxx"
              disabled={status !== "idle"}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Email liên hệ *">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                placeholder="nguyenvana@gmail.com"
                disabled={status !== "idle"}
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Link Facebook cá nhân *">
              <input
                required
                type="url"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                placeholder="https://facebook.com/..."
                disabled={status !== "idle"}
              />
            </Field>
          </div>

          {/* CHỌN BAN ỨNG TUYỂN — CÓ BAN PICKLEBALL MỚI 2026 */}
          <div className="md:col-span-2">
            <Field label="Chọn phân ban bạn muốn tham gia *">
              <div className="relative">
                <select
                  value={form.ban}
                  onChange={(e) => {
                    sound.playPop();
                    setForm({ ...form, ban: e.target.value });
                  }}
                  className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all appearance-none cursor-pointer"
                  disabled={status !== "idle"}
                >
                  {SECTIONS.map((s) => (
                    <option
                      key={s.key}
                      value={s.key}
                      className="bg-neutral-900 text-white py-2"
                    >
                      {s.name} {s.badge ? `(${s.badge})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronRight className="w-4 h-4 text-white/50 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
              </div>
            </Field>
          </div>
        </div>

        <button
          type="submit"
          disabled={status !== "idle"}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all duration-300 ${
            status === "idle"
              ? `bg-gradient-to-r ${THEME.primary} text-neutral-950 hover:shadow-[0_0_35px_rgba(52,211,153,0.5)] hover:scale-[1.01] active:scale-95`
              : status === "submitting"
              ? "bg-white/10 text-white cursor-not-allowed"
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 cursor-default"
          }`}
        >
          {status === "idle" && "Xác nhận gửi thông tin đăng ký"}
          {status === "submitting" && (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Đang ghi nhận đơn đăng ký...
            </span>
          )}
          {status === "success" && (
            <span className="flex items-center gap-2">
              <CircleCheck className="w-5 h-5" /> Đăng ký thành công! Chào mừng
              bạn đến với CLB!
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-xs sm:text-sm">
      <span className="text-white/70 font-semibold mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
            <span
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${THEME.primary} flex items-center justify-center`}
            >
              <Trophy className="w-4 h-4 text-neutral-900" />
            </span>
            <span className="text-base font-bold tracking-widest uppercase text-white">
              CLB Thể thao Trường Dược
            </span>
          </div>
          <p className="text-xs text-white/50 max-w-sm">
            Nền tảng thể thao vững chắc, kết nối đam mê và rèn luyện thể chất
            toàn diện cho sinh viên Trường Dược.
          </p>
        </div>
        <div className="text-xs text-white/40 text-center md:text-right">
          <div className="mb-1 font-medium text-white/60">
            Bản quyền © {new Date().getFullYear()} CLB Thể Thao Trường Dược
          </div>
          <p className="flex items-center justify-center md:justify-end gap-2 text-white/50">
            <span>Khoa Dược — Đại học Y Dược TP. Hồ Chí Minh</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function GradientBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-neutral-950 overflow-hidden"
    >
      {/* Lưới tọa độ ngầm */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      {/* Quầng sáng lớn */}
      <div
        className={`absolute top-[-20%] left-[-10%] w-[55vw] h-[55vw] rounded-full blur-[140px] opacity-20 bg-gradient-to-br ${THEME.primary}`}
      />
      <div
        className={`absolute bottom-[-20%] right-[-10%] w-[45vw] h-[45vw] rounded-full blur-[120px] opacity-15 bg-gradient-to-br ${THEME.primary}`}
      />
      {/* Đèn rọi spotlight chuột */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(450px circle at var(--cursor-x, 50%) var(--cursor-y, 50%), rgba(52, 211, 153, 0.12), transparent 40%)",
        }}
      />
    </div>
  );
}