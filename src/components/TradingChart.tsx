"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";

interface DataPoint {
   time: string;
   price: number;
}

export default function TradingChart() {
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

   // Fetch data real dari Open Exchange Rates API
   const fetchRealData = useCallback(async () => {
      try {
         const res = await fetch("https://open.er-api.com/v6/latest/USD");
         if (!res.ok) throw new Error("Fetch failed");

         const result = await res.json();
         const realPrice = Number(result.rates.IDR);

         const now = new Date();
         const timeString = now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
         });

         setLastUpdate(timeString);
         setCurrentPrice(realPrice);

         setStats(prev => {
            const openVal = prev.open === 0 ? realPrice : prev.open;
            const highVal = prev.high === 0 ? realPrice : Math.max(prev.high, realPrice);
            const lowVal = prev.low === 0 ? realPrice : Math.min(prev.low, realPrice);
            const prevCloseVal = prev.prevClose === 0 ? realPrice : prev.prevClose;

            const pChange = prevCloseVal > 0 ? Number((((realPrice - prevCloseVal) / prevCloseVal) * 100).toFixed(2)) : 0;

            setPercentageChange(pChange);

            return { open: openVal, high: highVal, low: lowVal, prevClose: prevCloseVal };
         });

         setData(prevData => {
            const updated = [...prevData, { time: timeString, price: realPrice }];
            if (updated.length > 30) return updated.slice(1);
            return updated;
         });
      } catch (err) {
         console.error("Fetch error:", err);
      } finally {
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchRealData();

      const interval = setInterval(() => {
         fetchRealData();
      }, 10000);

      return () => clearInterval(interval);
   }, [fetchRealData]);

   const formatPrice = (val: number) => {
      if (!val) return "0";
      return val.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
   };

   const isPositive = percentageChange >= 0;

   return (
      <div className="group relative w-full h-full p-6 rounded-3xl bg-white/[0.04] border border-white/20 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl flex flex-col justify-between space-y-4 overflow-hidden transition-all duration-500 hover:border-white/40">
         {/* Refleksi Kaca Cair Top (Liquid Glass Reflection) */}
         <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-3xl pointer-events-none" />

         {/* Ambient Glow Latar Belakang */}
         <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
         <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

         {/* Header Utama */}
         <div className="flex items-center justify-between shrink-0 relative z-10">
            <div className="flex items-center space-x-2.5">
               <h2 className="text-lg font-semibold tracking-wide text-white drop-shadow-sm">Exchange Rate IDR / USD</h2>
               <div className={`flex items-center space-x-0.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-md transition-all ${isPositive ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]" : "text-rose-300 bg-rose-500/10 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]"}`}>
                  {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{isPositive ? `+${percentageChange}%` : `${percentageChange}%`}</span>
               </div>
            </div>

            <div className="flex items-center space-x-1.5 border border-white/20 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-medium tracking-wider backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
               <span>LIVE API</span>
            </div>
         </div>

         {/* Tampilan Harga Utama */}
         <div className="shrink-0 relative z-10">
            <div className="flex items-baseline space-x-2">
               {isLoading ? <span className="text-3xl font-bold tracking-tight text-slate-400 animate-pulse">Memuat...</span> : <span className="text-3xl font-bold tracking-tight text-white drop-shadow-md">{formatPrice(currentPrice)}</span>}
               <span className="text-sm font-semibold text-slate-300">IDR</span>
            </div>
            <p className="text-xs text-slate-300/80 font-medium mt-0.5">1 USD (Real-Time Rates)</p>
         </div>

         {/* Grid Grafik & Panel Statistik */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end flex-1 min-h-0 relative z-10">
            {/* Area Grafik */}
            <div className="lg:col-span-3 h-full min-h-[180px] w-full bg-white/[0.03] rounded-2xl p-2 border border-white/15 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                     </defs>
                     <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#cbd5e1", fontSize: 11 }} interval="preserveStartEnd" />
                     <YAxis domain={["dataMin - 5", "dataMax + 5"]} axisLine={false} tickLine={false} tick={{ fill: "#cbd5e1", fontSize: 11 }} orientation="left" />
                     <Tooltip
                        contentStyle={{
                           backgroundColor: "rgba(15, 20, 32, 0.85)",
                           borderColor: "rgba(255, 255, 255, 0.2)",
                           borderRadius: "0.75rem",
                           backdropFilter: "blur(12px)",
                           fontSize: "12px",
                           color: "#f8fafc",
                           boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                        }}
                        formatter={(value: any) => [`${formatPrice(Number(value))} IDR`, "Kurs"]}
                     />
                     <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGreen)" isAnimationActive={false} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>

            {/* Panel Statistik */}
            <div className="bg-white/[0.04] border border-white/15 rounded-2xl p-4 flex flex-col justify-between space-y-3 text-xs backdrop-blur-md h-full shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
               <div className="flex justify-between items-center">
                  <span className="text-slate-300/80">Open</span>
                  <span className="font-semibold text-white">{formatPrice(stats.open)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-slate-300/80">High</span>
                  <span className="font-semibold text-white">{formatPrice(stats.high)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-slate-300/80">Low</span>
                  <span className="font-semibold text-white">{formatPrice(stats.low)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-slate-300/80">Prev Close</span>
                  <span className="font-semibold text-white">{formatPrice(stats.prevClose)}</span>
               </div>

               <div className="border-t border-white/15 pt-3 flex justify-between items-center">
                  <span className="text-slate-300/80">Update</span>
                  <div className="flex items-center space-x-1.5">
                     <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
                     <span className="font-semibold text-slate-200">{lastUpdate || "--:--:--"}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
