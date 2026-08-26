"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Trash2, Edit2, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "@/types";

interface ExtendedSettings extends Partial<Settings> {
   enableLiquidGlass?: boolean;
   glassOpacity?: number;
   glassBlur?: number;
}

interface LinkItem {
   id: string;
   name: string;
   url: string;
}

interface Group {
   id: string;
   category: string;
   links: LinkItem[];
}

const normalizeUrl = (url: string) => {
   if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
   }
   return url;
};

const FaviconImage = ({ url, name }: { url: string; name: string }) => {
   const [imgSrcIndex, setImgSrcIndex] = useState(0);

   let hostname = "";
   try {
      const validUrl = normalizeUrl(url);
      hostname = new URL(validUrl).hostname;
   } catch {
      hostname = "";
   }

   const iconSources = [`https://icons.duckduckgo.com/ip3/${hostname}.ico`, `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`, `https://api.staticaly.com/favicons/${hostname}`];

   if (!hostname || imgSrcIndex >= iconSources.length) {
      return <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
   }

   return <img src={iconSources[imgSrcIndex]} alt={name} className="w-3.5 h-3.5 object-contain rounded shrink-0 bg-black/40" onError={() => setImgSrcIndex(prev => prev + 1)} />;
};

const DEFAULT_GROUPS: Group[] = [
   {
      id: "ws-1",
      category: "My Workspace",
      links: [
         { id: "l-1", name: "Gmail", url: "https://gmail.com" },
         { id: "l-2", name: "Google Docs", url: "https://docs.google.com" },
         { id: "l-3", name: "ChatGPT", url: "https://chatgpt.com" },
         { id: "l-4", name: "Google Calendar", url: "https://calendar.google.com" },
         { id: "l-5", name: "Notion", url: "https://notion.so" },
         { id: "l-6", name: "WhatsApp Web", url: "https://web.whatsapp.com" },
         { id: "l-7", name: "Google", url: "https://google.com" },
      ],
   },
   {
      id: "ws-2",
      category: "Notes & Docs",
      links: [
         { id: "l-8", name: "Evernote", url: "https://evernote.com" },
         { id: "l-9", name: "Obsidian Web", url: "https://obsidian.md" },
         { id: "l-10", name: "Google Keep", url: "https://keep.google.com" },
      ],
   },
   {
      id: "ws-3",
      category: "Cloud Storage",
      links: [
         { id: "l-11", name: "Google Drive", url: "https://drive.google.com" },
         { id: "l-12", name: "Dropbox", url: "https://dropbox.com" },
         { id: "l-13", name: "OneDrive", url: "https://onedrive.live.com" },
         { id: "l-14", name: "iCloud", url: "https://icloud.com" },
      ],
   },
   {
      id: "ws-4",
      category: "Communication",
      links: [
         { id: "l-15", name: "Slack", url: "https://slack.com" },
         { id: "l-16", name: "Robinhood", url: "https://robinhood.com" },
         { id: "l-17", name: "Discord", url: "https://discord.com" },
         { id: "l-18", name: "Yahoo Finance", url: "https://finance.yahoo.com" },
         { id: "l-19", name: "Zoom", url: "https://zoom.us" },
      ],
   },
   {
      id: "ws-5",
      category: "Social Media",
      links: [
         { id: "l-20", name: "Instagram", url: "https://instagram.com" },
         { id: "l-21", name: "Twitter / X", url: "https://x.com" },
         { id: "l-22", name: "LinkedIn", url: "https://linkedin.com" },
         { id: "l-23", name: "Reddit", url: "https://reddit.com" },
         { id: "l-24", name: "Threads", url: "https://threads.net" },
      ],
   },
   {
      id: "ws-6",
      category: "Finance",
      links: [
         { id: "l-25", name: "PayPal", url: "https://paypal.com" },
         { id: "l-26", name: "Wise", url: "https://wise.com" },
         { id: "l-27", name: "Coinbase", url: "https://coinbase.com" },
         { id: "l-28", name: "Telegram Web", url: "https://web.telegram.org" },
      ],
   },
   {
      id: "ws-7",
      category: "Google Console",
      links: [
         { id: "l-29", name: "Google Translate", url: "https://translate.google.com" },
         { id: "l-30", name: "DeepL", url: "https://deepl.com" },
         { id: "l-31", name: "Canva", url: "https://canva.com" },
         { id: "l-32", name: "TinyPNG", url: "https://tinypng.com" },
         { id: "l-33", name: "Remove.bg", url: "https://remove.bg" },
      ],
   },
];

