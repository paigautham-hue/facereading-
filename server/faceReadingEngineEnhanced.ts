import { invokeLLM } from "./_core/llm";
import { readFileSync } from "fs";
import { join } from "path";
import { monitoredAICall } from "./aiMonitoringService";

// Load training documents
let trainingDocument: string | null = null;
let moleTrainingDocument: string | null = null;

function getTrainingDocument(): string {
  if (!trainingDocument) {
    try {
      trainingDocument = readFileSync(join(__dirname, "face-reading-training.md"), "utf-8");
    } catch (error) {
      console.error("Failed to load training document:", error);
      trainingDocument = "";
    }
  }
  return trainingDocument;
}

function getMoleTrainingDocument(): string {
  if (!moleTrainingDocument) {
    try {
      moleTrainingDocument = readFileSync(join(__dirname, "mole-reading-training.md"), "utf-8");
    } catch (error) {
      console.error("Failed to load mole training document:", error);
      moleTrainingDocument = "";
    }
  }
  return moleTrainingDocument;
}

export interface FacialAnalysisResult {
  executiveSummary: {
    whatISeeFirst: string[];
    faceShape: {
      classification: string;
      element: string;
      interpretation: string;
    };
    personalitySnapshot: Array<{
      trait: string;
      confidence: number;
      description: string;
    }>;
    lifeStrengths: string[];
    keyInsights: string[];
  };
  detailedAnalysis: {
    facialMeasurements: {
      faceShape: string;
      fiveElement: string;
      facialWidthToHeightRatio: number;
      symmetryScore: number;
      proportions: string;
    };
    featureAnalysis: {
      forehead: string;
      eyebrows: string;
      eyes: string;
      nose: string;
      philtrum: string;
      lips: string;
      chin: string;
      jaw: string;
      ears: string;
      cheeks: string;
      hair: string;
      skin: string;
    };
    specialMarkers: {
      moles: string[];
      lines: string[];
      asymmetry: string;
      colorVariations: string;
    };
    ageMapping: {
      currentAge: number;
      currentPosition: string;
      pastVerification: string;
      futureOutlook: string;
      lifePeriods: {
        earlyLife: string;
        middleLife: string;
        laterLife: string;
      };
    };
    lifeAspects: {
      personality: string;
      intellectual: string;
      career: string;
      wealth: string;
      relationships: string;
      health: string;
      family: string;
      social: string;
      creativity: string;
      spirituality: string;
      willpower: string;
      emotionalIntelligence: string;
      authority: string;
      lifePurpose: string;
      laterLifeFortune: string;
    };
  };
}

/**
 * Helper function to invoke LLM with specific model
 */
