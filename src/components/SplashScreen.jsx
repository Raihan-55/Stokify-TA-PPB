import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import logo from "../assets/react.svg";

export default function SplashScreen({ title = "Stokify" }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center 
      overflow-hidden transition-opacity duration-700 
      ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      {/* Aurora Gradient Glow */}
      <div className="absolute inset-0 animate-aurora bg-[radial-gradient(circle_at_30%_20%,rgba(96,165,250,0.9),transparent),radial-gradient(circle_at_70%_80%,rgba(30,58,138,0.9),transparent)]"></div>

      {/* Moving Wave Light */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-3xl animate-wave"></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="particle"></div>
        <div className="particle delay-150"></div>
        <div className="particle delay-300"></div>
        <div className="particle delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center gap-6 animate-fadeZoom">
        <img src={logo} className="w-24 h-24 drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]" alt="Logo" />

        <h1 className="text-4xl font-extrabold text-white tracking-wider drop-shadow-lg">{title}</h1>

        <Sparkles size={44} className="text-white drop-shadow animate-spin-slow" />
      </div>
    </div>
  );
}
