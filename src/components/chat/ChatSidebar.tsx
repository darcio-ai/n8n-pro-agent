import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

const ChatSidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ChatSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="h-full w-full bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      {/* Header */}
      <div className="p-3 border-b border-sidebar-border flex items-center justify-between">
        {!isCollapsed && (
          <span className="font-semibold text-sidebar-foreground">Conversas</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* New conversation button */}
      <div className="p-3">
        <Button
          onClick={onNewConversation}
          className={cn(
            "btn-gradient w-full justify-center",
            isCollapsed ? "px-0" : ""
          )}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Nova Conversa</span>}
        </Button>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-3">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "grid grid-cols-[16px_minmax(0,1fr)_28px] items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors",
                currentConversationId === conversation.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate text-sm min-w-0">
                {conversation.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 justify-self-end text-red-400 hover:text-red-500 hover:bg-red-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conversation.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Back to home */}
      {!isCollapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => navigate("/")}
          >
            ← Página inicial
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
