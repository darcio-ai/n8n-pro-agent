export interface Attachment {
  id: string;
  type: "image" | "file";
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
export const ALLOWED_FILE_TYPES = ["application/pdf", "text/plain", "application/json", "text/markdown"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_ATTACHMENTS = 5;
