"use client";

import React, { useState } from "react";
import { Plus, X, Trash2, Edit2, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { motion, AnimatePresence } from "framer-motion";

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

// Item Link Beranimasi dengan Staggered Delay Berdasarkan Indeks
const AnimatedLinkItem = ({ link, groupId, index, onEdit, onDelete }: { link: LinkItem; groupId: string; index: number; onEdit: (groupId: string, link: LinkItem) => void; onDelete: (groupId: string, linkId: string) => void }) => {
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
         className="group/item flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-white/10 transition-colors">
         <a href={normalizeUrl(link.url)} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-xs text-slate-300 hover:text-white transition-colors truncate flex-1">
            <FaviconImage url={link.url} name={link.name} />
            <span className="truncate text-[11px] font-medium">{link.name}</span>
         </a>

         <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
            <button onClick={() => onEdit(groupId, link)} className="p-0.5 text-slate-400 hover:text-slate-100">
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
   const [groups, setGroups] = useLocalStorage<Group[]>("dashboard_workspace_groups", DEFAULT_GROUPS);
   const [currentPage, setCurrentPage] = useState(0);

   const [modalType, setModalType] = useState<"addGroup" | "editGroup" | "addLink" | "editLink" | null>(null);
   const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
   const [activeLinkId, setActiveLinkId] = useState<string | null>(null);

   const [inputCategory, setInputCategory] = useState("");
   const [inputLinkName, setInputLinkName] = useState("");
   const [inputLinkUrl, setInputLinkUrl] = useState("");

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
         const newLink: LinkItem = { id: `l-${Date.now()}`, name: inputLinkName, url: formattedUrl };
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
      <div className="w-full space-y-4">
         {/* Grid Layout 4 Kolom */}
         <AnimatePresence mode="wait">
            <motion.div key={currentPage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="grid grid-cols-4 grid-flow-col grid-rows-2 gap-3 min-h-[380px]">
               {paginatedGroups.map((col, idx) => {
                  const isFirstCol = idx === 0 && currentPage === 0;

                  return (
                     <motion.div key={col.id} layout className={`p-4 rounded-2xl bg-white/[0.03] border border-white/15 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col justify-between group/card relative overflow-hidden transition-all duration-300 hover:border-white/30 ${isFirstCol ? "row-span-2 min-h-[360px]" : "row-span-1"}`}>
                        {/* Refleksi Kaca Cair (Liquid Glass Accent Top) */}
                        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/10 via-white/[0.02] to-transparent pointer-events-none" />

                        <div className="space-y-2.5 relative z-10">
                           {/* Header Kategori */}
                           <div className="flex items-center justify-between border-b border-white/10 pb-2">
                              <h4 className="text-xs font-semibold text-white tracking-wide drop-shadow-sm">{col.category}</h4>
                              <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                 <button onClick={() => openAddLink(col.id)} className="p-1 hover:text-orange-400 text-slate-400 rounded" title="Tambah Link">
                                    <Plus className="w-3.5 h-3.5" />
                                 </button>
                                 <button onClick={() => openEditGroup(col)} className="p-1 hover:text-slate-200 text-slate-400 rounded" title="Edit Grup">
                                    <Edit2 className="w-3.5 h-3.5" />
                                 </button>
                                 <button onClick={() => handleDeleteGroup(col.id)} className="p-1 hover:text-red-400 text-slate-400 rounded" title="Hapus Grup">
                                    <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                              </div>
                           </div>

                           {/* List Item Link */}
                           <div className="space-y-1">
                              <AnimatePresence mode="popLayout">
                                 {col.links.map((link, linkIdx) => (
                                    <AnimatedLinkItem key={link.id} link={link} groupId={col.id} index={linkIdx} onEdit={openEditLink} onDelete={handleDeleteLink} />
                                 ))}
                              </AnimatePresence>
                           </div>
                        </div>

                        <button onClick={() => openAddLink(col.id)} className="w-full py-1 border border-dashed border-white/15 hover:border-white/30 rounded-lg text-[10px] text-slate-400 hover:text-white transition-all opacity-0 group-hover/card:opacity-100 mt-2 relative z-10">
                           + Link Baru
                        </button>
                     </motion.div>
                  );
               })}

               {/* Card Tambah Grup Baru */}
               {currentPage === totalPages - 1 && paginatedGroups.length < ITEMS_PER_SLIDE && (
                  <motion.div onClick={openAddGroup} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="row-span-1 p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 hover:border-white/30 backdrop-blur-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.05] transition-all text-slate-400 hover:text-white min-h-[140px] space-y-1">
                     <Plus className="w-5 h-5 text-slate-300" />
                     <span className="text-xs font-medium">Tambah Grup Baru</span>
                  </motion.div>
               )}
            </motion.div>
         </AnimatePresence>

         {/* Pagination Slide Indicator */}
         {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-3 pt-2">
               <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="p-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 disabled:opacity-30 hover:text-white transition-colors">
                  <ChevronLeft className="w-4 h-4" />
               </button>
               <div className="flex space-x-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                     <div key={i} onClick={() => setCurrentPage(i)} className={`h-2 rounded-full cursor-pointer transition-all ${currentPage === i ? "bg-orange-500 w-4" : "bg-white/20 w-2 hover:bg-white/40"}`} />
                  ))}
               </div>
               <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="p-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 disabled:opacity-30 hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
               </button>
            </div>
         )}

         {/* Modal Edit / Add Beranimasi dengan Efek Glassmorphism */}
         <AnimatePresence>
            {modalType && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                  <motion.form initial={{ scale: 0.9, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 15 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onSubmit={modalType.includes("Group") ? handleSaveGroup : handleSaveLink} className="bg-slate-900/90 border border-white/20 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl backdrop-blur-2xl text-xs text-slate-200">
                     <div className="flex justify-between items-center border-b border-white/10 pb-2">
                        <h3 className="font-semibold text-white text-sm">
                           {modalType === "addGroup" && "Tambah Grup Workspace"}
                           {modalType === "editGroup" && "Edit Nama Grup"}
                           {modalType === "addLink" && "Tambah Link Baru"}
                           {modalType === "editLink" && "Edit Link"}
                        </h3>
                        <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">
                           <X className="w-4 h-4" />
                        </button>
                     </div>

                     {modalType.includes("Group") ? (
                        <div>
                           <label className="block text-slate-400 mb-1">Nama Kategori</label>
                           <input type="text" value={inputCategory} onChange={e => setInputCategory(e.target.value)} placeholder="Contoh: Design Tools" className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50" required />
                        </div>
                     ) : (
                        <div className="space-y-3">
                           <div>
                              <label className="block text-slate-400 mb-1">Nama Link</label>
                              <input type="text" value={inputLinkName} onChange={e => setInputLinkName(e.target.value)} placeholder="Contoh: Figma" className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50" required />
                           </div>
                           <div>
                              <label className="block text-slate-400 mb-1">URL Website</label>
                              <input type="text" value={inputLinkUrl} onChange={e => setInputLinkUrl(e.target.value)} placeholder="https://figma.com atau figma.com" className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50" required />
                           </div>
                        </div>
                     )}

                     <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={closeModal} className="px-3.5 py-1.5 bg-white/10 text-slate-300 rounded-xl font-medium hover:bg-white/20 transition-colors">
                           Batal
                        </button>
                        <button type="submit" className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors shadow-[0_0_12px_rgba(249,115,22,0.3)]">
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
