import { Bot, User, Copy, Check, FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Message, Attachment } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
}

const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden bg-muted/50 border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copiar
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );
};

const parseMarkdown = (content: string) => {
  const elements: React.ReactNode[] = [];
  const lines = content.split("\n");
  let currentCodeBlock: { language?: string; code: string[] } | null = null;
  let listItems: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (listItems) {
      const ListTag = listItems.type === "ol" ? "ol" : "ul";
      elements.push(
        <ListTag
          key={`list-${elements.length}`}
          className={cn(
            "my-2 pl-6 space-y-1",
            listItems.type === "ol" ? "list-decimal" : "list-disc"
          )}
        >
          {listItems.items.map((item, i) => (
            <li key={i} className="text-sm">
              {parseInline(item)}
            </li>
          ))}
        </ListTag>
      );
      listItems = null;
    }
  };

  const parseInline = (text: string): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    let remaining = text;
    let keyIndex = 0;

    // Pattern for inline elements: bold, code, links
    const patterns = [
      { regex: /\*\*(.+?)\*\*/g, render: (match: string) => <strong key={keyIndex++}>{match}</strong> },
      { regex: /`([^`]+)`/g, render: (match: string) => (
        <code key={keyIndex++} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">
          {match}
        </code>
      )},
      { regex: /\[([^\]]+)\]\(([^)]+)\)/g, render: (text: string, url: string) => (
        <a 
          key={keyIndex++} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {text}
        </a>
      )},
    ];

    // Process bold
    const boldParts = remaining.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{parseInlineCode(part.slice(2, -2))}</strong>;
      }
      return parseInlineCode(part);
    });
  };

  const parseInlineCode = (text: string): React.ReactNode[] => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">
            {part.slice(1, -1)}
          </code>
        );
      }
      return parseLinks(part);
    });
  };

  const parseLinks = (text: string): React.ReactNode => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start/end
    if (line.startsWith("```")) {
      if (currentCodeBlock) {
        elements.push(
          <CodeBlock
            key={`code-${elements.length}`}
            code={currentCodeBlock.code.join("\n")}
            language={currentCodeBlock.language}
          />
        );
        currentCodeBlock = null;
      } else {
        flushList();
        const language = line.slice(3).trim();
        currentCodeBlock = { language: language || undefined, code: [] };
      }
      continue;
    }

    // Inside code block
    if (currentCodeBlock) {
      currentCodeBlock.code.push(line);
      continue;
    }

    // Headers with icons
    if (line.startsWith("### ")) {
      flushList();
      const headerText = line.slice(4);
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-semibold mt-4 mb-2 text-foreground flex items-center gap-2">
          {headerText}
        </h3>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      const headerText = line.slice(3);
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-bold mt-4 mb-2 text-foreground">
          {headerText}
        </h2>
      );
      continue;
    }

    // Horizontal rule
    if (line.match(/^[-*_]{3,}$/)) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-4 border-border" />);
      continue;
    }

    // Tables
    if (line.includes("|") && line.trim().startsWith("|")) {
      flushList();
      const tableLines: string[] = [line];
      while (i + 1 < lines.length && lines[i + 1].includes("|")) {
        i++;
        tableLines.push(lines[i]);
      }
      
      const rows = tableLines
        .filter(l => !l.match(/^\|[-:| ]+\|$/))
        .map(l => l.split("|").filter(cell => cell.trim()).map(cell => cell.trim()));
      
      if (rows.length > 0) {
        elements.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  {rows[0].map((cell, ci) => (
                    <th key={ci} className="px-3 py-2 text-left font-semibold border border-border">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 border border-border">
                        {parseInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Unordered list
    if (line.match(/^[\s]*[-*]\s/)) {
      const item = line.replace(/^[\s]*[-*]\s/, "");
      if (!listItems || listItems.type !== "ul") {
        flushList();
        listItems = { type: "ul", items: [] };
      }
      listItems.items.push(item);
      continue;
    }

    // Ordered list
    if (line.match(/^[\s]*\d+\.\s/)) {
      const item = line.replace(/^[\s]*\d+\.\s/, "");
      if (!listItems || listItems.type !== "ol") {
        flushList();
        listItems = { type: "ol", items: [] };
      }
      listItems.items.push(item);
      continue;
    }

    // Blockquote
    if (line.startsWith(">")) {
      flushList();
      elements.push(
        <blockquote key={`quote-${i}`} className="border-l-4 border-primary/50 pl-4 my-2 italic text-muted-foreground">
          {parseInline(line.slice(1).trim())}
        </blockquote>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      flushList();
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="mb-2 text-sm leading-relaxed">
        {parseInline(line)}
      </p>
    );
  }

  flushList();

  return elements;
};

const MessageAttachments = ({ attachments, isUser }: { attachments: Attachment[]; isUser: boolean }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {attachments.map((attachment) => (
        <div key={attachment.id}>
          {attachment.type === "image" ? (
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-w-[200px] max-h-[200px] rounded-lg object-cover border border-border/50 hover:opacity-90 transition-opacity"
              />
            </a>
          ) : (
            <a
              href={attachment.url}
              download={attachment.name}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                isUser
                  ? "bg-white/20 hover:bg-white/30"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              <FileText className="w-4 h-4" />
              <span className="truncate max-w-[150px]">{attachment.name}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

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
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <MessageAttachments attachments={message.attachments} isUser={isUser} />
        )}
        
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            message.content ? <p className="mb-0 text-sm">{message.content}</p> : null
          ) : (
            parseMarkdown(message.content)
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
