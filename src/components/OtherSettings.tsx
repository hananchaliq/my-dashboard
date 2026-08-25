"use client";

import React, { useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function OtherSettings() {
   const [saveLocalData, setSaveLocalData] = useLocalStorage<boolean>("dashboard_save_local", true);
   const [refreshInterval, setRefreshInterval] = useLocalStorage<string>("dashboard_refresh_interval", "30");

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

   return (
      <div className="group relative w-full p-4 rounded-3xl bg-white/[0.03] border border-white/15 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl space-y-3 overflow-hidden transition-all duration-300 hover:border-white/30 text-xs">
         {/* Top Liquid Glass Reflection */}
         <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent pointer-events-none rounded-t-3xl" />

         <h3 className="font-semibold text-white tracking-wide drop-shadow-sm relative z-10">Lainnya</h3>

         {/* Toggle Simpan Data */}
         <div className="flex items-center justify-between py-1 relative z-10">
            <span className="text-slate-300">Simpan Data di Browser</span>
            <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" checked={saveLocalData} onChange={e => setSaveLocalData(e.target.checked)} className="sr-only peer" />
               <div className="w-9 h-5 bg-white/10 border border-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-amber-500 peer-checked:border-orange-400/50 shadow-inner"></div>
            </label>
         </div>

         {/* Select Refresh Otomatis */}
         <div className="flex items-center justify-between py-1 relative z-10">
            <span className="text-slate-300">Refresh Data Otomatis</span>
            <select value={refreshInterval} onChange={e => setRefreshInterval(e.target.value)} className="bg-black/30 border border-white/15 rounded-xl p-1.5 text-slate-100 focus:outline-none focus:border-orange-500/50 backdrop-blur-md text-[11px] cursor-pointer">
               <option value="15" className="bg-slate-900 text-slate-100">
                  15 detik
               </option>
               <option value="30" className="bg-slate-900 text-slate-100">
                  30 detik
               </option>
               <option value="60" className="bg-slate-900 text-slate-100">
                  1 menit
               </option>
            </select>
         </div>
      </div>
   );
}
