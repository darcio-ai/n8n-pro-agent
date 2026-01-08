import { forwardRef } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: string;
  showLeftConnector?: boolean;
  showRightConnector?: boolean;
}

const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon: Icon, title, description, delay = "0", showLeftConnector = false, showRightConnector = false }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "node-card p-6 opacity-0 animate-fade-in-up relative",
          delay
        )}
        style={{ animationFillMode: "forwards" }}
      >
        {/* Left connection point */}
        {showLeftConnector && (
          <div className="connection-point left bg-secondary" />
        )}

        {/* Right connection point */}
        {showRightConnector && (
          <div className="connection-point right bg-secondary" />
        )}

        {/* Icon container - styled like n8n node icon */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-n8n-coral-glow flex items-center justify-center mb-4 shadow-lg">
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>

        <h3 className="text-xl font-semibold mb-2 text-card-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

export default FeatureCard;
