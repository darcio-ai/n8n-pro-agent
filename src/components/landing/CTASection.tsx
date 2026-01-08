import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-n8n-coral-glow to-primary opacity-90" />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 n8n-grid-bg opacity-10" />

          <div className="relative px-8 py-16 md:px-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Pronto para automatizar?
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8 max-w-xl mx-auto">
              Inicie uma conversa agora e descubra como resolver seus desafios de automação com a ajuda de IA especializada.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/chat")}
              className="text-lg px-8 py-6 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform bg-background text-foreground hover:bg-background/90"
            >
              Iniciar Conversa
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
