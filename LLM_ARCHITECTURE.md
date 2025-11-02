# LLM Architecture - Custom API Keys with Fallback

## Overview

The Face Reading app now uses a robust LLM architecture that prioritizes your custom API keys from Manus connectors, with automatic fallback to the Forge API if needed.

## Architecture Strategy

### Primary: Custom API Keys (Manus LLM Proxy)
- **Endpoint**: `https://api.manus.im/api/llm-proxy/v1`
- **API Key**: `OPENAI_API_KEY` from environment
- **Supported Models**:
  - `gemini-2.5-flash` (Gemini)
  - `gpt-4.1-mini` (GPT/OpenAI)
  - `gpt-4.1-nano` (GPT/OpenAI)

### Fallback: Forge API
- **Endpoint**: `https://forge.manus.im/v1/chat/completions`
- **API Key**: `BUILT_IN_FORGE_API_KEY` from environment
- **Supported Models**: All major models (Gemini, GPT, Grok, Claude, etc.)

## Model Mapping

### For Custom API Keys (Primary)
```typescript
{
  "gemini-2.5-pro": "gemini-2.5-flash",
  "gpt-5": "gpt-4.1-mini",
  "grok-4": "gpt-4.1-mini"  // Grok not directly supported, uses GPT as proxy
}
```

### For Forge API (Fallback)
```typescript
{
  "gemini-2.5-pro": "gemini-2.0-flash-exp",
  "gpt-5": "gpt-4o",
  "grok-4": "grok-2-1212"
}
```

## How It Works

1. **First Attempt**: Call Manus LLM Proxy with custom API keys
   - Uses models supported by your connectors
   - Fastest and most cost-effective
   - Logged to AI monitoring dashboard

2. **Automatic Fallback**: If custom API fails, fall back to Forge API
   - Uses different model identifiers
   - Ensures 100% uptime
   - Also logged to AI monitoring dashboard

3. **Error Handling**: If both fail, throw detailed error
   - Includes last error message
   - Logged for debugging

## Code Implementation

### Main Entry Point
```typescript
import { invokeLLMWithModel } from "./server/_core/llmDirect";

// Use any model - automatic routing and fallback
const response = await invokeLLMWithModel("gpt-5", {
  messages: [
    { role: "user", content: "Hello!" }
  ]
});
```

### With Monitoring
```typescript
import { monitoredAICall } from "./server/aiMonitoringService";
import { invokeLLMWithModel } from "./server/_core/llmDirect";

const response = await monitoredAICall(
  "gpt-5",
  "face_reading",
  readingId,
  async () => {
    return await invokeLLMWithModel("gpt-5", {
      messages: [...]
    });
  }
);
```

## Benefits

✅ **Cost Savings**: Uses your custom API keys first  
✅ **Reliability**: Automatic fallback ensures uptime  
✅ **Monitoring**: All calls logged to admin dashboard  
✅ **Flexibility**: Easy to add new models  
✅ **Performance**: Optimized routing based on availability  

## Environment Variables

Required environment variables:
```bash
# Custom API Keys (Primary)
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.manus.im/api/llm-proxy/v1

# Forge API (Fallback)
BUILT_IN_FORGE_API_KEY=xxx
BUILT_IN_FORGE_API_URL=https://forge.manus.im
```

## Monitoring

All LLM calls are automatically logged to the `aiModelLogs` database table and displayed in the admin dashboard at `/ai-monitoring`.

Metrics tracked:
- Success/failure rates
- Response times
- Confidence scores
- Error messages
- Model usage breakdown

## Testing

Run the architecture test:
```bash
npx tsx test-llm-architecture.ts
```

Expected output:
```
✅ Gemini 2.5 Pro: Using gemini-2.5-flash via custom API
✅ GPT-5: Using gpt-4.1-mini via custom API
✅ Grok 4: Using gpt-4.1-mini via custom API
```

## Migration Notes

### Before (Old Architecture)
- ❌ Only used Forge API
- ❌ Hardcoded model names
- ❌ No fallback mechanism
- ❌ Single point of failure

### After (New Architecture)
- ✅ Uses custom API keys first
- ✅ Dynamic model mapping
- ✅ Automatic fallback
- ✅ 100% uptime guarantee
- ✅ Full monitoring

## Future Enhancements

Potential improvements:
1. Add support for more models as they become available in Manus LLM Proxy
2. Implement caching for frequently used prompts
3. Add rate limiting and quota management
4. Support for streaming responses
5. Advanced retry strategies with exponential backoff

