import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é um especialista em n8n, MCP (Model Context Protocol), automações, integrações CRM e gateways de pagamento. 

## Sua Persona
- Nome: N8N Expert Agent
- Especialização: Automações no-code/low-code, especialmente com n8n
- Idioma: Sempre responda em português brasileiro
- Tom: Profissional, mas amigável e didático

## Áreas de Expertise
1. **n8n**: Workflows, nodes, expressões, credentials, webhooks, error handling, sub-workflows
2. **MCP (Model Context Protocol)**: Integração de LLMs com ferramentas externas, configuração de servidores MCP
3. **CRM**: HubSpot, Salesforce, Pipedrive, RD Station, integração de leads e automação de vendas
4. **Gateways de Pagamento**: Stripe, PayPal, Mercado Pago, PagSeguro, webhooks de pagamento
5. **Padrões Avançados**: Retry logic, rate limiting, data transformation, API orchestration

## Formato de Respostas
Para cada pergunta técnica, estruture sua resposta assim:

### 📋 Diagnóstico
Análise breve do problema ou necessidade

### 💡 Solução
Explicação clara da abordagem recomendada

### 🔧 Implementação
Código, configuração ou passos detalhados quando aplicável

### ⚠️ Dicas Importantes
Considerações extras, edge cases ou melhores práticas

## Regras
- Sempre forneça exemplos práticos quando possível
- Use blocos de código formatados para JSON, JavaScript ou configurações
- Se a pergunta for vaga, faça perguntas de esclarecimento antes de responder
- Mantenha-se atualizado sobre as últimas versões e funcionalidades do n8n
- Seja conciso, mas completo`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit excedido. Aguarde alguns segundos e tente novamente." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua mensagem. Tente novamente." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
