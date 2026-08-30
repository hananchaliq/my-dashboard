"use client";

import React, { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CheckCircle2, Circle, Edit3, ListTodo, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { Settings } from "@/types";

interface ExtendedSettings extends Partial<Settings> {
   enableLiquidGlass?: boolean;
   glassOpacity?: number;
   glassBlur?: number;
}

interface ScheduleItem {
   id: string;
   time: string;
   agenda: string;
   detail: string;
   completed: boolean;
}

const DEFAULT_SCHEDULE: ScheduleItem[] = [
   { id: "1", time: "04.20 - 05.30", agenda: "Bangun, Ibadah Pagi, & Halaqah", detail: "Air Putih Warm (250–300 ml)", completed: false },
   { id: "2", time: "05.30 - 06.00", agenda: "Sesi Stimulasi Pagi (15–20 Mins)", detail: "Gelantungan (Bar Hang) 3x60s + Dynamic Stretching", completed: false },
   { id: "3", time: "06.00 - 06.20", agenda: "SARAPAN UTAMA (Nasi)", detail: "Nasi + 1 Gelas Susu (HiLo/Zee) + 1 Pil Boney", completed: false },
   { id: "4", time: "06.20 - 07.30", agenda: "Persiapan & Berangkat Sekolah", detail: "Air putih secukupnya", completed: false },
   { id: "5", time: "07.30 - 10.13", agenda: "KBM Sekolah", detail: "Air putih (bawa botol minum 1 Liter)", completed: false },
   { id: "6", time: "10.13 - 10.30", agenda: "Istirahat Sekolah & Berjemur", detail: "Berjemur Matahari Pagi (10–15 menit) + Air Putih", completed: false },
   { id: "7", time: "10.30 - 14.30", agenda: "KBM Sekolah hingga Selesai", detail: "Air putih secukupnya", completed: false },
   { id: "8", time: "14.30 - 15.30", agenda: "Pulang Sekolah & MAKAN SIANG", detail: "Makan Nasi Siang (Telur/Ayam/Ikan)", completed: false },
   { id: "9", time: "15.30 - 16.00", agenda: "Persiapan Asar & Pre-Workout Fuel", detail: "Quaker Oat (1 Porsi) + Air Putih", completed: false },
   { id: "10", time: "16.30 - 17.30", agenda: "SESI UTAMA: OLAHRAGA HEIGHT", detail: "Sprint 15m, Pull-up, Push-up/Squat, Skipping", completed: false },
   { id: "11", time: "17.30 - 18.00", agenda: "Mandi Sore & MAKAN MALAM", detail: "Makan Nasi Sore/Malam", completed: false },
   { id: "12", time: "18.00 - 20.00", agenda: "Magrib, Kajian, & Isya", detail: "Air putih secukupnya", completed: false },
   { id: "13", time: "20.00 - 21.30", agenda: "Belajar Mandiri", detail: "Air putih (Hindari makan berat/manis)", completed: false },
   { id: "14", time: "21.30 - 22.00", agenda: "Night Protocol & Skincare", detail: "1 Gelas Susu (HiLo/Zee) + 1 Pil Boney", completed: false },
   { id: "15", time: "22.00", agenda: "TIDUR MATI (WAJIB)", detail: "Matikan lampu kamar / minim cahaya", completed: false },
];

export default function DailyNotes() {
   const { resolvedTheme, theme } = useTheme();
   const [settings] = useLocalStorage<ExtendedSettings>("app_settings", {});

   const getTodayKey = () => new Date().toISOString().split("T")[0];
   const [todayKey] = useState(getTodayKey);

   const [schedule, setSchedule] = useLocalStorage<ScheduleItem[]>(`master_protocol_${todayKey}`, DEFAULT_SCHEDULE);
   const [notesHistory, setNotesHistory] = useLocalStorage<Record<string, ScheduleItem[]>>("master_protocol_history", {});

   const [currentDate, setCurrentDate] = useState("");
   const [isSaved, setIsSaved] = useState(false);
   const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
      setIsMounted(true);
      const formattedDate = new Intl.DateTimeFormat("id-ID", {
         weekday: "long",
         day: "numeric",
         month: "long",
         year: "numeric",
      }).format(new Date());
      setCurrentDate(formattedDate);
   }, []);

   const handleSave = () => {
      setSchedule(schedule);
      setNotesHistory({
         ...notesHistory,
         [todayKey]: schedule,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
   };

   const toggleItem = (id: string) => {
      const updated = schedule.map(item => (item.id === id ? { ...item, completed: !item.completed } : item));
      setSchedule(updated);
      setNotesHistory({
         ...notesHistory,
         [todayKey]: updated,
      });
   };

   const currentTheme = resolvedTheme || theme || "dark";
   const isDark = currentTheme === "dark";

   const enableLiquidGlass = settings?.enableLiquidGlass ?? true;
   const opacityVal = (settings?.glassOpacity ?? 40) / 100;
   const glassBlur = settings?.glassBlur ?? 12;

   const containerGlassStyle: React.CSSProperties = enableLiquidGlass
      ? {
           backgroundColor: isDark ? `rgba(9, 13, 22, ${opacityVal})` : `rgba(255, 255, 255, ${Math.max(opacityVal, 0.45)})`,
           backdropFilter: `blur(${glassBlur}px) saturate(180%)`,
           WebkitBackdropFilter: `blur(${glassBlur}px) saturate(180%)`,
        }
      : {
           backgroundColor: isDark ? "#090d16" : "#ffffff",
        };

   if (!isMounted) return null;

   const completedCount = schedule.filter(s => s.completed).length;

   return (
      <div style={containerGlassStyle} className={`group relative w-full h-full max-h-[620px] p-4 rounded-3xl border shadow-2xl flex flex-col justify-between space-y-3 overflow-hidden transition-colors duration-300 ${isDark ? "border-white/15 text-slate-100" : "border-slate-200 text-slate-800"}`}>
         {/* Ambient Glow */}
         <div className={`absolute top-0 left-0 right-0 h-32 rounded-t-3xl pointer-events-none ${isDark ? "bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent" : "bg-gradient-to-b from-orange-500/10 via-amber-500/[0.02] to-transparent"}`} />
         <div className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${isDark ? "bg-orange-500/10 group-hover:bg-orange-500/20" : "bg-orange-400/20 group-hover:bg-orange-400/30"}`} />

         {/* Header Utama */}
         <div className="flex items-center justify-between px-1 pt-1 shrink-0 relative z-10">
            <div className="flex items-center gap-2">
               <ListTodo className="w-4 h-4 text-orange-400" />
               <h3 className={`text-xs font-bold tracking-wide ${isDark ? "text-white" : "text-slate-900"}`}>Master Growth Protocol</h3>
            </div>

            <button type="button" onClick={handleSave} className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black rounded-xl text-[11px] font-bold transition-all shadow-md shadow-orange-500/25 border border-orange-400/30 active:scale-95 flex items-center gap-1">
               {isSaved && <Sparkles className="w-3 h-3 animate-spin" />}
               {isSaved ? "Tersimpan!" : "Simpan Progress"}
            </button>
         </div>

         {/* Sub-Header Tanggal */}
         <div className={`flex items-center justify-between text-[10px] font-semibold border-b pb-2 shrink-0 relative z-10 ${isDark ? "text-slate-400 border-white/10" : "text-slate-500 border-slate-200"}`}>
            <span>{currentDate || "Memuat tanggal..."}</span>
            <span className="font-mono text-orange-400">
               {completedCount}/{schedule.length} Selesai
            </span>
         </div>

         {/* Container Tabel/List Jadwal (Scrollable) */}
         <div className={`flex-1 flex flex-col p-2 rounded-2xl border backdrop-blur-xl transition-all min-h-0 relative z-10 shadow-inner overflow-hidden ${isDark ? "bg-black/20 border-white/10" : "bg-slate-50/70 border-slate-200/80"}`}>
            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 custom-scrollbar min-h-0">
               {schedule.map(item => (
                  <div key={item.id} onClick={() => toggleItem(item.id)} className={`flex items-start gap-2.5 p-2 rounded-xl border backdrop-blur-sm transition-all cursor-pointer ${item.completed ? (isDark ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-100/50 border-orange-200") : isDark ? "bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10" : "bg-white/60 border-transparent hover:border-slate-200 hover:bg-white"}`}>
                     <button type="button" className="mt-0.5 shrink-0 transition-colors">
                        {item.completed ? <CheckCircle2 className="w-4 h-4 text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]" /> : <Circle className={`w-4 h-4 ${isDark ? "text-slate-500 group-hover:text-slate-200" : "text-slate-400 group-hover:text-slate-700"}`} />}
                     </button>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                           <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${isDark ? "bg-white/10 text-orange-300" : "bg-orange-100 text-orange-700"}`}>{item.time}</span>
                           <span className={`text-[11px] font-semibold truncate ${item.completed ? (isDark ? "line-through text-slate-400" : "line-through text-slate-500") : isDark ? "text-slate-100" : "text-slate-900"}`}>{item.agenda}</span>
                        </div>
                        <p className={`text-[10px] mt-0.5 leading-relaxed truncate ${item.completed ? (isDark ? "line-through text-slate-500" : "line-through text-slate-400") : isDark ? "text-slate-400" : "text-slate-600"}`}>{item.detail}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Footer Info */}
         <div className={`flex items-center justify-between px-1 text-[9px] font-semibold shrink-0 relative z-10 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <span>Klik baris untuk mencentang rutinitas</span>
            <span>Target HGH & Nutrisi Maksimal</span>
         </div>
      </div>
   );
}
