import { X, FileText, Image as ImageIcon } from "lucide-react";
import { Attachment } from "@/types/chat";

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
  readonly?: boolean;
}

const AttachmentPreview = ({ attachments, onRemove, readonly = false }: AttachmentPreviewProps) => {
  if (attachments.length === 0) return null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="relative group flex items-center gap-2 bg-muted rounded-lg p-2 border border-border"
        >
          {attachment.type === "image" ? (
            <div className="relative w-16 h-16 rounded overflow-hidden">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded bg-muted-foreground/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex flex-col min-w-0 max-w-[120px]">
            <span className="text-xs font-medium truncate text-foreground">
              {attachment.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatSize(attachment.size)}
            </span>
          </div>

          {!readonly && (
            <button
              onClick={() => onRemove(attachment.id)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default AttachmentPreview;
