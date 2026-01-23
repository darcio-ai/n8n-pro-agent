import { Bot, User, Copy, Check, FileText, ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Message, Attachment } from "@/types/chat";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: Message;
  onDelete?: (messageId: string) => void;
}

const languageMap: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  md: 'markdown',
  zsh: 'bash',
  console: 'bash',
  terminal: 'bash',
};

// Auto-detect language from code content with aggressive detection
const detectLanguage = (code: string): string => {
  const trimmed = code.trim();
  const lines = trimmed.split('\n');
  const firstLine = lines[0]?.toLowerCase() || '';
  
  // JSON detection - more aggressive
  if ((trimmed.startsWith('{') || trimmed.startsWith('[')) ||
      firstLine.includes('"') && (trimmed.includes('":'))) {
    // Check if it looks like JSON structure
    if (/^\s*[\[{]/.test(trimmed) || /["']\w+["']\s*:/.test(trimmed)) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {
        // Might still be JSON-like, check for common patterns
        if (/["']\w+["']\s*:\s*["'\d\[{]/.test(trimmed)) {
          return 'json';
        }
      }
    }
  }
  
  // Bash/Shell detection - very aggressive
  const bashCommands = [
    'curl', 'wget', 'npm', 'yarn', 'pnpm', 'bun', 'cd', 'ls', 'mkdir', 'rm', 'cp', 'mv', 
    'cat', 'echo', 'export', 'source', 'chmod', 'chown', 'sudo', 'apt', 'apt-get', 'brew', 
    'pip', 'pip3', 'git', 'docker', 'kubectl', 'ssh', 'scp', 'tar', 'grep', 'awk', 'sed',
    'find', 'touch', 'head', 'tail', 'sort', 'uniq', 'wc', 'xargs', 'which', 'whereis',
    'man', 'less', 'more', 'vi', 'vim', 'nano', 'node', 'python', 'python3', 'ruby', 'go',
    'make', 'cmake', 'gcc', 'g++', 'rustc', 'cargo', 'deno', 'npx', 'bunx', 'pnpx'
  ];
  
  const bashPatterns = [
    /^\$\s/m,
    /^#!\s*\/bin\/(bash|sh|zsh)/,
    /\|\s*(grep|awk|sed|xargs|head|tail|sort|uniq|wc)/,
    /&&\s*(cd|npm|yarn|git|docker)/,
    /--[\w-]+/,
    /\$\{?\w+\}?/,
    /^\s*#\s+\w/m,
  ];
  
  // Check first word of any line against bash commands
  for (const line of lines) {
    const firstWord = line.trim().split(/\s+/)[0]?.toLowerCase();
    if (firstWord && bashCommands.includes(firstWord)) {
      return 'bash';
    }
  }
  
  if (bashPatterns.some(pattern => pattern.test(trimmed))) {
    return 'bash';
  }
  
  // JavaScript/TypeScript detection
  const jsPatterns = [
    /\b(const|let|var|function|async|await|import|export|class|extends|implements)\b/,
    /=>\s*[\({]/,
    /\.(then|catch|finally|map|filter|reduce|forEach)\(/,
    /console\.(log|error|warn|info|debug)/,
    /require\s*\(/,
    /module\.exports/,
    /new\s+\w+\(/,
    /\bthis\./,
  ];
  
  if (jsPatterns.some(pattern => pattern.test(trimmed))) {
    // Check if TypeScript
    if (/\b(interface|type|enum|:\s*(string|number|boolean|any|void|never|unknown|object)\b)/.test(trimmed) ||
        /<\w+(\s*,\s*\w+)*>/.test(trimmed)) {
      return 'typescript';
    }
    return 'javascript';
  }
  
  // Python detection
  const pythonPatterns = [
    /^(def|class|import|from|if\s+__name__|print\s*\(|async\s+def)\s/m,
    /:\s*$/m,
    /\bself\./,
    /^\s*(elif|except|finally|with|yield|lambda)\b/m,
    /^\s*@\w+/m,
    /\bNone\b/,
    /\bTrue\b|\bFalse\b/,
  ];
  
  if (pythonPatterns.some(pattern => pattern.test(trimmed))) {
    return 'python';
  }
  
  // SQL detection
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|FROM|WHERE|JOIN|TABLE|INDEX|INTO|VALUES|SET|ORDER\s+BY|GROUP\s+BY|HAVING|LIMIT|OFFSET)\b/i.test(trimmed)) {
    return 'sql';
  }
  
  // HTML/JSX detection
  if (/<[a-z][\s\S]*>/i.test(trimmed) && (/<\/[a-z]+>/i.test(trimmed) || /\/>/i.test(trimmed))) {
    // Check if it's JSX (has JS expressions)
    if (/\{[^}]+\}/.test(trimmed) && /className=/.test(trimmed)) {
      return 'jsx';
    }
    return 'html';
  }
  
  // CSS detection
  if (/[.#@][\w-]+\s*\{[\s\S]*\}/.test(trimmed) || 
      /@(media|keyframes|import|font-face)/.test(trimmed) ||
      /:\s*(flex|grid|block|inline|none|absolute|relative|fixed)/.test(trimmed)) {
    return 'css';
  }
  
  // YAML detection
  if (/^[\w-]+:\s*.+$/m.test(trimmed) && !trimmed.includes('{') && !trimmed.includes('(')) {
    return 'yaml';
  }
  
  // Markdown detection
  if (/^#{1,6}\s/.test(trimmed) || /^\*\*[^*]+\*\*/.test(trimmed) || /^[-*]\s/.test(trimmed)) {
    return 'markdown';
  }
  
  // Default to plaintext with basic highlighting
  return 'text';
};

const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  
  // Use provided language, map it, or auto-detect
  const detectedLanguage = language 
    ? (languageMap[language.toLowerCase()] || language.toLowerCase())
    : detectLanguage(code);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const customStyle: React.CSSProperties = {
    margin: 0,
    padding: '16px',
    fontSize: '13px',
    lineHeight: '20px',
    borderRadius: '0 0 8px 8px',
    fontFamily: 'Monaco, Menlo, Consolas, monospace',
    background: '#0a0a0a',
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden code-block" style={{ 
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: '#0a0a0a',
      position: 'relative'
    }}>
      {/* Header escuro */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: '#0f0f0f' }}>
        <span className="text-xs font-mono" style={{ color: '#9ca3af' }}>
          {detectedLanguage}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 text-xs transition-all duration-200",
            copied 
              ? "text-green-400" 
              : "text-zinc-400 hover:text-zinc-200"
          )}
          title={copied ? "Copiado!" : "Copiar código"}
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
      {/* Código com syntax highlighting */}
      <SyntaxHighlighter
        language={detectedLanguage}
        style={atomDark}
        customStyle={customStyle}
        showLineNumbers={false}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
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
            "my-2",
            listItems.type === "ol" ? "list-decimal ml-6" : "list-disc ml-5"
          )}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          {listItems.items.map((item, i) => (
            <li key={i} style={{ 
              fontSize: '15px', 
              lineHeight: '24px', 
              fontWeight: 400, 
              color: '#e5e5e5' 
            }}>
              <span style={{ fontWeight: 600, color: '#ffffff' }}></span>
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
            className="font-mono"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#f87171'
            }}
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
    
    // Normalize line for code block detection
    const trimmedLine = line.trim();
    // Normalize different types of backticks and remove zero-width characters
    const normalizedLine = trimmedLine
      .replace(/[`´''ˋ]/g, '`')  // Convert various quote/backtick types
      .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '');  // Remove zero-width and non-breaking spaces

    // Code block start/end - use regex for more robust detection
    const isCodeBlockDelimiter = /^`{3,}\s*\w*\s*$/.test(normalizedLine);
    
    if (isCodeBlockDelimiter) {
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
        // Extract language from the normalized line
        const langMatch = normalizedLine.match(/^`{3,}\s*(\w*)\s*$/);
        const language = langMatch?.[1] || undefined;
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
        <h3 key={`h3-${i}`} className="text-base flex items-center gap-2" style={{ 
          fontWeight: 600, 
          color: '#ffffff', 
          marginTop: '20px',
          marginBottom: '16px' 
        }}>
          {headerText}
        </h3>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      const headerText = line.slice(3);
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg" style={{ 
          fontWeight: 600, 
          color: '#ffffff', 
          marginTop: '20px',
          marginBottom: '16px' 
        }}>
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
      <p key={`p-${i}`} style={{ 
        fontSize: '15px', 
        fontWeight: 400, 
        lineHeight: '24px', 
        color: '#e5e5e5',
        marginBottom: '8px'
      }}>
        {parseInline(line)}
      </p>
    );
  }

  flushList();

  // Flush unclosed code block (handles streaming or incomplete responses)
  if (currentCodeBlock) {
    elements.push(
      <CodeBlock
        key={`code-${elements.length}`}
        code={currentCodeBlock.code.join("\n")}
        language={currentCodeBlock.language}
      />
    );
  }

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

