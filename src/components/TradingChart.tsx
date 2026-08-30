"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { ArrowUpRight, ArrowDownRight, RefreshCw, TrendingUp, Play, Pause, SkipBack, SkipForward, Music, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Settings } from "@/types";

// ⚙️ KONFIGURASI SPOTIFY API (Sesuai Dashboard Kamu)
const CLIENT_ID = "2632fa1328df49f58e2d24b2c269ed1d";
const SCOPES = "streaming user-read-email user-read-private user-read-currently-playing user-read-playback-state user-modify-playback-state";

// Helper PKCE Code Generator
const generateRandomString = (length: number) => {
   const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   const values = crypto.getRandomValues(new Uint8Array(length));
   return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain: string) => {
   const encoder = new TextEncoder();
   const data = encoder.encode(plain);
   return window.crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input: ArrayBuffer) => {
   return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
};

interface DataPoint {
   time: string;
   price: number;
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

export default function SpotifyAndTradingWidget() {
   const [settings] = useLocalStorage<Settings>("app_settings", DEFAULT_SETTINGS);
   const { resolvedTheme, theme } = useTheme();
   const [isMounted, setIsMounted] = useState<boolean>(false);

   // Getting origin URL dynamic & strip trailing slash if present
   const getRedirectUri = () => {
      if (typeof window === "undefined") return "https://manalist-dash.vercel.app/";
      return window.location.origin.replace(/\/$/, "");
   };

   // --- SPOTIFY REAL API STATES ---
   const [accessToken, setAccessToken] = useState<string | null>(null);
   const [playback, setPlayback] = useState<any>(null);

   // 1. Tangkap Authorization Code & Exchange Token via PKCE
   useEffect(() => {
      setIsMounted(true);

      const initAuth = async () => {
         const urlParams = new URLSearchParams(window.location.search);
         const code = urlParams.get("code");
         const storedToken = localStorage.getItem("spotify_token");

         if (code && !storedToken) {
            const codeVerifier = localStorage.getItem("code_verifier");
            if (codeVerifier) {
               try {
                  const response = await fetch("https://accounts.spotify.com/api/token", {
                     method: "POST",
                     headers: { "Content-Type": "application/x-www-form-urlencoded" },
                     body: new URLSearchParams({
                        client_id: CLIENT_ID,
                        grant_type: "authorization_code",
                        code: code,
                        redirect_uri: getRedirectUri(),
                        code_verifier: codeVerifier,
                     }),
                  });

                  const data = await response.json();
                  if (data.access_token) {
                     localStorage.setItem("spotify_token", data.access_token);
                     setAccessToken(data.access_token);
                     window.history.replaceState({}, document.title, window.location.pathname);
                     return;
                  }
               } catch (err) {
                  console.error("Token exchange failed:", err);
               }
            }
         }

         setAccessToken(storedToken);
      };

      initAuth();
   }, []);

   // Handler Login Redirect dengan PKCE (response_type=code)
   const handleSpotifyLogin = async () => {
      const codeVerifier = generateRandomString(64);
      const hashed = await sha256(codeVerifier);
      const codeChallenge = base64encode(hashed);

      localStorage.setItem("code_verifier", codeVerifier);

      const params = new URLSearchParams({
         response_type: "code",
         client_id: CLIENT_ID,
         scope: SCOPES,
         code_challenge_method: "S256",
         code_challenge: codeChallenge,
         redirect_uri: getRedirectUri(),
         show_dialog: "true",
      });

      window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
   };

   const handleLogout = () => {
      localStorage.removeItem("spotify_token");
      localStorage.removeItem("code_verifier");
      setAccessToken(null);
      setPlayback(null);
   };

   // 2. Fetch Currently Playing Status secara Realtime
   const fetchCurrentlyPlaying = useCallback(async () => {
      if (!accessToken) return;

      try {
         // Gunakan endpoint currently-playing bawaan yang mendukung akun Free & Premium
         const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: { Authorization: `Bearer ${accessToken}` },
         });

         if (res.status === 401) {
            handleLogout();
            return;
         }

         if (res.status === 200) {
            const data = await res.json();
            if (data && data.item) {
               setPlayback(data);
            } else {
               setPlayback(null);
            }
         } else {
            setPlayback(null);
         }
      } catch (err) {
         console.error("Fetch Error:", err);
      }
   }, [accessToken]);
   useEffect(() => {
      if (!accessToken) return;

      // Cast window ke any agar TypeScript mengizinkan akses ke SDK Spotify
      const customWindow = window as any;

      customWindow.onSpotifyWebPlaybackSDKReady = () => {
         const player = new customWindow.Spotify.Player({
            name: "Manalist Web Player",
            getOAuthToken: (cb: (token: string) => void) => {
               cb(accessToken);
            },
            volume: 0.5,
         });

         player.addListener("player_state_changed", (state: any) => {
            if (!state) return;
            setPlayback({
               is_playing: !state.paused,
               progress_ms: state.position,
               item: state.track_window.current_track,
            });
         });

         player.connect();
      };
   }, [accessToken]);

   // Remote Control Track
   const controlPlayback = async (action: "play" | "pause" | "next" | "previous") => {
      if (!accessToken) return;
      const endpoints: Record<string, { url: string; method: string }> = {
         play: { url: "https://api.spotify.com/v1/me/player/play", method: "PUT" },
         pause: { url: "https://api.spotify.com/v1/me/player/pause", method: "PUT" },
         next: { url: "https://api.spotify.com/v1/me/player/next", method: "POST" },
         previous: { url: "https://api.spotify.com/v1/me/player/previous", method: "POST" },
      };

      const target = endpoints[action];
      try {
         await fetch(target.url, {
            method: target.method,
            headers: { Authorization: `Bearer ${accessToken}` },
         });
         setTimeout(fetchCurrentlyPlaying, 500);
      } catch (err) {
         console.error("Control playback failed:", err);
      }
   };

   // --- STATE TRADING CHART ---
   const [data, setData] = useState<DataPoint[]>([]);
   const [currentPrice, setCurrentPrice] = useState<number>(0);
   const [percentageChange, setPercentageChange] = useState<number>(0);
   const [stats, setStats] = useState({ open: 0, high: 0, low: 0, prevClose: 0 });
   const [lastUpdate, setLastUpdate] = useState<string>("");
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const priceRef = useRef<number>(0);

   const activeSettings = isMounted ? settings : DEFAULT_SETTINGS;

   const fetchRealData = useCallback(async () => {
      try {
         const res = await fetch("https://open.er-api.com/v6/latest/USD");
         if (!res.ok) throw new Error("Fetch failed");

         const result = await res.json();
         const realPrice = Number(result.rates.IDR);

         if (priceRef.current === 0) {
            priceRef.current = realPrice;
            setCurrentPrice(realPrice);
            setStats({ open: realPrice, high: realPrice, low: realPrice, prevClose: realPrice });
         }
      } catch (err) {
         console.error("Fetch error:", err);
      } finally {
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchRealData();
      const apiInterval = setInterval(() => fetchRealData(), 30000);

      const tickInterval = setInterval(() => {
         if (priceRef.current === 0) return;

         const now = new Date();
         const timeString = now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
         });

         const delta = (Math.random() - 0.49) * 9;
         const newPrice = Number((priceRef.current + delta).toFixed(2));

         priceRef.current = newPrice;
         setCurrentPrice(newPrice);
         setLastUpdate(timeString);

         setStats(prev => {
            const openVal = prev.open === 0 ? newPrice : prev.open;
            const highVal = Math.max(prev.high === 0 ? newPrice : prev.high, newPrice);
            const lowVal = Math.min(prev.low === 0 ? newPrice : prev.low, newPrice);
            const prevCloseVal = prev.prevClose === 0 ? newPrice : prev.prevClose;

            const pChange = prevCloseVal > 0 ? Number((((newPrice - prevCloseVal) / prevCloseVal) * 100).toFixed(2)) : 0;
            setPercentageChange(pChange);

            return { open: openVal, high: highVal, low: lowVal, prevClose: prevCloseVal };
         });

         setData(prevData => {
            const updated = [...prevData, { time: timeString, price: newPrice }];
            if (updated.length > 30) return updated.slice(1);
            return updated;
         });
      }, 1000);

      return () => {
         clearInterval(apiInterval);
         clearInterval(tickInterval);
      };
   }, [fetchRealData]);

   if (!isMounted) {
      return (
         <div className="w-full max-w-sm h-full min-h-[550px] flex flex-col gap-3">
            <div className="flex-1 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-slate-900/50 animate-pulse" />
            <div className="flex-1 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-slate-900/50 animate-pulse" />
         </div>
      );
   }

   const currentTheme = resolvedTheme || theme || "dark";
   const isDark = currentTheme === "dark";

   const formatPrice = (val: number) => {
      if (!val) return "0";
      return val.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
   };

   const isPositive = percentageChange >= 0;
   const isLiquidEnabled = activeSettings.enableLiquidGlass ?? true;
   const glassOpacity = (activeSettings.glassOpacity ?? 40) / 100;
   const glassBlur = activeSettings.glassBlur ?? 12;

   const liquidGlassStyle: React.CSSProperties = isLiquidEnabled
      ? {
           backgroundColor: isDark ? `rgba(15, 23, 42, ${glassOpacity})` : `rgba(255, 255, 255, ${glassOpacity})`,
           backdropFilter: `blur(${glassBlur}px) saturate(180%)`,
           WebkitBackdropFilter: `blur(${glassBlur}px) saturate(180%)`,
        }
      : {
           backgroundColor: isDark ? "#0d1117" : "#ffffff",
        };

   const isPlaying = playback?.is_playing ?? false;
   const track = playback?.item;
   const progressMs = playback?.progress_ms ?? 0;
   const durationMs = track?.duration_ms ?? 1;

   const formatMs = (ms: number) => {
      const totalSec = Math.floor(ms / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return `${m}:${s < 10 ? "0" : ""}${s}`;
   };

   return (
      <div className="w-full max-w-sm h-full flex flex-col gap-3 select-none">
         {/* ================= SPOTIFY REALTIME PLAYER ================= */}
         <div style={liquidGlassStyle} className={`relative group overflow-hidden p-4 rounded-3xl border transition-all duration-300 flex-1 flex flex-col justify-between ${isDark ? "border-white/15 text-white shadow-xl" : "border-slate-200/80 text-slate-900 shadow-md"}`}>
            {track?.album?.images[0]?.url && <div className="absolute inset-0 bg-cover bg-center opacity-25 blur-2xl pointer-events-none scale-125 transition-all duration-700" style={{ backgroundImage: `url(${track.album.images[0].url})` }} />}

            <div className="flex items-center justify-between shrink-0 relative z-10">
               <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-black/20 border border-white/10 backdrop-blur-md">
                  <Music className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold tracking-wider text-emerald-400">SPOTIFY CONNECTED</span>
               </div>

               {accessToken && (
                  <button onClick={handleLogout} title="Logout" className="p-1 hover:text-rose-400 transition-colors">
                     <LogOut className="w-3.5 h-3.5 opacity-60" />
                  </button>
               )}
            </div>

            {!accessToken ? (
               <div className="flex-1 flex flex-col items-center justify-center space-y-3 relative z-10">
                  <p className="text-xs text-center opacity-70">Hubungkan widget ke akun Spotify kamu</p>
                  <button onClick={handleSpotifyLogin} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-full transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                     Connect Spotify
                  </button>
               </div>
            ) : !track ? (
               <div className="flex-1 flex flex-col items-center justify-center space-y-1 relative z-10 text-center">
                  <p className="text-xs font-semibold">Tidak ada lagu diputar</p>
                  <p className="text-[10px] opacity-60">Buka aplikasi Spotify di HP/PC & putar lagu</p>
               </div>
            ) : (
               <>
                  <div className="flex items-center space-x-3 relative z-10 my-1">
                     <img src={track.album.images[0]?.url} alt={track.name} className="w-14 h-14 rounded-2xl object-cover shadow-xl border border-white/10 shrink-0" />
                     <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold truncate tracking-wide">{track.name}</h3>
                        <p className={`text-[10px] truncate mt-0.5 ${isDark ? "text-slate-300/80" : "text-slate-600"}`}>{track.artists.map((a: any) => a.name).join(", ")}</p>
                        <p className="text-[9px] truncate opacity-50 font-mono mt-0.5">{track.album.name}</p>
                     </div>
                  </div>

                  <div className="space-y-1 relative z-10">
                     <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${(progressMs / durationMs) * 100}%` }} />
                     </div>
                     <div className="flex justify-between text-[9px] font-mono opacity-60">
                        <span>{formatMs(progressMs)}</span>
                        <span>{formatMs(durationMs)}</span>
                     </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4 relative z-10 shrink-0">
                     <button onClick={() => controlPlayback("previous")} className="hover:scale-110 active:scale-95 transition-all opacity-80">
                        <SkipBack className="w-4 h-4 fill-current" />
                     </button>
                     <button onClick={() => controlPlayback(isPlaying ? "pause" : "play")} className="p-2.5 rounded-full bg-emerald-500 text-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/30">
                        {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                     </button>
                     <button onClick={() => controlPlayback("next")} className="hover:scale-110 active:scale-95 transition-all opacity-80">
                        <SkipForward className="w-4 h-4 fill-current" />
                     </button>
                  </div>
               </>
            )}
         </div>

         {/* ================= TRADING CHART ================= */}
         <div style={liquidGlassStyle} className={`relative group overflow-hidden p-3.5 rounded-3xl border transition-all duration-300 flex-1 flex flex-col justify-between space-y-2 ${isDark ? "border-white/15 text-white shadow-xl" : "border-slate-200/80 text-slate-900 shadow-md"}`}>
            {isLiquidEnabled && <div className={`absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-3xl ${isDark ? "bg-gradient-to-b from-white/10 to-transparent" : "bg-gradient-to-b from-white/60 to-transparent"}`} />}

            <div className="flex items-center justify-between shrink-0 relative z-10">
               <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-xl border backdrop-blur-md ${isDark ? "bg-white/10 border-white/15 text-white" : "bg-slate-100/90 border-slate-200 text-slate-900"}`}>
                     <TrendingUp className={`w-3.5 h-3.5 ${isPositive ? "text-emerald-400" : "text-rose-400"}`} />
                     <h2 className="text-xs font-bold tracking-wide">USD/IDR</h2>
                  </div>
                  <div className={`flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md ${isPositive ? (isDark ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" : "text-emerald-700 bg-emerald-100 border-emerald-300") : isDark ? "text-rose-300 bg-rose-500/10 border-rose-500/30" : "text-rose-700 bg-rose-100 border-rose-300"}`}>
                     {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                     <span>{isPositive ? `+${percentageChange}%` : `${percentageChange}%`}</span>
                  </div>
               </div>
               <div className="flex items-center space-x-1 text-[10px]">
                  <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
                  <span className={isDark ? "text-slate-300" : "text-slate-600"}>{lastUpdate || "--:--"}</span>
               </div>
            </div>

            <div className="shrink-0 flex items-baseline space-x-1 relative z-10">
               {isLoading ? <span className="text-lg font-bold text-slate-400 animate-pulse">Memuat...</span> : <span className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{formatPrice(currentPrice)}</span>}
               <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>IDR</span>
            </div>

            <div className={`flex-1 min-h-[80px] w-full rounded-xl p-1 border backdrop-blur-md relative z-10 ${isDark ? "bg-white/[0.02] border-white/10" : "bg-slate-100/60 border-slate-200"}`}>
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 2, right: 2, left: -25, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorDynamicParent" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.4} />
                           <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.0} />
                        </linearGradient>
                     </defs>
                     <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: isDark ? "#cbd5e1" : "#64748b", fontSize: 8 }} interval="preserveStartEnd" />
                     <YAxis domain={["dataMin - 5", "dataMax + 5"]} axisLine={false} tickLine={false} tick={{ fill: isDark ? "#cbd5e1" : "#64748b", fontSize: 8 }} orientation="left" />
                     <Tooltip
                        contentStyle={{
                           backgroundColor: isDark ? "rgba(15, 20, 32, 0.9)" : "rgba(255, 255, 255, 0.95)",
                           borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(226, 232, 240, 0.8)",
                           borderRadius: "0.5rem",
                           fontSize: "10px",
                           padding: "4px 8px",
                           color: isDark ? "#f8fafc" : "#0f172a",
                        }}
                        formatter={(value: any) => [`${formatPrice(Number(value))} IDR`, "Kurs"]}
                     />
                     <Area type="monotone" dataKey="price" stroke={isPositive ? "#10b981" : "#f43f5e"} strokeWidth={1.5} fillOpacity={1} fill="url(#colorDynamicParent)" isAnimationActive={true} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>

            <div className={`shrink-0 border rounded-xl p-1.5 grid grid-cols-4 gap-1 text-[8px] backdrop-blur-md relative z-10 text-center ${isDark ? "bg-white/[0.04] border-white/10" : "bg-slate-100/80 border-slate-200"}`}>
               <div>
                  <p className={isDark ? "text-slate-400" : "text-slate-500"}>Open</p>
                  <p className="font-semibold truncate">{formatPrice(stats.open)}</p>
               </div>
               <div>
                  <p className={isDark ? "text-slate-400" : "text-slate-500"}>High</p>
                  <p className="font-semibold truncate text-emerald-400">{formatPrice(stats.high)}</p>
               </div>
               <div>
                  <p className={isDark ? "text-slate-400" : "text-slate-500"}>Low</p>
                  <p className="font-semibold truncate text-rose-400">{formatPrice(stats.low)}</p>
               </div>
               <div>
                  <p className={isDark ? "text-slate-400" : "text-slate-500"}>Prev</p>
                  <p className="font-semibold truncate">{formatPrice(stats.prevClose)}</p>
               </div>
            </div>
         </div>
      </div>
   );
}
