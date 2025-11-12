/**
 * OpenAI API Client for Advanced Reading System
 * 
 * Uses built-in OPENAI_API_KEY which is already configured in production
 */

import OpenAI from "openai";

// Lazy client initialization
function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;
  
  console.log("[OpenAI Client] Initializing client...", {
    hasKey: !!apiKey,
    hasBaseURL: !!baseURL,
    keyPrefix: apiKey?.substring(0, 15),
  });
  
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  
  return new OpenAI({ 
    apiKey,
    ...(baseURL ? { baseURL } : {})
  });
}

export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{
    type: "text" | "image_url";
    text?: string;
    image_url?: {
      url: string;
      detail?: "auto" | "low" | "high";
    };
  }>;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function invokeOpenAI(params: {
  messages: OpenAIMessage[];
  maxTokens?: number;
}): Promise<OpenAIResponse> {
  console.log("[OpenAI Client] invokeOpenAI called");
  
  // Create client on-demand (lazy initialization)
  const client = getClient();
  
  console.log("[OpenAI Client] Client created, making API call...");

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: params.maxTokens || 16000,
      messages: params.messages as any,
    });

    console.log("[OpenAI Client] API call successful", {
      tokens: response.usage,
      finishReason: response.choices[0]?.finish_reason
    });

    return response as OpenAIResponse;
  } catch (error: any) {
    console.error("[OpenAI API Error]", {
      message: error.message,
      status: error.status,
      type: error.type
    });
    throw new Error(`OpenAI API failed: ${error.message}`);
  }
}

