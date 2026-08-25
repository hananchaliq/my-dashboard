"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { CurrencyDataPoint } from "@/types";

export default function TradingChart() {
   const [data, setData] = useState<CurrencyDataPoint[]>([]);
   const [currentPrice, setCurrentPrice] = useState<number>(16250);
   const [priceChange, setPriceChange] = useState<number>(0);

   useEffect(() => {
      // Generate initial 15 data points
      const basePrice = 16250;
      const initialPoints: CurrencyDataPoint[] = [];
      const now = new Date();

      for (let i = 14; i >= 0; i--) {
         const timeStr = new Date(now.getTime() - i * 2000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
         });
         const randomDiff = (Math.random() - 0.48) * 12;
         const pointPrice = Number((basePrice + randomDiff).toFixed(2));
         initialPoints.push({ time: timeStr, price: pointPrice });
      }

      setData(initialPoints);
      setCurrentPrice(initialPoints[initialPoints.length - 1].price);

      // Update real-time simulation every second
      const interval = setInterval(() => {
         setData(prevData => {
            const lastPrice = prevData.length > 0 ? prevData[prevData.length - 1].price : 16250;
            const change = (Math.random() - 0.49) * 8;
            const newPrice = Number((lastPrice + change).toFixed(2));

            setCurrentPrice(newPrice);
            setPriceChange(Number((newPrice - prevData[0].price).toFixed(2)));

            const newTime = new Date().toLocaleTimeString([], {
               hour: "2-digit",
               minute: "2-digit",
               second: "2-digit",
            });

            const updated = [...prevData.slice(1), { time: newTime, price: newPrice }];
            return updated;
         });
      }, 1000);

      return () => clearInterval(interval);
   }, []);

   const isPositive = priceChange >= 0;

   return (
      <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-lg flex flex-col justify-between w-full">
         <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-indigo-400">
               <DollarSign className="w-5 h-5" />
               <span className="text-sm font-semibold tracking-wide uppercase">USD / IDR Live Market</span>
            </div>
            <div className={`flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full ${isPositive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
               {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
               <span>{isPositive ? `+${priceChange}` : priceChange}</span>
            </div>
         </div>

         <div className="flex items-baseline space-x-2 mb-3">
            <span className="text-2xl font-bold text-slate-100">Rp {currentPrice.toLocaleString("id-ID")}</span>
            <span className="text-xs text-slate-400">/ USD</span>
         </div>

         {/* Chart Area */}
         <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                     <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                     </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={["dataMin - 10", "dataMax + 10"]} hide />
                  <Tooltip
                     contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#1e293b",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
                        color: "#f8fafc",
                     }}
                     formatter={(value: any) => [`Rp ${Number(value).toLocaleString("id-ID")}`, "Price"]}
                  />
                  <Area type="monotone" dataKey="price" stroke={isPositive ? "#10b981" : "#f43f5e"} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" isAnimationActive={false} />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
   );
}
