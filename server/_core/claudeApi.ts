import Anthropic from "@anthropic-ai/sdk";

// Initialize Claude client with API key from environment
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || "",
});

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string | Array<{
    type: "image" | "text";
    source?: {
      type: "base64" | "url";
      media_type?: string;
      data?: string;
      url?: string;
    };
    text?: string;
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

/**
 * Invoke Claude API with messages
 * @param messages - Array of messages to send to Claude
 * @param maxTokens - Maximum tokens in response (default: 16384 for advanced analysis)
 * @param temperature - Temperature for response generation (default: 0.7)
 * @returns Claude API response
 */
export async function invokeClaude({
  messages,
  maxTokens = 16384,
  temperature = 0.7,
  system,
}: {
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
  system?: string;
}): Promise<ClaudeResponse> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: maxTokens,
      temperature,
      system,
      messages: messages as any,
    });

    return response as ClaudeResponse;
  } catch (error) {
    console.error("❌ Claude API Error:", error);
    throw new Error(`Claude API call failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if Claude API is configured
 */
export function isClaudeConfigured(): boolean {
  return !!process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY.length > 0;
}

