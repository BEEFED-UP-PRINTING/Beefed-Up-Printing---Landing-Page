import { Link, useLocation } from "wouter";
import { PlusCircle, MessageSquare, Trash2, LayoutPanelLeft } from "lucide-react";
import { useListOpenaiConversations, useDeleteOpenaiConversation } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Sidebar() {
  const [location] = useLocation();
  const { data: conversations, isLoading } = useListOpenaiConversations();
  const deleteMutation = useDeleteOpenaiConversation();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeId = location.startsWith("/c/") ? parseInt(location.split("/")[2], 10) : null;

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat?")) {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/openai/conversations"] });
      if (activeId === id) {
        window.location.href = "/";
      }
    }
  };

  if (!isSidebarOpen) {
    return (
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <LayoutPanelLeft size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-64 flex-col bg-[#09090B] border-r border-zinc-800/80 transition-all duration-300">
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <LayoutPanelLeft size={20} />
        </button>
        <Link href="/">
          <div className="flex flex-1 ml-2 items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white active:scale-[0.98] shadow-sm cursor-pointer">
            <PlusCircle size={16} />
            New chat
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3 pt-0 scrollbar-thin">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2 mt-4">
          Chat History
        </div>
        
        {isLoading ? (
          <div className="space-y-2 px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-zinc-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !conversations?.length ? (
          <div className="px-2 text-sm text-zinc-500 italic">No conversations yet</div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => {
              const isActive = activeId === conv.id;
              return (
                <Link key={conv.id} href={`/c/${conv.id}`}>
                  <div
                    className={cn(
                      "group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                      isActive
                        ? "bg-zinc-800 text-zinc-100 shadow-sm font-medium"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    )}
                  >
                    <MessageSquare size={16} className={isActive ? "text-zinc-100" : "text-zinc-500"} />
                    <div className="flex-1 truncate">
                      {conv.title || "New Conversation"}
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className={cn(
                        "opacity-0 transition-opacity hover:text-red-400 p-1 rounded-md hover:bg-zinc-700/50",
                        "group-hover:opacity-100"
                      )}
                      title="Delete chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
