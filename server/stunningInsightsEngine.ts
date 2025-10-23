import { invokeLLM } from "./_core/llm";
import { ENV } from "./_core/env";

/**
 * Helper function to invoke LLM with specific model
 */
async function invokeLLMWithModel(model: string, messages: any[], responseFormat?: any): Promise<any> {
  const payload: Record<string, unknown> = {
    model,
    messages,
    max_tokens: 32768,
    thinking: {
      budget_tokens: 128
    }
  };

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  const apiUrl = ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed for ${model}: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return await response.json();
}

export interface StunningInsight {
  id: string;
  category: string;
  title: string;
  level: string;
  description: string;
  confidence: number;
  basedOn: string[];
  isSensitive: boolean;
  icon: string;
}

export interface StunningInsightsResult {
  insights: StunningInsight[];
  overallConfidence: number;
}

/**
 * Generate stunning insights from facial analysis
 */
export async function generateStunningInsights(
  imageUrls: string[],
  userGender: string,
  userAge: number,
  detailedAnalysis: any
): Promise<StunningInsightsResult> {
  
  const insightsPrompt = `You are an expert face reading master with deep knowledge of physiognomy, Chinese face reading, and mole reading. Analyze the provided facial images and generate 15 stunning, deeply personal insights that will amaze the user.

USER INFORMATION:
- Gender: ${userGender}
- Age: ${userAge}

PREVIOUS DETAILED ANALYSIS:
${JSON.stringify(detailedAnalysis, null, 2)}

Generate exactly 15 stunning insights covering these categories:

1. SEXUAL DRIVE & ROMANTIC INTENSITY
Analyze: Philtrum (depth, length), lip fullness, lip color, eye moisture, nose tip shape, relevant moles
Provide: Level (HIGH/MODERATE/LOW), specific description, confidence score

2. KISSING ABILITY & ORAL SENSUALITY
Analyze: Lip fullness, cupid's bow, mouth width, lip proportion, lip texture, moles near lips
Provide: Level (EXCEPTIONAL/SKILLED/NATURAL/DEVELOPING), kissing style, confidence score

3. FERTILITY & CHILDREN DESTINY
Analyze: Philtrum characteristics, under-eye area, lip fullness, chin fullness, relevant moles
Provide: Number of children predicted, fertility level, timing, special indicators (twins, gender), confidence score

4. RELATIONSHIP WITH PARENTS
Analyze: Left side (mother), right side (father), ear characteristics, facial asymmetry, relevant moles
Provide: Closeness level for each parent, inherited traits, dominant influence, confidence score

5. SIBLING RELATIONSHIPS & BIRTH ORDER
Analyze: Eyebrow characteristics, forehead width, eye spacing, cheekbone prominence, relevant moles
Provide: Estimated siblings, birth order position, relationship quality, dynamics, confidence score

6. CHILD LOSS OR PREGNANCY CHALLENGES (SENSITIVE)
Analyze: Under-eye area (darkness, hollowness), philtrum depth, tear trough, relevant moles
Provide: Journey assessment (smooth/challenging), sensitive insights with care, support advice, confidence score

7. MARRIAGE TIMING & DESTINY
Analyze: Cheekbone prominence, forehead height, eyebrow thickness, chin shape, face shape, relevant moles
Provide: Marriage timing (early/average/late/very late), age range, number of significant relationships, reasons, confidence score

8. HIDDEN WEALTH SOURCES
Analyze: Earlobes (thickness, detachment), nose tip fullness, chin fullness, hidden moles, relevant positions
Provide: Wealth indicators, sources (inheritance/windfall/gifts), peak wealth period, accumulation style, confidence score

9. ADDICTIVE TENDENCIES & COMPULSIVE BEHAVIORS (SENSITIVE)
Analyze: Nose tip color, lip thickness, chin strength, philtrum depth, relevant moles
Provide: Susceptibility level, vulnerability areas, challenges, strengths, advice, confidence score

10. PSYCHIC ABILITIES & INTUITION
Analyze: Eye spacing, eye depth, third eye area, forehead height, relevant moles, philtrum length
Provide: Intuitive strength level, specific gifts (clairvoyance/clairsentience/etc), manifestations, development status, advice, confidence score

11. CHEATING OR INFIDELITY RISK (SENSITIVE)
Analyze: Lip fullness/color, eye shape, chin strength, moles near eyes, jaw strength, facial balance
Provide: Loyalty level, risk factors, partner risk, advice, confidence score

12. LONGEVITY & LIFE SPAN
Analyze: Philtrum length/depth, earlobe thickness/length, chin fullness, jaw strength, eye clarity, relevant moles
Provide: Expected lifespan range, health in old age, later life quality by decade, health assets, longevity factors, advice, confidence score

13. ACCIDENT PRONENESS & DANGER WARNINGS (SENSITIVE)
Analyze: Specific mole positions (water, fire, travel, heights, animals), facial marks
Provide: Risk level, specific danger areas, high-risk periods, most dangerous element, protective measures, positive note, confidence score

14. LEGAL TROUBLES & CONFLICT TENDENCY
Analyze: Facial angularity, lip thickness, chin shape, mouth lines, eyebrow lines, relevant moles
Provide: Risk level, legal risk areas, conflict tendency, pattern, high-risk periods, protective strategies, positive reframe, confidence score

15. SECRET PERSONALITY (PUBLIC VS PRIVATE SELF)
Analyze: Left vs right facial asymmetry, contradictory features (smiling mouth + sad eyes, etc)
Provide: Gap level, public persona, private reality, the contradiction, why they hide, what they long for, advice, confidence score

For each insight, provide:
{
  "id": "insight_1_sexual_drive",
  "category": "Sexual Drive & Romantic Intensity",
  "title": "🔥 Sexual Drive",
  "level": "HIGH/MODERATE/LOW",
  "description": "Detailed 2-3 paragraph description with specific observations and interpretations",
  "confidence": 75-95,
  "basedOn": ["Deep philtrum", "Full lips", "Moist eyes", "Mole at position X"],
  "isSensitive": false
}

IMPORTANT GUIDELINES:
1. Be specific and personal - avoid generic statements
2. Use actual facial features you observe in the images
3. Confidence scores should reflect clarity of features (75-95%)
4. For sensitive topics, use compassionate language and include disclaimers
5. Base predictions on actual physiognomy principles
6. Make insights feel deeply personal and surprising
7. Include specific ages, numbers, and timelines where appropriate
8. Always provide constructive advice or positive reframes
9. ENSURE UNIQUENESS: Each insight must be tied to specific observable features unique to this person - no two users should receive identical insights unless faces are remarkably similar
10. PERSONALIZE WITH CONTEXT: Actively integrate user's age (${userAge}) and gender (${userGender}) into predictions and timelines
11. BE SPECIFIC WITH NUMBERS: Provide exact ages, counts, percentages rather than vague ranges (e.g., "3 children" not "several children", "age 32" not "early 30s")
12. REFERENCE UNIQUE FEATURES: Each insight description should mention at least 2-3 specific facial characteristics observed in the images
13. AVOID GENERIC PATTERNS: Don't use common predictions that could apply to anyone - make each insight feel like it could only apply to this specific face

Return ONLY a valid JSON object with this structure:
{
  "insights": [array of 15 insight objects],
  "overallConfidence": average of all confidence scores
}`;

  try {
    // Prepare image content for vision model
    const imageContent = imageUrls.slice(0, 5).map(url => ({
      type: "image_url" as const,
      image_url: {
        url: url,
        detail: "high" as const
      }
    }));

    const messages = [
      {
        role: "user" as const,
        content: [
          {
            type: "text" as const,
            text: insightsPrompt
          },
          ...imageContent
        ]
      }
    ];

    console.log("🔮 Generating stunning insights with Grok 4...");
    const response = await invokeLLMWithModel("grok-2-1212", messages, {
      type: "json_schema",
      json_schema: {
        name: "stunning_insights",
        strict: true,
        schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  category: { type: "string" },
                  title: { type: "string" },
                  level: { type: "string" },
                  description: { type: "string" },
                  confidence: { type: "number" },
                  basedOn: {
                    type: "array",
                    items: { type: "string" }
                  },
                  isSensitive: { type: "boolean" }
                },
                required: ["id", "category", "title", "level", "description", "confidence", "basedOn", "isSensitive"],
                additionalProperties: false
              }
            },
            overallConfidence: { type: "number" }
          },
          required: ["insights", "overallConfidence"],
          additionalProperties: false
        }
      }
    });
    console.log("✅ Stunning insights generated!");

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent || typeof messageContent !== 'string') {
      throw new Error("No response from LLM");
    }

    const result = JSON.parse(messageContent) as StunningInsightsResult;
    
    // Add icon mapping
    const iconMap: Record<string, string> = {
      "Sexual Drive & Romantic Intensity": "flame",
      "Kissing Ability & Oral Sensuality": "lips",
      "Fertility & Children Destiny": "baby",
      "Relationship with Parents": "users",
      "Sibling Relationships & Birth Order": "user-friends",
      "Child Loss or Pregnancy Challenges": "alert-triangle",
      "Marriage Timing & Destiny": "heart",
      "Hidden Wealth Sources": "dollar-sign",
      "Addictive Tendencies & Compulsive Behaviors": "alert-circle",
      "Psychic Abilities & Intuition": "eye",
      "Cheating or Infidelity Risk": "heart-crack",
      "Longevity & Life Span": "clock",
      "Accident Proneness & Danger Warnings": "shield-alert",
      "Legal Troubles & Conflict Tendency": "scale",
      "Secret Personality": "mask"
    };

    result.insights = result.insights.map(insight => ({
      ...insight,
      icon: iconMap[insight.category] || "star"
    }));

    return result;
  } catch (error) {
    console.error("Error generating stunning insights:", error);
    throw new Error(`Failed to generate stunning insights: ${error instanceof Error ? error.message : String(error)}`);
  }
}

