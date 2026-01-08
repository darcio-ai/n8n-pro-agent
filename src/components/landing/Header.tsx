import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-n8n-coral-glow flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:inline">
            N8N Expert
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            onClick={() => navigate("/auth")}
            variant="outline"
            className="rounded-lg"
          >
            Entrar
          </Button>
          <Button
            onClick={() => navigate("/chat")}
            className="btn-gradient rounded-lg hidden sm:flex"
          >
            Começar
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
