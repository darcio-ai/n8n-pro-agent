import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 n8n-grid-bg opacity-50" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-card border border-border mb-8 opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-n8n-coral-glow flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">N8N Expert Agent</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 opacity-0 animate-fade-in-up animate-delay-100" style={{ animationFillMode: "forwards" }}>
          Seu Especialista em{" "}
          <span className="gradient-text">Automações n8n</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in-up animate-delay-200" style={{ animationFillMode: "forwards" }}>
          IA avançada especializada em n8n, MCP, integrações CRM e gateways de pagamento. 
          Obtenha soluções práticas e código pronto para suas automações.
        </p>

        {/* CTA Button */}
        <div className="opacity-0 animate-fade-in-up animate-delay-300" style={{ animationFillMode: "forwards" }}>
          <Button
            size="lg"
            onClick={() => navigate("/chat")}
            className="btn-gradient text-lg px-8 py-6 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform"
          >
            <Zap className="w-5 h-5 mr-2" />
            Começar Agora
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
