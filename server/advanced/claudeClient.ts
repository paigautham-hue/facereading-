/**
 * Separate Claude API Client for Advanced Reading System
 * 
 * CRITICAL: This file is completely independent from server/_core/llm.ts
 * to ensure zero impact on the standard face reading system.
 */

import Anthropic from "@anthropic-ai/sdk";

// Lazy client initialization - create client when needed, not at module load
function getClient(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY;
  
  console.log("[Claude Client] Initializing client...", {
    hasKey: !!apiKey,
    keyPrefix: apiKey?.substring(0, 15),
    envKeys: Object.keys(process.env).filter(k => k.includes('CLAUDE'))
  });
  
  if (!apiKey) {
    throw new Error("CLAUDE_API_KEY environment variable is not set");
  }
  
  return new Anthropic({ apiKey });
}

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string | Array<{
    type: "text" | "image";
    text?: string;
    source?: {
      type: "base64" | "url";
      media_type?: string;
      data?: string;
      url?: string;
    };
  }>;
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function invokeClaude(params: {
  messages: ClaudeMessage[];
  maxTokens?: number;
  system?: string;
}): Promise<ClaudeResponse> {
  console.log("[Claude Client] invokeClaude called");
  
  // Create client on-demand (lazy initialization)
  const client = getClient();
  
  console.log("[Claude Client] Client created, making API call...");

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: params.maxTokens || 16000,
      messages: params.messages as any,
      ...(params.system ? { system: params.system } : {}),
    });

    console.log("[Claude Client] API call successful", {
      tokens: response.usage,
      stopReason: response.stop_reason
    });

    return response as unknown as ClaudeResponse;
  } catch (error: any) {
    console.error("[Claude API Error]", {
      message: error.message,
      status: error.status,
      type: error.type
    });
    throw new Error(`Claude API failed: ${error.message}`);
  }
}

