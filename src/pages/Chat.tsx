import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import { ResponseStyle } from "@/components/chat/ResponseStyleSelector";
import { Bot, Zap, Plug, CreditCard, Repeat, Settings, Loader2 } from "lucide-react";
import { Message, Conversation, Attachment } from "@/types/chat";

interface QuickCategory {
  icon: React.ReactNode;
  title: string;
  description: string;
  suggestions: string[];
  color: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const MAX_CONTEXT_MESSAGES = 20;

const quickCategories: QuickCategory[] = [
  {
    icon: <Plug className="w-5 h-5" />,
    title: "MCP",
    description: "Model Context Protocol",
    color: "from-blue-500 to-cyan-500",
    suggestions: [
      "Como configurar MCP com n8n?",
      "Resolver timeout de MCP",
      "Autenticação MCP não funciona",
    ],
  },
  {
    icon: <Settings className="w-5 h-5" />,
    title: "CRM",
    description: "HubSpot, Salesforce, Pipedrive",
    color: "from-green-500 to-emerald-500",
    suggestions: [
      "Rate limit no HubSpot, como resolver?",
      "Sincronizar leads do Salesforce",
      "Integrar Pipedrive com n8n",
    ],
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: "Pagamentos",
    description: "Stripe, PayPal, MercadoPago",
    color: "from-purple-500 to-pink-500",
    suggestions: [
      "Verificar webhook signature do Stripe",
      "Integrar MercadoPago com n8n",
      "Processar pagamentos recorrentes",
    ],
  },
  {
    icon: <Repeat className="w-5 h-5" />,
    title: "Padrões",
    description: "Circuit Breaker, Retry, Saga",
    color: "from-orange-500 to-red-500",
    suggestions: [
      "Implementar circuit breaker no n8n",
      "Retry com exponential backoff",
      "Saga pattern para transações",
    ],
  },
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>(() => {
    return (localStorage.getItem("responseStyle") as ResponseStyle) || "normal";
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Save style preference
  const handleStyleChange = (style: ResponseStyle) => {
    setResponseStyle(style);
    localStorage.setItem("responseStyle", style);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversations from database
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("conversations")
          .select("*")
          .order("updated_at", { ascending: false });

        if (error) throw error;
        setConversations(data || []);
      } catch (error) {
        console.error("Error loading conversations:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as conversas.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, [user, toast]);

  // Load messages when selecting a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        attachments: (msg.attachments as unknown as Attachment[]) || undefined,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [toast]);

  const createConversation = async (title: string): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          title,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setConversations((prev) => [data, ...prev]);
      return data.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conversa.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast({
        title: "Mensagem excluída",
        description: "A mensagem foi removida com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a mensagem.",
        variant: "destructive",
      });
    }
  };

  const handleSelectConversation = async (id: string) => {
    setCurrentConversationId(id);
    await loadMessages(id);
  };

  const saveMessage = async (
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    attachments?: Attachment[]
  ) => {
    try {
      const attachmentsJson = attachments 
        ? JSON.parse(JSON.stringify(attachments)) 
        : [];
      
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        role,
        content,
        attachments: attachmentsJson,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const updateConversationTimestamp = async (conversationId: string) => {
    try {
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    } catch (error) {
      console.error("Error updating conversation timestamp:", error);
    }
  };

  const sendMessage = async (content: string, attachments?: Attachment[]) => {
    let conversationId = currentConversationId;

    if (!conversationId) {
      const title = content.length > 50 ? content.substring(0, 50) + "..." : content;
      conversationId = await createConversation(title || "Nova conversa");
      if (!conversationId) return;
      setCurrentConversationId(conversationId);
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      attachments,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Save user message to database
    await saveMessage(conversationId, "user", content, attachments);

    setIsLoading(true);
    let assistantContent = "";

    // Build multimodal message content for the API
    const buildMessageContent = (msg: Message) => {
      if (msg.attachments && msg.attachments.length > 0) {
        const parts: any[] = [];

        if (msg.content) {
          parts.push({ type: "text", text: msg.content });
        }

        msg.attachments
          .filter((a) => a.type === "image")
          .forEach((a) => {
            parts.push({
              type: "image_url",
              image_url: { url: a.url },
            });
          });

        msg.attachments
          .filter((a) => a.type === "file")
          .forEach((a) => {
            if (a.mimeType.startsWith("text/") || a.mimeType === "application/json") {
              try {
                const base64Content = a.url.split(",")[1];
                const decodedContent = atob(base64Content);
                parts.push({
                  type: "text",
                  text: `[Arquivo: ${a.name}]\n${decodedContent}`,
                });
              } catch {
                parts.push({ type: "text", text: `[Arquivo anexado: ${a.name}]` });
              }
            } else {
              parts.push({ type: "text", text: `[Arquivo anexado: ${a.name}]` });
            }
          });

        return parts.length === 1 && parts[0].type === "text" ? parts[0].text : parts;
      }
      return msg.content;
    };

    // Get context messages (limit to last N for API call)
    const allMessages = [...messages, userMessage];
    const contextMessages = allMessages.slice(-MAX_CONTEXT_MESSAGES);

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: contextMessages.map((m) => ({
            role: m.role,
            content: buildMessageContent(m),
          })),
          responseStyle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao enviar mensagem");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [
                  ...prev,
                  { id: `assistant-${Date.now()}`, role: "assistant", content: assistantContent },
                ];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message to database after streaming is complete
      if (assistantContent) {
        await saveMessage(conversationId, "assistant", assistantContent);
        await updateConversationTimestamp(conversationId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingConversations) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen bg-background">
      <ResizablePanel defaultSize={20} minSize={10} maxSize={40}>
        <ChatSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={80}>
        <div className="flex flex-col h-full overflow-hidden">
          <ChatHeader />

          <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
            <div className="max-w-4xl mx-auto py-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-n8n-coral-glow flex items-center justify-center mb-6 shadow-lg glow-coral">
                    <Zap className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-foreground">
                    Olá! Sou seu Expert em n8n
                  </h2>
                  <p className="text-muted-foreground max-w-md mb-8">
                    Especialista em workflows, integrações MCP, automações CRM e gateways de pagamento.
                    Escolha uma categoria ou faça sua pergunta!
                  </p>

                  {/* Quick Categories */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
                    {quickCategories.map((category) => (
                      <div
                        key={category.title}
                        className="group relative p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white`}
                          >
                            {category.icon}
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-foreground">{category.title}</h3>
                            <p className="text-xs text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {category.suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => sendMessage(suggestion)}
                              className="px-2.5 py-1 rounded-md bg-muted hover:bg-primary/10 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* General Suggestions */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "Como configurar um webhook no n8n?",
                      "Melhores práticas de error handling",
                      "Como debugar workflows complexos?",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} onDelete={handleDeleteMessage} />
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3 p-4">
                      <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-zinc-500 dark:text-zinc-400 animate-pulse" />
                      </div>
                      <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          <ChatInput 
            onSend={sendMessage} 
            isLoading={isLoading} 
            responseStyle={responseStyle}
            onStyleChange={handleStyleChange}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Chat;
