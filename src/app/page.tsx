"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import WeatherAndPrayer from "@/components/WeatherAndPrayer";
import SearchAndLinks from "@/components/SearchAndLinks";
import CalendarWidget from "@/components/CalendarWidget";
import DailyNotes from "@/components/DailyNotes";
import TradingChart from "@/components/TradingChart";
import WorkspaceGrid from "@/components/WorkspaceGrid";
import FloatingToolbar from "@/components/FloatingToolbar";
import SettingsOverlay from "@/components/SettingsOverlay";
import QuickMode from "@/components/QuickMode";
import OtherSettings from "@/components/OtherSettings";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Settings } from "@/types";

const DEFAULT_SETTINGS: Settings = {
   bgType: "color",
   bgValue: "#07090e",
   lat: -8.8383,
   lng: 121.6521,
   cityName: "Ende",
};

export default function Home() {
   const [settings, setSettings] = useLocalStorage<Settings>("app_settings", DEFAULT_SETTINGS);
   const [isSettingsOpen, setIsSettingsOpen] = useState(false);

   const getBackgroundStyle = () => {
      if (settings.bgType === "gradient") {
         return { background: settings.bgValue || "linear-gradient(to right, #07090e, #0d1117)" };
      }
      if (settings.bgType === "image" && settings.bgValue) {
         return {
            backgroundImage: `url(${settings.bgValue})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
         };
      }
      return { backgroundColor: settings.bgValue || "#07090e" };
   };

   return (
      <main style={getBackgroundStyle()} className="min-h-screen w-full bg-[#07090e] text-slate-100 p-4 space-y-4 relative selection:bg-orange-500 selection:text-white transition-all duration-300">
         {/* Background Overlay */}
         {settings.bgType === "image" && <div className="fixed inset-0 bg-black/75 pointer-events-none z-0" />}

         <div className="w-full space-y-4 relative z-10 max-w-[1600px] mx-auto">
            {/* Header Navigation */}
            <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

            {/* Dashboard Grid Utama */}
            <div className="grid grid-cols-12 gap-4 items-start">
               {/* KOLOM KIRI (3/12) */}
               <div className="col-span-12 lg:col-span-3 space-y-4">
                  <WeatherAndPrayer />
                  <QuickMode />
                  <OtherSettings />
               </div>

               {/* KOLOM TENGAH & KANAN (9/12) */}
               <div className="col-span-12 lg:col-span-9 space-y-4">
                  {/* Baris Atas: Search & Links (8/12) + Kalender (4/12) */}
                  <div className="grid grid-cols-12 gap-4 items-stretch">
                     <div className="col-span-12 lg:col-span-8 h-full">
                        <SearchAndLinks />
                     </div>
                     <div className="col-span-12 lg:col-span-4 h-full">
                        <CalendarWidget />
                     </div>
                  </div>

                  {/* Baris Tengah: Catatan Harian & Trading Chart */}
                  <div className="grid grid-cols-12 gap-4 items-stretch">
                     <div className="col-span-12 lg:col-span-5 h-full">
                        <DailyNotes />
                     </div>
                     <div className="col-span-12 lg:col-span-7 h-full">
                        <TradingChart />
                     </div>
                  </div>

                  {/* Baris Bawah: Workspace Grid */}
                  <div className="w-full">
                     <WorkspaceGrid />
                  </div>
               </div>
            </div>
         </div>

         {/* Floating Toolbar & Modals */}
         <FloatingToolbar onOpenSettings={() => setIsSettingsOpen(true)} />

         {isSettingsOpen && <SettingsOverlay settings={settings} onSave={setSettings} onClose={() => setIsSettingsOpen(false)} />}
      </main>
   );
}
