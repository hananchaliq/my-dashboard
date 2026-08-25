"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function CalendarWidget() {
   const [currentDate, setCurrentDate] = useState(new Date());
   const [direction, setDirection] = useState<number>(0);

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

   // Disesuaikan agar kompatibel penuh dengan Framer Motion & TS
   const variants: Variants = {
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
   };

   return (
      <div className="relative group overflow-hidden p-5 rounded-3xl bg-white/[0.04] border border-white/20 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-500 hover:border-white/40 hover:shadow-[0_8px_32px_0_rgba(249,115,22,0.15)] h-full flex flex-col justify-between w-full">
         {/* Refleksi Kilauan Cairan (Liquid Glass Highlight) */}
         <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-2xl pointer-events-none" />

         {/* Ambient background glow */}
         <div className="absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br from-orange-500/30 to-amber-500/20 rounded-full blur-2xl group-hover:bg-orange-500/40 transition-all duration-700 pointer-events-none" />
         <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

         {/* Header Kalender */}
         <div className="flex items-center justify-between mb-3 z-10 relative shrink-0">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-2xl border border-white/15 backdrop-blur-md shadow-inner">
               <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
               <h3 className="text-xs font-bold text-white tracking-wide drop-shadow">Kalender</h3>
            </div>

            {/* Navigasi Bulan dengan Efek Kaca Cair */}
            <div className="flex items-center space-x-1 bg-white/10 p-1 rounded-2xl border border-white/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
               <button onClick={handlePrevMonth} className="p-1.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/20 transition-all active:scale-95" title="Bulan Sebelumnya">
                  <ChevronLeft className="w-3.5 h-3.5" />
               </button>

               <span className="font-semibold text-[11px] text-white min-w-[90px] text-center select-none drop-shadow">
                  {monthNames[month]} {year}
               </span>

               <button onClick={handleNextMonth} className="p-1.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/20 transition-all active:scale-95" title="Bulan Berikutnya">
                  <ChevronRight className="w-3.5 h-3.5" />
               </button>
            </div>
         </div>

         {/* Grid Nama Hari */}
         <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-2 font-bold shrink-0 z-10 relative">
            {days.map((d, i) => (
               <span key={`day-${i}`} className={`${i === 0 || i === 6 ? "text-orange-300" : "text-slate-300/80"} py-0.5 select-none drop-shadow-sm`}>
                  {d}
               </span>
            ))}
         </div>

         {/* Grid Tanggal Beranimasi */}
         <div className="relative overflow-hidden flex-1 flex flex-col justify-stretch z-10">
            <AnimatePresence custom={direction} mode="wait">
               <motion.div key={`${month}-${year}`} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="grid grid-cols-7 gap-1 text-center text-xs h-full content-between items-center">
                  {/* Sisa Bulan Lalu */}
                  {prevMonthDays.map((day, i) => (
                     <div key={`prev-${i}`} className="flex items-center justify-center">
                        <span className="text-white/20 font-normal select-none">{day}</span>
                     </div>
                  ))}

                  {/* Bulan Aktif */}
                  {currentMonthDays.map(day => {
                     const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                     return (
                        <div key={`current-${day}`} className="flex items-center justify-center">
                           <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} className={`relative w-7 h-7 rounded-full flex items-center justify-center font-medium transition-all ${isToday ? "bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.6)] border border-white/40 ring-2 ring-orange-400/40" : "text-white/90 hover:text-white hover:bg-white/15 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] hover:border hover:border-white/20"}`}>
                              {day}
                              {isToday && <span className="absolute -bottom-0.5 w-1 h-1 bg-white rounded-full animate-ping" />}
                           </motion.button>
                        </div>
                     );
                  })}

                  {/* Sisa Bulan Depan */}
                  {nextMonthDays.map((day, i) => (
                     <div key={`next-${i}`} className="flex items-center justify-center">
                        <span className="text-white/20 font-normal select-none">{day}</span>
                     </div>
                  ))}
               </motion.div>
            </AnimatePresence>
         </div>
      </div>
   );
}
