import { Cpu, Users, CreditCard, Sparkles } from "lucide-react";
import SpecialtyBadge from "./SpecialtyBadge";

const Specialties = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 opacity-0 animate-fade-in-up animate-delay-400" style={{ animationFillMode: "forwards" }}>
            Áreas de <span className="gradient-text">Especialização</span>
          </h2>
          <p className="text-muted-foreground text-lg opacity-0 animate-fade-in-up animate-delay-500" style={{ animationFillMode: "forwards" }}>
            Conhecimento profundo nas tecnologias mais demandadas
          </p>
        </div>

        {/* Specialty badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SpecialtyBadge
            icon={Cpu}
            label="MCP Integration"
            delay="animate-delay-500"
          />
          <SpecialtyBadge
            icon={Users}
            label="CRM Automation"
            delay="animate-delay-600"
          />
          <SpecialtyBadge
            icon={CreditCard}
            label="Payment Gateways"
            delay="animate-delay-700"
          />
          <SpecialtyBadge
            icon={Sparkles}
            label="Advanced Patterns"
            delay="animate-delay-800"
          />
        </div>
      </div>
    </section>
  );
};

export default Specialties;
