interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function BoomboxPlaylist(_props: Props) {
  return (
    <div style={{ width: "100%" }}>
      <iframe
        src="https://bup-studio-pf43vzta.teamily.run/embed"
        width="100%"
        height="168"
        style={{ border: 0, display: 'block' }}
        title="BUP Now Playing"
        loading="lazy"
        allow="autoplay"
      />
    </div>
  );
}
