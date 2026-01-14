import { useNavigate } from "react-router-dom";
import { Plus, MessageSquare, MoreHorizontal, Star, Pencil, FolderPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onRenameConversation?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onAddToProject?: (id: string) => void;
}

const ChatSidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onToggleFavorite,
  onAddToProject,
}: ChatSidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className="h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-sidebar-border">
        <span className="font-semibold text-sidebar-foreground">Conversas</span>
      </div>

      {/* New conversation button */}
      <div className="p-3">
        <Button
          onClick={onNewConversation}
          className="btn-gradient w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          <span className="ml-2">Nova Conversa</span>
        </Button>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-3">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conversation.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate text-sm">
                {conversation.title}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-sidebar-foreground hover:bg-sidebar-accent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border border-border z-50">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite?.(conversation.id);
                    }}
                    className="cursor-pointer"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Favoritar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameConversation?.(conversation.id);
                    }}
                    className="cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Mudar o nome
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToProject?.(conversation.id);
                    }}
                    className="cursor-pointer"
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Adicionar ao projeto
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                    className="text-red-400 focus:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Apagar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Back to home */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => navigate("/")}
        >
          ← Página inicial
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;
