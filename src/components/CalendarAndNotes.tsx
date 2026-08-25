"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, FileText, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function CalendarAndNotes() {
   const [currentDate, setCurrentDate] = useState<Date>(new Date());
   const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split("T")[0]);
   const [notes, setNotes] = useLocalStorage<Record<string, string>>("app_daily_notes", {});
   const [savedStatus, setSavedStatus] = useState(false);

   const year = currentDate.getFullYear();
   const month = currentDate.getMonth();

   const daysInMonth = new Date(year, month + 1, 0).getDate();
   const firstDayIndex = new Date(year, month, 1).getDay();

   const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

   const handlePrevMonth = () => {
      setCurrentDate(new Date(year, month - 1, 1));
   };

   const handleNextMonth = () => {
      setCurrentDate(new Date(year, month + 1, 1));
   };

   const handleSelectDay = (day: number) => {
      const formattedMonth = String(month + 1).padStart(2, "0");
      const formattedDay = String(day).padStart(2, "0");
      const key = `${year}-${formattedMonth}-${formattedDay}`;
      setSelectedDateStr(key);
   };

   const handleNoteChange = (text: string) => {
      setNotes({
         ...notes,
         [selectedDateStr]: text,
      });
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 1500);
   };

   return (
      <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-lg flex flex-col justify-between w-full space-y-4">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-400">
               <CalendarIcon className="w-5 h-5" />
               <span className="text-sm font-semibold tracking-wide uppercase">Kalender & Catatan</span>
            </div>
            <div className="flex items-center space-x-1">
               <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
                  <ChevronLeft className="w-4 h-4" />
               </button>
               <span className="text-xs font-semibold text-slate-200">
                  {monthNames[month]} {year}
               </span>
               <button onClick={handleNextMonth} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
                  <ChevronRight className="w-4 h-4" />
               </button>
            </div>
         </div>

         {/* Mini Calendar Grid */}
         <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["M", "S", "S", "R", "K", "J", "S"].map((d, i) => (
               <span key={i} className="text-slate-500 font-semibold py-1">
                  {d}
               </span>
            ))}

            {Array.from({ length: firstDayIndex }).map((_, i) => (
               <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
               const day = i + 1;
               const formattedMonth = String(month + 1).padStart(2, "0");
               const formattedDay = String(day).padStart(2, "0");
               const dateKey = `${year}-${formattedMonth}-${formattedDay}`;

               const isSelected = selectedDateStr === dateKey;
               const hasNote = notes[dateKey] && notes[dateKey].trim().length > 0;

               return (
                  <button key={day} onClick={() => handleSelectDay(day)} className={`p-1.5 rounded-xl transition-all relative ${isSelected ? "bg-indigo-600 text-white font-bold" : "hover:bg-slate-800 text-slate-300"}`}>
                     {day}
                     {hasNote && !isSelected && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full" />}
                  </button>
               );
            })}
         </div>

         {/* Note Area */}
         <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center space-x-1 text-xs text-slate-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                     Catatan untuk: <strong className="text-slate-200">{selectedDateStr}</strong>
                  </span>
               </div>
               {savedStatus && (
                  <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                     <Save className="w-3 h-3" />
                     <span>Tersimpan</span>
                  </span>
               )}
            </div>
            <textarea value={notes[selectedDateStr] || ""} onChange={e => handleNoteChange(e.target.value)} placeholder="Tulis catatan harian di sini..." className="w-full h-20 p-2.5 bg-slate-800/50 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none" />
         </div>
      </div>
   );
}
