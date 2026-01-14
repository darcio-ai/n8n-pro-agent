import { useNavigate } from "react-router-dom";
import { Plus, MessageSquare, MoreHorizontal, Star, Pencil, FolderPlus, Trash2, PanelLeftClose } from "lucide-react";
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
  onToggleSidebar?: () => void;
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
  onToggleSidebar,
}: ChatSidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className="h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-sidebar-border flex items-center justify-between">
        <span className="font-semibold text-sidebar-foreground">Conversas</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={onToggleSidebar}
        >
          <PanelLeftClose className="w-4 h-4" />
        </Button>
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
        <div className="space-y-1 pb-3 overflow-x-hidden">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative w-full h-12 flex items-center gap-2 px-3 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conversation.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-[hsl(var(--n8n-coral))] hover:text-black"
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className={`min-w-0 flex-1 truncate pr-8 ${
                currentConversationId === conversation.id ? 'text-sidebar-active' : 'text-sidebar'
              }`}>
                {conversation.title}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-6 w-6 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 ease-in-out text-muted-foreground group-hover:text-black hover:bg-transparent"
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
