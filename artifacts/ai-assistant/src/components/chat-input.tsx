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
    <div className="relative mx-auto max-w-3xl w-full p-4">
      <div className="relative flex items-end rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg shadow-black/20 focus-within:ring-1 focus-within:ring-zinc-600 transition-all p-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Assistant..."
          className="w-full max-h-[200px] min-h-[44px] resize-none bg-transparent px-3 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none scrollbar-thin"
          rows={1}
          disabled={disabled}
        />
        <div className="p-1 mb-1 mr-1">
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
              input.trim() && !disabled
                ? "bg-zinc-100 text-zinc-900 hover:bg-white shadow-sm hover:shadow active:scale-95"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            )}
          >
            {disabled ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowUp size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
      <div className="text-center mt-3">
        <p className="text-[11px] text-zinc-500 font-medium">
          Assistant can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
