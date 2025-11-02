import { ENV } from "./env";
import type { InvokeParams, InvokeResult } from "./llm";

/**
 * Model mapping for different AI providers
 * Maps our internal model names to actual API model identifiers
 */
const MODEL_MAPPING: Record<string, string> = {
  // Gemini models - use gemini-2.5-flash for custom API, gemini-2.0-flash-exp for Forge
  "gemini-2.5-pro": "gemini-2.5-flash",
  "gemini-2.0-flash-exp": "gemini-2.5-flash",
  "gemini-2.5-flash": "gemini-2.5-flash",
  
  // OpenAI models (GPT) - use gpt-4.1-mini for custom API, gpt-4o for Forge
  "gpt-5": "gpt-4.1-mini",
  "gpt-4o": "gpt-4.1-mini",
  "gpt-4.1-mini": "gpt-4.1-mini",
  "gpt-4-turbo": "gpt-4.1-mini",
  
  // xAI models (Grok) - use gpt-4.1-mini as proxy for Grok (not directly supported)
  "grok-4": "gpt-4.1-mini",
  "grok-2-1212": "gpt-4.1-mini",
  "grok-2": "gpt-4.1-mini",
};

// Forge API uses different model names
const FORGE_MODEL_MAPPING: Record<string, string> = {
  "gemini-2.5-pro": "gemini-2.0-flash-exp",
  "gemini-2.0-flash-exp": "gemini-2.0-flash-exp",
  "gemini-2.5-flash": "gemini-2.0-flash-exp",
  "gpt-5": "gpt-4o",
  "gpt-4o": "gpt-4o",
  "gpt-4.1-mini": "gpt-4o",
  "gpt-4-turbo": "gpt-4-turbo",
  "grok-4": "grok-2-1212",
  "grok-2-1212": "grok-2-1212",
  "grok-2": "grok-2-1212",
};

/**
 * Normalize message content for API compatibility
 */
const normalizeMessage = (message: any) => {
  const { role, name, tool_call_id, content } = message;

  if (role === "tool" || role === "function") {
    const textContent = Array.isArray(content)
      ? content.map(part => (typeof part === "string" ? part : JSON.stringify(part))).join("\n")
      : typeof content === "string" ? content : JSON.stringify(content);

    return {
      role,
      name,
      tool_call_id,
      content: textContent,
    };
  }

  // Handle array content
  if (Array.isArray(content)) {
    const normalizedParts = content.map(part => {
      if (typeof part === "string") {
        return { type: "text", text: part };
      }
      return part;
    });

    // If only one text part, collapse to string
    if (normalizedParts.length === 1 && normalizedParts[0].type === "text") {
      return {
        role,
        name,
        content: normalizedParts[0].text,
      };
    }

    return {
      role,
      name,
      content: normalizedParts,
    };
  }

  return {
    role,
    name,
    content,
  };
};

/**
 * Call LLM using custom API keys from Manus connectors
 * This directly hits the Manus LLM proxy which routes to your configured models
 */
