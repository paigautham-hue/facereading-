import { invokeLLM } from "./_core/llm";
import { readFileSync } from "fs";
import { join } from "path";

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

export async function analyzeFace(imageUrls: string[], userAge: number): Promise<FacialAnalysisResult> {
  const training = getTrainingDocument();
  const moleTraining = getMoleTrainingDocument();
  
  // Prepare image content for vision analysis
  const imageContent = imageUrls.map(url => ({
    type: "image_url" as const,
    image_url: {
      url,
      detail: "high" as const,
    },
  }));

  // Step 1: Vision analysis to extract facial features
  const visionPrompt = `You are an expert facial analyst. Analyze these facial images comprehensively and extract detailed facial features, measurements, and characteristics.

Analyze the following aspects:
1. Face shape and proportions (oval, round, square, rectangular, heart, triangle, diamond)
2. Five Element classification (Wood, Fire, Earth, Metal, Water)
3. Facial width-to-height ratio
4. Symmetry assessment
5. Detailed features: forehead, eyebrows, eyes, nose, philtrum, lips, chin, jaw, ears, cheeks, hair, skin
6. Special markers: moles, lines, wrinkles, color variations, asymmetry
7. Age-related features

Provide a detailed, structured analysis of all visible facial characteristics.`;

  const visionResponse = await invokeLLM({
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

  const facialFeatures = visionResponse.choices[0].message.content;

  // Step 2: Generate comprehensive face reading using training documents
  const readingPrompt = `You are a world-class face reading expert with deep knowledge of physiognomy, Chinese face reading (Mien Shiang), and modern facial anthropometry.

FACE READING TRAINING:
${training.substring(0, 12000)}

MOLE READING TRAINING:
${moleTraining.substring(0, 8000)}

FACIAL ANALYSIS:
${facialFeatures}

USER AGE: ${userAge} years old

Based on the training document and the facial analysis, provide a comprehensive, accurate, and personalized face reading. Your response MUST be in valid JSON format with the following structure:

{
  "executiveSummary": {
    "whatISeeFirst": ["feature 1", "feature 2", "feature 3"],
    "faceShape": {
      "classification": "shape name",
      "element": "element name",
      "interpretation": "brief interpretation"
    },
    "personalitySnapshot": [
      {
        "trait": "trait name",
        "confidence": 85,
        "description": "specific description"
      }
    ],
    "lifeStrengths": ["strength 1", "strength 2", "strength 3"],
    "keyInsights": ["insight 1", "insight 2", "insight 3"]
  },
  "detailedAnalysis": {
    "facialMeasurements": {
      "faceShape": "detailed description",
      "fiveElement": "element with explanation",
      "facialWidthToHeightRatio": 1.5,
      "symmetryScore": 85,
      "proportions": "detailed proportions"
    },
    "featureAnalysis": {
      "forehead": "detailed analysis",
      "eyebrows": "detailed analysis",
      "eyes": "detailed analysis",
      "nose": "detailed analysis",
      "philtrum": "detailed analysis",
      "lips": "detailed analysis",
      "chin": "detailed analysis",
      "jaw": "detailed analysis",
      "ears": "detailed analysis",
      "cheeks": "detailed analysis",
      "hair": "detailed analysis",
      "skin": "detailed analysis"
    },
    "specialMarkers": {
      "moles": ["location and meaning"],
      "lines": ["type and interpretation"],
      "asymmetry": "analysis",
      "colorVariations": "analysis"
    },
    "ageMapping": {
      "currentAge": ${userAge},
      "currentPosition": "position on face",
      "pastVerification": "analysis of past",
      "futureOutlook": "predictions",
      "lifePeriods": {
        "earlyLife": "0-30 analysis",
        "middleLife": "30-60 analysis",
        "laterLife": "60+ analysis"
      }
    },
    "lifeAspects": {
      "personality": "comprehensive personality analysis",
      "intellectual": "intellectual capacity and learning style",
      "career": "career direction and success potential",
      "wealth": "financial fortune and earning capacity",
      "relationships": "relationship style and compatibility",
      "health": "health indicators and vitality",
      "family": "family relationships and children",
      "social": "social skills and popularity",
      "creativity": "creative abilities and expression",
      "spirituality": "spiritual inclinations and wisdom",
      "willpower": "determination and persistence",
      "emotionalIntelligence": "empathy and emotional awareness",
      "authority": "leadership and influence",
      "lifePurpose": "life direction and calling",
      "laterLifeFortune": "old age prospects and legacy"
    }
  }
}

IMPORTANT GUIDELINES:
1. Be highly specific and verifiable in your predictions
2. Use positive framing while being honest
3. Reference specific facial features to support each prediction
4. Make predictions that will stun the user with accuracy
5. Include age-specific timelines and predictions
6. Ensure all confidence scores are realistic (70-95 range)
7. Return ONLY valid JSON, no additional text`;

  const readingResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a face reading expert. Always respond with valid JSON only.",
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
    },
  });

  const analysisText = readingResponse.choices[0].message.content;
  if (typeof analysisText !== "string") {
    throw new Error("Invalid response format from LLM");
  }
  const analysis: FacialAnalysisResult = JSON.parse(analysisText);

  return analysis;
}

