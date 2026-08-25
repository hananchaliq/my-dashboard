"use client";

import React, { useState } from "react";
import { Settings as SettingsIcon, X, Palette, MapPin, RotateCcw } from "lucide-react";
import { Settings } from "@/types";

interface SettingsOverlayProps {
   settings: Settings;
   onSave: (newSettings: Settings) => void;
}

export default function SettingsOverlay({ settings, onSave }: SettingsOverlayProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [bgType, setBgType] = useState<"color" | "gradient" | "image">(settings.bgType || "color");
   const [bgValue, setBgValue] = useState(settings.bgValue || "#020617");
   const [lat, setLat] = useState(settings.lat || -8.6191);
   const [lng, setLng] = useState(settings.lng || 122.2111);
   const [cityName, setCityName] = useState(settings.cityName || "Maumere");

   const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
         bgType,
         bgValue,
         lat: Number(lat),
         lng: Number(lng),
         cityName,
      });
      setIsOpen(false);
   };

   const handleReset = () => {
      const defaultSettings: Settings = {
         bgType: "color",
         bgValue: "#020617",
         lat: -8.6191,
         lng: 122.2111,
         cityName: "Maumere",
      };
      setBgType("color");
      setBgValue("#020617");
      setLat(-8.6191);
      setLng(122.2111);
      setCityName("Maumere");
      onSave(defaultSettings);
   };

   return (
      <>
         {/* Settings Trigger Button (Floating Top-Right) */}
         <button onClick={() => setIsOpen(true)} className="fixed top-5 right-5 p-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg z-40 group" title="Settings">
            <SettingsIcon className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
         </button>

         {/* Settings Modal Overlay */}
         {isOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
               <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-slate-800">
                     <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
                        <SettingsIcon className="w-5 h-5" />
                        <span>Dashboard Settings</span>
                     </div>
                     <button onClick={() => setIsOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Modal Body */}
                  <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto">
                     {/* Background Customization */}
                     <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                           <Palette className="w-4 h-4 text-indigo-400" />
                           <span>Tampilan Background</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                           {(["color", "gradient", "image"] as const).map(type => (
                              <button key={type} type="button" onClick={() => setBgType(type)} className={`py-2 px-3 rounded-xl border text-xs font-medium capitalize transition-all ${bgType === type ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"}`}>
                                 {type}
                              </button>
                           ))}
                        </div>

                        {bgType === "color" && (
                           <div className="flex items-center space-x-3 pt-2">
                              <input type="color" value={bgValue} onChange={e => setBgValue(e.target.value)} className="w-10 h-10 rounded-xl border-0 cursor-pointer bg-transparent" />
                              <span className="text-xs text-slate-300 font-mono">{bgValue}</span>
                           </div>
                        )}

                        {bgType === "gradient" && (
                           <div className="space-y-2 pt-2">
                              <select value={bgValue} onChange={e => setBgValue(e.target.value)} className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none">
                                 <option value="linear-gradient(to right, #0f172a, #1e1b4b)">Midnight Indigo</option>
                                 <option value="linear-gradient(to right, #020617, #0f172a)">Deep Obsidian</option>
                                 <option value="linear-gradient(to right, #064e3b, #022c22)">Emerald Dark</option>
                                 <option value="linear-gradient(to right, #4c0519, #1e1b4b)">Cosmic Crimson</option>
                              </select>
                           </div>
                        )}

                        {bgType === "image" && (
                           <div className="pt-2">
                              <input type="text" placeholder="Paste Image URL (e.g. https://images.unsplash.com/...)" value={bgValue} onChange={e => setBgValue(e.target.value)} className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500" />
                           </div>
                        )}
                     </div>

                     {/* Location Customization */}
                     <div className="space-y-3 pt-4 border-t border-slate-800">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                           <MapPin className="w-4 h-4 text-emerald-400" />
                           <span>Lokasi (Cuaca & Sholat)</span>
                        </label>
                        <div className="space-y-3">
                           <input type="text" placeholder="Nama Kota (e.g. Maumere)" value={cityName} onChange={e => setCityName(e.target.value)} className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none" />
                           <div className="grid grid-cols-2 gap-3">
                              <input type="number" step="any" placeholder="Latitude" value={lat} onChange={e => setLat(Number(e.target.value))} className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none" />
                              <input type="number" step="any" placeholder="Longitude" value={lng} onChange={e => setLng(Number(e.target.value))} className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none" />
                           </div>
                        </div>
                     </div>

                     {/* Footer Actions */}
                     <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                        <button type="button" onClick={handleReset} className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors">
                           <RotateCcw className="w-3.5 h-3.5" />
                           <span>Reset Default</span>
                        </button>
                        <div className="flex space-x-2">
                           <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">
                              Batal
                           </button>
                           <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium">
                              Simpan Perubahan
                           </button>
                        </div>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </>
   );
}
