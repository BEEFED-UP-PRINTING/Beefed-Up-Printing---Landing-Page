import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";
import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";

interface ChatMessageProps {
  role: "user" | "assistant" | string;
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex w-full px-4 py-6 md:px-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-3xl w-full gap-4",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        <div
          className={cn(
            "flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm",
            isUser 
              ? "bg-zinc-800 border-zinc-700 text-zinc-200" 
              : "bg-zinc-100 border-zinc-200 text-zinc-900"
          )}
        >
          {isUser ? <User size={16} /> : <Bot size={18} />}
        </div>
        
        <div 
          className={cn(
            "flex flex-col min-w-0 flex-1",
            isUser ? "items-end" : "items-start pt-1"
          )}
        >
          {isUser ? (
            <div className="bg-zinc-800/80 text-zinc-100 px-5 py-3.5 rounded-3xl rounded-tr-sm whitespace-pre-wrap leading-relaxed shadow-sm border border-zinc-700/50">
              {content}
            </div>
          ) : (
            <div className="w-full">
              <MarkdownRenderer content={content} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
