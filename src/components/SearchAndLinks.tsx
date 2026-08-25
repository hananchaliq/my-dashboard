"use client";

import React, { useState } from "react";
import { Search, Plus, Trash2, Globe } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { QuickLink } from "@/types";

const DEFAULT_LINKS: QuickLink[] = [
   { id: "1", title: "Google", url: "https://google.com" },
   { id: "2", title: "YouTube", url: "https://youtube.com" },
   { id: "3", title: "GitHub", url: "https://github.com" },
   { id: "4", title: "ChatGPT", url: "https://chatgpt.com" },
];

export default function SearchAndLinks() {
   const [query, setQuery] = useState("");
   const [links, setLinks] = useLocalStorage<QuickLink[]>("app_quick_links", DEFAULT_LINKS);
   const [isAdding, setIsAdding] = useState(false);
   const [newTitle, setNewTitle] = useState("");
   const [newUrl, setNewUrl] = useState("");

   const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
   };

   const getFaviconUrl = (urlStr: string) => {
      try {
         const parsed = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
         return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
      } catch {
         return "";
      }
   };

   const addLink = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTitle.trim() || !newUrl.trim()) return;

      let formattedUrl = newUrl.trim();
      if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
         formattedUrl = `https://${formattedUrl}`;
      }

      const newItem: QuickLink = {
         id: Date.now().toString(),
         title: newTitle.trim(),
         url: formattedUrl,
      };

      setLinks([...links, newItem]);
      setNewTitle("");
      setNewUrl("");
      setIsAdding(false);
   };

   const removeLink = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setLinks(links.filter(item => item.id !== id));
   };

   return (
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto space-y-6">
         {/* Search Bar */}
         <form onSubmit={handleSearch} className="w-full relative group">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search with Google..." className="w-full px-5 py-4 pl-12 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-lg transition-all" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
         </form>

         {/* Quick Links Grid */}
         <div className="flex flex-wrap items-center justify-center gap-4">
            {links.map(link => (
               <div key={link.id} className="relative group">
                  <a href={link.url} title={link.title} className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-slate-700 hover:scale-105 hover:bg-slate-800/60 transition-all shadow-md group">
                     <img
                        src={getFaviconUrl(link.url)}
                        alt={link.title}
                        className="w-7 h-7 object-contain"
                        onError={e => {
                           // Fallback jika icon gagal dimuat
                           (e.target as HTMLElement).style.display = "none";
                           (e.target as HTMLElement).nextElementSibling?.classList.remove("hidden");
                        }}
                     />
                     <Globe className="w-6 h-6 text-slate-400 hidden" />
                  </a>

                  {/* Remove Button */}
                  <button onClick={e => removeLink(link.id, e)} className="absolute -top-1 -right-1 p-1 bg-rose-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-600" title="Remove shortcut">
                     <Trash2 className="w-3 h-3" />
                  </button>
               </div>
            ))}

            {/* Add Button */}
            <button onClick={() => setIsAdding(true)} className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900/40 border border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-800/40 text-slate-400 hover:text-indigo-400 transition-all" title="Add Shortcut">
               <Plus className="w-6 h-6" />
            </button>
         </div>

         {/* Modal Add Link */}
         {isAdding && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <form onSubmit={addLink} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-xl">
                  <h3 className="text-lg font-semibold text-slate-100">Add New Shortcut</h3>
                  <input type="text" placeholder="Title (e.g. GitHub)" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500" required />
                  <input type="text" placeholder="URL (e.g. github.com)" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500" required />
                  <div className="flex justify-end space-x-2 pt-2">
                     <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm">
                        Cancel
                     </button>
                     <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">
                        Add Shortcut
                     </button>
                  </div>
               </form>
            </div>
         )}
      </div>
   );
}
