/**
 * Advanced Face Reading Analysis Engine
 * 
 * Uses OpenAI GPT-4 for enhanced 3-section analysis:
 * 1. Detailed Mole/Mark Analysis (100+ zones with lucky/unlucky positions)
 * 2. Compatibility Analysis (romantic, business, friendship)
 * 3. Decade-by-Decade Timeline (9 periods + 7 critical ages)
 * 
 * Output: 16K tokens (~20-25 pages PDF)
 */

import { invokeOpenAI, type OpenAIMessage } from "./openaiClient";

export interface AdvancedAnalysisResult {
  executiveSummary: any;
  detailedAnalysis: any;
  stunningInsights: any;
  moleAnalysis: any;
  compatibilityAnalysis: any;
  decadeTimeline: any;
}

export async function performAdvancedAnalysis(params: {
  name: string;
  gender: string;
  dateOfBirth?: string;
  imageUrls: string[];
}): Promise<AdvancedAnalysisResult> {
  console.log(`[Advanced Engine] Starting analysis for ${params.name}`);

  // Build image content for OpenAI
  const imageContent = params.imageUrls.map((url) => ({
    type: "image_url" as const,
    image_url: {
      url,
      detail: "high" as const,
    },
  }));

  const systemPrompt = `You are an expert face reading master with deep knowledge of Chinese face reading (Mian Xiang), physiognomy, and ancient wisdom traditions.

Your task is to provide an EXTREMELY COMPREHENSIVE analysis that includes:

1. **Executive Summary** - First impressions and dominant traits
2. **Detailed Feature Analysis** - Deep dive into facial features
3. **Stunning Insights** - Unique observations and predictions
4. **Detailed Mole/Mark Analysis** - Analyze ALL visible moles, marks, and skin features across 100+ facial zones. For each mark, specify:
   - Exact location (zone number and description)
   - Lucky or unlucky significance
   - Life aspect affected (wealth, health, relationships, career)
   - Remedies or recommendations
5. **Compatibility Analysis** - Provide detailed compatibility insights for:
   - Romantic relationships (best matches, challenges)
   - Business partnerships (ideal collaborators, warning signs)
   - Friendships (natural allies, potential conflicts)
6. **Decade-by-Decade Life Timeline** - Map out life journey across:
   - 9 major life periods (ages 0-10, 11-20, 21-30, 31-40, 41-50, 51-60, 61-70, 71-80, 81+)
   - 7 critical ages (specific turning points)
   - Key opportunities and challenges in each period

Return your analysis as a JSON object with these exact keys:
{
  "executiveSummary": { ... },
  "detailedAnalysis": { ... },
  "stunningInsights": { ... },
  "moleAnalysis": { ... },
  "compatibilityAnalysis": { ... },
  "decadeTimeline": { ... }
}

Be extremely detailed and comprehensive. Aim for 16,000 tokens of output.`;

  const userMessage = `Perform a comprehensive advanced face reading analysis for:
Name: ${params.name}
Gender: ${params.gender}
${params.dateOfBirth ? `Date of Birth: ${params.dateOfBirth}` : ""}

Please analyze all provided images and deliver the complete 6-section analysis.`;

  const messages: OpenAIMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: userMessage,
        },
        ...imageContent,
      ] as any,
    },
  ];

  try {
    const response = await invokeOpenAI({
      messages,
      maxTokens: 16000,
    });

    const textContent = response.choices[0]?.message.content;
    if (!textContent) {
      throw new Error("No text content in OpenAI response");
    }

    // Parse JSON response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in OpenAI response");
    }

    const result = JSON.parse(jsonMatch[0]);
    console.log(`[Advanced Engine] Analysis complete - ${response.usage.completion_tokens} tokens generated`);

    return result;
  } catch (error: any) {
    console.error("[Advanced Engine Error]", error);
    throw new Error(`Advanced analysis failed: ${error.message}`);
  }
}

