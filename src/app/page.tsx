"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
   enableLiquidGlass: true,
   glassOpacity: 40,
   glassBlur: 12,
};

export default function Home() {
   const [settings, setSettings] = useLocalStorage<Settings>("app_settings", DEFAULT_SETTINGS);
   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
   const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   const activeSettings = isMounted ? settings : DEFAULT_SETTINGS;

   const getBackgroundStyle = () => {
      if (activeSettings.bgType === "gradient") {
         return {
            background: activeSettings.bgValue || "linear-gradient(to right, #07090e, #0d1117)",
         };
      }
      if (activeSettings.bgType === "image" && activeSettings.bgValue) {
         return {
            backgroundImage: `url(${activeSettings.bgValue})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
         };
      }
      return { backgroundColor: activeSettings.bgValue || "#07090e" };
   };

   return (
      <main className="min-h-screen w-full bg-slate-100 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 relative overflow-x-hidden transition-colors duration-300">
         {/* Background Overlay untuk image mode */}
         {activeSettings.bgType === "image" && <div className="fixed inset-0 bg-black/75 pointer-events-none z-0" />}

         {/* Main Container Wrapper */}
         <motion.div
            style={getBackgroundStyle()}
            animate={{
               scale: 1,
               borderRadius: "0px",
            }}
            transition={{ duration: 0.2 }}
            className="min-h-screen w-full p-4 space-y-4 relative z-10 origin-center transition-all duration-300 selection:bg-orange-500 selection:text-white font-sans">
            <div className="w-full space-y-4 max-w-[1600px] mx-auto">
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
                     {/* Baris Atas: Search & Links + Kalender */}
                     <div className="grid grid-cols-12 gap-4 items-stretch">
                        <div className="col-span-12 lg:col-span-8 h-full">
                           <SearchAndLinks />
                        </div>
                        <div className="col-span-12 lg:col-span-4 h-full">
                           <CalendarWidget />
                        </div>
                     </div>

                     {/* Baris Tengah: Rasio 3/5 (Kiri) dan 2/5 (Kanan) */}
                     <div className="flex flex-col lg:flex-row gap-4 items-stretch w-full">
                        <div className="w-full lg:flex-[3] min-w-0">
                           <DailyNotes />
                        </div>
                        <div className="w-full lg:flex-[2] min-w-0">
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

            {/* Floating Toolbar */}
            <FloatingToolbar onOpenSettings={() => setIsSettingsOpen(true)} />
         </motion.div>

         {/* Drawer Overlay Settings */}
         <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={(updated: Settings) => setSettings(updated)} />
      </main>
   );
}
