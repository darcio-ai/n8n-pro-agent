import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpecialtyBadgeProps {
  icon: LucideIcon;
  label: string;
  delay?: string;
}

const SpecialtyBadge = ({ icon: Icon, label, delay = "0" }: SpecialtyBadgeProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border",
        "hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300",
        "opacity-0 animate-scale-in",
        delay
      )}
      style={{ animationFillMode: "forwards" }}
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-n8n-green-glow flex items-center justify-center">
        <Icon className="w-5 h-5 text-secondary-foreground" />
      </div>
      <span className="font-medium text-card-foreground">{label}</span>
    </div>
  );
};

export default SpecialtyBadge;
