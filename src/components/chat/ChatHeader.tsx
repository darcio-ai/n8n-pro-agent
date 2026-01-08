import { Zap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const ChatHeader = () => {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
      {/* Logo and title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-n8n-coral-glow flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-foreground">N8N Expert Agent</h1>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <ThemeToggle />
    </header>
  );
};

export default ChatHeader;
