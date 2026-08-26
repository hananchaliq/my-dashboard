"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, X, Pencil, Trash2, ChevronLeft, ChevronRight, ShieldAlert, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Settings } from "@/types";

export interface Shortcut {
   id: string;
   name: string;
   url: string;
}

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

const DEFAULT_SHORTCUTS: Shortcut[] = [
   // Programming
   { id: "1", name: "GitHub", url: "https://github.com" },
   { id: "2", name: "Stack Overflow", url: "https://stackoverflow.com" },
   { id: "3", name: "Laravel", url: "https://laravel.com" },

   // AI Tools
   { id: "4", name: "ChatGPT", url: "https://chatgpt.com" },
   { id: "5", name: "Claude AI", url: "https://claude.ai" },
   { id: "6", name: "Perplexity", url: "https://perplexity.ai" },

   // Entertainment
   { id: "7", name: "YouTube", url: "https://youtube.com" },
   { id: "8", name: "Spotify", url: "https://open.spotify.com" },
   { id: "9", name: "Netflix", url: "https://netflix.com" },

   // Sosmed & Productive
   { id: "10", name: "WhatsApp", url: "https://web.whatsapp.com" },
   { id: "11", name: "Instagram", url: "https://instagram.com" },
   { id: "12", name: "X", url: "https://x.com" },
   { id: "13", name: "Gmail", url: "https://mail.google.com" },
   { id: "14", name: "Figma", url: "https://figma.com" },
   { id: "15", name: "Vercel", url: "https://vercel.com" },
];

const ITEMS_PER_PAGE = 16;

