"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Palette, MapPin, RotateCcw, Sparkles, Droplets, Navigation, Check, Upload, Trash2, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Settings } from "@/types";

// Tipe lokal yang memperluas Tipe Settings bawaan agar tidak bentrok/error di TS
export interface ExtendedSettings extends Partial<Settings> {
   bgType?: "color" | "gradient" | "image";
   bgValue?: string;
   addressDetail?: string;
   enableLiquidGlass?: boolean;
   glassOpacity?: number;
   glassBlur?: number;
   uploadedWallpapers?: string[];
   lat?: number;
   lng?: number;
   cityName?: string;
}

const DEFAULT_SETTINGS: ExtendedSettings = {
   bgType: "color",
   bgValue: "#07090e",
   lat: -8.8383,
   lng: 121.6521,
   cityName: "Ende",
   enableLiquidGlass: true,
   glassOpacity: 40,
   glassBlur: 12,
   uploadedWallpapers: [],
   addressDetail: "Ende, Nusa Tenggara Timur",
};

interface SettingsOverlayProps {
   isOpen: boolean;
   onClose: () => void;
   onSave: (newSettings: Settings) => void;
}

const DEFAULT_PRESETS = [
   {
      name: "Cyberpunk City",
      url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1920&auto=format&fit=crop",
   },
   {
      name: "Dark Nebula",
      url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1920&auto=format&fit=crop",
   },
   {
      name: "Minimalist Waves",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop",
   },
   {
      name: "Neon Aesthetic",
      url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop",
   },
];

const compressImage = (file: File, maxWidth = 1280, quality = 0.75): Promise<string> => {
   return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = event => {
         const img = new Image();
         img.src = event.target?.result as string;
         img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
               height = Math.round((height * maxWidth) / width);
               width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Gagal membuat context canvas");

            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
            resolve(compressedDataUrl);
         };
         img.onerror = err => reject(err);
      };
      reader.onerror = err => reject(err);
   });
};

