/**
 * Separate Claude API Client for Advanced Reading System
 * 
 * CRITICAL: This file is completely independent from server/_core/llm.ts
 * to ensure zero impact on the standard face reading system.
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || "",
});

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string | Array<{
    type: "text" | "image";
    text?: string;
    source?: {
      type: "base64";
      media_type: string;
      data: string;
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
  if (!process.env.CLAUDE_API_KEY) {
    throw new Error("CLAUDE_API_KEY is not configured");
  }

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: params.maxTokens || 16000,
      messages: params.messages as any,
      ...(params.system ? { system: params.system } : {}),
    });

    return response as unknown as ClaudeResponse;
  } catch (error: any) {
    console.error("[Claude API Error]", error);
    throw new Error(`Claude API failed: ${error.message}`);
  }
}

