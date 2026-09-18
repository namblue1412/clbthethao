import {
  Trophy,
  Megaphone,
  Volleyball,
  Sparkles,
  Flame,
  Activity
} from "lucide-react";

export const THEME = {
  primary: "from-emerald-500 via-lime-500 to-emerald-400",
  soft: "from-emerald-500/20 via-lime-400/20 to-emerald-400/20",
  ring: "ring-emerald-400/50",
};

export const STATS = [
  { label: "Thành viên CLB", value: "300+" },
  { label: "Đơn phỏng vấn mỗi năm", value: "150+" },
  { label: "Giải đấu các môn mỗi năm", value: "5+" },
  { label: "Đối tác đồng hành", value: "1+" },
];

// ======================================================================
// CẤU HÌNH LIÊN KẾT DUY NHẤT VỚI GOOGLE SHEET CỦA CLB
// (Quản lý chung cả 2 chức năng: Đơn đăng ký thành viên & Hoạt động ĐRL)
// Hướng dẫn chi tiết cách lấy URL xem tại: HUONG_DAN_GOOGLE_SHEET.md
// ======================================================================
export const GOOGLE_SHEET_MASTER_CONFIG = {
  SCRIPT_URL: "", // Dán link Web App Google Apps Script duy nhất vào đây
  ADMIN_PASSWORD: "clbduocadmin", // Mật khẩu bảng quản trị của Chủ nhiệm
};
export const GOOGLE_SHEET_CONFIG = GOOGLE_SHEET_MASTER_CONFIG;

export const CATEGORIES = [
  { id: "all", label: "Tất cả các ban" },
  { id: "racket", label: "Bộ môn Vợt (Pickleball, Cầu lông)" },
  { id: "ball", label: "Bộ môn Bóng (Bóng đá, Bóng chuyền)" },
  { id: "art_media", label: "Cổ vũ & Truyền thông" },
];

