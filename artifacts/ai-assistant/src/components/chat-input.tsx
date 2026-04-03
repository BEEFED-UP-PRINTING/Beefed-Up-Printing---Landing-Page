import { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative mx-auto max-w-3xl w-full px-2 pb-2">
      <div
        className="relative flex items-end rounded-2xl border shadow-lg transition-all p-2"
        style={{ background: "#141210", borderColor: "#2a2520" }}
        onFocusCapture={e => (e.currentTarget.style.borderColor = "#e8a020")}
        onBlurCapture={e => (e.currentTarget.style.borderColor = "#2a2520")}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Maggie anything..."
          className="w-full max-h-[200px] min-h-[44px] resize-none bg-transparent px-3 py-3 focus:outline-none scrollbar-thin text-sm"
          style={{ color: "#f5f0e8" }}
          rows={1}
          disabled={disabled}
        />
        <div className="p-1 mb-1 mr-1">
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 font-bold"
            )}
            style={
              input.trim() && !disabled
                ? { background: "#e8a020", color: "#0a0a0a" }
                : { background: "#1e1a14", color: "#4a4038", cursor: "not-allowed" }
            }
            onMouseEnter={e => {
              if (input.trim() && !disabled) (e.currentTarget.style.background = "#f0b030");
            }}
            onMouseLeave={e => {
              if (input.trim() && !disabled) (e.currentTarget.style.background = "#e8a020");
            }}
          >
            {disabled ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <ArrowUp size={17} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-[10px] font-medium" style={{ color: "#3a3028" }}>
          Maggie · Beefed Up Printing AI · Sharp sharp, but verify the details yourself
        </p>
      </div>
    </div>
  );
}
