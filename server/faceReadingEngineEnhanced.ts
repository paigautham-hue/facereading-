import { invokeLLM } from "./_core/llm";
import { invokeLLMWithModel } from "./_core/llmDirect";
import { readFileSync } from "fs";
import { join } from "path";
import { monitoredAICall } from "./aiMonitoringService";
import { parseJSONWithRetry } from "./jsonParser";

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
      elementBalance?: {
        dominant: string;
        secondary: string;
        harmony: string;
        conflicts: string[];
      };
      facialZones?: Array<{
        zone: string;
        position: string;
        quality: string;
        interpretation: string;
        confidence: number;
      }>;
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
      moleInterpretations?: Array<{
        position: string;
        size: string;
        color: string;
        meaning: string;
        lifeArea: string;
        auspiciousness: 'highly_auspicious' | 'auspicious' | 'neutral' | 'challenging' | 'highly_challenging';
        confidence: number;
      }>;
      lines: string[];
      asymmetry: string;
      colorVariations: string;
      microFeatures?: {
        eyeCorners: string;
        noseTip: string;
        lipCorners: string;
        earlobes: string;
        templeArea: string;
      };
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
    featureInteractions?: {
      dominantTraits: Array<{
        trait: string;
        supportingFeatures: string[];
        confidence: number;
        reasoning: string;
      }>;
      contradictions: Array<{
        feature1: string;
        feature2: string;
        resolution: string;
      }>;
      synergies: Array<{
        features: string[];
        combinedEffect: string;
        amplification: string;
      }>;
    };
    scientificValidation?: {
      fwhrAnalysis: {
        ratio: number;
        interpretation: string;
        researchBasis: string;
        confidence: number;
      };
      symmetryAnalysis: {
        score: number;
        implications: string;
        researchBasis: string;
      };
      sexualDimorphism: {
        masculinityScore: number;
        femininityScore: number;
        interpretation: string;
      };
    };
  };
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
      return await invokeLLMWithModel("gemini-2.0-flash-exp", {
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: visionPrompt },
              ...imageContent,
            ],
          },
        ],
      });
    }
  );

  const facialFeatures = visionResponse.choices[0].message.content;
  console.log("✅ Vision analysis complete");

  // ========== STEP 2: Comprehensive Face Reading with GPT-5 ==========
  console.log("🧠 Step 2: Comprehensive face reading with GPT-5...");
  
  const readingPrompt = `You are a world-renowned face reading master with 40+ years of experience in physiognomy, Chinese face reading (Mien Shiang), and modern facial anthropometry.

FACE READING TRAINING:
${training.substring(0, 80000)}

MOLE READING TRAINING:
${moleTraining}

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
      "proportions": "detailed analysis of upper/middle/lower face proportions",
      "elementBalance": {
        "dominant": "primary element with percentage",
        "secondary": "secondary element with percentage",
        "harmony": "analysis of element balance and what it means for life",
        "conflicts": ["any elemental conflicts and how they manifest"]
      },
      "facialZones": [
        {
          "zone": "Zone name (e.g., Career Palace, Wealth Palace)",
          "position": "specific facial location",
          "quality": "excellent/good/average/challenging",
          "interpretation": "detailed interpretation of what this zone reveals",
          "confidence": 90
        }
      ]
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
      "moleInterpretations": [
        {
          "position": "specific position name from the 86 facial positions",
          "size": "small/medium/large",
          "color": "light brown/dark brown/black/red/honey",
          "meaning": "comprehensive interpretation based on mole reading training",
          "lifeArea": "specific life area affected (wealth/career/relationships/health/etc)",
          "auspiciousness": "highly_auspicious/auspicious/neutral/challenging/highly_challenging",
          "confidence": 85
        }
      ],
      "lines": ["[Type of line]: [interpretation and timing]"],
      "asymmetry": "detailed analysis of any asymmetry and its meaning",
      "colorVariations": "analysis of color patterns and health indicators",
      "microFeatures": {
        "eyeCorners": "analysis of eye corner shape and what it reveals",
        "noseTip": "analysis of nose tip shape and wealth indicators",
        "lipCorners": "analysis of lip corners and happiness indicators",
        "earlobes": "analysis of earlobe size/attachment and fortune indicators",
        "templeArea": "analysis of temple area and relationship indicators"
      }
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
    },
    "featureInteractions": {
      "dominantTraits": [
        {
          "trait": "specific dominant personality trait",
          "supportingFeatures": ["feature 1 that supports this", "feature 2", "feature 3"],
          "confidence": 90,
          "reasoning": "detailed explanation of why these features combine to create this trait"
        }
      ],
      "contradictions": [
        {
          "feature1": "feature that suggests one thing",
          "feature2": "feature that suggests something contradictory",
          "resolution": "how these contradictions resolve in the person's life and what it means"
        }
      ],
      "synergies": [
        {
          "features": ["feature 1", "feature 2", "feature 3"],
          "combinedEffect": "the powerful combined effect of these features working together",
          "amplification": "how this combination amplifies certain life outcomes"
        }
      ]
    },
    "scientificValidation": {
      "fwhrAnalysis": {
        "ratio": 1.5,
        "interpretation": "detailed interpretation based on facial width-to-height ratio research",
        "researchBasis": "reference to evolutionary psychology research on fWHR and behavior",
        "confidence": 85
      },
      "symmetryAnalysis": {
        "score": 85,
        "implications": "what this symmetry score means for health, attractiveness, and developmental stability",
        "researchBasis": "reference to research on facial symmetry and genetic quality"
      },
      "sexualDimorphism": {
        "masculinityScore": 70,
        "femininityScore": 30,
        "interpretation": "analysis of sex-typical features and what they reveal about hormones, behavior, and life outcomes"
      }
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
10. Return ONLY valid JSON, no additional text or markdown
11. CROSS-VALIDATE interpretations: ensure features support each other logically
12. PROVIDE EVIDENCE: explain WHY each feature leads to each interpretation
13. CHECK CONSISTENCY: ensure no contradictory statements (or explain contradictions)
14. USE SCIENTIFIC BASIS: reference fWHR, symmetry, and dimorphism research where applicable
15. VERIFY MEASUREMENTS: ensure ratios and scores are realistic and match the description
16. COMPREHENSIVE MOLES: analyze ALL visible moles using the 86-position system
17. MICRO-FEATURES: don't miss small details like eye corners, nose tip, lip curves
18. ELEMENT BALANCE: analyze how Five Elements interact and create harmony or conflict
19. FACIAL ZONES: map the 13 traditional zones and assess quality of each
20. FEATURE SYNERGIES: identify how features amplify each other's effects`;

  const readingResponse = await monitoredAICall(
    "gpt-5",
    "face_reading",
    undefined,
    async () => {
      return await invokeLLMWithModel("gpt-4o", {
        messages: [
          {
            role: "system",
            content: "You are a master face reading expert. Respond ONLY with valid JSON.",
          },
          {
            role: "user",
            content: readingPrompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "face_reading_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                executiveSummary: {
                  type: "object",
                  properties: {
                    whatISeeFirst: { type: "array", items: { type: "string" } },
                    faceShape: {
                      type: "object",
                      properties: {
                        classification: { type: "string" },
                        element: { type: "string" },
                        interpretation: { type: "string" },
                      },
                      required: ["classification", "element", "interpretation"],
                      additionalProperties: false,
                    },
                    personalitySnapshot: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          trait: { type: "string" },
                          confidence: { type: "number" },
                          description: { type: "string" },
                        },
                        required: ["trait", "confidence", "description"],
                        additionalProperties: false,
                      },
                    },
                    lifeStrengths: { type: "array", items: { type: "string" } },
                    keyInsights: { type: "array", items: { type: "string" } },
                  },
                  required: ["whatISeeFirst", "faceShape", "personalitySnapshot", "lifeStrengths", "keyInsights"],
                  additionalProperties: false,
                },
                detailedAnalysis: {
                  type: "object",
                  properties: {
                    facialMeasurements: {
                      type: "object",
                      properties: {
                        faceShape: { type: "string" },
                        fiveElement: { type: "string" },
                        facialWidthToHeightRatio: { type: "number" },
                        symmetryScore: { type: "number" },
                        proportions: { type: "string" },
                      },
                      required: ["faceShape", "fiveElement", "facialWidthToHeightRatio", "symmetryScore", "proportions"],
                      additionalProperties: false,
                    },
                    featureAnalysis: {
                      type: "object",
                      properties: {
                        forehead: { type: "string" },
                        eyebrows: { type: "string" },
                        eyes: { type: "string" },
                        nose: { type: "string" },
                        philtrum: { type: "string" },
                        lips: { type: "string" },
                        chin: { type: "string" },
                        jaw: { type: "string" },
                        ears: { type: "string" },
                        cheeks: { type: "string" },
                        hair: { type: "string" },
                        skin: { type: "string" },
                      },
                      required: ["forehead", "eyebrows", "eyes", "nose", "philtrum", "lips", "chin", "jaw", "ears", "cheeks", "hair", "skin"],
                      additionalProperties: false,
                    },
                    specialMarkers: {
                      type: "object",
                      properties: {
                        moles: { type: "array", items: { type: "string" } },
                        lines: { type: "array", items: { type: "string" } },
                        asymmetry: { type: "string" },
                        colorVariations: { type: "string" },
                      },
                      required: ["moles", "lines", "asymmetry", "colorVariations"],
                      additionalProperties: false,
                    },
                    ageMapping: {
                      type: "object",
                      properties: {
                        currentAge: { type: "number" },
                        currentPosition: { type: "string" },
                        pastVerification: { type: "string" },
                        futureOutlook: { type: "string" },
                        lifePeriods: {
                          type: "object",
                          properties: {
                            earlyLife: { type: "string" },
                            middleLife: { type: "string" },
                            laterLife: { type: "string" },
                          },
                          required: ["earlyLife", "middleLife", "laterLife"],
                          additionalProperties: false,
                        },
                      },
                      required: ["currentAge", "currentPosition", "pastVerification", "futureOutlook", "lifePeriods"],
                      additionalProperties: false,
                    },
                    lifeAspects: {
                      type: "object",
                      properties: {
                        personality: { type: "string" },
                        intellectual: { type: "string" },
                        career: { type: "string" },
                        wealth: { type: "string" },
                        relationships: { type: "string" },
                        health: { type: "string" },
                        family: { type: "string" },
                        social: { type: "string" },
                        creativity: { type: "string" },
                        spirituality: { type: "string" },
                        willpower: { type: "string" },
                        emotionalIntelligence: { type: "string" },
                        authority: { type: "string" },
                        lifePurpose: { type: "string" },
                        laterLifeFortune: { type: "string" },
                      },
                      required: ["personality", "intellectual", "career", "wealth", "relationships", "health", "family", "social", "creativity", "spirituality", "willpower", "emotionalIntelligence", "authority", "lifePurpose", "laterLifeFortune"],
                      additionalProperties: false,
                    },
                  },
                  required: ["facialMeasurements", "featureAnalysis", "specialMarkers", "ageMapping", "lifeAspects"],
                  additionalProperties: false,
                },
              },
              required: ["executiveSummary", "detailedAnalysis"],
              additionalProperties: false,
            },
          },
        }, // Strict JSON schema enforcement
      });
    }
  );

  let readingContent = readingResponse.choices[0].message.content;
  
  // Ensure content is a string
  if (typeof readingContent !== 'string') {
    readingContent = JSON.stringify(readingContent);
  }
  
  // Log the full response for debugging
  console.log("📝 Full AI response length:", readingContent.length, "characters");
  console.log("📝 First 200 chars:", readingContent.substring(0, 200));
  console.log("📝 Last 200 chars:", readingContent.substring(readingContent.length - 200));
  
  // Parse JSON with robust error handling and AI retry fallback
  let faceReading: FacialAnalysisResult;
  try {
    faceReading = parseJSONWithRetry<FacialAnalysisResult>(
      readingContent,
      3,
      (attempt, error) => {
        console.log(`⚠️ JSON parse attempt ${attempt} failed: ${error}`);
        console.log(`Retrying...`);
      }
    );
    console.log("✅ Comprehensive face reading complete");
  } catch (parseError) {
    console.error("❌ All JSON parsing attempts failed. Retrying with simpler prompt...");
    
    // Fallback: Retry with explicit JSON-only instruction
    const simplifiedPrompt = `${readingPrompt}\n\nIMPORTANT: Return ONLY the JSON object. No markdown, no code blocks, no explanations. Start with { and end with }.`;
    
    const retryResponse = await invokeLLMWithModel("gpt-4o", {
      messages: [
        {
          role: "system",
          content: "You are a master face reading expert. Return ONLY valid JSON. No markdown formatting. No code blocks. Just pure JSON starting with { and ending with }.",
        },
        {
          role: "user",
          content: simplifiedPrompt,
        },
      ],
      response_format: { type: "json_object" }, // Force JSON mode
    });
    
    let retryContent = retryResponse.choices[0].message.content;
    if (typeof retryContent !== 'string') {
      retryContent = JSON.stringify(retryContent);
    }
    
    faceReading = parseJSONWithRetry<FacialAnalysisResult>(
      retryContent,
      3,
      (attempt, error) => {
        console.log(`⚠️ Retry parse attempt ${attempt} failed: ${error}`);
      }
    );
    console.log("✅ Face reading complete after retry");
  }

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
      return await invokeLLMWithModel("grok-2-1212", {
        messages: [
          {
            role: "system",
            content: "You are a face reading expert validator. Respond ONLY with valid JSON.",
          },
          {
            role: "user",
            content: validationPrompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "face_reading_validation",
            strict: true,
            schema: {
              type: "object",
              properties: {
                executiveSummary: {
                  type: "object",
                  properties: {
                    whatISeeFirst: { type: "array", items: { type: "string" } },
                    faceShape: {
                      type: "object",
                      properties: {
                        classification: { type: "string" },
                        element: { type: "string" },
                        interpretation: { type: "string" },
                      },
                      required: ["classification", "element", "interpretation"],
                      additionalProperties: false,
                    },
                    personalitySnapshot: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          trait: { type: "string" },
                          confidence: { type: "number" },
                          description: { type: "string" },
                        },
                        required: ["trait", "confidence", "description"],
                        additionalProperties: false,
                      },
                    },
                    lifeStrengths: { type: "array", items: { type: "string" } },
                    keyInsights: { type: "array", items: { type: "string" } },
                  },
                  required: ["whatISeeFirst", "faceShape", "personalitySnapshot", "lifeStrengths", "keyInsights"],
                  additionalProperties: false,
                },
                detailedAnalysis: {
                  type: "object",
                  properties: {
                    facialMeasurements: {
                      type: "object",
                      properties: {
                        faceShape: { type: "string" },
                        fiveElement: { type: "string" },
                        facialWidthToHeightRatio: { type: "number" },
                        symmetryScore: { type: "number" },
                        proportions: { type: "string" },
                      },
                      required: ["faceShape", "fiveElement", "facialWidthToHeightRatio", "symmetryScore", "proportions"],
                      additionalProperties: false,
                    },
                    featureAnalysis: {
                      type: "object",
                      properties: {
                        forehead: { type: "string" },
                        eyebrows: { type: "string" },
                        eyes: { type: "string" },
                        nose: { type: "string" },
                        philtrum: { type: "string" },
                        lips: { type: "string" },
                        chin: { type: "string" },
                        jaw: { type: "string" },
                        ears: { type: "string" },
                        cheeks: { type: "string" },
                        hair: { type: "string" },
                        skin: { type: "string" },
                      },
                      required: ["forehead", "eyebrows", "eyes", "nose", "philtrum", "lips", "chin", "jaw", "ears", "cheeks", "hair", "skin"],
                      additionalProperties: false,
                    },
                    specialMarkers: {
                      type: "object",
                      properties: {
                        moles: { type: "array", items: { type: "string" } },
                        lines: { type: "array", items: { type: "string" } },
                        asymmetry: { type: "string" },
                        colorVariations: { type: "string" },
                      },
                      required: ["moles", "lines", "asymmetry", "colorVariations"],
                      additionalProperties: false,
                    },
                    ageMapping: {
                      type: "object",
                      properties: {
                        currentAge: { type: "number" },
                        currentPosition: { type: "string" },
                        pastVerification: { type: "string" },
                        futureOutlook: { type: "string" },
                        lifePeriods: {
                          type: "object",
                          properties: {
                            earlyLife: { type: "string" },
                            middleLife: { type: "string" },
                            laterLife: { type: "string" },
                          },
                          required: ["earlyLife", "middleLife", "laterLife"],
                          additionalProperties: false,
                        },
                      },
                      required: ["currentAge", "currentPosition", "pastVerification", "futureOutlook", "lifePeriods"],
                      additionalProperties: false,
                    },
                    lifeAspects: {
                      type: "object",
                      properties: {
                        personality: { type: "string" },
                        intellectual: { type: "string" },
                        career: { type: "string" },
                        wealth: { type: "string" },
                        relationships: { type: "string" },
                        health: { type: "string" },
                        family: { type: "string" },
                        social: { type: "string" },
                        creativity: { type: "string" },
                        spirituality: { type: "string" },
                        willpower: { type: "string" },
                        emotionalIntelligence: { type: "string" },
                        authority: { type: "string" },
                        lifePurpose: { type: "string" },
                        laterLifeFortune: { type: "string" },
                      },
                      required: ["personality", "intellectual", "career", "wealth", "relationships", "health", "family", "social", "creativity", "spirituality", "willpower", "emotionalIntelligence", "authority", "lifePurpose", "laterLifeFortune"],
                      additionalProperties: false,
                    },
                  },
                  required: ["facialMeasurements", "featureAnalysis", "specialMarkers", "ageMapping", "lifeAspects"],
                  additionalProperties: false,
                },
              },
              required: ["executiveSummary", "detailedAnalysis"],
              additionalProperties: false,
            },
          },
        }, // Strict JSON schema for validation
      });
    }
  );

  let validatedContent = validationResponse.choices[0].message.content;
  
  // Ensure content is a string
  if (typeof validatedContent !== 'string') {
    validatedContent = JSON.stringify(validatedContent);
  }
  
  // Parse JSON with robust error handling and AI retry fallback
  let enhancedReading: FacialAnalysisResult;
  try {
    enhancedReading = parseJSONWithRetry<FacialAnalysisResult>(
      validatedContent,
      3,
      (attempt, error) => {
        console.log(`⚠️ JSON parse attempt ${attempt} failed: ${error}`);
        console.log(`Retrying...`);
      }
    );
    console.log("✅ Cross-validation and enhancement complete");
  } catch (parseError) {
    console.error("❌ Validation parsing failed. Using original reading without enhancement.");
    // Fallback: If validation fails, return the original reading
    enhancedReading = faceReading;
    console.log("⚠️ Returning original reading (validation step skipped)");
  }

  console.log("🎉 Enhanced multi-model analysis complete!");
  
  return enhancedReading as FacialAnalysisResult;
}

