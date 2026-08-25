"use client";

import React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

export default function QuickMode() {
   const { theme, setTheme } = useTheme();

   return (
      <div className="group relative w-full p-4 rounded-3xl bg-white/[0.03] border border-white/15 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl space-y-3 overflow-hidden transition-all duration-300 hover:border-white/30">
         {/* Top Liquid Glass Reflection */}
         <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent pointer-events-none rounded-t-3xl" />

         <h3 className="text-xs font-semibold text-white tracking-wide drop-shadow-sm relative z-10">Mode Cepat</h3>

         <div className="grid grid-cols-3 gap-2 relative z-10">
            {/* Button Terang */}
            <button type="button" onClick={() => setTheme?.("light")} className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-[11px] font-medium transition-all backdrop-blur-md border ${theme === "light" ? "bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.2)]" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"}`}>
               <Sun className="w-3.5 h-3.5" />
               <span>Terang</span>
            </button>

            {/* Button Gelap */}
            <button type="button" onClick={() => setTheme?.("dark")} className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-[11px] font-medium transition-all backdrop-blur-md border ${theme === "dark" ? "bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)]" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"}`}>
               <Moon className="w-3.5 h-3.5" />
               <span>Gelap</span>
            </button>

            {/* Button Sistem */}
            <button type="button" onClick={() => setTheme?.("system")} className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-[11px] font-medium transition-all backdrop-blur-md border ${theme === "system" ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"}`}>
               <Laptop className="w-3.5 h-3.5" />
               <span>Sistem</span>
            </button>
         </div>
      </div>
   );
}