export default function SettingsOverlay({ isOpen, onClose }: SettingsOverlayProps) {
   const { resolvedTheme, theme } = useTheme();
   const [settings, setSettings] = useLocalStorage<ExtendedSettings>("app_settings", DEFAULT_SETTINGS);

   const [isMounted, setIsMounted] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [isLocating, setIsLocating] = useState(false);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   const currentTheme = resolvedTheme || theme || "dark";
   const isDark = currentTheme === "dark";

   const activeSettings: ExtendedSettings = isMounted ? (settings as ExtendedSettings) : DEFAULT_SETTINGS;

   // Local Form States
   const [bgType, setBgType] = useState<"color" | "gradient" | "image">(activeSettings.bgType || "color");
   const [bgValue, setBgValue] = useState<string>(activeSettings.bgValue || (isDark ? "#07090e" : "#f8fafc"));
   const [addressDetail, setAddressDetail] = useState<string>(activeSettings.addressDetail || "Ende, Nusa Tenggara Timur");
   const [enableLiquidGlass, setEnableLiquidGlass] = useState<boolean>(activeSettings.enableLiquidGlass ?? true);
   const [glassOpacity, setGlassOpacity] = useState<number>(activeSettings.glassOpacity ?? 40);
   const [glassBlur, setGlassBlur] = useState<number>(activeSettings.glassBlur ?? 12);
   const [uploadedWallpapers, setUploadedWallpapers] = useState<string[]>(activeSettings.uploadedWallpapers || []);

   // Resync saat theme berganti atau modal dibuka
   useEffect(() => {
      if (!isMounted) return;
      setBgType(activeSettings.bgType || "color");
      setAddressDetail(activeSettings.addressDetail || "Ende, Nusa Tenggara Timur");
      setEnableLiquidGlass(activeSettings.enableLiquidGlass ?? true);
      setGlassOpacity(activeSettings.glassOpacity ?? 40);
      setGlassBlur(activeSettings.glassBlur ?? 12);
      if (activeSettings.uploadedWallpapers) setUploadedWallpapers(activeSettings.uploadedWallpapers);

      let val = activeSettings.bgValue || "";
      if (!isDark && (val === "#07090e" || val === "#090d16")) {
         val = "#f8fafc";
      } else if (isDark && val === "#f8fafc") {
         val = "#07090e";
      }
      setBgValue(val);
   }, [isMounted, isDark, isOpen]);

   if (!isMounted) return null;

   const updateAndSave = (updatedPartial: ExtendedSettings) => {
      const updated: ExtendedSettings = {
         ...activeSettings,
         bgType,
         bgValue,
         addressDetail,
         enableLiquidGlass,
         glassOpacity,
         glassBlur,
         uploadedWallpapers,
         ...updatedPartial,
      };

      setSettings(updated);
   };

   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
         const compressedBase64 = await compressImage(file, 1280, 0.75);
         let updatedList = [...uploadedWallpapers];
         if (updatedList.length >= 4) {
            updatedList.shift();
         }
         updatedList.push(compressedBase64);

         setUploadedWallpapers(updatedList);
         setBgType("image");
         setBgValue(compressedBase64);
         updateAndSave({
            uploadedWallpapers: updatedList,
            bgType: "image",
            bgValue: compressedBase64,
         });
      } catch (err) {
         console.error("Gagal mengompres gambar:", err);
      } finally {
         e.target.value = "";
      }
   };

   const handleRemoveUploaded = (index: number) => {
      const updated = uploadedWallpapers.filter((_, i) => i !== index);
      setUploadedWallpapers(updated);
      if (bgValue === uploadedWallpapers[index]) {
         const fallbackUrl = updated.length > 0 ? updated[updated.length - 1] : DEFAULT_PRESETS[0].url;
         setBgValue(fallbackUrl);
         updateAndSave({ uploadedWallpapers: updated, bgValue: fallbackUrl });
      } else {
         updateAndSave({ uploadedWallpapers: updated });
      }
   };

   const handleAutoLocation = () => {
      if (!navigator.geolocation) {
         alert("Geolokasi tidak didukung browser ini.");
         return;
      }
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
         async position => {
            const { latitude, longitude } = position.coords;
            try {
               const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
               const data = await res.json();
               const road = data.address?.road || data.address?.suburb || "";
               const city = data.address?.city || data.address?.town || data.address?.county || "";
               const state = data.address?.state || "";
               const fullAddress = [road, city, state].filter(Boolean).join(", ") || data.display_name;

               setAddressDetail(fullAddress);
               updateAndSave({ addressDetail: fullAddress, lat: latitude, lng: longitude, cityName: city || "Ende" });
            } catch {
               setAddressDetail("Ende, Nusa Tenggara Timur");
               updateAndSave({ addressDetail: "Ende, Nusa Tenggara Timur" });
            } finally {
               setIsLocating(false);
            }
         },
         () => {
            alert("Gagal mengambil lokasi. Pastikan izin lokasi aktif.");
            setIsLocating(false);
         }
      );
   };

   const handleReset = () => {
      const resetBg = isDark ? "#07090e" : "#f8fafc";
      const resetSettings: ExtendedSettings = {
         ...DEFAULT_SETTINGS,
         bgValue: resetBg,
      };
      setBgType("color");
      setBgValue(resetBg);
      setAddressDetail("Ende, Nusa Tenggara Timur");
      setEnableLiquidGlass(true);
      setGlassOpacity(40);
      setGlassBlur(12);
      setUploadedWallpapers([]);
      setSettings(resetSettings);
   };

   // Liquid Glass Style (sama seperti CalendarWidget)
   const opacityVal = glassOpacity / 100;
   const drawerGlassStyle: React.CSSProperties = enableLiquidGlass
      ? {
           backgroundColor: isDark ? `rgba(9, 13, 22, ${Math.max(opacityVal, 0.75)})` : `rgba(255, 255, 255, ${Math.max(opacityVal, 0.75)})`,
           backdropFilter: `blur(${glassBlur}px) saturate(180%)`,
           WebkitBackdropFilter: `blur(${glassBlur}px) saturate(180%)`,
        }
      : {
           backgroundColor: isDark ? "#090d16" : "#ffffff",
        };

   return (
      <AnimatePresence>
         {isOpen && (
            <div className="fixed inset-0 z-50 flex justify-end overflow-hidden font-sans">
               {/* Backdrop Blur */}
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />

               {/* Dynamic Theme Sidebar Drawer */}
               <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} style={drawerGlassStyle} className={`relative w-full max-w-md h-full border-l shadow-2xl flex flex-col z-10 transition-colors duration-300 overflow-hidden ${isDark ? "border-white/15 text-slate-100" : "border-slate-200 text-slate-900"}`}>
                  {/* Ambient Glow */}
                  <div className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none -z-10 ${isDark ? "bg-orange-500/15" : "bg-orange-400/20"}`} />

                  {/* Header */}
                  <div className={`flex items-center justify-between p-5 border-b backdrop-blur-md transition-colors ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100/60"}`}>
                     <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-black shadow-lg shadow-orange-500/25">
                           <SlidersHorizontal className="w-4 h-4" />
                        </div>
                        <div>
                           <h2 className="text-sm font-bold tracking-wide flex items-center gap-1.5">
                              Dashboard Settings
                              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                           </h2>
                           <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Kustomisasi visual UI & Preferensi</p>
                        </div>
                     </div>
                     <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-black/5 text-slate-500 hover:text-black"}`}>
                        <X className="w-5 h-5" />
                     </motion.button>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 p-5 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/20">
                     {/* Background Options */}
                     <div className={`p-4 rounded-2xl border backdrop-blur-sm space-y-4 transition-colors ${isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-100/60 border-slate-200"}`}>
                        <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                           <Palette className="w-4 h-4 text-orange-400" />
                           Background Style
                        </label>

                        {/* Switch Type */}
                        <div className="grid grid-cols-3 gap-2">
                           {(["color", "gradient", "image"] as const).map(type => (
                              <button
                                 key={type}
                                 type="button"
                                 onClick={() => {
                                    setBgType(type);
                                    updateAndSave({ bgType: type });
                                 }}
                                 className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${bgType === type ? "bg-gradient-to-r from-orange-500 to-amber-500 border-orange-400 text-black font-bold shadow-md" : isDark ? "bg-black/30 border-white/10 text-slate-300 hover:bg-white/5" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"}`}>
                                 {type}
                              </button>
                           ))}
                        </div>

                        {bgType === "color" && (
                           <div className="flex items-center space-x-3 pt-2">
                              <input
                                 type="color"
                                 value={bgValue.startsWith("#") ? bgValue : isDark ? "#07090e" : "#f8fafc"}
                                 onChange={e => {
                                    setBgValue(e.target.value);
                                    updateAndSave({ bgValue: e.target.value });
                                 }}
                                 className="w-10 h-10 rounded-xl border border-white/20 cursor-pointer bg-transparent"
                              />
                              <div className={`flex-1 border rounded-xl px-3 py-2 text-xs font-mono flex items-center justify-between transition-colors ${isDark ? "bg-black/40 border-white/10" : "bg-white border-slate-200 text-slate-800"}`}>
                                 <span>Solid Hex</span>
                                 <span className="text-orange-400 font-bold">{bgValue}</span>
                              </div>
                           </div>
                        )}

                        {bgType === "gradient" && (
                           <select
                              value={bgValue}
                              onChange={e => {
                                 setBgValue(e.target.value);
                                 updateAndSave({ bgValue: e.target.value });
                              }}
                              className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-orange-500 transition-colors ${isDark ? "bg-black/50 border-white/15 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}>
                              <option value="linear-gradient(to right, #f8fafc, #e2e8f0)">Clean Slate (Light)</option>
                              <option value="linear-gradient(to right, #fff7ed, #ffedd5)">Soft Peach (Light)</option>
                              <option value="linear-gradient(to right, #07090e, #0d1117)">Dark Standard</option>
                              <option value="linear-gradient(to right, #0f172a, #1e1b4b)">Midnight Indigo</option>
                              <option value="linear-gradient(to right, #1c1917, #451a03)">Warm Amber</option>
                           </select>
                        )}

                        {bgType === "image" && (
                           <div className="space-y-4 pt-2">
                              <div className="space-y-2">
                                 <div className="flex items-center justify-between text-[11px]">
                                    <span>Upload Custom Wallpaper</span>
                                    <span className="text-orange-400 font-bold">({uploadedWallpapers.length}/4) Slot</span>
                                 </div>
                                 <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                 <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-3 px-4 border border-dashed border-orange-500/50 hover:border-orange-500 bg-orange-500/5 hover:bg-orange-500/10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-orange-400 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    <span>Upload Gambar Auto-Compress</span>
                                 </button>
                              </div>

                              {uploadedWallpapers.length > 0 && (
                                 <div className="space-y-2">
                                    <span className="text-[11px] font-semibold opacity-80">Galeri Saya:</span>
                                    <div className="grid grid-cols-2 gap-2">
                                       {uploadedWallpapers.map((url, idx) => (
                                          <div key={idx} className={`relative h-16 rounded-xl overflow-hidden border transition-all group ${bgValue === url ? "border-orange-500 ring-2 ring-orange-500/40" : isDark ? "border-white/10 opacity-70 hover:opacity-100" : "border-slate-200 opacity-70 hover:opacity-100"}`}>
                                             <img
                                                src={url}
                                                alt={`Custom Wallpaper ${idx + 1}`}
                                                className="w-full h-full object-cover cursor-pointer"
                                                onClick={() => {
                                                   setBgValue(url);
                                                   updateAndSave({ bgValue: url });
                                                }}
                                             />
                                             <button type="button" onClick={() => handleRemoveUploaded(idx)} className="absolute top-1 right-1 bg-black/80 hover:bg-rose-600 text-white p-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 className="w-3 h-3" />
                                             </button>
                                             {bgValue === url && (
                                                <div className="absolute bottom-1 right-1 bg-orange-500 text-black p-0.5 rounded-full">
                                                   <Check className="w-3 h-3 stroke-[3]" />
                                                </div>
                                             )}
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}

                              <div className="space-y-2">
                                 <span className="text-[11px] font-semibold opacity-80">Preset Wallpaper:</span>
                                 <div className="grid grid-cols-2 gap-2">
                                    {DEFAULT_PRESETS.map(item => (
                                       <button
                                          key={item.name}
                                          type="button"
                                          onClick={() => {
                                             setBgValue(item.url);
                                             updateAndSave({ bgValue: item.url });
                                          }}
                                          className={`relative h-16 rounded-xl overflow-hidden border text-left transition-all ${bgValue === item.url ? "border-orange-500 ring-2 ring-orange-500/40" : isDark ? "border-white/10 opacity-60 hover:opacity-100" : "border-slate-200 opacity-60 hover:opacity-100"}`}>
                                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1.5">
                                             <span className="text-[10px] font-medium text-white truncate">{item.name}</span>
                                          </div>
                                          {bgValue === item.url && (
                                             <div className="absolute top-1 right-1 bg-orange-500 rounded-full p-0.5 text-black">
                                                <Check className="w-3 h-3 stroke-[3]" />
                                             </div>
                                          )}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Liquid Glass Controls */}
                     <div className={`p-4 rounded-2xl border backdrop-blur-sm space-y-4 transition-colors ${isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-100/60 border-slate-200"}`}>
                        <div className="flex items-center justify-between">
                           <label className="text-xs font-bold uppercase tracking-wider flex items-center space-x-2">
                              <Droplets className="w-4 h-4 text-orange-400" />
                              <span>Liquid Glass Effect</span>
                           </label>
                           <input
                              type="checkbox"
                              checked={enableLiquidGlass}
                              onChange={e => {
                                 const checked = e.target.checked;
                                 setEnableLiquidGlass(checked);
                                 updateAndSave({ enableLiquidGlass: checked });
                              }}
                              className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                           />
                        </div>

                        {enableLiquidGlass && (
                           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className={`space-y-5 pt-2 border-t ${isDark ? "border-white/5" : "border-slate-200"}`}>
                              <div className="space-y-2">
                                 <div className="flex justify-between text-[11px]">
                                    <span>Glass Opacity</span>
                                    <span className="text-orange-400 font-mono font-bold">{glassOpacity}%</span>
                                 </div>
                                 <input
                                    type="range"
                                    min="0"
                                    max="90"
                                    value={glassOpacity}
                                    onChange={e => {
                                       const val = Number(e.target.value);
                                       setGlassOpacity(val);
                                       updateAndSave({ glassOpacity: val });
                                    }}
                                    className="w-full h-2 accent-orange-500 rounded-lg cursor-pointer bg-orange-500/10 transition-all duration-150 ease-out"
                                 />
                              </div>

                              <div className="space-y-2">
                                 <div className="flex justify-between text-[11px]">
                                    <span>Blur Intensity</span>
                                    <span className="text-orange-400 font-mono font-bold">{glassBlur}px</span>
                                 </div>
                                 <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    value={glassBlur}
                                    onChange={e => {
                                       const val = Number(e.target.value);
                                       setGlassBlur(val);
                                       updateAndSave({ glassBlur: val });
                                    }}
                                    className="w-full h-2 accent-orange-500 rounded-lg cursor-pointer bg-orange-500/10 transition-all duration-150 ease-out"
                                 />
                              </div>
                           </motion.div>
                        )}
                     </div>

                     {/* Detail Alamat */}
                     <div className={`p-4 rounded-2xl border backdrop-blur-sm space-y-4 transition-colors ${isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-100/60 border-slate-200"}`}>
                        <div className="flex items-center justify-between">
                           <label className="text-xs font-bold uppercase tracking-wider flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-orange-400" />
                              <span>Alamat & Lokasi</span>
                           </label>
                           <button type="button" onClick={handleAutoLocation} disabled={isLocating} className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-[11px] font-semibold transition-colors">
                              <Navigation className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
                              <span>{isLocating ? "Mencari..." : "Detect Location"}</span>
                           </button>
                        </div>

                        <div className="space-y-2">
                           <input
                              type="text"
                              placeholder="Masukkan Detail Alamat"
                              value={addressDetail}
                              onChange={e => {
                                 setAddressDetail(e.target.value);
                                 updateAndSave({ addressDetail: e.target.value });
                              }}
                              className={`w-full p-3 border rounded-xl text-xs focus:outline-none focus:border-orange-500 transition-colors ${isDark ? "bg-black/40 border-white/10 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}
                           />
                        </div>
                     </div>
                  </div>

                  {/* Footer Action */}
                  <div className={`flex items-center justify-between p-4 border-t transition-colors ${isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-100/80"}`}>
                     <button type="button" onClick={handleReset} className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                     </button>
                     <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-xs shadow-lg shadow-orange-500/25 transition-all">
                        Selesai
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
   );
}