async function callWithCustomKeys(
  model: string,
  params: InvokeParams
): Promise<InvokeResult> {
  if (!ENV.openaiApiKey) {
    throw new Error("Custom API key (OPENAI_API_KEY) not configured");
  }

  const mappedModel = MODEL_MAPPING[model] || model;

  const payload: Record<string, unknown> = {
    model: mappedModel,
    messages: params.messages.map(normalizeMessage),
    max_tokens: params.maxTokens || params.max_tokens || 32768,
  };

  // Add thinking budget for reasoning models
  if (mappedModel.includes("grok") || mappedModel.includes("gemini")) {
    payload.thinking = {
      budget_tokens: 128,
    };
  }

  // Add tools if provided
  if (params.tools && params.tools.length > 0) {
    payload.tools = params.tools;
  }

  // Add tool choice if provided
  const toolChoice = params.toolChoice || params.tool_choice;
  if (toolChoice) {
    payload.tool_choice = toolChoice;
  }

  // Add response format if provided
  const responseFormat = params.responseFormat || params.response_format;
  if (responseFormat) {
    payload.response_format = responseFormat;
  } else if (params.outputSchema || params.output_schema) {
    const schema = params.outputSchema || params.output_schema;
    payload.response_format = {
      type: "json_schema",
      json_schema: {
        name: schema!.name,
        schema: schema!.schema,
        ...(typeof schema!.strict === "boolean" ? { strict: schema!.strict } : {}),
      },
    };
  }

  console.log(`🔑 Calling ${mappedModel} via custom API keys (Manus LLM Proxy)...`);

  const response = await fetch(`${ENV.openaiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${ENV.openaiApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Custom API call failed for ${mappedModel}: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  const result = await response.json();
  console.log(`✅ Custom API call successful for ${mappedModel}`);
  return result as InvokeResult;
}

/**
 * Call LLM using Forge API (fallback)
 */
async function callWithForgeAPI(
  model: string,
  params: InvokeParams
): Promise<InvokeResult> {
  if (!ENV.forgeApiKey) {
    throw new Error("Forge API key not configured");
  }

  const mappedModel = FORGE_MODEL_MAPPING[model] || model;

  const apiUrl = ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";

  const payload: Record<string, unknown> = {
    model: mappedModel,
    messages: params.messages.map(normalizeMessage),
    max_tokens: params.maxTokens || params.max_tokens || 32768,
  };

  // Add thinking budget
  payload.thinking = {
    budget_tokens: 128,
  };

  // Add tools if provided
  if (params.tools && params.tools.length > 0) {
    payload.tools = params.tools;
  }

  // Add tool choice if provided
  const toolChoice = params.toolChoice || params.tool_choice;
  if (toolChoice) {
    payload.tool_choice = toolChoice;
  }

  // Add response format if provided
  const responseFormat = params.responseFormat || params.response_format;
  if (responseFormat) {
    payload.response_format = responseFormat;
  } else if (params.outputSchema || params.output_schema) {
    const schema = params.outputSchema || params.output_schema;
    payload.response_format = {
      type: "json_schema",
      json_schema: {
        name: schema!.name,
        schema: schema!.schema,
        ...(typeof schema!.strict === "boolean" ? { strict: schema!.strict } : {}),
      },
    };
  }

  console.log(`🔄 Calling ${mappedModel} via Forge API (fallback)...`);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Forge API call failed for ${mappedModel}: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  const result = await response.json();
  console.log(`✅ Forge API call successful for ${mappedModel}`);
  return result as InvokeResult;
}

/**
 * Invoke LLM with automatic fallback strategy
 * 
 * Strategy:
 * 1. Try custom API keys first (Manus LLM Proxy) - uses your configured connectors
 * 2. If that fails, fall back to Forge API
 * 3. If both fail, throw error
 * 
 * @param model - Model identifier (e.g., "gpt-5", "gemini-2.5-pro", "grok-4")
 * @param params - Standard LLM invocation parameters
 * @returns LLM response
 */
export async function invokeLLMWithModel(
  model: string,
  params: InvokeParams
): Promise<InvokeResult> {
  let lastError: Error | null = null;

  // Strategy 1: Try custom API keys first
  if (ENV.openaiApiKey) {
    try {
      return await callWithCustomKeys(model, params);
    } catch (error: any) {
      console.warn(`⚠️  Custom API call failed for ${model}:`, error.message);
      lastError = error;
    }
  }

  // Strategy 2: Fall back to Forge API
  if (ENV.forgeApiKey) {
    try {
      console.log(`🔄 Falling back to Forge API for ${model}...`);
      return await callWithForgeAPI(model, params);
    } catch (error: any) {
      console.error(`❌ Forge API also failed for ${model}:`, error.message);
      lastError = error;
    }
  }

  // Both strategies failed
  throw new Error(
    `All LLM API strategies failed for ${model}. Last error: ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Invoke LLM with messages array (simplified interface)
 * Used by existing code that passes messages directly
 */
export async function invokeLLMWithModelMessages(
  model: string,
  messages: any[],
  responseFormat?: any
): Promise<InvokeResult> {
  return invokeLLMWithModel(model, {
    messages,
    responseFormat,
  });
}

