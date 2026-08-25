"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Sun, CloudSun, Cloud, CloudRain, Moon, CloudMoon, Building2 } from "lucide-react";

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

// Konversi WMO Code dari Open-Meteo ke Teks & Ikon
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

   // 1. Ambil Koordinat Asli via Geolocation API & Reverse Geocoding
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

                  setLocation({
                     lat,
                     lng,
                     city: cityName,
                     subregion: stateName,
                  });
               } catch {
                  setLocation({ lat, lng, city: "Lokasi Anda", subregion: "Indonesia" });
               }
            },
            error => {
               console.warn("Akses GPS tidak diizinkan / gagal. Menggunakan default Ende:", error);
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

   // 2. Fetch Data Cuaca & Jadwal Sholat Berdasarkan Koordinat
   useEffect(() => {
      async function fetchData() {
         try {
            setLoading(true);

            // Fetch Open-Meteo
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

            // Fetch Aladhan Sholat API
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

            // Tentukan Waktu Sholat Terdekat / Aktif
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

   const weatherDetails = weather ? getWeatherDetails(weather.code, weather.isDay) : null;

   return (
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto font-sans">
         {/* 1. CARD CUACA (Liquid Glass) */}
         <div className="group relative p-5 rounded-2xl bg-white/[0.04] border border-white/20 backdrop-blur-2xl text-slate-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col justify-between overflow-hidden transition-all duration-500 hover:border-white/40">
            {/* Refleksi Kaca Cair Top (Liquid Glass Reflection) */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-2xl pointer-events-none" />

            {/* Ambient Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/25 transition-all duration-700" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
               <h3 className="text-base font-semibold text-white drop-shadow-sm">Cuaca</h3>
               <p className="text-xs text-slate-300/80 mt-0.5">
                  {location.city}, {location.subregion}
               </p>

               <div className="flex items-center space-x-3 mt-4">
                  {weatherDetails?.icon}
                  <span className="text-4xl font-bold tracking-tight text-white drop-shadow-md">{loading ? "--" : weather?.temp}°C</span>
               </div>
               <p className="text-xs font-medium text-slate-200 mt-1">{weatherDetails?.text || "Memuat..."}</p>
            </div>

            {/* Prediksi Jam ke Depan */}
            <div className="mt-6 relative z-10">
               <p className="text-xs text-slate-300/80 font-medium mb-2.5">Prediksi 12 Jam ke Depan</p>
               <div className="grid grid-cols-6 gap-1.5">
                  {weather?.hourly.map((h, i) => {
                     const details = getWeatherDetails(h.code, h.isDay);
                     return (
                        <div key={i} className="bg-white/10 border border-white/15 rounded-xl py-2 px-1 flex flex-col items-center justify-between text-center min-h-[72px] backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:bg-white/20 transition-all">
                           <span className="text-[10px] text-slate-300 font-mono">{h.time}</span>
                           <div className="my-1">{details.smallIcon}</div>
                           <span className="text-xs font-semibold text-white">{h.temp}°C</span>
                        </div>
                     );
                  }) ||
                     Array(6)
                        .fill(0)
                        .map((_, i) => (
                           <div key={i} className="bg-white/5 border border-white/10 rounded-xl py-2 px-1 text-center text-xs text-slate-400 backdrop-blur-md">
                              --
                           </div>
                        ))}
               </div>
            </div>

            {/* Grafik Temperatur Recharts */}
            <div className="h-28 w-full mt-4 -mb-2 relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weather?.chartData || []} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                           <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                        </linearGradient>
                     </defs>
                     <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#cbd5e1", fontSize: 10 }} interval="preserveStartEnd" />
                     <YAxis domain={["dataMin - 2", "dataMax + 2"]} axisLine={false} tickLine={false} tick={{ fill: "#cbd5e1", fontSize: 10 }} />
                     <Tooltip
                        contentStyle={{
                           backgroundColor: "rgba(15, 20, 32, 0.85)",
                           borderColor: "rgba(255, 255, 255, 0.2)",
                           backdropFilter: "blur(12px)",
                           borderRadius: "0.75rem",
                           fontSize: "11px",
                           color: "#f8fafc",
                           boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                        }}
                        formatter={(value: any) => [`${value}°C`, "Suhu"]}
                     />
                     <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" isAnimationActive={false} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* 2. CARD WAKTU SHOLAT (Liquid Glass) */}
         <div className="group relative p-5 rounded-2xl bg-white/[0.04] border border-white/20 backdrop-blur-2xl text-slate-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden transition-all duration-500 hover:border-white/40">
            {/* Refleksi Kaca Cair Top (Liquid Glass Reflection) */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-2xl pointer-events-none" />

            {/* Ambient Glow */}
            <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-orange-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/25 transition-all duration-700" />

            <div className="relative z-10">
               <h3 className="text-base font-semibold text-white drop-shadow-sm">Waktu Sholat</h3>
               <p className="text-xs text-slate-300/80 mt-0.5">
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
                           <div key={name} className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isActive ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold border border-white/30 shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "text-slate-200 bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/15 hover:border-white/20"}`}>
                              <span>{name}</span>
                              <span className="font-mono">{time}</span>
                           </div>
                        );
                     })
                  ) : (
                     <div className="text-xs text-slate-400 py-4">Memuat Jadwal Sholat...</div>
                  )}
               </div>

               {/* Vektor Hiasan Masjid */}
               <div className="absolute right-2 bottom-1 opacity-20 pointer-events-none text-white flex items-end">
                  <Building2 className="w-28 h-28 stroke-[1]" />
               </div>
            </div>
         </div>
      </div>
   );
}
