"use client";

import React, { useEffect, useState } from "react";
import { CloudSun, Clock, MapPin, Compass } from "lucide-react";
import { HourlyWeather, PrayerTimes } from "@/types";

// Default koordinat (Maumere / NTT sebagai default)
const DEFAULT_LAT = -8.6191;
const DEFAULT_LNG = 122.2111;

export default function WeatherAndPrayer() {
   const [currentTemp, setCurrentTemp] = useState<number | null>(null);
   const [hourlyForecast, setHourlyForecast] = useState<HourlyWeather[]>([]);
   const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [locationName, setLocationName] = useState<string>("Detecting location...");

   useEffect(() => {
      let lat = DEFAULT_LAT;
      let lng = DEFAULT_LNG;

      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
            position => {
               lat = position.coords.latitude;
               lng = position.coords.longitude;
               setLocationName(`${lat.toFixed(2)}°, ${lng.toFixed(2)}°`);
               fetchData(lat, lng);
            },
            () => {
               setLocationName("Maumere (Default)");
               fetchData(lat, lng);
            }
         );
      } else {
         setLocationName("Maumere (Default)");
         fetchData(lat, lng);
      }
   }, []);

   const fetchData = async (lat: number, lng: number) => {
      setLoading(true);
      try {
         // 1. Fetch Weather (Open-Meteo)
         const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,weathercode&timezone=auto`);
         const weatherData = await weatherRes.json();

         if (weatherData.current_weather) {
            setCurrentTemp(Math.round(weatherData.current_weather.temperature));
         }

         if (weatherData.hourly && weatherData.hourly.time) {
            const now = new Date();
            const currentHour = now.getHours();

            // Ambil 12 jam ke depan dari waktu sekarang
            const hourlyList: HourlyWeather[] = [];
            const times: string[] = weatherData.hourly.time;
            const temps: number[] = weatherData.hourly.temperature_2m;
            const codes: number[] = weatherData.hourly.weathercode;

            let addedCount = 0;
            for (let i = 0; i < times.length; i++) {
               const itemTime = new Date(times[i]);
               if (itemTime >= now || itemTime.getHours() >= currentHour) {
                  hourlyList.push({
                     time: itemTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                     temp: Math.round(temps[i]),
                     code: codes[i],
                  });
                  addedCount++;
                  if (addedCount >= 12) break;
               }
            }
            setHourlyForecast(hourlyList);
         }

         // 2. Fetch Prayer Times (Aladhan API)
         const dateToday = new Date().toISOString().split("T")[0];
         const prayerRes = await fetch(`https://api.aladhan.com/v1/timings/${dateToday}?latitude=${lat}&longitude=${lng}&method=2`);
         const prayerData = await prayerRes.json();

         if (prayerData.data && prayerData.data.timings) {
            const t = prayerData.data.timings;
            setPrayerTimes({
               Fajr: t.Fajr,
               Dhuhr: t.Dhuhr,
               Asr: t.Asr,
               Maghrib: t.Maghrib,
               Isha: t.Isha,
            });
         }
      } catch (err) {
         console.error("Error fetching weather/prayer data:", err);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* Widget Cuaca */}
         <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-2 text-indigo-400">
                  <CloudSun className="w-5 h-5" />
                  <span className="text-sm font-semibold tracking-wide uppercase">Cuaca</span>
               </div>
               <div className="flex items-center space-x-1 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{locationName}</span>
               </div>
            </div>

            {loading ? (
               <div className="py-8 text-center text-slate-500 text-sm animate-pulse">Memuat data cuaca...</div>
            ) : (
               <>
                  <div className="flex items-baseline space-x-2 my-2">
                     <span className="text-4xl font-bold text-slate-100">{currentTemp !== null ? `${currentTemp}°C` : "--"}</span>
                     <span className="text-xs text-slate-400">Saat ini</span>
                  </div>

                  {/* Prediksi 12 Jam */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80">
                     <span className="text-xs font-medium text-slate-400 mb-2 block">Prediksi 12 Jam Ke Depan</span>
                     <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
                        {hourlyForecast.map((item, idx) => (
                           <div key={idx} className="flex flex-col items-center flex-shrink-0 px-2.5 py-2 bg-slate-800/40 rounded-xl border border-slate-800 text-center min-w-[55px]">
                              <span className="text-[10px] text-slate-400">{item.time}</span>
                              <span className="text-xs font-semibold text-slate-200 mt-1">{item.temp}°</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </>
            )}
         </div>

         {/* Widget Jadwal Sholat */}
         <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-2 text-emerald-400">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-semibold tracking-wide uppercase">Waktu Sholat</span>
               </div>
               <div className="flex items-center space-x-1 text-xs text-slate-400">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Hari Ini</span>
               </div>
            </div>

            {loading ? (
               <div className="py-8 text-center text-slate-500 text-sm animate-pulse">Memuat jadwal sholat...</div>
            ) : (
               <div className="grid grid-cols-5 gap-2 my-auto py-2">
                  {[
                     { name: "Subuh", time: prayerTimes?.Fajr },
                     { name: "Dzuhur", time: prayerTimes?.Dhuhr },
                     { name: "Ashar", time: prayerTimes?.Asr },
                     { name: "Maghrib", time: prayerTimes?.Maghrib },
                     { name: "Isya", time: prayerTimes?.Isha },
                  ].map((p, idx) => (
                     <div key={idx} className="flex flex-col items-center p-2 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                        <span className="text-[11px] text-slate-400 font-medium">{p.name}</span>
                        <span className="text-xs font-bold text-slate-100 mt-1">{p.time || "--:--"}</span>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
