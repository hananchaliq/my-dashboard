"use client";

import React, { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTheme } from "next-themes";
import { Settings } from "@/types";

interface ExtendedSettings extends Partial<Settings> {
   enableLiquidGlass?: boolean;
   glassOpacity?: number;
   glassBlur?: number;
}

export default function OtherSettings() {
   const { resolvedTheme, theme } = useTheme();
   const [settings] = useLocalStorage<ExtendedSettings>("app_settings", {});

   const [saveLocalData, setSaveLocalData] = useLocalStorage<boolean>("dashboard_save_local", true);
   const [refreshInterval, setRefreshInterval] = useLocalStorage<string>("dashboard_refresh_interval", "30");
   const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   // Effect pemicu timer auto-refresh data
   useEffect(() => {
      const intervalMs = parseInt(refreshInterval, 10) * 1000;
      if (isNaN(intervalMs) || intervalMs <= 0) return;

      const timer = setInterval(() => {
         // Logika auto-refresh data dashboard
         console.log(`[Auto-Refresh] Memperbarui data setiap ${refreshInterval}s`);
      }, intervalMs);

      return () => clearInterval(timer);
   }, [refreshInterval]);

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

   return (
      <div style={containerGlassStyle} className={`group relative w-full p-4 rounded-2xl border shadow-xl space-y-3 overflow-hidden transition-all duration-300 text-xs ${isDark ? "border-white/15 text-slate-100 hover:border-white/30" : "border-slate-200 text-slate-800 hover:border-slate-300"}`}>
         {/* Top Liquid Glass Reflection */}
         <div className={`absolute top-0 left-0 right-0 h-16 pointer-events-none rounded-t-2xl ${isDark ? "bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent" : "bg-gradient-to-b from-orange-500/10 via-amber-500/[0.02] to-transparent"}`} />

         {/* Ambient Glow Subtle Background */}
         <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all duration-700 ${isDark ? "bg-orange-500/10 group-hover:bg-orange-500/20" : "bg-orange-400/15 group-hover:bg-orange-400/25"}`} />

         <h3 className={`font-bold tracking-wide relative z-10 ${isDark ? "text-white" : "text-slate-900"}`}>Lainnya</h3>

         {/* Toggle Simpan Data */}
         <div className="flex items-center justify-between py-1 relative z-10">
            <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>Simpan Data di Browser</span>
            <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" checked={saveLocalData} onChange={e => setSaveLocalData(e.target.checked)} className="sr-only peer" />
               <div className={`w-9 h-5 border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-amber-500 peer-checked:border-orange-400/50 shadow-inner ${isDark ? "bg-white/10 border-white/15" : "bg-black/10 border-black/15"}`} />
            </label>
         </div>

         {/* Select Refresh Otomatis */}
         <div className="flex items-center justify-between py-1 relative z-10">
            <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>Refresh Data Otomatis</span>
            <select value={refreshInterval} onChange={e => setRefreshInterval(e.target.value)} className={`border rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-orange-500/50 backdrop-blur-md text-[11px] font-medium cursor-pointer transition-colors ${isDark ? "bg-black/30 border-white/15 text-slate-100" : "bg-white/80 border-slate-200 text-slate-800"}`}>
               <option value="15" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>
                  15 detik
               </option>
               <option value="30" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>
                  30 detik
               </option>
               <option value="60" className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>
                  1 menit
               </option>
            </select>
         </div>
      </div>
   );
}