const ChatMessage = ({ message, onDelete }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 animate-fade-in-up group/message",
        isUser ? "flex-row-reverse" : "flex-row chat-message-assistant"
      )}
      data-message-type={message.role}
      style={!isUser ? { background: 'transparent', backgroundColor: 'transparent' } : undefined}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
          isUser
            ? "bg-gradient-to-br from-primary to-n8n-coral-glow"
            : "bg-transparent border border-zinc-700"
        )}
        style={!isUser ? { background: 'transparent' } : undefined}
      >
        {isUser ? (
          <User className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-zinc-400" />
        )}
      </div>

      {/* Message content */}
      <div 
        className={cn("flex-1 max-w-[80%] relative", !isUser && "assistant-message")}
        style={!isUser ? { background: 'transparent', backgroundColor: 'transparent' } : undefined}
      >
        {isUser ? (
          <div className="rounded-xl p-4 bg-gradient-to-br from-primary to-n8n-coral-glow text-primary-foreground ml-auto">
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <MessageAttachments attachments={message.attachments} isUser={isUser} />
            )}
            {message.content && (
              <p className="mb-0" style={{ fontSize: '15px', fontWeight: 400, lineHeight: '24px' }}>
                {message.content}
              </p>
            )}
          </div>
        ) : (
          <div style={{ background: 'transparent', backgroundColor: 'transparent' }}>
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <MessageAttachments attachments={message.attachments} isUser={isUser} />
            )}
            <div className="max-w-none" style={{ background: 'transparent' }}>
              {parseMarkdown(message.content)}
            </div>
          </div>
        )}
        
        {/* Delete button */}
        {onDelete && (
          <button
            onClick={() => onDelete(message.id)}
            className={cn(
              "absolute top-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200",
              "p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-900/30",
              "text-zinc-400 hover:text-red-500 dark:hover:text-red-400",
              isUser ? "left-2" : "right-2"
            )}
            title="Excluir mensagem"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
