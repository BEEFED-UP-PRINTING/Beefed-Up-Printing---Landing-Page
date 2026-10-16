import { useRef, useState } from "react";

/**
 * MaggieUploadShare — File upload + WhatsApp share buttons for the Maggie chat.
 *
 * Props:
 *   onImageSelected  — callback(imageBase64: string) when the user picks a file
 *   lastImageBase64  — the most recent generated image (data:image/...base64) — enables the WhatsApp button
 *   apiBase          — your Worker origin, e.g. "https://bup-api.<sub>.workers.dev" or your custom domain
 *   authToken        — optional Bearer token if the user is logged in
 *   disabled         — disables both buttons (e.g. while a request is in-flight)
 */

interface MaggieUploadShareProps {
  onImageSelected: (imageBase64: string) => void;
  lastImageBase64?: string | null;
  apiBase: string;
  authToken?: string | null;
  disabled?: boolean;
}

export default function MaggieUploadShare({
  onImageSelected,
  lastImageBase64,
  apiBase,
  authToken,
  disabled = false,
}: MaggieUploadShareProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // ---- File upload: convert to base64 and pass to parent ----
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 6 MB limit to stay within Worker KV constraints
    if (file.size > 6 * 1024 * 1024) {
      setShareError("That image is too big — please pick one under 6 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (base64 && base64.startsWith("data:image/")) {
        onImageSelected(base64);
        setShareError(null);
      } else {
        setShareError("Could not read that image. Try a different one.");
      }
    };
    reader.onerror = () => setShareError("Could not read that image. Try a different one.");
    reader.readAsDataURL(file);

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ---- WhatsApp share: POST image to /api/share, open WhatsApp with the returned link ----
  async function handleWhatsAppShare() {
    if (!lastImageBase64) return;
    setSharing(true);
    setShareError(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const res = await fetch(`${apiBase}/api/share`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          image: lastImageBase64,
          message: "Check out my BUP design!",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Share failed");
      }

      const data = await res.json();
      if (data.success && data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
      } else {
        throw new Error("No share link returned");
      }
    } catch (err: any) {
      setShareError(err?.message || "Could not share right now. Try again.");
    } finally {
      setSharing(false);
    }
  }

  const hasImage = !!lastImageBase64;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 0.9rem",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
            background: disabled ? "#f3f4f6" : "#fff",
            color: disabled ? "#9ca3af" : "#1f2937",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload image
        </button>

        {/* WhatsApp share button — only shows when there's a generated image */}
        {hasImage && (
          <button
            type="button"
            onClick={handleWhatsAppShare}
            disabled={disabled || sharing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.5rem 0.9rem",
              borderRadius: "0.5rem",
              border: "none",
              background: disabled || sharing ? "#9ca3af" : "#25D366",
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: disabled || sharing ? "not-allowed" : "pointer",
            }}
          >
            {sharing ? (
              "Sharing…"
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                Share on WhatsApp
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Error feedback */}
      {shareError && (
        <p style={{ fontSize: "0.8rem", color: "#dc2626", margin: 0 }}>
          {shareError}
        </p>
      )}
    </div>
  );
}
