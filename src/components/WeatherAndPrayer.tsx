"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Sun, CloudSun, Cloud, CloudRain, Moon, CloudMoon, Building2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Settings } from "@/types";

interface ExtendedSettings extends Partial<Settings> {
   enableLiquidGlass?: boolean;
   glassOpacity?: number;
   glassBlur?: number;
}

interface HourlyForecast {
   time: string;
   temp: number;
   code: number;
   isDay: number;
}

interface WeatherData {
   temp: number;
   code: number;
   isDay: number;
   hourly: HourlyForecast[];
   chartData: { time: string; temp: number }[];
}

interface PrayerTimings {
   Subuh: string;
   Dzuhur: string;
   Ashar: string;
   Maghrib: string;
   Isya: string;
}

interface LocationInfo {
   lat: number;
   lng: number;
   city: string;
   subregion: string;
}

const getWeatherDetails = (code: number, isDay: number = 1) => {
   if (code === 0) {
      return {
         text: "Cerah",
         icon: isDay ? <Sun className="w-10 h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" /> : <Moon className="w-10 h-10 text-slate-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />,
         smallIcon: isDay ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />,
      };
   }
   if (code >= 1 && code <= 3) {
      return {
         text: "Cerah Berawan",
         icon: isDay ? <CloudSun className="w-10 h-10 text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.4)]" /> : <CloudMoon className="w-10 h-10 text-slate-300" />,
         smallIcon: isDay ? <CloudSun className="w-4 h-4 text-amber-300" /> : <CloudMoon className="w-4 h-4 text-slate-300" />,
      };
   }
   if (code >= 51 && code <= 67) {
      return {
         text: "Hujan Ringan",
         icon: <CloudRain className="w-10 h-10 text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]" />,
         smallIcon: <CloudRain className="w-4 h-4 text-sky-400" />,
      };
   }
   if (code >= 80) {
      return {
         text: "Hujan Lebat",
         icon: <CloudRain className="w-10 h-10 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />,
         smallIcon: <CloudRain className="w-4 h-4 text-blue-400" />,
      };
   }
   return {
      text: "Berawan",
      icon: <Cloud className="w-10 h-10 text-slate-300" />,
      smallIcon: <Cloud className="w-4 h-4 text-slate-400" />,
   };
};

