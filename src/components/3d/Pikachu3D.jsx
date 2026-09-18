import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { motion } from "framer-motion";
import { sound } from "../../utils/audio";

export default function Pikachu3D({ className = "" }) {
  // canvasContainerRef luôn tồn tại trong DOM (dù hidden), để GLTFLoader có thể attach renderer
  const canvasContainerRef = useRef(null);
  const [hasGlbModel, setHasGlbModel] = useState(false);
  const [isSiuuu, setIsSiuuu] = useState(false);
  const [siuuPhase, setSiuuPhase] = useState("");
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const mouseTiltRef = useRef({ x: 0, y: 0 });
  const mixerRef = useRef(null);
  const actionsRef = useRef({});

  // 1. THREE.JS GLTF LOADER VỚI ANIMATIONMIXER
  // canvasContainerRef div LUÔN có trong DOM (hidden khi chưa load xong)
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    let mixer = null;
    const clock = new THREE.Clock();
    let animationFrameId = null;
    let renderer = null;

    const loader = new GLTFLoader();
    loader.load(
      "/pikachu.glb",
      (gltf) => {
        // GLB load thành công!
        const width = container.clientWidth || 420;
        const height = container.clientHeight || 460;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
        camera.position.set(0, 0.5, 4.5);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        container.innerHTML = "";
        container.appendChild(renderer.domElement);

        // Ánh sáng
        scene.add(new THREE.AmbientLight(0xffffff, 2.0));
        const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
        mainLight.position.set(4, 6, 5);
        scene.add(mainLight);
        const rimLight = new THREE.DirectionalLight(0x10b981, 1.2);
        rimLight.position.set(-4, -2, -3);
        scene.add(rimLight);

        const model = gltf.scene;

        // Auto-fit: căn giữa + scale vừa với viewport
        const box = new THREE.Box3().setFromObject(model);
        const boxSize = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z) || 1;
        const targetScale = 2.2 / maxDim;

        model.scale.setScalar(targetScale);
        model.position.set(
          -center.x * targetScale,
          -center.y * targetScale,
          -center.z * targetScale
        );
        scene.add(model);

        // Kích hoạt animation — chỉ phát "Idle" mặc định
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const actions = {};
          gltf.animations.forEach((clip) => {
            actions[clip.name] = mixer.clipAction(clip);
          });

          const idleAction = actions["Idle"] || mixer.clipAction(gltf.animations[0]);
          idleAction.play();

          mixerRef.current = mixer;
          actionsRef.current = actions;
        }

        // Render loop
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          const delta = clock.getDelta();
          if (mixer) mixer.update(delta);

          // Nhẹ nhàng xoay root theo chuột
          const ty = (mouseTiltRef.current.y * Math.PI) / 400;
          const tx = (mouseTiltRef.current.x * Math.PI) / 500;
          model.rotation.y += (ty - model.rotation.y) * 0.06;
          model.rotation.x += (tx - model.rotation.x) * 0.06;

          renderer.render(scene, camera);
        };
        animate();

        // Đánh dấu đã load thành công → hiện canvas 3D, ẩn sprite
        setHasGlbModel(true);
      },
      undefined,
      () => {
        // Không có file .glb → dùng sprite 2.5D, hasGlbModel = false (mặc định)
      }
    );

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  // 2. THEO DÕI CHUỘT
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const newTilt = { x: (py - 0.5) * -18, y: (px - 0.5) * 18 };
    setMouseTilt(newTilt);
    mouseTiltRef.current = newTilt;
  };

  const handleMouseLeave = () => {
    const reset = { x: 0, y: 0 };
    setMouseTilt(reset);
    mouseTiltRef.current = reset;
  };

  // 3. SIUUU CR7 + 3D JUMP ANIMATION
  const triggerCR7Siuuu = () => {
    if (isSiuuu) return;
    setIsSiuuu(true);
    setSiuuPhase("jump");

    try {
      const audio = new Audio("/siu.mp3");
      audio.play().catch(() => sound.playSiuuu());
    } catch {
      sound.playSiuuu();
    }

    // Nếu có model 3D: crossfade Idle → Jump → Idle
    const actions = actionsRef.current;
    if (actions["Jump"] && actions["Idle"]) {
      const jumpAction = actions["Jump"];
      jumpAction.reset();
      jumpAction.setLoop(THREE.LoopOnce, 1);
      jumpAction.clampWhenFinished = false;
      jumpAction.play();
      actions["Idle"].crossFadeTo(jumpAction, 0.2, true);

      const onFinish = (e) => {
        if (e.action === jumpAction) {
          jumpAction.crossFadeTo(actions["Idle"], 0.3, true);
          actions["Idle"].reset().play();
          mixerRef.current?.removeEventListener("finished", onFinish);
        }
      };
      mixerRef.current?.addEventListener("finished", onFinish);
    } else if (actions["Wave"] && actions["Idle"]) {
      const waveAction = actions["Wave"];
      waveAction.reset();
      waveAction.setLoop(THREE.LoopOnce, 1);
      waveAction.clampWhenFinished = false;
      waveAction.play();
      actions["Idle"].crossFadeTo(waveAction, 0.2, true);

      const onFinish = (e) => {
        if (e.action === waveAction) {
          waveAction.crossFadeTo(actions["Idle"], 0.3, true);
          actions["Idle"].reset().play();
          mixerRef.current?.removeEventListener("finished", onFinish);
        }
      };
      mixerRef.current?.addEventListener("finished", onFinish);
    }

    setTimeout(() => setSiuuPhase("land"), 850);
    setTimeout(() => setSiuuPhase("pose"), 1100);
    setTimeout(() => { setIsSiuuu(false); setSiuuPhase(""); }, 3600);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={triggerCR7Siuuu}
      className={`relative flex items-center justify-center cursor-pointer select-none group ${className}`}
    >
      {/* VẦNG SÁNG NỀN */}
      <div
        className={`absolute inset-0 -m-10 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
          isSiuuu
            ? "bg-gradient-to-tr from-emerald-400/50 via-yellow-400/50 to-lime-300/60 scale-125"
            : "bg-gradient-to-tr from-emerald-500/20 via-white/10 to-yellow-400/20 group-hover:scale-110"
        }`}
      />

      {/* BANNER SIUUU */}
      {isSiuuu && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none animate-bounce">
          <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-300 to-lime-400 text-neutral-950 font-black text-xl sm:text-2xl md:text-3xl tracking-wider shadow-[0_0_40px_rgba(250,204,21,0.8)] border-2 border-white flex items-center gap-2">
            <span>{siuuPhase === "jump" ? "XOAY TRÊN KHÔNG 360°" : "SIIIIUUUUUUU!"}</span>
            <span className="text-xl">💥⚡</span>
          </div>
          <div className="mt-1 px-3 py-1 rounded-full bg-neutral-900/90 border border-emerald-400/50 text-[11px] font-bold text-emerald-300 backdrop-blur-md shadow-lg">
            CR7 x DƯỢC SĨ PIKACHU
          </div>
        </div>
      )}

      {/* GỢI Ý NHẤP */}
      {!isSiuuu && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3.5 py-1.5 rounded-full bg-neutral-900/80 border border-white/15 backdrop-blur-md text-[11px] text-white/75 group-hover:text-emerald-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Nhấp vào Dược Sĩ Pikachu để <b>SIUUU</b> kiểu CR7! ⚡
        </div>
      )}

      {/* 
        QUAN TRỌNG: Canvas container LUÔN có trong DOM (không conditional render).
        Ẩn/hiện bằng CSS để GLTFLoader có ref hợp lệ từ đầu.
      */}
      <div
        ref={canvasContainerRef}
        className="w-full max-w-[420px] h-[430px] md:h-[490px]"
        style={{ display: hasGlbModel ? "block" : "none" }}
      />

      {/* SPRITE 2.5D – hiện khi chưa có GLB hoặc đang load */}
      {!hasGlbModel && (
        <motion.div
          animate={
            isSiuuu
              ? siuuPhase === "jump"
                ? { y: -130, rotateY: [0, 180, 360], scale: 1.15 }
                : siuuPhase === "land"
                ? { y: 15, scale: [1.15, 0.95, 1.05], rotateY: 0 }
                : { y: 0, scale: 1.05, rotateY: 0 }
              : {
                  rotateX: mouseTilt.x,
                  rotateY: mouseTilt.y,
                  y: [0, -10, 0],
                  scale: [1, 1.025, 1],
                }
          }
          transition={
            isSiuuu
              ? { duration: 0.8, ease: "easeOut" }
              : {
                  rotateX: { type: "spring", stiffness: 280, damping: 20 },
                  rotateY: { type: "spring", stiffness: 280, damping: 20 },
                  y: { repeat: Infinity, duration: 2.6, ease: "easeInOut" },
                  scale: { repeat: Infinity, duration: 2.6, ease: "easeInOut" },
                }
          }
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full max-w-[420px] h-[430px] md:h-[480px] flex items-center justify-center"
        >
          <img
            src="/pikachu-doctor.png"
            alt="Dược Sĩ Pikachu Áo Blouse Trường Dược"
            className="w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)] filter brightness-105 contrast-105"
            draggable={false}
          />

          {isSiuuu && (
            <motion.div
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-16 rounded-full border-4 border-emerald-400 bg-emerald-500/30 blur-sm pointer-events-none"
            />
          )}

          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-44 h-8 bg-black/40 rounded-full blur-md -z-10 group-hover:scale-95 transition-transform" />
        </motion.div>
      )}
    </div>
  );
}
