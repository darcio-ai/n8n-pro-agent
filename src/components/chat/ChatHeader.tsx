import ThemeToggle from "@/components/ThemeToggle";
import orbithaLogo from "@/assets/orbitha-logo.jpeg";

const ChatHeader = () => {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
      {/* Logo and title */}
      <div className="flex items-center gap-3">
        <img 
          src={orbithaLogo} 
          alt="Orbitha" 
          className="w-9 h-9 rounded-lg object-cover" 
        />
        <div>
          <h1 className="font-bold text-foreground">N8N Expert Agent</h1>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs text-muted-foreground">by Orbitha • Online</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <ThemeToggle />
    </header>
  );
};

export default ChatHeader;
