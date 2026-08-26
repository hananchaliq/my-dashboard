"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CheckCircle2, Circle, Edit3, ListTodo, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { Settings } from "@/types";

interface ExtendedSettings extends Partial<Settings> {
   enableLiquidGlass?: boolean;
   glassOpacity?: number;
   glassBlur?: number;
}

const DEFAULT_NOTES = "• Belajar React & Three.js\n• Latihan algoritma\n• Baca kitab malam hari\n• Olahraga ringan";

export default function DailyNotes() {
   const { resolvedTheme, theme } = useTheme();
   const [settings] = useLocalStorage<ExtendedSettings>("app_settings", {});
   const [noteText, setNoteText] = useLocalStorage<string>("dashboard_notes", DEFAULT_NOTES);

   const [tempNotes, setTempNotes] = useState("");
   const [currentDate, setCurrentDate] = useState("");
   const [isSaved, setIsSaved] = useState(false);
   const [viewMode, setViewMode] = useState<"edit" | "interactive">("interactive");
   const [isMounted, setIsMounted] = useState(false);

   const textareaRef = useRef<HTMLTextAreaElement>(null);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   useEffect(() => {
      setTempNotes(noteText);
   }, [noteText]);

   // Tanggal Real-Time Bahasa Indonesia
   useEffect(() => {
      const formattedDate = new Intl.DateTimeFormat("id-ID", {
         weekday: "long",
         day: "numeric",
         month: "long",
         year: "numeric",
      }).format(new Date());

      setCurrentDate(formattedDate);
   }, []);

   // Shortcut Ctrl+S / Cmd+S untuk Simpan
   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if ((e.ctrlKey || e.metaKey) && e.key === "s") {
            e.preventDefault();
            handleSave();
         }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
   }, [tempNotes]);

   const handleSave = () => {
      setNoteText(tempNotes);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
   };

   // Smart Enter untuk auto bullet saat ngetik
   const handleKeyDownTextarea = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
         e.preventDefault();
         const target = e.currentTarget;
         const start = target.selectionStart;
         const end = target.selectionEnd;

         const newText = tempNotes.substring(0, start) + "\n• " + tempNotes.substring(end);
         setTempNotes(newText);

         setTimeout(() => {
            target.selectionStart = target.selectionEnd = start + 3;
         }, 0);
      }
   };

   // Toggle item checklist pada mode interaktif
   const toggleCheckItem = (indexToToggle: number) => {
      const lines = tempNotes.split("\n");
      const updatedLines = lines.map((line, idx) => {
         if (idx === indexToToggle) {
            if (line.includes("✓ ")) return line.replace("✓ ", "• ");
            if (line.includes("• ")) return line.replace("• ", "✓ ");
            return `✓ ${line}`;
         }
         return line;
      });
      const updatedText = updatedLines.join("\n");
      setTempNotes(updatedText);
      setNoteText(updatedText);
   };

   const currentTheme = resolvedTheme || theme || "dark";
   const isDark = currentTheme === "dark";

   // Konfigurasi Dynamic Glass Styling
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

   const lines = tempNotes.split("\n").filter(line => line.trim() !== "");
   const wordCount = tempNotes.trim() ? tempNotes.trim().split(/\s+/).length : 0;
   const charCount = tempNotes.length;

   return (
      <div style={containerGlassStyle} className={`group relative w-full h-full p-5 rounded-3xl border shadow-2xl flex flex-col justify-between space-y-3 overflow-hidden transition-colors duration-300 ${isDark ? "border-white/15 text-slate-100" : "border-slate-200 text-slate-800"}`}>
         {/* Ambient Glow Gradient Header (Diperhalus) */}
         <div className={`absolute top-0 left-0 right-0 h-32 rounded-t-3xl pointer-events-none ${isDark ? "bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent" : "bg-gradient-to-b from-orange-500/10 via-amber-500/[0.02] to-transparent"}`} />

         {/* Ambient Glow Corner */}
         <div className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${isDark ? "bg-orange-500/10 group-hover:bg-orange-500/20" : "bg-orange-400/20 group-hover:bg-orange-400/30"}`} />
         <div className={`absolute -bottom-12 -left-12 w-44 h-44 rounded-full blur-3xl pointer-events-none ${isDark ? "bg-amber-500/10" : "bg-amber-400/15"}`} />

         {/* Header Utama */}
         <div className="flex items-center justify-between px-1 pt-1 shrink-0 relative z-10">
            <div className="flex items-center gap-2">
               <h3 className={`text-sm font-bold tracking-wide ${isDark ? "text-white" : "text-slate-900"}`}>Catatan Harian</h3>
               <button type="button" onClick={() => setViewMode(v => (v === "edit" ? "interactive" : "edit"))} className={`p-1.5 rounded-xl border backdrop-blur-md transition-all shadow-sm ${isDark ? "bg-white/5 hover:bg-white/15 border-white/10 text-slate-300 hover:text-orange-400" : "bg-black/5 hover:bg-black/10 border-black/10 text-slate-600 hover:text-orange-600"}`} title={viewMode === "edit" ? "Mode Checklist Interaktif" : "Mode Edit Teks"}>
                  {viewMode === "edit" ? <ListTodo className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
               </button>
            </div>

            <button type="button" onClick={handleSave} className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/25 border border-orange-400/30 active:scale-95 flex items-center gap-1.5">
               {isSaved && <Sparkles className="w-3 h-3 animate-spin" />}
               {isSaved ? "Tersimpan!" : "Simpan"}
            </button>
         </div>

         {/* Box Konten Utama */}
         <div className={`flex-1 flex flex-col p-4 rounded-2xl border backdrop-blur-xl space-y-3 transition-all min-h-0 relative z-10 shadow-inner overflow-hidden ${isDark ? "bg-black/20 border-white/10" : "bg-slate-50/70 border-slate-200/80"}`}>
            {/* Tanggal Realtime */}
            <p className={`text-[11px] font-semibold border-b pb-2 shrink-0 ${isDark ? "text-slate-400 border-white/10" : "text-slate-500 border-slate-200"}`}>{currentDate || "Memuat tanggal..."}</p>

            {/* Mode Interaktif Checklist */}
            {viewMode === "interactive" ? (
               <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                  {lines.length > 0 ? (
                     lines.map((line, idx) => {
                        const isChecked = line.includes("✓ ");
                        const cleanText = line.replace(/^[•✓\-\*]\s*/, "");

                        return (
                           <div key={idx} onClick={() => toggleCheckItem(idx)} className={`flex items-start gap-2.5 group cursor-pointer py-1.5 px-2 rounded-xl border backdrop-blur-sm transition-all ${isDark ? "hover:bg-white/10 border-transparent hover:border-white/10" : "hover:bg-black/5 border-transparent hover:border-slate-200"}`}>
                              <button type="button" className="mt-0.5 shrink-0 transition-colors">
                                 {isChecked ? <CheckCircle2 className="w-4 h-4 text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]" /> : <Circle className={`w-4 h-4 ${isDark ? "text-slate-500 group-hover:text-slate-200" : "text-slate-400 group-hover:text-slate-700"}`} />}
                              </button>
                              <span className={`text-xs leading-relaxed transition-all ${isChecked ? (isDark ? "line-through text-slate-500" : "line-through text-slate-400") : isDark ? "text-slate-100 font-medium" : "text-slate-800 font-medium"}`}>{cleanText}</span>
                           </div>
                        );
                     })
                  ) : (
                     <p className={`text-xs italic py-4 text-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>Belum ada catatan hari ini...</p>
                  )}
               </div>
            ) : (
               /* Mode Editor Teks Raw */
               <textarea ref={textareaRef} value={tempNotes} onChange={e => setTempNotes(e.target.value)} onKeyDown={handleKeyDownTextarea} placeholder="• Tulis catatan atau tugas di sini..." className={`w-full flex-1 bg-transparent text-xs focus:outline-none resize-none leading-relaxed tracking-wide font-normal min-h-0 ${isDark ? "text-white placeholder-slate-500" : "text-slate-800 placeholder-slate-400"}`} />
            )}
         </div>

         {/* Footer Meta Info */}
         <div className={`flex items-center justify-between px-1 text-[10px] font-semibold shrink-0 relative z-10 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <span>{viewMode === "interactive" ? "Klik baris untuk mencentang" : "Tekan Enter untuk baris baru"}</span>
            <div className="flex gap-2 font-mono">
               <span>{wordCount} Kata</span>
               <span>•</span>
               <span>{charCount} Karakter</span>
            </div>
         </div>
      </div>
   );
}