export default function SearchAndLinks() {
   const [settings] = useLocalStorage<Settings>("app_settings", DEFAULT_SETTINGS);
   const { resolvedTheme, theme } = useTheme();

   const [query, setQuery] = useState("");
   const [shortcuts, setShortcuts] = useLocalStorage<Shortcut[]>("dashboard_shortcuts", DEFAULT_SHORTCUTS);

   const [currentPage, setCurrentPage] = useState(0);
   const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

   // Modal State
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
   const [deletingShortcut, setDeletingShortcut] = useState<Shortcut | null>(null);

   // Form Inputs
   const [nameInput, setNameInput] = useState("");
   const [urlInput, setUrlInput] = useState("");

   const [isMounted, setIsMounted] = useState(false);
   const menuRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      setIsMounted(true);

      const handleClickOutside = (e: MouseEvent) => {
         if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setActiveMenuId(null);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const activeSettings = isMounted ? settings : DEFAULT_SETTINGS;

   if (!isMounted) {
      return (
         <div className="w-full h-full min-h-[320px] rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-slate-900/50 animate-pulse flex items-center justify-center">
            <span className="text-xs text-slate-500 font-mono">Loading Search & Links...</span>
         </div>
      );
   }

   const currentTheme = resolvedTheme || theme || "dark";
   const isDark = currentTheme === "dark";

   const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
         window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      }
   };

   const getDomain = (urlStr: string) => {
      try {
         return new URL(urlStr).hostname.replace("www.", "");
      } catch {
         return urlStr;
      }
   };

   const getCleanIconUrl = (shortcut: Shortcut) => {
      const domain = getDomain(shortcut.url).toLowerCase();
      const name = shortcut.name.toLowerCase();

      // Icon light/dark adjustment for monochromatic icons like GitHub/X/Vercel
      const iconColor = isDark ? "%23ffffff" : "%23000000";

      // AI Tools
      if (domain.includes("chatgpt") || domain.includes("openai") || name.includes("chatgpt")) {
         return `https://api.iconify.design/simple-icons:openai.svg?color=${iconColor}`;
      }
      if (domain.includes("claude") || name.includes("claude")) {
         return "https://api.iconify.design/simple-icons:anthropic.svg?color=%23d97706";
      }
      if (domain.includes("perplexity") || name.includes("perplexity")) {
         return `https://api.iconify.design/simple-icons:perplexity.svg?color=${iconColor}`;
      }

      // Programming
      if (domain.includes("github") || name.includes("github")) return `https://api.iconify.design/simple-icons:github.svg?color=${iconColor}`;
      if (domain.includes("stackoverflow") || name.includes("stack")) return "https://api.iconify.design/simple-icons:stackoverflow.svg?color=%23f48024";
      if (domain.includes("laravel") || name.includes("laravel")) return "https://api.iconify.design/simple-icons:laravel.svg?color=%23ff2d20";

      // Entertainment & Sosmed
      if (domain.includes("youtube") || name.includes("youtube")) return "https://api.iconify.design/simple-icons:youtube.svg?color=%23ff0000";
      if (domain.includes("spotify") || name.includes("spotify")) return "https://api.iconify.design/simple-icons:spotify.svg?color=%231ed760";
      if (domain.includes("netflix") || name.includes("netflix")) return "https://api.iconify.design/simple-icons:netflix.svg?color=%23e50914";
      if (domain.includes("tiktok") || name.includes("tiktok")) return `https://api.iconify.design/simple-icons:tiktok.svg?color=${iconColor}`;

      if (domain.includes("whatsapp") || name.includes("whatsapp")) return "https://api.iconify.design/simple-icons:whatsapp.svg?color=%2325d366";
      if (domain.includes("instagram") || name.includes("instagram")) return "https://api.iconify.design/simple-icons:instagram.svg?color=%23e4405f";
      if (domain.includes("x.com") || domain.includes("twitter") || name === "x") return `https://api.iconify.design/simple-icons:x.svg?color=${iconColor}`;
      if (domain.includes("mail.google") || name.includes("gmail")) return "https://api.iconify.design/simple-icons:gmail.svg?color=%23ea4335";
      if (domain.includes("figma") || name.includes("figma")) return "https://api.iconify.design/simple-icons:figma.svg?color=%23f24e1e";
      if (domain.includes("vercel") || name.includes("vercel")) return `https://api.iconify.design/simple-icons:vercel.svg?color=${iconColor}`;

      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
   };

   const openAddModal = () => {
      setEditingShortcut(null);
      setNameInput("");
      setUrlInput("");
      setIsModalOpen(true);
      setActiveMenuId(null);
   };

   const openEditModal = (shortcut: Shortcut, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingShortcut(shortcut);
      setNameInput(shortcut.name);
      setUrlInput(shortcut.url);
      setIsModalOpen(true);
      setActiveMenuId(null);
   };

   const openDeleteModal = (shortcut: Shortcut, e: React.MouseEvent) => {
      e.stopPropagation();
      setDeletingShortcut(shortcut);
      setActiveMenuId(null);
   };

   const handleSaveShortcut = (e: React.FormEvent) => {
      e.preventDefault();
      if (!nameInput.trim() || !urlInput.trim()) return;

      let formattedUrl = urlInput.trim();
      if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
         formattedUrl = `https://${formattedUrl}`;
      }

      if (editingShortcut) {
         setShortcuts(shortcuts.map(s => (s.id === editingShortcut.id ? { ...s, name: nameInput, url: formattedUrl } : s)));
      } else {
         const newItem: Shortcut = {
            id: Date.now().toString(),
            name: nameInput,
            url: formattedUrl,
         };
         setShortcuts([...shortcuts, newItem]);
      }

      setIsModalOpen(false);
   };

   const confirmDelete = () => {
      if (deletingShortcut) {
         const updated = shortcuts.filter(s => s.id !== deletingShortcut.id);
         setShortcuts(updated);
         setDeletingShortcut(null);

         const maxPages = Math.ceil((updated.length + 1) / ITEMS_PER_PAGE);
         if (currentPage >= maxPages && currentPage > 0) {
            setCurrentPage(currentPage - 1);
         }
      }
   };

   const totalItemsWithAdd = shortcuts.length + 1;
   const totalPages = Math.max(1, Math.ceil(totalItemsWithAdd / ITEMS_PER_PAGE));

   const startIdx = currentPage * ITEMS_PER_PAGE;
   const currentShortcuts = shortcuts.slice(startIdx, startIdx + ITEMS_PER_PAGE);
   const showAddBtnOnThisPage = currentShortcuts.length < ITEMS_PER_PAGE;

   const isLiquidEnabled = activeSettings.enableLiquidGlass ?? true;
   const glassOpacity = (activeSettings.glassOpacity ?? 40) / 100;
   const glassBlur = activeSettings.glassBlur ?? 12;

   // Style Inline Glassmorphism Engine
   const liquidGlassStyle: React.CSSProperties = isLiquidEnabled
      ? {
           backgroundColor: isDark ? `rgba(15, 23, 42, ${glassOpacity})` : `rgba(255, 255, 255, ${glassOpacity})`,
           backdropFilter: `blur(${glassBlur}px) saturate(180%)`,
           WebkitBackdropFilter: `blur(${glassBlur}px) saturate(180%)`,
        }
      : {
           backgroundColor: isDark ? "#0d1117" : "#ffffff",
        };

   return (
      <div style={liquidGlassStyle} className={`relative group overflow-hidden p-5 rounded-3xl border transition-all duration-300 h-full flex flex-col justify-between w-full select-none ${isDark ? "border-white/15 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/30" : "border-slate-200/80 text-slate-900 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] hover:border-orange-400/40"}`}>
         {/* Glossy Reflective Gradient */}
         {isLiquidEnabled && <div className={`absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-3xl ${isDark ? "bg-gradient-to-b from-white/10 to-transparent" : "bg-gradient-to-b from-white/60 to-transparent"}`} />}

         {/* Ambient Inner Glow */}
         <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${isDark ? "bg-orange-500/20 group-hover:bg-orange-500/35" : "bg-orange-400/20 group-hover:bg-orange-400/30"}`} />
         <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

         {/* Search Bar Container */}
         <div className="space-y-1.5 shrink-0 z-10 relative">
            <form onSubmit={handleSearch} className="relative group/search">
               <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-slate-300 group-focus-within/search:text-white" : "text-slate-400 group-focus-within/search:text-slate-900"}`} />
               <input id="main-search-input" type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari apa saja..." className={`w-full pl-11 pr-10 py-3 rounded-2xl text-xs backdrop-blur-md transition-all focus:outline-none ${isDark ? "bg-white/10 border border-white/15 text-white placeholder-slate-300/70 focus:border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" : "bg-slate-100/90 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-orange-400/50 shadow-inner"}`} />
               <button type="submit" className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl flex items-center justify-center text-xs transition-all active:scale-95 border shadow-sm ${isDark ? "bg-white/15 hover:bg-white/25 text-white border-white/10" : "bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 border-slate-300/50"}`}>
                  ➔
               </button>
            </form>
            <p className={`text-[10px] text-center drop-shadow-sm ${isDark ? "text-slate-300/80" : "text-slate-500"}`}>Tekan Enter untuk mencari di Google</p>
         </div>

         {/* Grid Quick Links */}
         <div className="relative flex-1 flex items-center justify-center w-full min-h-0 z-10 py-2">
            <AnimatePresence mode="wait">
               <motion.div key={currentPage} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.12 }} className="grid grid-cols-8 gap-3 w-full justify-items-center items-center">
                  {currentShortcuts.map(item => (
                     <div key={item.id} onClick={() => window.open(item.url, "_blank")} className="flex flex-col items-center justify-center group/item cursor-pointer relative w-full">
                        {/* Tombol Action Edit/Delete */}
                        <button
                           onClick={e => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === item.id ? null : item.id);
                           }}
                           className={`absolute -top-1 -right-1 w-5 h-5 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity z-20 flex items-center justify-center border shadow-md ${isDark ? "bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 border-white/20" : "bg-white/95 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200"}`}
                           title="Opsi">
                           <Pencil className="w-2.5 h-2.5" />
                        </button>

                        {/* Pop-up Menu */}
                        {activeMenuId === item.id && (
                           <div ref={menuRef} onClick={e => e.stopPropagation()} className={`absolute right-0 top-6 border backdrop-blur-xl rounded-xl shadow-2xl p-1 z-30 flex flex-col gap-0.5 min-w-[90px] ${isDark ? "bg-[#0f1420]/90 border-white/20 text-slate-200" : "bg-white/90 border-slate-200/80 text-slate-800 shadow-slate-300/50"}`}>
                              <button onClick={e => openEditModal(item, e)} className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] rounded-lg transition-colors w-full text-left ${isDark ? "hover:bg-white/10 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}>
                                 <Pencil className="w-3 h-3" /> Edit
                              </button>
                              <button onClick={e => openDeleteModal(item, e)} className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-red-500 hover:bg-red-500/15 rounded-lg transition-colors w-full text-left">
                                 <Trash2 className="w-3 h-3 text-red-500" /> Hapus
                              </button>
                           </div>
                        )}

                        {/* Box Icon Liquid Glass */}
                        <div className={`w-full aspect-square max-w-[54px] max-h-[54px] rounded-2xl border backdrop-blur-md flex items-center justify-center transition-all p-2.5 mx-auto ${isDark ? "bg-white/10 border-white/20 group-hover/item:border-white/40 group-hover/item:bg-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]" : "bg-slate-100/90 border-slate-200 group-hover/item:border-orange-400/50 group-hover/item:bg-slate-200/80 shadow-inner"}`}>
                           <img
                              src={getCleanIconUrl(item)}
                              alt={item.name}
                              className="w-full h-full object-contain transition-transform group-hover/item:scale-110 drop-shadow"
                              onError={e => {
                                 const target = e.target as HTMLImageElement;
                                 target.onerror = null;
                                 target.src = `https://www.google.com/s2/favicons?domain=${getDomain(item.url)}&sz=128`;
                              }}
                           />
                        </div>

                        {/* Tooltip Hover Nama */}
                        <div className={`absolute -bottom-6 opacity-0 group-hover/item:opacity-100 transition-all transform group-hover/item:translate-y-0 translate-y-1 text-[10px] font-medium py-0.5 px-2 rounded-md border backdrop-blur-md whitespace-nowrap z-20 pointer-events-none shadow-xl ${isDark ? "bg-[#0f1420]/90 text-slate-100 border-white/20" : "bg-white/95 text-slate-800 border-slate-200"}`}>{item.name}</div>
                     </div>
                  ))}

                  {/* Tombol Tambah Quick Link */}
                  {showAddBtnOnThisPage && (
                     <div onClick={openAddModal} className="flex flex-col items-center justify-center cursor-pointer group/add w-full">
                        <div className={`w-full aspect-square max-w-[54px] max-h-[54px] rounded-2xl border border-dashed backdrop-blur-md flex items-center justify-center transition-all mx-auto ${isDark ? "bg-white/5 border-white/20 text-slate-300 group-hover/add:text-white group-hover/add:border-white/40 group-hover/add:bg-white/15" : "bg-slate-100/50 border-slate-300 text-slate-500 group-hover/add:text-slate-900 group-hover/add:border-orange-400/60 group-hover/add:bg-slate-200/60"}`}>
                           <Plus className="w-5 h-5" />
                        </div>
                     </div>
                  )}
               </motion.div>
            </AnimatePresence>
         </div>

         {/* Pagination Slide */}
         {totalPages > 1 && (
            <div className={`flex items-center justify-between pt-2 border-t shrink-0 z-10 relative ${isDark ? "border-white/10" : "border-slate-200"}`}>
               <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className={`p-1 rounded-xl border transition-colors disabled:opacity-20 disabled:cursor-not-allowed ${isDark ? "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/15" : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-200"}`}>
                  <ChevronLeft className="w-4 h-4" />
               </motion.button>

               <div className="flex space-x-1.5">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                     <button key={idx} onClick={() => setCurrentPage(idx)} className={`h-1.5 rounded-full transition-all ${currentPage === idx ? (isDark ? "bg-white w-4 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-orange-500 w-4 shadow-[0_0_8px_rgba(249,115,22,0.5)]") : isDark ? "bg-white/20 hover:bg-white/40 w-1.5" : "bg-slate-300 hover:bg-slate-400 w-1.5"}`} />
                  ))}
               </div>

               <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1} className={`p-1 rounded-xl border transition-colors disabled:opacity-20 disabled:cursor-not-allowed ${isDark ? "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/15" : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-200"}`}>
                  <ChevronRight className="w-4 h-4" />
               </motion.button>
            </div>
         )}

         {/* Modal Tambah/Edit */}
         <AnimatePresence>
            {isModalOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                  <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleSaveShortcut} className={`border backdrop-blur-2xl rounded-3xl w-full max-w-xs p-5 space-y-4 shadow-2xl text-xs ${isDark ? "bg-[#0f1420]/90 border-white/20 text-slate-200" : "bg-white/95 border-slate-200 text-slate-800"}`}>
                     <div className={`flex justify-between items-center border-b pb-2.5 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                        <h3 className={`font-semibold text-xs flex items-center gap-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                           <Globe className="w-3.5 h-3.5 text-orange-400" />
                           {editingShortcut ? "Edit Quick Link" : "Tambah Quick Link"}
                        </h3>
                        <button type="button" onClick={() => setIsModalOpen(false)} className={isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-700"}>
                           <X className="w-3.5 h-3.5" />
                        </button>
                     </div>

                     <div className="space-y-2.5">
                        <div>
                           <label className={`block mb-1 text-[11px] ${isDark ? "text-slate-300" : "text-slate-600"}`}>Nama Aplikasi</label>
                           <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Contoh: TikTok" className={`w-full rounded-xl p-2 backdrop-blur-md border focus:outline-none ${isDark ? "bg-white/5 border-white/15 text-white placeholder-slate-400 focus:border-white/30" : "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-orange-400"}`} required />
                        </div>
                        <div>
                           <label className={`block mb-1 text-[11px] ${isDark ? "text-slate-300" : "text-slate-600"}`}>URL Website</label>
                           <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="tiktok.com" className={`w-full rounded-xl p-2 backdrop-blur-md border focus:outline-none ${isDark ? "bg-white/5 border-white/15 text-white placeholder-slate-400 focus:border-white/30" : "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-orange-400"}`} required />
                        </div>
                     </div>

                     <div className="flex justify-end space-x-2 pt-1">
                        <button type="button" onClick={() => setIsModalOpen(false)} className={`px-3 py-1.5 rounded-xl text-[11px] border ${isDark ? "bg-white/10 hover:bg-white/15 text-slate-200 border-white/10" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"}`}>
                           Batal
                        </button>
                        <button type="submit" className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold rounded-xl text-[11px] shadow-[0_0_12px_rgba(249,115,22,0.4)] border border-white/20">
                           {editingShortcut ? "Simpan" : "Tambah"}
                        </button>
                     </div>
                  </motion.form>
               </div>
            )}
         </AnimatePresence>

         {/* Modal Hapus */}
         <AnimatePresence>
            {deletingShortcut && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`border border-red-500/30 backdrop-blur-2xl rounded-3xl w-full max-w-xs p-5 space-y-3 shadow-2xl text-xs ${isDark ? "bg-[#0f1420]/90 text-slate-200" : "bg-white/95 text-slate-800"}`}>
                     <div className="flex items-center space-x-2.5 text-red-500">
                        <ShieldAlert className="w-5 h-5 shrink-0" />
                        <h3 className={`font-semibold text-xs ${isDark ? "text-white" : "text-slate-900"}`}>Konfirmasi Hapus</h3>
                     </div>

                     <p className={`text-[11px] ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        Hapus shortcut <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>"{deletingShortcut.name}"</span>?
                     </p>

                     <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={() => setDeletingShortcut(null)} className={`px-3 py-1.5 rounded-xl text-[11px] border ${isDark ? "bg-white/10 hover:bg-white/15 text-slate-200 border-white/10" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"}`}>
                           Batal
                        </button>
                        <button type="button" onClick={confirmDelete} className="px-4 py-1.5 bg-red-600/80 hover:bg-red-500 text-white font-semibold rounded-xl text-[11px] shadow-[0_0_12px_rgba(239,68,68,0.4)] border border-white/20">
                           Hapus
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
