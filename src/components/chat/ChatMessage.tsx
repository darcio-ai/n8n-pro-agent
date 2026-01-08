import { Bot, User, Copy, Check, FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Message, Attachment } from "@/types/chat";
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import python from 'highlight.js/lib/languages/python';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);

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

  const highlightedCode = useMemo(() => {
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      return code;
    }
  }, [code, language]);

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden">
      {/* Header - minimal, no border */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-800/80">
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 
            hover:text-zinc-700 dark:hover:text-zinc-200 
            opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      {/* Code - no border, subtle background */}
      <pre className="p-4 overflow-x-auto bg-zinc-50 dark:bg-zinc-900/60">
        <code 
          className="text-sm font-mono hljs"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
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
            "my-2 space-y-1.5",
            listItems.type === "ol" ? "list-decimal ml-6" : "list-disc ml-5"
          )}
        >
          {listItems.items.map((item, i) => (
            <li key={i} className="text-sm text-zinc-700 dark:text-zinc-300">
              {parseInline(item)}
            </li>
          ))}
        </ListTag>
      );
      listItems = null;
    }
  };

  const parseInline = (text: string): React.ReactNode[] => {
    // Process bold
    const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-foreground">{parseInlineCode(part.slice(2, -2))}</strong>;
      }
      return parseInlineCode(part);
    });
  };

  const parseInlineCode = (text: string): React.ReactNode[] => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code 
            key={i} 
            className="px-1.5 py-0.5 rounded text-xs font-mono bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
          >
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

    // Headers - simple bold, no border
    if (line.startsWith("### ")) {
      flushList();
      const headerText = line.slice(4);
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-semibold mt-5 mb-2 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          {headerText}
        </h3>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      const headerText = line.slice(3);
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-semibold mt-5 mb-2 text-zinc-900 dark:text-zinc-100">
          {headerText}
        </h2>
      );
      continue;
    }

    // Horizontal rule
    if (line.match(/^[-*_]{3,}$/)) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-4 border-zinc-200 dark:border-zinc-700" />);
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
          <div key={`table-${i}`} className="my-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800/50">
                  {rows[0].map((cell, ci) => (
                    <th key={ci} className="px-3 py-2 text-left font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b border-zinc-100 dark:border-zinc-800">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
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
        <blockquote 
          key={`quote-${i}`} 
          className="border-l-2 border-zinc-300 dark:border-zinc-600 pl-4 my-3 italic text-zinc-600 dark:text-zinc-400"
        >
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
      <p key={`p-${i}`} className="mb-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
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
                className="max-w-[200px] max-h-[200px] rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 hover:opacity-90 transition-opacity"
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
                  : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
            : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "flex-1 max-w-[80%] rounded-xl p-4",
          isUser
            ? "bg-gradient-to-br from-primary to-n8n-coral-glow text-primary-foreground ml-auto"
            : "bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100"
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