const ITEMS_PER_SLIDE = 7;

const AnimatedLinkItem = ({ link, groupId, index, isDark, onEdit, onDelete }: { link: LinkItem; groupId: string; index: number; isDark: boolean; onEdit: (groupId: string, link: LinkItem) => void; onDelete: (groupId: string, linkId: string) => void }) => {
   return (
      <motion.div
         initial={{ opacity: 0, y: 6 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -4 }}
         transition={{
            duration: 0.25,
            delay: index * 0.04,
            ease: "easeOut",
         }}
         className={`group/item flex items-center justify-between py-1 px-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}>
         <a href={normalizeUrl(link.url)} target="_blank" rel="noreferrer" className={`flex items-center space-x-2 text-xs transition-colors truncate flex-1 ${isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>
            <FaviconImage url={link.url} name={link.name} />
            <span className="truncate text-[11px] font-medium">{link.name}</span>
         </a>

         <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
            <button onClick={() => onEdit(groupId, link)} className={`p-0.5 ${isDark ? "text-slate-400 hover:text-slate-100" : "text-slate-500 hover:text-slate-800"}`}>
               <Edit2 className="w-3 h-3" />
            </button>
            <button onClick={() => onDelete(groupId, link.id)} className="p-0.5 text-slate-400 hover:text-red-400">
               <Trash2 className="w-3 h-3" />
            </button>
         </div>
      </motion.div>
   );
};

export default function WorkspaceGrid() {
   const { resolvedTheme, theme } = useTheme();
   const [settings] = useLocalStorage<ExtendedSettings>("app_settings", {});
   const [groups, setGroups] = useLocalStorage<Group[]>("dashboard_workspace_groups", DEFAULT_GROUPS);

   const [currentPage, setCurrentPage] = useState(0);
   const [isMounted, setIsMounted] = useState(false);

   const [modalType, setModalType] = useState<"addGroup" | "editGroup" | "addLink" | "editLink" | null>(null);
   const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
   const [activeLinkId, setActiveLinkId] = useState<string | null>(null);

   const [inputCategory, setInputCategory] = useState("");
   const [inputLinkName, setInputLinkName] = useState("");
   const [inputLinkUrl, setInputLinkUrl] = useState("");

   useEffect(() => {
      setIsMounted(true);
   }, []);

   const currentTheme = resolvedTheme || theme || "dark";
   const isDark = currentTheme === "dark";

   // Dynamic Glass Styling Sesuai Pattern DailyNotes
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

   const totalPages = Math.ceil((groups.length + 1) / ITEMS_PER_SLIDE);
   const paginatedGroups = groups.slice(currentPage * ITEMS_PER_SLIDE, (currentPage + 1) * ITEMS_PER_SLIDE);

   const openAddGroup = () => {
      setInputCategory("");
      setModalType("addGroup");
   };

   const openEditGroup = (group: Group) => {
      setActiveGroupId(group.id);
      setInputCategory(group.category);
      setModalType("editGroup");
   };

   const handleSaveGroup = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputCategory.trim()) return;

      if (modalType === "addGroup") {
         const newGroup: Group = { id: `ws-${Date.now()}`, category: inputCategory, links: [] };
         setGroups([...groups, newGroup]);
      } else if (modalType === "editGroup" && activeGroupId) {
         setGroups(groups.map(g => (g.id === activeGroupId ? { ...g, category: inputCategory } : g)));
      }
      closeModal();
   };

   const handleDeleteGroup = (groupId: string) => {
      if (confirm("Apakah yakin ingin menghapus grup ini?")) {
         setGroups(groups.filter(g => g.id !== groupId));
      }
   };

   const openAddLink = (groupId: string) => {
      setActiveGroupId(groupId);
      setInputLinkName("");
      setInputLinkUrl("https://");
      setModalType("addLink");
   };

   const openEditLink = (groupId: string, link: LinkItem) => {
      setActiveGroupId(groupId);
      setActiveLinkId(link.id);
      setInputLinkName(link.name);
      setInputLinkUrl(link.url);
      setModalType("editLink");
   };

   const handleSaveLink = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputLinkName.trim() || !inputLinkUrl.trim() || !activeGroupId) return;

      const formattedUrl = normalizeUrl(inputLinkUrl);

      if (modalType === "addLink") {
         const newLink: LinkItem = {
            id: crypto.randomUUID(),
            name: inputLinkName,
            url: formattedUrl,
         };
         setGroups(groups.map(g => (g.id === activeGroupId ? { ...g, links: [...g.links, newLink] } : g)));
      } else if (modalType === "editLink" && activeLinkId) {
         setGroups(
            groups.map(g =>
               g.id === activeGroupId
                  ? {
                       ...g,
                       links: g.links.map(l => (l.id === activeLinkId ? { ...l, name: inputLinkName, url: formattedUrl } : l)),
                    }
                  : g
            )
         );
      }
      closeModal();
   };

   const handleDeleteLink = (groupId: string, linkId: string) => {
      setGroups(groups.map(g => (g.id === groupId ? { ...g, links: g.links.filter(l => l.id !== linkId) } : g)));
   };

   const closeModal = () => {
      setModalType(null);
      setActiveGroupId(null);
      setActiveLinkId(null);
   };

   return (
      <div className="w-full space-y-4 font-sans">
         {/* Grid Layout 4 Kolom */}
         <AnimatePresence mode="wait">
            <motion.div key={currentPage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="grid grid-cols-4 grid-flow-col grid-rows-2 gap-3 min-h-[380px]">
               {paginatedGroups.map((col, idx) => {
                  const isFirstCol = idx === 0 && currentPage === 0;

                  return (
                     <motion.div key={col.id} layout style={containerGlassStyle} className={`group/card relative p-4 rounded-3xl border shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${isDark ? "border-white/15 text-slate-100" : "border-slate-200 text-slate-800"} ${isFirstCol ? "row-span-2 min-h-[360px]" : "row-span-1"}`}>
                        {/* Ambient Glow Gradient Header */}
                        <div className={`absolute top-0 left-0 right-0 h-24 rounded-t-3xl pointer-events-none ${isDark ? "bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent" : "bg-gradient-to-b from-orange-500/10 via-amber-500/[0.02] to-transparent"}`} />

                        {/* Ambient Glow Corner */}
                        <div className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${isDark ? "bg-orange-500/10 group-hover/card:bg-orange-500/20" : "bg-orange-400/20 group-hover/card:bg-orange-400/30"}`} />

                        <div className="space-y-2.5 relative z-10">
                           {/* Header Kategori */}
                           <div className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                              <h4 className={`text-xs font-bold tracking-wide ${isDark ? "text-white" : "text-slate-900"}`}>{col.category}</h4>
                              <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                 <button onClick={() => openAddLink(col.id)} className={`p-1 rounded transition-colors ${isDark ? "hover:text-orange-400 text-slate-400" : "hover:text-orange-600 text-slate-500"}`} title="Tambah Link">
                                    <Plus className="w-3.5 h-3.5" />
                                 </button>
                                 <button onClick={() => openEditGroup(col)} className={`p-1 rounded transition-colors ${isDark ? "hover:text-slate-200 text-slate-400" : "hover:text-slate-700 text-slate-500"}`} title="Edit Grup">
                                    <Edit2 className="w-3.5 h-3.5" />
                                 </button>
                                 <button onClick={() => handleDeleteGroup(col.id)} className="p-1 hover:text-red-400 text-slate-400 rounded transition-colors" title="Hapus Grup">
                                    <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                              </div>
                           </div>

                           {/* List Item Link */}
                           <div className="space-y-1">
                              <AnimatePresence mode="popLayout">
                                 {col.links.map((link, linkIdx) => (
                                    <AnimatedLinkItem key={link.id || `link-${col.id}-${linkIdx}`} link={link} groupId={col.id} index={linkIdx} isDark={isDark} onEdit={openEditLink} onDelete={handleDeleteLink} />
                                 ))}
                              </AnimatePresence>
                           </div>
                        </div>

                        <button onClick={() => openAddLink(col.id)} className={`w-full py-1 border border-dashed rounded-xl text-[10px] transition-all opacity-0 group-hover/card:opacity-100 mt-2 relative z-10 font-medium ${isDark ? "border-white/15 hover:border-white/30 text-slate-400 hover:text-white" : "border-slate-300 hover:border-slate-400 text-slate-500 hover:text-slate-900"}`}>
                           + Link Baru
                        </button>
                     </motion.div>
                  );
               })}

               {/* Card Tambah Grup Baru */}
               {currentPage === totalPages - 1 && paginatedGroups.length < ITEMS_PER_SLIDE && (
                  <motion.div onClick={openAddGroup} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} style={containerGlassStyle} className={`row-span-1 p-4 rounded-3xl border border-dashed shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all min-h-[140px] space-y-1 ${isDark ? "border-white/20 hover:border-white/40 text-slate-400 hover:text-white" : "border-slate-300 hover:border-slate-400 text-slate-500 hover:text-slate-900"}`}>
                     <Plus className="w-5 h-5" />
                     <span className="text-xs font-semibold">Tambah Grup Baru</span>
                  </motion.div>
               )}
            </motion.div>
         </AnimatePresence>

         {/* Pagination Slide Indicator */}
         {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-3 pt-2">
               <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className={`p-1.5 rounded-xl border backdrop-blur-md transition-all disabled:opacity-30 ${isDark ? "bg-white/5 border-white/10 text-slate-400 hover:text-white" : "bg-black/5 border-black/10 text-slate-600 hover:text-slate-900"}`}>
                  <ChevronLeft className="w-4 h-4" />
               </button>
               <div className="flex space-x-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                     <div key={i} onClick={() => setCurrentPage(i)} className={`h-2 rounded-full cursor-pointer transition-all ${currentPage === i ? "bg-gradient-to-r from-orange-500 to-amber-500 w-5 shadow-sm shadow-orange-500/30" : isDark ? "bg-white/20 w-2 hover:bg-white/40" : "bg-black/20 w-2 hover:bg-black/40"}`} />
                  ))}
               </div>
               <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className={`p-1.5 rounded-xl border backdrop-blur-md transition-all disabled:opacity-30 ${isDark ? "bg-white/5 border-white/10 text-slate-400 hover:text-white" : "bg-black/5 border-black/10 text-slate-600 hover:text-slate-900"}`}>
                  <ChevronRight className="w-4 h-4" />
               </button>
            </div>
         )}

         {/* Modal Edit / Add Beranimasi dengan Efek Glassmorphism */}
         <AnimatePresence>
            {modalType && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                  <motion.form initial={{ scale: 0.9, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 15 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onSubmit={modalType.includes("Group") ? handleSaveGroup : handleSaveLink} style={containerGlassStyle} className={`border rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl backdrop-blur-2xl text-xs ${isDark ? "border-white/20 text-slate-200" : "border-slate-300 text-slate-800"}`}>
                     <div className={`flex justify-between items-center border-b pb-2 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                        <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                           {modalType === "addGroup" && "Tambah Grup Workspace"}
                           {modalType === "editGroup" && "Edit Nama Grup"}
                           {modalType === "addLink" && "Tambah Link Baru"}
                           {modalType === "editLink" && "Edit Link"}
                        </h3>
                        <button type="button" onClick={closeModal} className={`p-1 rounded-lg ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                           <X className="w-4 h-4" />
                        </button>
                     </div>

                     {modalType.includes("Group") ? (
                        <div>
                           <label className={`block mb-1 font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>Nama Kategori</label>
                           <input type="text" value={inputCategory} onChange={e => setInputCategory(e.target.value)} placeholder="Contoh: Design Tools" className={`w-full border rounded-xl p-2.5 focus:outline-none focus:border-orange-500/50 ${isDark ? "bg-black/40 border-white/10 text-white placeholder-slate-500" : "bg-slate-100/80 border-slate-300 text-slate-900 placeholder-slate-400"}`} required />
                        </div>
                     ) : (
                        <div className="space-y-3">
                           <div>
                              <label className={`block mb-1 font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>Nama Link</label>
                              <input type="text" value={inputLinkName} onChange={e => setInputLinkName(e.target.value)} placeholder="Contoh: Figma" className={`w-full border rounded-xl p-2.5 focus:outline-none focus:border-orange-500/50 ${isDark ? "bg-black/40 border-white/10 text-white placeholder-slate-500" : "bg-slate-100/80 border-slate-300 text-slate-900 placeholder-slate-400"}`} required />
                           </div>
                           <div>
                              <label className={`block mb-1 font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>URL Website</label>
                              <input type="text" value={inputLinkUrl} onChange={e => setInputLinkUrl(e.target.value)} placeholder="https://figma.com atau figma.com" className={`w-full border rounded-xl p-2.5 focus:outline-none focus:border-orange-500/50 ${isDark ? "bg-black/40 border-white/10 text-white placeholder-slate-500" : "bg-slate-100/80 border-slate-300 text-slate-900 placeholder-slate-400"}`} required />
                           </div>
                        </div>
                     )}

                     <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={closeModal} className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors ${isDark ? "bg-white/10 text-slate-300 hover:bg-white/20" : "bg-black/5 text-slate-700 hover:bg-black/10"}`}>
                           Batal
                        </button>
                        <button type="submit" className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-bold rounded-xl transition-all shadow-md shadow-orange-500/25 border border-orange-400/30 active:scale-95">
                           Simpan
                        </button>
                     </div>
                  </motion.form>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}
