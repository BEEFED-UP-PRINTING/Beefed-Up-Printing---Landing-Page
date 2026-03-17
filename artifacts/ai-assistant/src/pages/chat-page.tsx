import { useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Sparkles } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { ChatInput } from "@/components/chat-input";
import { ChatMessage } from "@/components/chat-message";
import { useGetOpenaiConversation, useCreateOpenaiConversation } from "@workspace/api-client-react";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export function ChatPage() {
  const [match, params] = useRoute("/c/:id");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const activeId = match && params?.id ? parseInt(params.id, 10) : null;

  const { data: conversation, isLoading } = useGetOpenaiConversation(activeId as number, {
    query: { enabled: !!activeId },
  });

  const createMutation = useCreateOpenaiConversation();
  const { streamMessage, isStreaming } = useChatStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll on messages update
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, isStreaming]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    let targetId = activeId;

    // If we're on the new chat screen, create a conversation first
    if (!targetId) {
      const title = content.length > 50 ? content.slice(0, 47) + "..." : content;
      const newConv = await createMutation.mutateAsync({ data: { title } });
      targetId = newConv.id;
      
      // Navigate to the new conversation URL, but don't wait to start streaming
      setLocation(`/c/${newConv.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/openai/conversations"] });
    }

    // Stream the message to the target conversation
    if (targetId) {
      await streamMessage(targetId, content);
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden text-zinc-50">
      <Sidebar />
      
      <main className="flex flex-1 flex-col relative h-full min-w-0">
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {!activeId ? (
            // Empty State
            <div className="h-full flex flex-col items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center max-w-md text-center"
              >
                <div className="h-16 w-16 bg-zinc-100 text-zinc-950 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-white/5">
                  <Sparkles size={32} />
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-50 mb-3">
                  How can I help you today?
                </h1>
                <p className="text-zinc-400 text-base mb-8">
                  I can assist with writing, answering questions, or exploring new ideas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {["Explain quantum computing in simple terms", "Write a polite decline email", "Give me 5 unique startup ideas", "How do I center a div?"].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(suggestion)}
                      className="p-4 text-sm text-left border border-zinc-800 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 transition-all text-zinc-300 hover:text-zinc-50 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            // Chat View
            <div className="flex flex-col pb-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-20 text-zinc-500">
                  <Sparkles size={24} className="animate-pulse" />
                </div>
              ) : (
                <>
                  {conversation?.messages?.map((msg) => (
                    <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
                  ))}
                  {isStreaming && !conversation?.messages?.find(m => m.role === 'assistant' && m.content === '') && (
                    <div className="flex justify-start px-4 py-6 md:px-6">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200">
                        <Sparkles size={16} className="animate-pulse" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-4" />
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-6 pb-2 px-4 shrink-0">
          <ChatInput onSend={handleSend} disabled={isStreaming} />
        </div>
      </main>
    </div>
  );
}
