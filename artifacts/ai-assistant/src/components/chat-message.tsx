import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";
import { User } from "lucide-react";
import { motion } from "framer-motion";

interface ChatMessageProps {
  role: "user" | "assistant" | string;
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "flex w-full px-4 py-5 md:px-8",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-3xl w-full gap-3",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border"
              style={{ background: "#1e1a14", borderColor: "#3a3028", color: "#c8b89a" }}
            >
              <User size={15} />
            </div>
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden border shadow-lg"
              style={{ borderColor: "#e8a020", boxShadow: "0 0 12px rgba(232,160,32,0.2)" }}
            >
              <img
                src="/beefed-up-brand.png"
                alt="Maggie"
                className="w-full h-full object-cover scale-125"
              />
            </div>
          )}
        </div>

        {/* Message body */}
        <div
          className={cn(
            "flex flex-col min-w-0 flex-1",
            isUser ? "items-end" : "items-start pt-0.5"
          )}
        >
          {!isUser && (
            <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: "#e8a020" }}>
              Maggie
            </p>
          )}
          {isUser ? (
            <div
              className="px-5 py-3.5 rounded-3xl rounded-tr-sm whitespace-pre-wrap leading-relaxed text-sm border"
              style={{ background: "#1e1a14", color: "#f5f0e8", borderColor: "#2a2520" }}
            >
              {content}
            </div>
          ) : (
            <div className="w-full" style={{ color: "#d8cfc4" }}>
              <MarkdownRenderer content={content} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
