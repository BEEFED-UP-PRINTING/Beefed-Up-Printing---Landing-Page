import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music, ChevronDown, ChevronUp, Play, Pause,
  SkipBack, SkipForward, Volume2, VolumeX,
  Upload, Lock, Loader2, Trash2,
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string | null;
  durationSec: number | null;
}

const API = "https://bup-api.beefedupp.workers.dev";

function fmt(sec: number | null | undefined) {
  if (!sec || !isFinite(sec) || sec < 0) return "--:--";
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
}

interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function BoomboxPlaylist({ open, onOpenChange }: Props) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = open ?? internalExpanded;
  const setExpanded = (v: boolean) => { setInternalExpanded(v); onOpenChange?.(v); };

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  const [adminMode, setAdminMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("");
  const [uploadAudioUrl, setUploadAudioUrl] = useState("");
  const [uploadCoverUrl, setUploadCoverUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPressStart = () => { pressTimer.current = setTimeout(() => setShowPinModal(true), 2000); };
  const onPressEnd = () => { if (pressTimer.current) clearTimeout(pressTimer.current); };

  const fetchTracks = useCallback(async () => {
    setLoadingTracks(true);
    setFetchError(null);
    try {
      const res = await fetch(`${API}/api/player/tracks`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTracks(data.tracks ?? []);
    } catch {
      setFetchError("Couldn't load tracks");
    } finally {
      setLoadingTracks(false);
    }
  }, []);

  useEffect(() => { fetchTracks(); }, [fetchTracks]);

  useEffect(() => {
    try { if (sessionStorage.getItem("bup_admin") === "1") setAdminMode(true); } catch {}
  }, []);

  const track = tracks[index] ?? null;

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    el.src = track.audioUrl;
    el.load();
    if (playing) el.play().catch(() => setPlaying(false));
  }, [index, track?.audioUrl]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, []);

  const go = useCallback((delta: number) => {
    if (!tracks.length) return;
    setIndex(i => (i + delta + tracks.length) % tracks.length);
    setCurrent(0);
  }, [tracks.length]);

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  const submitPin = async () => {
    setPinError("");
    try {
      const res = await fetch(`${API}/api/player/admin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) { setPinError("Wrong PIN"); return; }
      setAdminMode(true);
      setShowPinModal(false);
      try { sessionStorage.setItem("bup_admin", "1"); } catch {}
    } catch {
      setPinError("Could not verify PIN");
    }
  };

  const handleUpload = async () => {
    if (!uploadTitle || !uploadArtist || !uploadAudioUrl) {
      setUploadError("Title, artist and audio URL are required");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const res = await fetch(`${API}/api/player/admin/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin, title: uploadTitle, artist: uploadArtist,
          audioUrl: uploadAudioUrl,
          coverUrl: uploadCoverUrl || null,
        }),
      });
      if (!res.ok) throw new Error();
      setUploadTitle(""); setUploadArtist(""); setUploadAudioUrl(""); setUploadCoverUrl("");
      setUploadSuccess(true);
      await fetchTracks();
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch {
      setUploadError("Upload failed. Check your PIN and try again.");
    } finally {
      setUploading(false);
    }
  };

  const deleteTrack = async (id: string) => {
    try {
      await fetch(`${API}/api/player/admin/tracks/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      await fetchTracks();
      setIndex(i => Math.min(i, Math.max(0, tracks.length - 2)));
    } catch {}
  };

  useEffect(() => {
    if (!expanded) return;
    const onDocClick = (e: MouseEvent) => {
      const container = document.getElementById("boombox-container");
      if (container && !container.contains(e.target as Node)) setExpanded(false);
    };
    const t = setTimeout(() => document.addEventListener("click", onDocClick), 300);
    return () => { clearTimeout(t); document.removeEventListener("click", onDocClick); };
  }, [expanded]);

  return (
    <div id="boombox-container" className="relative max-w-md mx-auto">
      {/* Trigger */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center gap-3 border border-zinc-800 bg-zinc-950 px-4 py-3 text-left"
        style={{ boxShadow: "0 0 20px rgba(249,115,22,0.05)" }}
      >
        <div
          className="relative w-9 h-9 shrink-0"
          onMouseDown={onPressStart} onMouseUp={onPressEnd}
          onMouseLeave={onPressEnd} onTouchStart={onPressStart} onTouchEnd={onPressEnd}
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute inset-0 rounded-full border border-zinc-700" />
          <div className="absolute inset-1 rounded-full bg-zinc-900 flex items-center justify-center">
            <Music size={14} className="text-primary" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[11px] font-display font-bold tracking-wider uppercase truncate">
            {track?.title ?? "BUP Studio Vibes"}
          </p>
          <p className="text-zinc-600 text-[10px] font-sans truncate">
            {track ? `${track.artist} · Tap to expand` : "Tap to open player"}
          </p>
        </div>
        {playing && (
          <span className="flex gap-0.5 items-end h-4 mr-1">
            {[1, 2, 3].map(i => (
              <span key={i} className="w-0.5 bg-orange-500 rounded-full animate-pulse"
                style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
        )}
        <span className="text-zinc-500">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </motion.button>

      {/* PIN Modal */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => { setShowPinModal(false); setPin(""); setPinError(""); }}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-72"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                <Lock size={16} className="text-orange-500" />
                <p className="text-white text-sm font-bold">Admin Access</p>
              </div>
              <input
                type="password" placeholder="Enter PIN" value={pin}
                onChange={e => setPin(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitPin()}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm mb-2 outline-none focus:border-orange-500"
              />
              {pinError && <p className="text-red-400 text-xs mb-2">{pinError}</p>}
              <button onClick={submitPin}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2 rounded-lg transition-colors">
                Unlock
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Player */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden border-x border-b border-zinc-800 bg-zinc-950"
          >
            {loadingTracks && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="text-orange-500 animate-spin" />
              </div>
            )}

            {!loadingTracks && fetchError && (
              <div className="px-4 py-6 text-center">
                <p className="text-zinc-500 text-xs">{fetchError}</p>
                <button onClick={fetchTracks} className="mt-2 text-orange-500 text-xs hover:text-orange-400">Retry</button>
              </div>
            )}

            {!loadingTracks && !fetchError && tracks.length === 0 && (
              <div className="px-4 py-6 text-center">
                <Music size={24} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-xs">No tracks yet.</p>
                {!adminMode && <p className="text-zinc-700 text-[10px] mt-1">Hold the music icon 2s to add tracks.</p>}
              </div>
            )}

            {!loadingTracks && !fetchError && track && (
              <>
                {/* Now Playing */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                  <div className="w-12 h-12 shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden flex items-center justify-center">
                    {track.coverUrl
                      ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      : <Music size={18} className="text-zinc-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold truncate">{track.title}</p>
                    <p className="text-zinc-500 text-[10px] truncate">{track.artist}</p>
                  </div>
                  <button onClick={toggle}
                    className="w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors shrink-0">
                    {playing
                      ? <Pause size={14} fill="white" className="text-white" />
                      : <Play size={14} fill="white" className="text-white ml-0.5" />}
                  </button>
                </div>

                {/* Scrubber */}
                <div className="px-4 pb-2">
                  <input type="range" min={0} max={duration || 0} step={0.1} value={current}
                    onChange={e => { const v = Number(e.target.value); if (audioRef.current) audioRef.current.currentTime = v; setCurrent(v); }}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #f97016 ${pct}%, #27272a ${pct}%)` }}
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
                    <span>{fmt(current)}</span><span>{fmt(duration || track.durationSec)}</span>
                  </div>
                </div>

                {/* Transport + Volume */}
                <div className="flex items-center justify-between px-4 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-1">
                    <button onClick={() => go(-1)} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800">
                      <SkipBack size={14} fill="currentColor" />
                    </button>
                    <button onClick={() => go(1)} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800">
                      <SkipForward size={14} fill="currentColor" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMuted(m => !m)} className="p-1.5 text-zinc-500 hover:text-white transition-colors">
                      {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    </button>
                    <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
                      onChange={e => { setVolume(Number(e.target.value)); setMuted(false); }}
                      className="w-16 h-1 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #f97016 ${(muted ? 0 : volume) * 100}%, #27272a ${(muted ? 0 : volume) * 100}%)` }}
                    />
                  </div>
                </div>

                {/* Track list */}
                {tracks.length > 1 && (
                  <div className="max-h-36 overflow-y-auto">
                    {tracks.map((t, i) => (
                      <div key={t.id}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${i === index ? "bg-zinc-900" : "hover:bg-zinc-900/50"}`}
                        onClick={() => { setIndex(i); setCurrent(0); setTimeout(() => { audioRef.current?.play().catch(() => {}); setPlaying(true); }, 50); }}
                      >
                        <span className={`text-[10px] w-4 text-center font-bold ${i === index ? "text-orange-500" : "text-zinc-600"}`}>
                          {i === index && playing ? "▶" : i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-semibold truncate ${i === index ? "text-orange-400" : "text-white"}`}>{t.title}</p>
                          <p className="text-[9px] text-zinc-600 truncate">{t.artist}</p>
                        </div>
                        {adminMode && (
                          <button onClick={e => { e.stopPropagation(); deleteTrack(t.id); }}
                            className="p-1 text-zinc-700 hover:text-red-400 transition-colors">
                            <Trash2 size={11} />
                          </button>
                        )}
                        <span className="text-[9px] text-zinc-700">{fmt(t.durationSec)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Admin Upload Panel */}
            {adminMode && (
              <div className="border-t border-zinc-800 px-4 py-3">
                <button onClick={() => setShowUpload(v => !v)}
                  className="flex items-center gap-2 text-orange-500 hover:text-orange-400 text-[10px] font-bold tracking-wider uppercase transition-colors mb-2">
                  <Upload size={12} />
                  {showUpload ? "Hide Upload" : "Add Track"}
                </button>
                {showUpload && (
                  <div className="space-y-2">
                    <input type="text" placeholder="Track title" value={uploadTitle}
                      onChange={e => setUploadTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-orange-500" />
                    <input type="text" placeholder="Artist name" value={uploadArtist}
                      onChange={e => setUploadArtist(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-orange-500" />
                    <input type="url" placeholder="Audio URL (MP3 direct link)" value={uploadAudioUrl}
                      onChange={e => setUploadAudioUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-orange-500" />
                    <input type="url" placeholder="Cover art URL (optional)" value={uploadCoverUrl}
                      onChange={e => setUploadCoverUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-orange-500" />
                    {uploadError && <p className="text-red-400 text-[10px]">{uploadError}</p>}
                    {uploadSuccess && <p className="text-green-400 text-[10px]">Track added!</p>}
                    <button onClick={handleUpload} disabled={uploading}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                      {uploading ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : "Add Track"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <audio ref={audioRef} preload="metadata"
              onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
              onEnded={() => go(1)}
              onTimeUpdate={e => setCurrent(e.currentTarget.currentTime)}
              onLoadedMetadata={e => setDuration(e.currentTarget.duration || 0)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}