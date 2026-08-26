"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Settings } from "@/types";

interface ExtendedSettings extends Partial<Settings> {
   enableLiquidGlass?: boolean;
   glassOpacity?: number;
   glassBlur?: number;
}

export default function QuickMode() {
   const { resolvedTheme, theme, setTheme } = useTheme();
   const [settings] = useLocalStorage<ExtendedSettings>("app_settings", {});
   const [mounted, setMounted] = useState(false);

   // Mencegah masalah Mismatch Hydration pada Next.js Client Component
   useEffect(() => {
      setMounted(true);
   }, []);

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

   // Tampilkan Skeleton/Placeholder saat komponen belum selesai di-mount di browser
   if (!mounted) {
      return <div className="w-full p-4 rounded-3xl bg-slate-200/50 dark:bg-white/[0.03] border border-black/10 dark:border-white/15 animate-pulse h-[104px]" />;
   }

   return (
      <div style={containerGlassStyle} className={`group relative w-full p-4 rounded-2xl border shadow-2xl space-y-3 overflow-hidden transition-all duration-300 ${isDark ? "border-white/15 text-slate-100 hover:border-white/30" : "border-slate-200 text-slate-800 hover:border-slate-300"}`}>
         {/* Top Liquid Glass Reflection */}
         <div className={`absolute top-0 left-0 right-0 h-16 pointer-events-none rounded-t-2xl ${isDark ? "bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent" : "bg-gradient-to-b from-orange-500/10 via-amber-500/[0.02] to-transparent"}`} />

         {/* Ambient Glow Corner */}
         <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all duration-700 ${isDark ? "bg-orange-500/10 group-hover:bg-orange-500/20" : "bg-orange-400/15 group-hover:bg-orange-400/25"}`} />

         <h3 className={`text-xs font-bold tracking-wide relative z-10 ${isDark ? "text-white" : "text-slate-900"}`}>Mode Cepat</h3>

         <div className="grid grid-cols-3 gap-2 relative z-10">
            {/* Button Terang */}
            <button type="button" onClick={() => setTheme("light")} className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-[11px] font-medium transition-all backdrop-blur-md border cursor-pointer ${theme === "light" ? "bg-amber-500/20 border-amber-400/50 text-amber-600 dark:text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]" : isDark ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white" : "bg-black/5 border-black/10 text-slate-600 hover:bg-black/10 hover:text-slate-900"}`}>
               <Sun className="w-3.5 h-3.5" />
               <span>Terang</span>
            </button>

            {/* Button Gelap */}
            <button type="button" onClick={() => setTheme("dark")} className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-[11px] font-medium transition-all backdrop-blur-md border cursor-pointer ${theme === "dark" ? "bg-orange-500/20 border-orange-500/50 text-orange-500 dark:text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)]" : isDark ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white" : "bg-black/5 border-black/10 text-slate-600 hover:bg-black/10 hover:text-slate-900"}`}>
               <Moon className="w-3.5 h-3.5" />
               <span>Gelap</span>
            </button>

            {/* Button Sistem */}
            <button type="button" onClick={() => setTheme("system")} className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-[11px] font-medium transition-all backdrop-blur-md border cursor-pointer ${theme === "system" ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-600 dark:text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]" : isDark ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white" : "bg-black/5 border-black/10 text-slate-600 hover:bg-black/10 hover:text-slate-900"}`}>
               <Laptop className="w-3.5 h-3.5" />
               <span>Sistem</span>
            </button>
         </div>
      </div>
   );
}
