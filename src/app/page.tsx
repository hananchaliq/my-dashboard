"use client";

import React from "react";
import SearchAndLinks from "@/components/SearchAndLinks";
import WeatherAndPrayer from "@/components/WeatherAndPrayer";
import TradingChart from "@/components/TradingChart";
import CalendarAndNotes from "@/components/CalendarAndNotes";
import SettingsOverlay from "@/components/SettingsOverlay";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Settings } from "@/types";

const DEFAULT_SETTINGS: Settings = {
   bgType: "color",
   bgValue: "#020617",
   lat: -8.6191,
   lng: 122.2111,
   cityName: "Maumere",
};

export default function Home() {
   const [settings, setSettings] = useLocalStorage<Settings>("app_settings", DEFAULT_SETTINGS);

   const getBackgroundStyle = () => {
      if (settings.bgType === "gradient") {
         return { background: settings.bgValue || "linear-gradient(to right, #0f172a, #1e1b4b)" };
      }
      if (settings.bgType === "image" && settings.bgValue) {
         return {
            backgroundImage: `url(${settings.bgValue})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
         };
      }
      return { backgroundColor: settings.bgValue || "#020617" };
   };

   return (
      <main style={getBackgroundStyle()} className="min-h-screen flex flex-col items-center justify-center p-6 relative text-slate-100 transition-all duration-500 space-y-6">
         <SettingsOverlay settings={settings} onSave={setSettings} />

         {/* Top Widgets Grid */}
         <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <TradingChart />
            <CalendarAndNotes />
         </div>

         {/* Middle Weather & Prayer */}
         <WeatherAndPrayer />

         {/* Bottom Search & Quick Links */}
         <SearchAndLinks />
      </main>
   );
}
