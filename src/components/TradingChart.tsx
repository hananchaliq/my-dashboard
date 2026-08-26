"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { ArrowUpRight, ArrowDownRight, RefreshCw, TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Settings } from "@/types";

interface DataPoint {
   time: string;
   price: number;
}

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

export default function TradingChart() {
   const [settings] = useLocalStorage<Settings>("app_settings", DEFAULT_SETTINGS);
   const { resolvedTheme, theme } = useTheme();

   const [data, setData] = useState<DataPoint[]>([]);
   const [currentPrice, setCurrentPrice] = useState<number>(0);
   const [percentageChange, setPercentageChange] = useState<number>(0);
   const [stats, setStats] = useState({
      open: 0,
      high: 0,
      low: 0,
      prevClose: 0,
   });
   const [lastUpdate, setLastUpdate] = useState<string>("");
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [isMounted, setIsMounted] = useState<boolean>(false);

   // Ref untuk menampung harga terakhir agar interval 1 detik selalu dapat nilai paling segar
   const priceRef = useRef<number>(0);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   const activeSettings = isMounted ? settings : DEFAULT_SETTINGS;

   // 1. Fetch data asli dari API (sebagai anchor/base price)
   const fetchRealData = useCallback(async () => {
      try {
         const res = await fetch("https://open.er-api.com/v6/latest/USD");
         if (!res.ok) throw new Error("Fetch failed");

         const result = await res.json();
         const realPrice = Number(result.rates.IDR);

         // Set base price jika baru pertama kali fetch
         if (priceRef.current === 0) {
            priceRef.current = realPrice;
            setCurrentPrice(realPrice);

            setStats({
               open: realPrice,
               high: realPrice,
               low: realPrice,
               prevClose: realPrice,
            });
         }
      } catch (err) {
         console.error("Fetch error:", err);
      } finally {
         setIsLoading(false);
      }
   }, []);

   // 2. Ticking Loop (Berjalan TIAP 1 DETIK untuk simulasi grafik live trading)
   useEffect(() => {
      fetchRealData();

      // Fetch API asli tiap 30 detik untuk sync ulang
      const apiInterval = setInterval(() => {
         fetchRealData();
      }, 30000);

      // Live Tick per 1 Detik (membuat grafik naik-turun dinamis)
      const tickInterval = setInterval(() => {
         if (priceRef.current === 0) return;

         const now = new Date();
         const timeString = now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
         });

         // Fluktuasi random acak antara -4.5 IDR sampai +4.5 IDR
         const delta = (Math.random() - 0.49) * 9;
         const newPrice = Number((priceRef.current + delta).toFixed(2));

         priceRef.current = newPrice;
         setCurrentPrice(newPrice);
         setLastUpdate(timeString);

         // Update statistik High, Low, & Change
         setStats(prev => {
            const openVal = prev.open === 0 ? newPrice : prev.open;
            const highVal = Math.max(prev.high === 0 ? newPrice : prev.high, newPrice);
            const lowVal = Math.min(prev.low === 0 ? newPrice : prev.low, newPrice);
            const prevCloseVal = prev.prevClose === 0 ? newPrice : prev.prevClose;

            const pChange = prevCloseVal > 0 ? Number((((newPrice - prevCloseVal) / prevCloseVal) * 100).toFixed(2)) : 0;
            setPercentageChange(pChange);

            return { open: openVal, high: highVal, low: lowVal, prevClose: prevCloseVal };
         });

         // Simpan maksimal 40 data point biar grafiknya terus bergeser/running
         setData(prevData => {
            const updated = [...prevData, { time: timeString, price: newPrice }];
            if (updated.length > 40) return updated.slice(1);
            return updated;
         });
      }, 1000);

      return () => {
         clearInterval(apiInterval);
         clearInterval(tickInterval);
      };
   }, [fetchRealData]);

   if (!isMounted) {
      return (
         <div className="w-full h-full min-h-[320px] rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-slate-900/50 animate-pulse flex items-center justify-center">
            <span className="text-xs text-slate-500 font-mono">Loading Realtime Engine...</span>
         </div>
      );
   }

   const currentTheme = resolvedTheme || theme || "dark";
   const isDark = currentTheme === "dark";

   const formatPrice = (val: number) => {
      if (!val) return "0";
      return val.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
   };

   const isPositive = percentageChange >= 0;

   const isLiquidEnabled = activeSettings.enableLiquidGlass ?? true;
   const glassOpacity = (activeSettings.glassOpacity ?? 40) / 100;
   const glassBlur = activeSettings.glassBlur ?? 12;

   const liquidGlassStyle: React.CSSProperties = isLiquidEnabled
      ? {
           backgroundColor: isDark ? `rgba(15, 23, 42, ${glassOpacity})` : `rgba(255, 255, 255, ${glassOpacity})`,
           backdropFilter: `blur(${glassBlur}px) saturate(180%)`,
           WebkitBackdropFilter: `blur(${glassBlur}px) saturate(180%)`,
        }
      : {
           backgroundColor: isDark ? "#0d1117" : "#ffffff",
        };

   return (
      <div style={liquidGlassStyle} className={`relative group overflow-hidden p-6 rounded-3xl border transition-all duration-300 h-full flex flex-col justify-between w-full select-none space-y-4 ${isDark ? "border-white/15 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/30" : "border-slate-200/80 text-slate-900 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] hover:border-emerald-400/40"}`}>
         {/* Glossy Reflective Gradient */}
         {isLiquidEnabled && <div className={`absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-3xl ${isDark ? "bg-gradient-to-b from-white/10 to-transparent" : "bg-gradient-to-b from-white/60 to-transparent"}`} />}

         {/* Ambient Inner Glow */}
         <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${isDark ? (isPositive ? "bg-emerald-500/10 group-hover:bg-emerald-500/25" : "bg-rose-500/10 group-hover:bg-rose-500/25") : isPositive ? "bg-emerald-400/20 group-hover:bg-emerald-400/30" : "bg-rose-400/20 group-hover:bg-rose-400/30"}`} />

         {/* Header Utama */}
         <div className="flex items-center justify-between shrink-0 relative z-10">
            <div className="flex items-center space-x-2.5">
               <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-2xl border backdrop-blur-md shadow-inner ${isDark ? "bg-white/10 border-white/15 text-white" : "bg-slate-100/90 border-slate-200 text-slate-900"}`}>
                  <TrendingUp className={`w-3.5 h-3.5 animate-pulse ${isPositive ? "text-emerald-400" : "text-rose-400"}`} />
                  <h2 className="text-xs font-bold tracking-wide drop-shadow-sm">Kurs IDR / USD</h2>
               </div>

               <div className={`flex items-center space-x-0.5 text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md transition-all duration-300 ${isPositive ? (isDark ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]" : "text-emerald-700 bg-emerald-100 border-emerald-300") : isDark ? "text-rose-300 bg-rose-500/10 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]" : "text-rose-700 bg-rose-100 border-rose-300"}`}>
                  {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{isPositive ? `+${percentageChange}%` : `${percentageChange}%`}</span>
               </div>
            </div>

            <div className={`flex items-center space-x-1.5 border px-3 py-1 rounded-full text-xs font-medium tracking-wider backdrop-blur-md ${isDark ? "border-white/20 bg-white/10 text-slate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" : "border-slate-200 bg-slate-100/90 text-slate-700 shadow-sm"}`}>
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
               <span>TICK 1S</span>
            </div>
         </div>

         {/* Tampilan Harga Utama */}
         <div className="shrink-0 relative z-10">
            <div className="flex items-baseline space-x-2">
               {isLoading ? <span className="text-3xl font-bold tracking-tight text-slate-400 animate-pulse">Memuat...</span> : <span className={`text-3xl font-bold tracking-tight drop-shadow-md transition-colors duration-300 ${isDark ? "text-white" : "text-slate-900"}`}>{formatPrice(currentPrice)}</span>}
               <span className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>IDR</span>
            </div>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? "text-slate-300/80" : "text-slate-500"}`}>1 USD (Live 1s Fluctuations)</p>
         </div>

         {/* Grid Grafik & Panel Statistik */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end flex-1 min-h-0 relative z-10">
            {/* Area Grafik */}
            <div className={`lg:col-span-3 h-full min-h-[180px] w-full rounded-2xl p-2 border backdrop-blur-md ${isDark ? "bg-white/[0.03] border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" : "bg-slate-100/60 border-slate-200 shadow-inner"}`}>
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorDynamic" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.4} />
                           <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.0} />
                        </linearGradient>
                     </defs>
                     <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: isDark ? "#cbd5e1" : "#64748b", fontSize: 11 }} interval="preserveStartEnd" />
                     <YAxis domain={["dataMin - 10", "dataMax + 10"]} axisLine={false} tickLine={false} tick={{ fill: isDark ? "#cbd5e1" : "#64748b", fontSize: 11 }} orientation="left" />
                     <Tooltip
                        contentStyle={{
                           backgroundColor: isDark ? "rgba(15, 20, 32, 0.85)" : "rgba(255, 255, 255, 0.95)",
                           borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(226, 232, 240, 0.8)",
                           borderRadius: "0.75rem",
                           backdropFilter: "blur(12px)",
                           fontSize: "12px",
                           color: isDark ? "#f8fafc" : "#0f172a",
                           boxShadow: isDark ? "0 10px 25px -5px rgba(0, 0, 0, 0.5)" : "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value: any) => [`${formatPrice(Number(value))} IDR`, "Kurs"]}
                     />
                     <Area type="monotone" dataKey="price" stroke={isPositive ? "#10b981" : "#f43f5e"} strokeWidth={2} fillOpacity={1} fill="url(#colorDynamic)" isAnimationActive={true} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>

            {/* Panel Statistik */}
            <div className={`border rounded-2xl p-4 flex flex-col justify-between space-y-3 text-xs backdrop-blur-md h-full shrink-0 ${isDark ? "bg-white/[0.04] border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" : "bg-slate-100/80 border-slate-200 shadow-sm"}`}>
               <div className="flex justify-between items-center">
                  <span className={isDark ? "text-slate-300/80" : "text-slate-500"}>Open</span>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{formatPrice(stats.open)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className={isDark ? "text-slate-300/80" : "text-slate-500"}>High</span>
                  <span className={`font-semibold ${isDark ? "text-white text-emerald-400" : "text-emerald-600"}`}>{formatPrice(stats.high)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className={isDark ? "text-slate-300/80" : "text-slate-500"}>Low</span>
                  <span className={`font-semibold ${isDark ? "text-white text-rose-400" : "text-rose-600"}`}>{formatPrice(stats.low)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className={isDark ? "text-slate-300/80" : "text-slate-500"}>Prev Close</span>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{formatPrice(stats.prevClose)}</span>
               </div>

               <div className={`border-t pt-3 flex justify-between items-center ${isDark ? "border-white/15" : "border-slate-200"}`}>
                  <span className={isDark ? "text-slate-300/80" : "text-slate-500"}>Update</span>
                  <div className="flex items-center space-x-1.5">
                     <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
                     <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{lastUpdate || "--:--:--"}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
