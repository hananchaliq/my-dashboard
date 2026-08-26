"use client";

import React, { useState, useEffect } from "react";
import { Edit3, Grid, Bell, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Settings } from "@/types";

interface ExtendedSettings extends Partial<Settings> {
   enableLiquidGlass?: boolean;
   glassOpacity?: number;
   glassBlur?: number;
}

interface NavbarProps {
   userName?: string;
   onEditMode?: () => void;
   onOpenGrid?: () => void;
   onToggleNotifications?: () => void;
   onProfileClick?: () => void;
}

export default function Navbar({ userName = "Hanan", onEditMode, onOpenGrid, onToggleNotifications, onProfileClick }: NavbarProps) {
   const { resolvedTheme, theme } = useTheme();
   const [settings] = useLocalStorage<ExtendedSettings>("app_settings", {});

   const [greeting, setGreeting] = useState("Selamat Malam");
   const [formattedDate, setFormattedDate] = useState("");
   const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   useEffect(() => {
      const now = new Date();
      const hours = now.getHours();

      if (hours >= 4 && hours < 11) setGreeting("Selamat Pagi");
      else if (hours >= 11 && hours < 15) setGreeting("Selamat Siang");
      else if (hours >= 15 && hours < 18) setGreeting("Selamat Sore");
      else setGreeting("Selamat Malam");

      const options: Intl.DateTimeFormatOptions = {
         weekday: "long",
         day: "numeric",
         month: "long",
         year: "numeric",
      };
      setFormattedDate(now.toLocaleDateString("id-ID", options));
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

   if (!isMounted) return null;

   return (
      <header style={containerGlassStyle} className={`relative w-full flex items-center justify-between px-5 py-3 rounded-2xl border shadow-xl overflow-hidden transition-colors duration-300 ${isDark ? "border-white/15 text-slate-100" : "border-slate-200 text-slate-800"}`}>
         {/* Ambient Glow Subtle Background */}
         <div className={`absolute -top-10 -left-10 w-36 h-36 rounded-full blur-2xl pointer-events-none ${isDark ? "bg-orange-500/10" : "bg-orange-400/15"}`} />
         <div className={`absolute -bottom-10 -right-10 w-36 h-36 rounded-full blur-2xl pointer-events-none ${isDark ? "bg-amber-500/10" : "bg-amber-400/15"}`} />

         {/* Brand & Greeting Left */}
         <div className="flex items-center gap-3 relative z-10">
            {/* Globe Container */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border backdrop-blur-md transition-all ${isDark ? "bg-orange-500/15 border-orange-500/30 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.15)]" : "bg-orange-500/10 border-orange-500/20 text-orange-600 shadow-sm"}`}>
               <Globe className="w-4 h-4" />
            </div>

            {/* Greeting & Date Stacked */}
            <div className={`pl-3 border-l flex flex-col justify-center transition-colors ${isDark ? "border-white/10" : "border-slate-200"}`}>
               <h1 className={`text-xs font-bold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  {greeting}, {userName} <span className="text-amber-400 inline-block animate-pulse">👋</span>
               </h1>
               <span className={`text-[10px] font-medium leading-tight mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{formattedDate || "Memuat tanggal..."}</span>
            </div>
         </div>

         {/* Profile & Quick Icons Right */}
         <div className="flex items-center space-x-2 relative z-10">
            <button onClick={onEditMode} className={`p-2 rounded-xl border backdrop-blur-md transition-all shadow-sm active:scale-95 ${isDark ? "bg-white/5 hover:bg-white/15 border-white/10 text-slate-300 hover:text-white" : "bg-black/5 hover:bg-black/10 border-black/10 text-slate-600 hover:text-slate-900"}`} title="Mode Edit Layout">
               <Edit3 className="w-4 h-4" />
            </button>

            <button onClick={onOpenGrid} className={`p-2 rounded-xl border backdrop-blur-md transition-all shadow-sm active:scale-95 ${isDark ? "bg-white/5 hover:bg-white/15 border-white/10 text-slate-300 hover:text-white" : "bg-black/5 hover:bg-black/10 border-black/10 text-slate-600 hover:text-slate-900"}`} title="Workspace Grid">
               <Grid className="w-4 h-4" />
            </button>

            <button onClick={onToggleNotifications} className={`p-2 rounded-xl border backdrop-blur-md transition-all shadow-sm active:scale-95 ${isDark ? "bg-white/5 hover:bg-white/15 border-white/10 text-slate-300 hover:text-white" : "bg-black/5 hover:bg-black/10 border-black/10 text-slate-600 hover:text-slate-900"}`} title="Notifikasi">
               <Bell className="w-4 h-4" />
            </button>

            <button onClick={onProfileClick} className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-amber-400 text-black font-extrabold text-xs shadow-md shadow-orange-500/20 border border-orange-400/40 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center" title="Profil">
               {userName.charAt(0).toUpperCase()}
            </button>
         </div>
      </header>
   );
}
