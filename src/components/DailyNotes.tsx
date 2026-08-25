"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CheckCircle2, Circle, Edit3, ListTodo, Sparkles } from "lucide-react";

const DEFAULT_NOTES = "• Belajar React & Three.js\n• Latihan algoritma\n• Baca kitab malam hari\n• Olahraga ringan";

export default function DailyNotes() {
   const [noteText, setNoteText] = useLocalStorage<string>("dashboard_notes", DEFAULT_NOTES);
   const [tempNotes, setTempNotes] = useState("");
   const [currentDate, setCurrentDate] = useState("");
   const [isSaved, setIsSaved] = useState(false);
   const [viewMode, setViewMode] = useState<"edit" | "interactive">("interactive");

   const textareaRef = useRef<HTMLTextAreaElement>(null);

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

   const lines = tempNotes.split("\n").filter(line => line.trim() !== "");
   const wordCount = tempNotes.trim() ? tempNotes.trim().split(/\s+/).length : 0;
   const charCount = tempNotes.length;

   return (
      <div className="group relative w-full h-full p-5 rounded-3xl bg-white/[0.03] border border-white/15 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl flex flex-col justify-between space-y-3 overflow-hidden transition-all duration-500 hover:border-white/30">
         {/* Smooth Refleksi Kaca Cair (Gradien Diperhalus agar tidak patah) */}
         <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent rounded-t-3xl pointer-events-none" />

         {/* Ambient Glow Latar Belakang */}
         <div className="absolute -top-12 -right-12 w-44 h-44 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-all duration-700" />
         <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

         {/* Header Utama */}
         <div className="flex items-center justify-between px-1 pt-1 shrink-0 relative z-10">
            <div className="flex items-center gap-2">
               <h3 className="text-sm font-semibold text-white tracking-wide drop-shadow-sm">Catatan Harian</h3>
               <button type="button" onClick={() => setViewMode(v => (v === "edit" ? "interactive" : "edit"))} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-orange-400 backdrop-blur-md transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" title={viewMode === "edit" ? "Mode Checklist Interaktif" : "Mode Edit Teks"}>
                  {viewMode === "edit" ? <ListTodo className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
               </button>
            </div>

            <button onClick={handleSave} className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-medium transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] border border-white/20 active:scale-95 flex items-center gap-1.5">
               {isSaved && <Sparkles className="w-3 h-3 animate-spin" />}
               {isSaved ? "Tersimpan!" : "Simpan"}
            </button>
         </div>

         {/* Box Konten Utama */}
         <div className="flex-1 flex flex-col p-4 rounded-2xl bg-black/20 border border-white/10 backdrop-blur-xl space-y-3 transition-all min-h-0 relative z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden">
            {/* Tanggal Realtime */}
            <p className="text-[11px] font-medium text-slate-300/80 border-b border-white/10 pb-2 shrink-0">{currentDate || "Memuat tanggal..."}</p>

            {/* Mode Interaktif Checklist */}
            {viewMode === "interactive" ? (
               <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                  {lines.length > 0 ? (
                     lines.map((line, idx) => {
                        const isChecked = line.includes("✓ ");
                        const cleanText = line.replace(/^[•✓\-\*]\s*/, "");

                        return (
                           <div key={idx} onClick={() => toggleCheckItem(idx)} className="flex items-start gap-2.5 group cursor-pointer py-1.5 px-2 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 backdrop-blur-sm transition-all">
                              <button type="button" className="mt-0.5 shrink-0 text-slate-400 group-hover:text-orange-400 transition-colors">
                                 {isChecked ? <CheckCircle2 className="w-4 h-4 text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.5)]" /> : <Circle className="w-4 h-4 text-slate-400/80 group-hover:text-slate-200" />}
                              </button>
                              <span className={`text-xs leading-relaxed transition-all ${isChecked ? "line-through text-slate-400/70" : "text-slate-100 font-medium"}`}>{cleanText}</span>
                           </div>
                        );
                     })
                  ) : (
                     <p className="text-xs text-slate-400 italic py-4 text-center">Belum ada catatan hari ini...</p>
                  )}
               </div>
            ) : (
               /* Mode Editor Teks Raw */
               <textarea ref={textareaRef} value={tempNotes} onChange={e => setTempNotes(e.target.value)} onKeyDown={handleKeyDownTextarea} placeholder="• Tulis catatan atau tugas di sini..." className="w-full flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none resize-none leading-relaxed tracking-wide font-normal min-h-0" />
            )}
         </div>

         {/* Footer Meta Info */}
         <div className="flex items-center justify-between px-1 text-[10px] text-slate-300/80 font-medium shrink-0 relative z-10">
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
