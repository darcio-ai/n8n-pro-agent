import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import AttachmentPreview from "./AttachmentPreview";
import { ResponseStyleSelector, ResponseStyle } from "./ResponseStyleSelector";
import {
  Attachment,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_ATTACHMENTS,
} from "@/types/chat";

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  isLoading: boolean;
  responseStyle: ResponseStyle;
  onStyleChange: (style: ResponseStyle) => void;
}

const ChatInput = ({ onSend, isLoading, responseStyle, onStyleChange }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    const allAllowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_FILE_TYPES];
    
    if (!allAllowedTypes.includes(file.type)) {
      return `Tipo de arquivo não suportado: ${file.type || file.name.split('.').pop()}`;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo muito grande: ${file.name} (máx. 5MB)`;
    }
    
    return null;
  };

  const processFile = (file: File): Promise<Attachment> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        resolve({
          id: crypto.randomUUID(),
          type: isImage ? "image" : "file",
          name: file.name,
          url: reader.result as string,
          mimeType: file.type,
          size: file.size,
        });
      };
      
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = MAX_ATTACHMENTS - attachments.length;
    
    if (fileArray.length > remainingSlots) {
      toast({
        title: "Limite de anexos",
        description: `Você pode anexar no máximo ${MAX_ATTACHMENTS} arquivos por mensagem.`,
        variant: "destructive",
      });
      return;
    }

    const newAttachments: Attachment[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Arquivo inválido",
          description: error,
          variant: "destructive",
        });
        continue;
      }
      
      try {
        const attachment = await processFile(file);
        newAttachments.push(attachment);
      } catch (e) {
        toast({
          title: "Erro",
          description: `Não foi possível processar: ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      handleFiles(imageFiles);
    }
  }, [attachments.length]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachments.length > 0) && !isLoading) {
      onSend(input.trim(), attachments.length > 0 ? attachments : undefined);
      setInput("");
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Paste event listener
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener("paste", handlePaste);
      return () => textarea.removeEventListener("paste", handlePaste);
    }
  }, [handlePaste]);

  return (
    <form
      onSubmit={handleSubmit}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-4 border-t border-border bg-card transition-colors ${
        isDragging ? "bg-primary/5 border-primary" : ""
      }`}
    >
      {/* Drop zone indicator */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-lg pointer-events-none z-10">
          <p className="text-primary font-medium">Solte os arquivos aqui</p>
        </div>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="mb-3 border border-border rounded-lg bg-muted/30">
          <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />
        </div>
      )}

      <div className="flex gap-3 items-end">
        {/* Attachment button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_FILE_TYPES].join(",")}
          multiple
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || attachments.length >= MAX_ATTACHMENTS}
          className="h-12 w-12 rounded-xl flex-shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua pergunta ou cole/arraste imagens..."
          className="flex-1 resize-none min-h-[48px] max-h-[150px] bg-background"
          disabled={isLoading}
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={(!input.trim() && attachments.length === 0) || isLoading}
          className="btn-gradient h-12 w-12 rounded-xl flex-shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
      
      {/* Bottom bar with style selector */}
      <div className="flex items-center justify-between mt-2">
        <ResponseStyleSelector value={responseStyle} onChange={onStyleChange} />
        <p className="text-xs text-muted-foreground">
          Enter para enviar • Shift+Enter nova linha
        </p>
      </div>
    </form>
  );
};

export default ChatInput;
