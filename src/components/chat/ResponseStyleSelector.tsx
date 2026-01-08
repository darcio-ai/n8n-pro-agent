import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Feather, GraduationCap, Zap, MessageSquareText, Briefcase } from "lucide-react";

export type ResponseStyle = "normal" | "learning" | "concise" | "explanatory" | "formal";

interface ResponseStyleSelectorProps {
  value: ResponseStyle;
  onChange: (style: ResponseStyle) => void;
}

const styles = [
  { 
    id: "normal" as ResponseStyle, 
    label: "Normal", 
    icon: Feather, 
    description: "Respostas balanceadas" 
  },
  { 
    id: "learning" as ResponseStyle, 
    label: "Aprendizado", 
    icon: GraduationCap, 
    description: "Didático, passo a passo" 
  },
  { 
    id: "concise" as ResponseStyle, 
    label: "Conciso", 
    icon: Zap, 
    description: "Direto ao ponto" 
  },
  { 
    id: "explanatory" as ResponseStyle, 
    label: "Explicativo", 
    icon: MessageSquareText, 
    description: "Detalhado com contexto" 
  },
  { 
    id: "formal" as ResponseStyle, 
    label: "Formal", 
    icon: Briefcase, 
    description: "Tom profissional" 
  },
];

export const ResponseStyleSelector = ({ value, onChange }: ResponseStyleSelectorProps) => {
  const current = styles.find((s) => s.id === value) || styles[0];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-muted-foreground hover:text-foreground h-8 px-2"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="text-xs">{current.label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {styles.map((style) => {
          const Icon = style.icon;
          return (
            <DropdownMenuItem
              key={style.id}
              onClick={() => onChange(style.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm">{style.label}</span>
                  <span className="text-xs text-muted-foreground">{style.description}</span>
                </div>
              </div>
              {value === style.id && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ResponseStyleSelector;