export const SECTIONS = [
  {
    key: "pickleball",
    name: "Ban Pickleball",
    category: "racket",
    badge: "Mới",
    leader: "Ban Chuyên môn Pickleball",
    icon: Flame,
    accent: "bg-gradient-to-br from-lime-400 via-emerald-500 to-teal-600",
    coverType: "pickleball",
    slogan: "Năng động — Khéo léo — Gắn kết",
    goals: [
      "Xây dựng sân chơi Pickleball lành mạnh cho sinh viên Trường Dược.",
      "Tổ chức các buổi hướng dẫn luật chơi, kỹ thuật cơ bản và đấu tập 2 buổi/tuần.",
      "Thành lập đội hình tham gia thi đấu giao hữu với các trường bạn.",
      "Tạo cơ hội rèn luyện phản xạ và giao lưu thể thao sau giờ học.",
    ],
    history: [
      { year: "2026", text: "Chính thức thành lập ban, đưa bộ môn Pickleball vào hoạt động của CLB." },
      { year: "2026", text: "Tổ chức buổi sinh hoạt trải nghiệm đầu tiên cho sinh viên Trường Dược." },
    ],
    achievements: [
      "Ban thể thao mới thu hút đông đảo sinh viên đăng ký tham gia.",
      "Tổ chức thành công các buổi giao lưu nội bộ đầu tiên.",
    ],
  },
  {
    key: "football",
    name: "Ban Bóng đá",
    category: "ball",
    leader: "Bạch Hưng Thái Sơn",
    icon: Trophy,
    accent: "bg-gradient-to-br from-emerald-500 to-lime-500",
    coverType: "football",
    slogan: "Đoàn kết — Máu lửa — Hết mình",
    goals: [
      "Rèn luyện thể lực và tinh thần phối hợp đồng đội trên sân cỏ.",
      "Tổ chức và tham gia các giải bóng đá sinh viên thường niên của Trường Dược.",
      "Duy trì lịch tập luyện và thi đấu giao lưu đều đặn mỗi tuần.",
    ],
    history: [
      { year: "2019", text: "Khởi động phong trào bóng đá sinh viên Trường Dược." },
      { year: "2024", text: "Tổ chức giải đấu bóng đá nội bộ cho sinh viên các khoá." },
      { year: "2026", text: "Đồng hành cùng nhà tài trợ TV TPI trong các hoạt động thi đấu." },
    ],
    achievements: [
      "Vô Địch Giải Bóng đá nam UMP Champions League VII.",
      "Huy Chương Bạc Giải Bóng đá nữ UMP Champions League VII.",
      "Vô Địch Giải Bóng đá nữ UMP Champions League VIII.",
      "Huy Chương Bạc Giải Bóng đá nam UMP Champions League VIII.",
    ],
  },
  {
    key: "volleyball",
    name: "Ban Bóng chuyền",
    category: "ball",
    leader: "Phó Đức Huy",
    icon: Volleyball,
    accent: "bg-gradient-to-br from-lime-500 to-emerald-500",
    coverType: "volleyball",
    slogan: "Bền bỉ — Phối hợp — Bứt phá",
    goals: [
      "Duy trì tập luyện kỹ năng chuyền bóng, đập bóng và phòng thủ.",
      "Sinh hoạt định kỳ 2 buổi/tuần nhằm nâng cao kỹ năng và gắn kết thành viên.",
      "Tạo môi trường tập luyện vui vẻ, cởi mở cho sinh viên đam mê bóng chuyền.",
    ],
    history: [
      { year: "2020", text: "Hình thành từ nhóm sinh viên yêu thích bóng chuyền tại Trường Dược." },
      { year: "2023", text: "Chính thức thành lập ban trực thuộc CLB Thể thao Trường Dược." },
      { year: "2025", text: "Tham gia thi đấu cọ xát với các đội bóng sinh viên trong trường." },
    ],
    achievements: [
      "Huy chương Đồng giải bóng chuyền cấp Trường.",
      "Tổ chức giải bóng chuyền phong trào cho sinh viên Trường Dược.",
      "Đại diện trường tham gia thi đấu giải sinh viên.",
    ],
  },
  {
    key: "badminton",
    name: "Ban Cầu lông",
    category: "racket",
    leader: "Bùi Minh Triết",
    icon: Activity,
    accent: "bg-gradient-to-br from-emerald-600 to-lime-500",
    coverType: "badminton",
    slogan: "Nhanh nhẹn — Tập trung — Giao lưu",
    goals: [
      "Duy trì các buổi tập luyện cầu lông định kỳ hằng tuần theo nhóm trình độ.",
      "Luyện tập các nội dung thi đấu Đơn và Đôi (Nam, Nữ, Nam Nữ).",
      "Tổ chức các giải đấu mini nội bộ để các thành viên cọ xát kinh nghiệm.",
    ],
    history: [
      { year: "2017", text: "Cộng đồng sinh viên cầu lông Trường Dược ra đời." },
      { year: "2020", text: "Thành lập quỹ sân bãi và hoạt động định kỳ." },
      { year: "2024", text: "Tổ chức giải cầu lông nội bộ cho sinh viên các khoá." },
    ],
    achievements: [
      "Đạt thành tích tốt tại các giải cầu lông giao hữu sinh viên.",
      "Duy trì phong trào tập luyện sôi nổi và đều đặn nhất CLB.",
    ],
  },
  {
    key: "cheerleading",
    name: "Đội Cheerleading",
    category: "art_media",
    leader: "Ngô Minh Khang",
    icon: Sparkles,
    accent: "bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600",
    coverType: "cheerleading",
    slogan: "Nhiệt huyết — Đồng đều — Tự tin",
    goals: [
      "Rèn luyện sự dẻo dai, thể lực và tinh thần đồng đội.",
      "Tập luyện các bài biểu diễn cổ động sôi động cho các sự kiện của Trường Dược.",
      "Tạo môi trường gắn kết, thân thiện cho các bạn yêu thích nhảy và cổ động.",
    ],
    history: [
      { year: "2023", text: "Thành lập đội Cheerleading trực thuộc CLB." },
      { year: "2024", text: "Đổi tên thành Cobra Cheerleading Team, tập trung nâng cao chất lượng bài tập." },
      { year: "2025", text: "Tham gia biểu diễn cổ vũ tại các giải thi đấu thể thao và lễ hội." },
    ],
    achievements: [
      "4 lần đạt giải tại hội thi nhảy cổ động Dynamic.",
      "Đội hình biểu diễn quen thuộc tại các sự kiện thể thao của Trường Dược.",
    ],
  },
  {
    key: "media",
    name: "Ban Truyền thông",
    category: "art_media",
    leader: "Lai Trí Huy",
    icon: Megaphone,
    accent: "bg-gradient-to-br from-lime-600 to-emerald-500",
    coverType: "media",
    slogan: "Ghi lại — Kết nối — Lan tỏa",
    goals: [
      "Chụp ảnh, quay video ghi lại những khoảnh khắc đẹp của CLB.",
      "Quản lý fanpage, đưa tin về các buổi tập và giải đấu của Trường Dược.",
      "Hỗ trợ các thành viên nâng cao kỹ năng chụp ảnh, dựng clip và thiết kế poster.",
    ],
    history: [
      { year: "2020", text: "Thành lập nhóm truyền thông hỗ trợ chụp ảnh các giải đấu." },
      { year: "2022", text: "Phụ trách quản lý hình ảnh và fanpage chính thức của CLB." },
      { year: "2026", text: "Đồng hành truyền thông cùng đối tác TV TPI cho các giải đấu." },
    ],
    achievements: [
      "Kênh thông tin kết nối sinh viên thể thao Trường Dược.",
      "Ghi lại hàng ngàn bức ảnh kỷ niệm cho các mùa giải thể thao.",
    ],
  },
];