export default function WeatherAndPrayer() {
   const { resolvedTheme, theme } = useTheme();
   const [settings] = useLocalStorage<ExtendedSettings>("app_settings", {});
   const [isMounted, setIsMounted] = useState(false);

   const [location, setLocation] = useState<LocationInfo>({
      lat: -8.8383,
      lng: 121.6521,
      city: "Mencari Lokasi...",
      subregion: "Indonesia",
   });
   const [weather, setWeather] = useState<WeatherData | null>(null);
   const [prayers, setPrayers] = useState<PrayerTimings | null>(null);
   const [activePrayer, setActivePrayer] = useState<string>("");
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   // 1. Ambil Koordinat Asli via Geolocation API
   useEffect(() => {
      if ("geolocation" in navigator) {
         navigator.geolocation.getCurrentPosition(
            async position => {
               const lat = position.coords.latitude;
               const lng = position.coords.longitude;

               try {
                  const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                  const geoData = await geoRes.json();
                  const addr = geoData.address || {};

                  const cityName = addr.city || addr.town || addr.county || addr.regency || addr.village || "Lokasi Anda";
                  const stateName = addr.state ? `${addr.state}, Indonesia` : "Indonesia";

                  setLocation({ lat, lng, city: cityName, subregion: stateName });
               } catch {
                  setLocation({ lat, lng, city: "Lokasi Anda", subregion: "Indonesia" });
               }
            },
            error => {
               console.warn("Akses GPS gagal. Menggunakan default Ende:", error);
               setLocation({
                  lat: -8.8383,
                  lng: 121.6521,
                  city: "Ende",
                  subregion: "NTT, Indonesia",
               });
            },
            { enableHighAccuracy: true }
         );
      }
   }, []);

   // 2. Fetch Data Cuaca & Jadwal Sholat
   useEffect(() => {
      async function fetchData() {
         try {
            setLoading(true);

            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current_weather=true&hourly=temperature_2m,weathercode,is_day&timezone=auto`);
            const weatherData = await weatherRes.json();

            const currentHour = new Date().getHours();
            const hourlyData: HourlyForecast[] = [];
            const chartData = [];

            for (let i = 0; i < 24; i++) {
               const targetIndex = currentHour + i;
               if (weatherData.hourly?.time[targetIndex]) {
                  const timeRaw = weatherData.hourly.time[targetIndex];
                  const timeFormatted = timeRaw.split("T")[1]?.substring(0, 5) || `${targetIndex}:00`;
                  const tempVal = Math.round(weatherData.hourly.temperature_2m[targetIndex]);
                  const codeVal = weatherData.hourly.weathercode[targetIndex];
                  const isDayVal = weatherData.hourly.is_day[targetIndex];

                  if (i < 6) {
                     hourlyData.push({
                        time: timeFormatted,
                        temp: tempVal,
                        code: codeVal,
                        isDay: isDayVal,
                     });
                  }

                  chartData.push({
                     time: timeFormatted,
                     temp: tempVal,
                  });
               }
            }

            setWeather({
               temp: Math.round(weatherData.current_weather.temperature),
               code: weatherData.current_weather.weathercode,
               isDay: weatherData.current_weather.is_day,
               hourly: hourlyData,
               chartData,
            });

            const prayerRes = await fetch(`https://api.aladhan.com/v1/timings?latitude=${location.lat}&longitude=${location.lng}&method=20`);
            const prayerData = await prayerRes.json();
            const timings = prayerData.data.timings;

            const mappedPrayers: PrayerTimings = {
               Subuh: timings.Fajr.split(" ")[0],
               Dzuhur: timings.Dhuhr.split(" ")[0],
               Ashar: timings.Asr.split(" ")[0],
               Maghrib: timings.Maghrib.split(" ")[0],
               Isya: timings.Isha.split(" ")[0],
            };

            setPrayers(mappedPrayers);

            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const timeToMinutes = (tStr: string) => {
               const [h, m] = tStr.split(":").map(Number);
               return h * 60 + m;
            };

            if (currentMinutes >= timeToMinutes(mappedPrayers.Maghrib) && currentMinutes < timeToMinutes(mappedPrayers.Isya)) {
               setActivePrayer("Maghrib");
            } else if (currentMinutes >= timeToMinutes(mappedPrayers.Isya) || currentMinutes < timeToMinutes(mappedPrayers.Subuh)) {
               setActivePrayer("Isya");
            } else if (currentMinutes >= timeToMinutes(mappedPrayers.Subuh) && currentMinutes < timeToMinutes(mappedPrayers.Dzuhur)) {
               setActivePrayer("Subuh");
            } else if (currentMinutes >= timeToMinutes(mappedPrayers.Dzuhur) && currentMinutes < timeToMinutes(mappedPrayers.Ashar)) {
               setActivePrayer("Dzuhur");
            } else {
               setActivePrayer("Ashar");
            }
         } catch (err) {
            console.error("Gagal mengambil data cuaca/sholat:", err);
         } finally {
            setLoading(false);
         }
      }

      fetchData();
   }, [location]);

   const currentTheme = resolvedTheme || theme || "dark";
   const isDark = currentTheme === "dark";

   // Konfigurasi Dynamic Glass Styling yang persis sama dengan DailyNotes
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

   const weatherDetails = weather ? getWeatherDetails(weather.code, weather.isDay) : null;

   return (
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto font-sans">
         {/* 1. CARD CUACA */}
         <div style={containerGlassStyle} className={`group relative p-5 rounded-3xl border shadow-2xl flex flex-col justify-between overflow-hidden transition-colors duration-300 ${isDark ? "border-white/15 text-slate-100" : "border-slate-200 text-slate-800"}`}>
            {/* Ambient Glow Gradient Header */}
            <div className={`absolute top-0 left-0 right-0 h-32 rounded-t-3xl pointer-events-none ${isDark ? "bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent" : "bg-gradient-to-b from-orange-500/10 via-amber-500/[0.02] to-transparent"}`} />

            {/* Ambient Glow Corner */}
            <div className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${isDark ? "bg-orange-500/10 group-hover:bg-orange-500/20" : "bg-orange-400/20 group-hover:bg-orange-400/30"}`} />
            <div className={`absolute -bottom-12 -left-12 w-44 h-44 rounded-full blur-3xl pointer-events-none ${isDark ? "bg-amber-500/10" : "bg-amber-400/15"}`} />

            <div className="relative z-10">
               <div className="flex items-center justify-between">
                  <div>
                     <h3 className={`text-sm font-bold tracking-wide ${isDark ? "text-white" : "text-slate-900"}`}>{location.city}</h3>
                     <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{location.subregion}</p>
                  </div>
                  {weatherDetails?.icon}
               </div>

               <div className="flex items-baseline space-x-1 mt-4">
                  <span className={`text-4xl font-bold tracking-tight drop-shadow-md ${isDark ? "text-white" : "text-slate-900"}`}>{loading ? "--" : weather?.temp}</span>
                  <span className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>°C</span>
               </div>
               <p className={`text-xs font-medium mt-1 ${isDark ? "text-slate-200" : "text-slate-700"}`}>Kondisi: {weatherDetails?.text || "Memuat..."}</p>
            </div>

            {/* Mini Grid 6 Jam */}
            <div className="mt-6 relative z-10">
               <p className={`text-xs font-medium mb-2.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Prediksi 6 Jam ke Depan</p>
               <div className="grid grid-cols-6 gap-1.5">
                  {weather?.hourly.map((h, i) => {
                     const details = getWeatherDetails(h.code, h.isDay);
                     return (
                        <div key={i} className={`border rounded-xl py-2 px-1 flex flex-col items-center justify-between text-center min-h-[72px] backdrop-blur-md transition-all ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-100" : "bg-black/5 border-black/10 hover:bg-black/10 text-slate-800"}`}>
                           <span className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>{h.time}</span>
                           <div className="my-1">{details.smallIcon}</div>
                           <span className="text-xs font-semibold">{h.temp}°C</span>
                        </div>
                     );
                  }) ||
                     Array(6)
                        .fill(0)
                        .map((_, i) => (
                           <div key={i} className={`border rounded-xl py-2 px-1 text-center text-xs backdrop-blur-md min-h-[72px] flex items-center justify-center ${isDark ? "bg-white/5 border-white/10 text-slate-500" : "bg-black/5 border-black/10 text-slate-400"}`}>
                              --
                           </div>
                        ))}
               </div>
            </div>

            {/* Grafik Temperatur */}
            <div className="h-28 w-full mt-4 -mb-2 relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weather?.chartData || []} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                           <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                        </linearGradient>
                     </defs>
                     <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 10 }} interval="preserveStartEnd" />
                     <YAxis domain={["dataMin - 2", "dataMax + 2"]} axisLine={false} tickLine={false} tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 10 }} />
                     <Tooltip
                        contentStyle={{
                           backgroundColor: isDark ? "rgba(9, 13, 22, 0.85)" : "rgba(255, 255, 255, 0.95)",
                           borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
                           backdropFilter: "blur(12px)",
                           borderRadius: "0.75rem",
                           fontSize: "11px",
                           color: isDark ? "#f8fafc" : "#0f172a",
                           boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                        }}
                        formatter={(value: any) => [`${value}°C`, "Suhu"]}
                     />
                     <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" isAnimationActive={true} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* 2. CARD WAKTU SHOLAT */}
         <div style={containerGlassStyle} className={`group relative p-5 rounded-3xl border shadow-2xl overflow-hidden transition-colors duration-300 ${isDark ? "border-white/15 text-slate-100" : "border-slate-200 text-slate-800"}`}>
            {/* Ambient Glow Gradient Header */}
            <div className={`absolute top-0 left-0 right-0 h-32 rounded-t-3xl pointer-events-none ${isDark ? "bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent" : "bg-gradient-to-b from-orange-500/10 via-amber-500/[0.02] to-transparent"}`} />

            {/* Ambient Glow Corner */}
            <div className={`absolute -bottom-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${isDark ? "bg-orange-500/10 group-hover:bg-orange-500/20" : "bg-orange-400/20 group-hover:bg-orange-400/30"}`} />

            <div className="relative z-10">
               <h3 className={`text-sm font-bold tracking-wide ${isDark ? "text-white" : "text-slate-900"}`}>Jadwal Sholat</h3>
               <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {location.city}, {location.subregion.split(",")[0]}
               </p>
            </div>

            <div className="flex justify-between items-end mt-4 relative z-10">
               {/* List Waktu Sholat Vertikal */}
               <div className="flex flex-col space-y-1.5 w-3/5">
                  {prayers ? (
                     Object.entries(prayers).map(([name, time]) => {
                        const isActive = activePrayer === name;
                        return (
                           <div key={name} className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isActive ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold shadow-md shadow-orange-500/25 border border-orange-400/30" : isDark ? "text-slate-200 bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10" : "text-slate-700 bg-black/5 border border-black/10 backdrop-blur-md hover:bg-black/10"}`}>
                              <span>{name}</span>
                              <span className="font-mono font-semibold">{time}</span>
                           </div>
                        );
                     })
                  ) : (
                     <div className={`text-xs py-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Memuat Jadwal Sholat...</div>
                  )}
               </div>

               {/* Vektor Hiasan Masjid */}
               <div className={`absolute right-2 bottom-1 opacity-20 pointer-events-none flex items-end ${isDark ? "text-white" : "text-slate-800"}`}>
                  <Building2 className="w-28 h-28 stroke-[1]" />
               </div>
            </div>
         </div>
      </div>
   );
}
