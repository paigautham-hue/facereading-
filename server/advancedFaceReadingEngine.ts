import { invokeClaude } from "./_core/claudeApi";
import { readFileSync } from "fs";
import { join } from "path";
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

export interface AdvancedFacialAnalysisResult {
  // Standard sections (same as regular readings)
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
  
  // Enhanced sections (exclusive to advanced readings)
  moleAnalysis: {
    overview: string;
    significantMoles: Array<{
      position: string;
      zone: number;
      auspiciousness: "very_lucky" | "lucky" | "neutral" | "unlucky" | "very_unlucky";
      interpretation: string;
      lifeAreas: string[];
      timing: string;
      remedies: string[];
    }>;
    hiddenMoles: string;
    moleInteractions: string;
    overallMoleReading: string;
  };
  compatibilityAnalysis: {
    romanticCompatibility: {
      bestMatches: string[];
      challengingMatches: string[];
      relationshipStyle: string;
      attractionFactors: string;
      longTermPotential: string;
    };
    businessCompatibility: {
      idealPartners: string[];
      conflictTypes: string[];
      leadershipStyle: string;
      teamDynamics: string;
      negotiationApproach: string;
    };
    friendshipCompatibility: {
      bestFriendTypes: string[];
      socialCircle: string;
      loyaltyFactors: string;
      conflictResolution: string;
    };
  };
  decadeTimeline: {
    decades: Array<{
      ageRange: string;
      period: string;
      fortuneLevel: "excellent" | "good" | "moderate" | "challenging" | "difficult";
      keyThemes: string[];
      opportunities: string[];
      challenges: string[];
      advice: string;
    }>;
    criticalAges: Array<{
      age: number;
      significance: string;
      prediction: string;
      preparation: string;
    }>;
    lifeCycles: {
      earlyYears: string;
      middleYears: string;
      laterYears: string;
    };
  };
}

/**
 * Advanced face reading analysis using Claude API
 * Generates comprehensive 20-25 page reports with enhanced sections
 * 
 * @param imageUrls - Array of image URLs for analysis
 * @param userAge - User's age for age-specific predictions
 * @param userName - User's name (optional)
 * @param userGender - User's gender for compatibility analysis
 * @returns Advanced facial analysis result
 */
