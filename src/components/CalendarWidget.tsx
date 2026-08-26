"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useTheme } from "next-themes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Settings } from "@/types";

const DEFAULT_SETTINGS: Settings = {
  bgType: "color",
  bgValue: "#07090e",
  lat: -8.8383,
  lng: 121.6521,
  cityName: "Ende",
  enableLiquidGlass: true,
  glassOpacity: 40,
  glassBlur: 12,
};

export default function CalendarWidget() {
  const [settings] = useLocalStorage<Settings>("app_settings", DEFAULT_SETTINGS);
  const { resolvedTheme, theme } = useTheme();

  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setCurrentDate(new Date());
    setIsMounted(true);
  }, []);

  const activeSettings = isMounted ? settings : DEFAULT_SETTINGS;

  if (!isMounted || !currentDate) {
    return (
      <div className="w-full h-full min-h-[320px] rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-slate-900/50 animate-pulse flex items-center justify-center">
        <span className="text-xs text-slate-500 font-mono">Loading Calendar...</span>
      </div>
    );
  }

  const currentTheme = resolvedTheme || theme || "dark";
  const isDark = currentTheme === "dark";

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const days = ["M", "S", "S", "R", "K", "J", "S"];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setDirection(-1);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => daysInPrevMonth - firstDayOfMonth + i + 1);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const totalSlots = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDaysCount = (7 - (totalSlots % 7)) % 7;
  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => i + 1);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 20 : -20,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 20 : -20,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
    }),
  } as Variants;

  const isLiquidEnabled = activeSettings.enableLiquidGlass ?? true;
  const glassOpacity = (activeSettings.glassOpacity ?? 40) / 100;
  const glassBlur = activeSettings.glassBlur ?? 12;

  // Style Inline Khusus Glassmorphism Engine
  const liquidGlassStyle: React.CSSProperties = isLiquidEnabled
    ? {
        backgroundColor: isDark 
          ? `rgba(15, 23, 42, ${glassOpacity})` 
          : `rgba(255, 255, 255, ${glassOpacity})`,
        backdropFilter: `blur(${glassBlur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${glassBlur}px) saturate(180%)`,
      }
    : {
        backgroundColor: isDark ? "#0d1117" : "#ffffff",
      };

  return (
    <div
      style={liquidGlassStyle}
      className={`relative group overflow-hidden p-5 rounded-3xl border transition-all duration-300 h-full flex flex-col justify-between w-full select-none ${
        isDark
          ? "border-white/15 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/30"
          : "border-slate-200/80 text-slate-900 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] hover:border-orange-400/40"
      }`}
    >
      {/* Glossy Reflective Gradient */}
      {isLiquidEnabled && (
        <div
          className={`absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-3xl ${
            isDark
              ? "bg-gradient-to-b from-white/10 to-transparent"
              : "bg-gradient-to-b from-white/60 to-transparent"
          }`}
        />
      )}

      {/* Ambient Inner Glow */}
      <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${isDark ? "bg-orange-500/20 group-hover:bg-orange-500/35" : "bg-orange-400/20 group-hover:bg-orange-400/30"}`} />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Widget */}
      <div className="flex items-center justify-between mb-3 z-10 relative shrink-0">
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-2xl border backdrop-blur-md shadow-inner ${isDark ? "bg-white/10 border-white/15 text-white" : "bg-slate-100/90 border-slate-200 text-slate-900"}`}>
          <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <h3 className="text-xs font-bold tracking-wide drop-shadow-sm">Kalender</h3>
        </div>

        {/* Navigasi Bulan */}
        <div className={`flex items-center space-x-1 p-1 rounded-2xl border backdrop-blur-md ${isDark ? "bg-white/10 border-white/20 text-white" : "bg-slate-100/90 border-slate-200 text-slate-800 shadow-sm"}`}>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={handlePrevMonth} className={`p-1.5 rounded-xl transition-colors ${isDark ? "text-slate-200 hover:text-white hover:bg-white/20" : "text-slate-600 hover:text-black hover:bg-slate-200/80"}`} title="Bulan Sebelumnya">
            <ChevronLeft className="w-3.5 h-3.5" />
          </motion.button>

          <span className="font-semibold text-[11px] min-w-[95px] text-center select-none drop-shadow-sm">
            {monthNames[month]} {year}
          </span>

          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={handleNextMonth} className={`p-1.5 rounded-xl transition-colors ${isDark ? "text-slate-200 hover:text-white hover:bg-white/20" : "text-slate-600 hover:text-black hover:bg-slate-200/80"}`} title="Bulan Berikutnya">
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Grid Nama Hari */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-2 font-bold shrink-0 z-10 relative">
        {days.map((d, i) => (
          <span key={`day-${i}`} className={`py-0.5 select-none drop-shadow-sm ${i === 0 || i === 6 ? (isDark ? "text-orange-300 font-extrabold" : "text-orange-600 font-extrabold") : isDark ? "text-slate-300/80" : "text-slate-600"}`}>
            {d}
          </span>
        ))}
      </div>

      {/* Grid Tanggal Beranimasi */}
      <div className="relative overflow-hidden flex-1 flex flex-col justify-stretch z-10 min-h-[190px]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div key={`${month}-${year}`} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="grid grid-cols-7 gap-1 text-center text-xs h-full content-between items-center">
            {/* Hari Bulan Lalu */}
            {prevMonthDays.map((day, i) => (
              <div key={`prev-${i}`} className="flex items-center justify-center">
                <span className={`font-normal select-none ${isDark ? "text-white/20" : "text-slate-400/50"}`}>{day}</span>
              </div>
            ))}

            {/* Hari Bulan Aktif */}
            {currentMonthDays.map(day => {
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

              return (
                <div key={`current-${day}`} className="flex items-center justify-center">
                  <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} className={`relative w-7 h-7 rounded-full flex items-center justify-center font-medium transition-all ${isToday ? "bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.6)] border border-white/40 ring-2 ring-orange-400/40" : isDark ? "text-white/90 hover:text-white hover:bg-white/15 hover:border hover:border-white/20" : "text-slate-800 hover:text-slate-950 hover:bg-slate-200/90 hover:border hover:border-slate-300"}`}>
                    {day}
                    {isToday && <span className="absolute -bottom-0.5 w-1 h-1 bg-white rounded-full animate-ping" />}
                  </motion.button>
                </div>
              );
            })}

            {/* Hari Bulan Depan */}
            {nextMonthDays.map((day, i) => (
              <div key={`next-${i}`} className="flex items-center justify-center">
                <span className={`font-normal select-none ${isDark ? "text-white/20" : "text-slate-400/50"}`}>{day}</span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}