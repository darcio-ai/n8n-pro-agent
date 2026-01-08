import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 animate-fade-in-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
          isUser
            ? "bg-gradient-to-br from-primary to-n8n-coral-glow"
            : "bg-muted border border-border"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "flex-1 max-w-[80%] rounded-xl p-4",
          isUser
            ? "bg-gradient-to-br from-primary to-n8n-coral-glow text-primary-foreground ml-auto"
            : "bg-card border border-border text-card-foreground"
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {/* Render markdown-like content */}
          {message.content.split("\n").map((line, i) => {
            // Handle code blocks
            if (line.startsWith("```")) {
              return null; // Skip code block markers for now
            }
            
            // Handle headers
            if (line.startsWith("### ")) {
              return (
                <h3 key={i} className="text-base font-semibold mt-3 mb-2">
                  {line.replace("### ", "")}
                </h3>
              );
            }
            
            // Handle bold text
            if (line.includes("**")) {
              const parts = line.split(/\*\*(.*?)\*\*/g);
              return (
                <p key={i} className="mb-1">
                  {parts.map((part, j) =>
                    j % 2 === 1 ? (
                      <strong key={j}>{part}</strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </p>
              );
            }
            
            // Handle inline code
            if (line.includes("`")) {
              const parts = line.split(/`([^`]+)`/g);
              return (
                <p key={i} className="mb-1">
                  {parts.map((part, j) =>
                    j % 2 === 1 ? (
                      <code
                        key={j}
                        className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono"
                      >
                        {part}
                      </code>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </p>
              );
            }
            
            // Regular paragraph
            if (line.trim()) {
              return (
                <p key={i} className="mb-1">
                  {line}
                </p>
              );
            }
            
            return <br key={i} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
