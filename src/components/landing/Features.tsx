import { useRef } from "react";
import { Brain, Wrench, Shield } from "lucide-react";
import FeatureCard from "./FeatureCard";
import WorkflowConnections from "./WorkflowConnections";

const Features = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 opacity-0 animate-fade-in-up animate-delay-400" style={{ animationFillMode: "forwards" }}>
            Por que escolher nosso{" "}
            <span className="gradient-text">Agente Expert?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto opacity-0 animate-fade-in-up animate-delay-500" style={{ animationFillMode: "forwards" }}>
            Desenvolvido para resolver problemas complexos de automação com precisão e eficiência
          </p>
        </div>

        {/* Feature cards with connections */}
        <div ref={containerRef} className="relative">
          {/* SVG Connections with particles */}
          <WorkflowConnections
            containerRef={containerRef}
            card1Ref={card1Ref}
            card2Ref={card2Ref}
            card3Ref={card3Ref}
          />

          {/* Cards grid */}
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <FeatureCard
              ref={card1Ref}
              icon={Brain}
              title="Inteligência Contextual"
              description="Entende o contexto completo do seu workflow e oferece soluções personalizadas baseadas nas melhores práticas do n8n."
              delay="animate-delay-500"
              showRightConnector
            />
            <FeatureCard
              ref={card2Ref}
              icon={Wrench}
              title="Soluções Práticas"
              description="Código pronto para uso, exemplos detalhados e explicações passo a passo para implementar suas automações."
              delay="animate-delay-600"
              showLeftConnector
              showRightConnector
            />
            <FeatureCard
              ref={card3Ref}
              icon={Shield}
              title="Especialização Avançada"
              description="Domínio profundo em MCP, integrações CRM, gateways de pagamento e padrões avançados de automação."
              delay="animate-delay-700"
              showLeftConnector
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
