import { useImperativeHandle, useRef, forwardRef } from "react";

export interface AudioPlayerHandle {
  triggerPlay: () => void;
  start: (offsetSeconds?: number) => void;
}

const AudioPlayer = forwardRef<AudioPlayerHandle>((_, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useImperativeHandle(ref, () => ({
    triggerPlay() {
      const audio = audioRef.current;
      if (!audio) return;
      audio.muted = false;
      audio.play().catch(() => {});
    },
    start(offsetSeconds = 1) {
      const audio = audioRef.current;
      if (!audio) return;
      try {
        audio.currentTime = offsetSeconds;
      } catch {}
      audio.muted = false;
      audio.play().catch(() => {});
    },
  }));

  return (
    <audio
      ref={audioRef}
      src={`${import.meta.env.BASE_URL}music.mp3`}
      loop
      preload="auto"
    />
  );
});

AudioPlayer.displayName = "AudioPlayer";
export default AudioPlayer;