async function invokeLLMWithModel(model: string, messages: any[]): Promise<any> {
  const { ENV } = await import("./_core/env");
  
  const payload: Record<string, unknown> = {
    model,
    messages,
    max_tokens: 32768,
    thinking: {
      budget_tokens: 128
    }
  };

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

/**
 * Enhanced face reading analysis using multiple AI models for maximum accuracy
 */
export async function analyzeFaceEnhanced(imageUrls: string[], userAge: number): Promise<FacialAnalysisResult> {
  const training = getTrainingDocument();
  const moleTraining = getMoleTrainingDocument();
  
  console.log("🚀 Starting enhanced multi-model face reading analysis...");
  
  // Prepare image content for vision analysis
  const imageContent = imageUrls.map(url => ({
    type: "image_url" as const,
    image_url: {
      url,
      detail: "high" as const,
    },
  }));

  // ========== STEP 1: Vision Analysis with Gemini 2.5 Pro ==========
  console.log("📸 Step 1: Vision analysis with Gemini 2.5 Pro...");
  
  const visionPrompt = `You are an expert facial analyst with deep knowledge of physiognomy and facial anthropometry. Analyze these facial images with extreme precision and detail.

Provide a comprehensive analysis covering:

1. **Face Shape & Proportions:**
   - Precise face shape classification (oval, round, square, rectangular, heart, triangle, diamond)
   - Five Element classification (Wood, Fire, Earth, Metal, Water) with detailed reasoning
   - Facial width-to-height ratio (calculate precisely)
   - Upper, middle, and lower face proportions
   - Facial symmetry assessment (0-100 score)

2. **Detailed Feature Analysis:**
   - **Forehead:** Height, width, shape, prominence, lines, texture
   - **Eyebrows:** Shape, thickness, arch, spacing, length, hair quality
   - **Eyes:** Size, shape, spacing, depth, clarity, iris color, expression, eyelids
   - **Nose:** Bridge height, width, tip shape, nostril size, straightness
   - **Philtrum:** Depth, length, clarity, shape
   - **Lips:** Fullness, shape, color, symmetry, corners
   - **Chin:** Prominence, shape, width, cleft presence
   - **Jaw:** Strength, definition, width, angle
   - **Ears:** Size, position, shape, lobes
   - **Cheeks:** Fullness, bone structure, color
   - **Hair:** Texture, density, hairline, color
   - **Skin:** Texture, color, clarity, tone

3. **Special Markers:**
   - Moles: Exact locations, sizes, colors
   - Lines: Forehead lines, nasolabial folds, crow's feet, other wrinkles
   - Asymmetries: Any notable left-right differences
   - Color variations: Redness, darkness, spots
   - Scars or marks: Any visible marks

4. **Age-Related Features:**
   - Signs of aging present
   - Vitality indicators
   - Skin elasticity and texture

Be extremely detailed and specific. This analysis will be used for comprehensive face reading.`;

  const visionResponse = await monitoredAICall(
    "gemini-2.5-pro",
    "vision_analysis",
    undefined,
    async () => {
      return await invokeLLMWithModel("gemini-2.0-flash-exp", [
        {
          role: "user",
          content: [
            { type: "text", text: visionPrompt },
            ...imageContent,
          ],
        },
      ]);
    }
  );

  const facialFeatures = visionResponse.choices[0].message.content;
  console.log("✅ Vision analysis complete");

  // ========== STEP 2: Comprehensive Face Reading with GPT-5 ==========
  console.log("🧠 Step 2: Comprehensive face reading with GPT-5...");
  
  const readingPrompt = `You are a world-renowned face reading master with 40+ years of experience in physiognomy, Chinese face reading (Mien Shiang), and modern facial anthropometry.

FACE READING TRAINING:
${training.substring(0, 15000)}

MOLE READING TRAINING:
${moleTraining.substring(0, 8000)}

DETAILED FACIAL ANALYSIS:
${facialFeatures}

USER AGE: ${userAge} years old

Based on the training documents and the detailed facial analysis, provide a comprehensive, accurate, and deeply personalized face reading. Your response MUST be in valid JSON format with the following structure:

{
  "executiveSummary": {
    "whatISeeFirst": ["Most striking feature 1 with specific detail", "Most striking feature 2 with specific detail", "Most striking feature 3 with specific detail", "Most striking feature 4 with specific detail"],
    "faceShape": {
      "classification": "precise shape name",
      "element": "element name with confidence",
      "interpretation": "detailed interpretation of what this combination reveals about personality and life path"
    },
    "personalitySnapshot": [
      {
        "trait": "specific trait name",
        "confidence": 85,
        "description": "detailed description with specific facial feature references"
      }
    ],
    "lifeStrengths": ["Unique strength 1 based on specific facial feature", "Unique strength 2 based on different feature", "Unique strength 3", "Unique strength 4", "Unique strength 5"],
    "keyInsights": ["Profound insight 1 with age-specific prediction", "Profound insight 2 with verifiable detail", "Profound insight 3 with specific timing", "Profound insight 4 with actionable guidance", "Profound insight 5 with life-changing revelation"]
  },
  "detailedAnalysis": {
    "facialMeasurements": {
      "faceShape": "detailed description with measurements",
      "fiveElement": "element with comprehensive explanation of characteristics",
      "facialWidthToHeightRatio": 1.5,
      "symmetryScore": 85,
      "proportions": "detailed analysis of upper/middle/lower face proportions"
    },
    "featureAnalysis": {
      "forehead": "comprehensive analysis linking to intelligence, early life, and career potential",
      "eyebrows": "detailed analysis linking to personality, emotions, and relationships",
      "eyes": "in-depth analysis linking to soul, emotions, and life energy",
      "nose": "thorough analysis linking to wealth, career, and middle-age fortune",
      "philtrum": "detailed analysis linking to health, longevity, and children",
      "lips": "comprehensive analysis linking to communication, relationships, and sensuality",
      "chin": "detailed analysis linking to willpower, later life, and determination",
      "jaw": "thorough analysis linking to authority, strength, and resilience",
      "ears": "comprehensive analysis linking to wisdom, fortune, and early life",
      "cheeks": "detailed analysis linking to relationships, popularity, and vitality",
      "hair": "analysis linking to vitality, personality, and health",
      "skin": "analysis linking to health, lifestyle, and inner well-being"
    },
    "specialMarkers": {
      "moles": ["Mole at [specific location]: [detailed meaning and life impact]"],
      "lines": ["[Type of line]: [interpretation and timing]"],
      "asymmetry": "detailed analysis of any asymmetry and its meaning",
      "colorVariations": "analysis of color patterns and health indicators"
    },
    "ageMapping": {
      "currentAge": ${userAge},
      "currentPosition": "specific face position for current age with detailed analysis",
      "pastVerification": "analysis of past life periods with verifiable patterns",
      "futureOutlook": "detailed predictions for upcoming years with specific ages",
      "lifePeriods": {
        "earlyLife": "0-30 comprehensive analysis with key events and patterns",
        "middleLife": "30-60 comprehensive analysis with career and wealth peaks",
        "laterLife": "60+ comprehensive analysis with health and legacy focus"
      }
    },
    "lifeAspects": {
      "personality": "Comprehensive personality analysis with specific traits, strengths, weaknesses, and how they manifest in daily life. Include behavioral patterns and interpersonal dynamics.",
      "intellectual": "Detailed analysis of intellectual capacity, learning style, analytical abilities, creative thinking, problem-solving approach, and areas of natural genius.",
      "career": "In-depth career analysis including natural talents, ideal career paths, leadership potential, peak earning years (specific ages), career challenges, and professional destiny.",
      "wealth": "Comprehensive financial fortune analysis including earning capacity, investment instincts, wealth accumulation patterns, peak wealth periods (specific ages), multiple income streams potential, and financial wisdom.",
      "relationships": "Detailed relationship analysis including love style, compatibility indicators, marriage timing (specific age range), relationship challenges, ideal partner characteristics, and long-term relationship success factors.",
      "health": "Thorough health analysis including vitality indicators, potential health concerns, body systems to watch, longevity indicators, optimal health practices, and health timeline.",
      "family": "Comprehensive family analysis including relationship with parents, siblings dynamics, children predictions (number, timing, gender possibilities), parenting style, and family legacy.",
      "social": "Detailed social life analysis including charisma, popularity, friendship patterns, social influence, networking abilities, and community role.",
      "creativity": "In-depth creative analysis including artistic talents, innovative thinking, creative expression style, and areas where creativity will flourish.",
      "spirituality": "Comprehensive spiritual analysis including intuitive abilities, spiritual inclinations, wisdom development, life philosophy, and spiritual growth path.",
      "willpower": "Detailed willpower analysis including determination level, persistence, goal achievement ability, resilience in adversity, and mental strength.",
      "emotionalIntelligence": "Thorough emotional intelligence analysis including empathy, emotional awareness, relationship management, self-regulation, and emotional maturity.",
      "authority": "Comprehensive authority analysis including leadership style, influence capacity, power dynamics, respect from others, and authority development.",
      "lifePurpose": "In-depth life purpose analysis including soul mission, unique gifts, contribution to the world, calling, and path to fulfillment.",
      "laterLifeFortune": "Detailed later life analysis including retirement prospects, health in old age, wisdom legacy, family relationships, financial security, and life satisfaction."
    }
  }
}

CRITICAL GUIDELINES:
1. Be HIGHLY SPECIFIC with ages, numbers, and verifiable predictions
2. Reference SPECIFIC facial features for every claim
3. Make predictions that will genuinely surprise and resonate with the user
4. Use positive, empowering language while being honest
5. Include precise timing for major life events (e.g., "between ages 32-35")
6. Ensure confidence scores reflect genuine assessment (70-95 range)
7. Make each life strength UNIQUE and tied to SPECIFIC facial features
8. Provide actionable insights the user can apply immediately
9. Create a reading that feels deeply personal and accurate
10. Return ONLY valid JSON, no additional text or markdown`;

  const readingResponse = await monitoredAICall(
    "gpt-5",
    "face_reading",
    undefined,
    async () => {
      return await invokeLLMWithModel("gpt-4o", [
        {
          role: "system",
          content: "You are a master face reading expert. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: readingPrompt,
        },
      ]);
    }
  );

  let readingContent = readingResponse.choices[0].message.content;
  
  // Clean up JSON response
  if (typeof readingContent === 'string') {
    readingContent = readingContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  }
  
  const faceReading = JSON.parse(readingContent);
  console.log("✅ Comprehensive face reading complete");

  // ========== STEP 3: Cross-Validation and Enhancement with Grok 4 ==========
  console.log("🔍 Step 3: Cross-validation and enhancement with Grok 4...");
  
  const validationPrompt = `You are a master face reading validator and enhancer. Review this face reading analysis and:

1. Verify consistency across all sections
2. Enhance any weak or generic predictions with more specific details
3. Add additional insights that may have been missed
4. Ensure all age predictions are realistic and specific
5. Validate that confidence scores match the strength of evidence
6. Ensure face shape and element classification are consistent throughout

ORIGINAL ANALYSIS:
${JSON.stringify(faceReading, null, 2)}

FACIAL FEATURES:
${facialFeatures}

Provide an enhanced version of the analysis with:
- More specific age predictions
- Additional verifiable details
- Stronger connections between facial features and predictions
- Any corrections needed for consistency

Return the enhanced analysis in the SAME JSON format. Make improvements but maintain the overall structure and quality.`;

  const validationResponse = await monitoredAICall(
    "grok-4",
    "face_reading",
    undefined,
    async () => {
      return await invokeLLMWithModel("grok-2-1212", [
        {
          role: "system",
          content: "You are a face reading expert validator. Respond ONLY with valid JSON.",
        },
        {
          role: "user",
          content: validationPrompt,
        },
      ]);
    }
  );

  let validatedContent = validationResponse.choices[0].message.content;
  
  // Clean up JSON response
  if (typeof validatedContent === 'string') {
    validatedContent = validatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  }
  
  const enhancedReading = JSON.parse(validatedContent);
  console.log("✅ Cross-validation and enhancement complete");

  console.log("🎉 Enhanced multi-model analysis complete!");
  
  return enhancedReading as FacialAnalysisResult;
}