export async function analyzeAdvancedFace(
  imageUrls: string[],
  userAge: number,
  userName?: string,
  userGender?: "male" | "female" | "unknown"
): Promise<AdvancedFacialAnalysisResult> {
  console.log("🚀 Starting advanced face reading with Claude API...");
  console.log(`📊 Processing ${imageUrls.length} images for ${userName || "user"}, age ${userAge}, gender ${userGender || "unknown"}`);

  const training = getTrainingDocument();
  const moleTraining = getMoleTrainingDocument();

  // Step 1: Vision analysis with Claude (supports image URLs directly)
  const visionPrompt = `You are an expert facial analyst. Analyze these ${imageUrls.length} facial images comprehensively.

Focus on:
1. Face shape and proportions (oval, round, square, rectangular, heart, triangle, diamond)
2. Five Element classification (Wood, Fire, Earth, Metal, Water)
3. Facial width-to-height ratio
4. Symmetry assessment (left vs right side differences)
5. Detailed features: forehead, eyebrows, eyes, nose, philtrum, lips, chin, jaw, ears, cheeks, hair, skin
6. Special markers: moles (exact positions and zones), lines, wrinkles, color variations, asymmetry
7. Age-related features
8. Micro-features: eye corners, nose tip, lip curves, earlobes, temples

**CRITICAL FOR MOLE ANALYSIS:** 
- Identify EXACT positions of ALL visible moles, marks, and beauty spots
- Specify which facial zone each mole is in (1-100 zone system)
- Note size, color, prominence of each mole
- Describe mole clusters and patterns

Provide a detailed, structured analysis of all visible facial characteristics.`;

  const imageContent = imageUrls.map(url => ({
    type: "image" as const,
    source: {
      type: "url" as const,
      url,
    },
  }));

  const visionResponse = await invokeClaude({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: visionPrompt },
          ...imageContent,
        ],
      },
    ],
    maxTokens: 4096,
    temperature: 0.3,
  });

  const facialFeatures = visionResponse.content[0].text;
  console.log(`✅ Vision analysis complete (${visionResponse.usage.input_tokens} input tokens, ${visionResponse.usage.output_tokens} output tokens)`);

  // Step 2: Comprehensive face reading with Claude
  const readingPrompt = `You are a world-class face reading master with 40+ years of experience in physiognomy, Chinese face reading (Mien Shiang), and modern facial anthropometry.

FACE READING TRAINING:
${training.substring(0, 80000)}

MOLE READING TRAINING (100+ zones):
${moleTraining}

FACIAL ANALYSIS:
${facialFeatures}

USER INFO:
- Age: ${userAge} years old
- Gender: ${userGender || "unknown"}
- Name: ${userName || "User"}

Based on the training documents and facial analysis, provide a COMPREHENSIVE, DEEPLY DETAILED face reading with enhanced sections.

Your response MUST be in valid JSON format with this EXACT structure:

{
  "executiveSummary": {
    "whatISeeFirst": ["feature 1", "feature 2", "feature 3"],
    "faceShape": {
      "classification": "shape name",
      "element": "element name",
      "interpretation": "detailed interpretation"
    },
    "personalitySnapshot": [
      {
        "trait": "trait name",
        "confidence": 85,
        "description": "specific description tied to facial features"
      }
    ],
    "lifeStrengths": ["unique strength 1", "unique strength 2", "unique strength 3", "unique strength 4", "unique strength 5"],
    "keyInsights": ["insight 1", "insight 2", "insight 3"]
  },
  "detailedAnalysis": {
    "facialMeasurements": {
      "faceShape": "detailed description",
      "fiveElement": "element with explanation",
      "facialWidthToHeightRatio": 1.5,
      "symmetryScore": 85,
      "proportions": "detailed proportions analysis"
    },
    "featureAnalysis": {
      "forehead": "detailed forehead analysis",
      "eyebrows": "detailed eyebrow analysis",
      "eyes": "detailed eye analysis",
      "nose": "detailed nose analysis",
      "philtrum": "detailed philtrum analysis",
      "lips": "detailed lips analysis",
      "chin": "detailed chin analysis",
      "jaw": "detailed jaw analysis",
      "ears": "detailed ear analysis",
      "cheeks": "detailed cheek analysis",
      "hair": "detailed hair analysis",
      "skin": "detailed skin analysis"
    },
    "specialMarkers": {
      "moles": ["mole 1 description", "mole 2 description"],
      "lines": ["line 1 description", "line 2 description"],
      "asymmetry": "asymmetry analysis",
      "colorVariations": "color variations analysis"
    },
    "ageMapping": {
      "currentAge": ${userAge},
      "currentPosition": "current life position analysis",
      "pastVerification": "past verification based on age markers",
      "futureOutlook": "future outlook prediction",
      "lifePeriods": {
        "earlyLife": "early life analysis",
        "middleLife": "middle life analysis",
        "laterLife": "later life analysis"
      }
    },
    "lifeAspects": {
      "personality": "personality analysis",
      "intellectual": "intellectual analysis",
      "career": "career analysis",
      "wealth": "wealth analysis",
      "relationships": "relationships analysis",
      "health": "health analysis",
      "family": "family analysis",
      "social": "social analysis",
      "creativity": "creativity analysis",
      "spirituality": "spirituality analysis",
      "willpower": "willpower analysis",
      "emotionalIntelligence": "emotional intelligence analysis",
      "authority": "authority analysis",
      "lifePurpose": "life purpose analysis",
      "laterLifeFortune": "later life fortune analysis"
    }
  },
  "moleAnalysis": {
    "overview": "comprehensive overview of all moles and their significance",
    "significantMoles": [
      {
        "position": "exact position description (e.g., 'left cheek, 2cm below eye')",
        "zone": 34,
        "auspiciousness": "lucky",
        "interpretation": "detailed interpretation of this mole's meaning",
        "lifeAreas": ["wealth", "relationships"],
        "timing": "age range when this mole's influence is strongest",
        "remedies": ["remedy 1 if unlucky", "remedy 2 if unlucky"]
      }
    ],
    "hiddenMoles": "analysis of hidden or covered moles and their significance",
    "moleInteractions": "how multiple moles interact and influence each other",
    "overallMoleReading": "comprehensive summary of mole-based predictions"
  },
  "compatibilityAnalysis": {
    "romanticCompatibility": {
      "bestMatches": ["face type 1", "face type 2", "face type 3"],
      "challengingMatches": ["face type 1", "face type 2"],
      "relationshipStyle": "detailed relationship style analysis",
      "attractionFactors": "what attracts this person romantically",
      "longTermPotential": "long-term relationship potential and advice"
    },
    "businessCompatibility": {
      "idealPartners": ["partner type 1", "partner type 2", "partner type 3"],
      "conflictTypes": ["conflict type 1", "conflict type 2"],
      "leadershipStyle": "detailed leadership style analysis",
      "teamDynamics": "how this person works in teams",
      "negotiationApproach": "negotiation and deal-making style"
    },
    "friendshipCompatibility": {
      "bestFriendTypes": ["friend type 1", "friend type 2", "friend type 3"],
      "socialCircle": "ideal social circle and friend group dynamics",
      "loyaltyFactors": "loyalty and friendship longevity factors",
      "conflictResolution": "how this person handles friendship conflicts"
    }
  },
  "decadeTimeline": {
    "decades": [
      {
        "ageRange": "0-9",
        "period": "Childhood Foundation",
        "fortuneLevel": "good",
        "keyThemes": ["theme 1", "theme 2"],
        "opportunities": ["opportunity 1", "opportunity 2"],
        "challenges": ["challenge 1", "challenge 2"],
        "advice": "specific advice for this decade"
      }
    ],
    "criticalAges": [
      {
        "age": 33,
        "significance": "major life turning point",
        "prediction": "specific prediction for this age",
        "preparation": "how to prepare for this critical age"
      }
    ],
    "lifeCycles": {
      "earlyYears": "comprehensive early years (0-30) analysis",
      "middleYears": "comprehensive middle years (30-60) analysis",
      "laterYears": "comprehensive later years (60+) analysis"
    }
  }
}

**CRITICAL GUIDELINES:**
1. Make EVERY prediction unique and personalized to THIS specific face
2. Reference specific facial features for EVERY interpretation
3. Use age ${userAge} and gender ${userGender} context throughout
4. For mole analysis: identify 5-10 significant moles with exact zones
5. For compatibility: consider face shape, element, and features
6. For decade timeline: provide 9 decades (0-9, 10-19, ... 80-89) + 7 critical ages
7. Make predictions stunning and memorable - users should feel "how did they know?!"
8. Use confidence scores 75-95 (avoid extremes)
9. Balance positive framing with honest insights
10. Return ONLY valid JSON, no additional text

Generate the most comprehensive, accurate, and stunning face reading ever created.`;

  const readingResponse = await invokeClaude({
    messages: [
      {
        role: "user",
        content: readingPrompt,
      },
    ],
    maxTokens: 16384, // 2x standard system for enhanced detail
    temperature: 0.7,
    system: "You are a master face reading expert. Always respond with valid JSON only. Make every reading unique, personalized, and stunning.",
  });

  const analysisText = readingResponse.content[0].text;
  console.log(`✅ Advanced face reading complete (${readingResponse.usage.input_tokens} input tokens, ${readingResponse.usage.output_tokens} output tokens)`);
  console.log(`📊 Total tokens used: ${visionResponse.usage.input_tokens + visionResponse.usage.output_tokens + readingResponse.usage.input_tokens + readingResponse.usage.output_tokens}`);

  if (typeof analysisText !== "string") {
    throw new Error("Invalid response format from Claude API");
  }

  // Parse JSON with robust error handling
  const analysis = parseJSONWithRetry<AdvancedFacialAnalysisResult>(
    analysisText,
    3,
    (attempt, error) => {
      console.log(`⚠️ JSON parse attempt ${attempt} failed: ${error}`);
      console.log(`Retrying...`);
    }
  );

  console.log("🎉 Advanced face reading analysis complete!");
  return analysis;
}

