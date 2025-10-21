import { readFileSync } from "fs";
import { join } from "path";

export interface PDFGenerationData {
  userName: string;
  readingDate: string;
  executiveSummary: any;
  detailedAnalysis: any;
  images: Array<{ type: string; url: string }>;
}

/**
 * Generate a comprehensive face reading PDF report
 * Returns markdown content that can be converted to PDF using manus-md-to-pdf utility
 */
export function generateReadingMarkdown(data: PDFGenerationData): string {
  const {
    userName,
    readingDate,
    executiveSummary,
    detailedAnalysis,
  } = data;

  const markdown = `
---
title: Face Reading Report
author: Face Reading - AI-Powered Facial Analysis
date: ${readingDate}
---

<div style="text-align: center; padding: 60px 0;">
  <h1 style="font-size: 48px; color: #FFD700; margin-bottom: 20px;">✨ Your Face Reading</h1>
  <h2 style="font-size: 24px; color: #9370DB; margin-bottom: 40px;">A Journey of Self-Discovery</h2>
  <p style="font-size: 18px; color: #666;">Prepared for: <strong>${userName}</strong></p>
  <p style="font-size: 14px; color: #999;">${readingDate}</p>
</div>

<div style="page-break-after: always;"></div>

# Executive Summary

## What I See First

${executiveSummary.whatISeeFirst?.map((item: string) => `- ${item}`).join('\n')}

## Face Shape & Element

**Classification:** ${executiveSummary.faceShape?.classification}

**Element:** ${executiveSummary.faceShape?.element}

${executiveSummary.faceShape?.interpretation}

## Key Insights

${executiveSummary.keyInsights?.map((insight: string, index: number) => `
### Insight ${index + 1}
${insight}
`).join('\n')}

<div style="page-break-after: always;"></div>

# Personality Snapshot

Your core character traits with confidence analysis:

${executiveSummary.personalitySnapshot?.map((trait: any) => `
## ${trait.trait}
**Confidence:** ${trait.confidence}%

${trait.description}
`).join('\n')}

<div style="page-break-after: always;"></div>

# Life Strengths

Your natural talents and abilities:

${executiveSummary.lifeStrengths?.map((strength: string) => `- ⭐ ${strength}`).join('\n')}

<div style="page-break-after: always;"></div>

# Detailed Facial Analysis

## Facial Measurements

${formatObjectAsMarkdown(detailedAnalysis.facialMeasurements)}

## Feature Analysis

${formatObjectAsMarkdown(detailedAnalysis.featureAnalysis)}

## Special Markers

${formatObjectAsMarkdown(detailedAnalysis.specialMarkers)}

<div style="page-break-after: always;"></div>

# Life Aspects Analysis

## 🧠 Personality Traits
${detailedAnalysis.lifeAspects?.personality || 'Not available'}

## 📚 Intellectual Capacity
${detailedAnalysis.lifeAspects?.intellectual || 'Not available'}

## 💼 Career & Success
${detailedAnalysis.lifeAspects?.career || 'Not available'}

## 💰 Wealth & Finance
${detailedAnalysis.lifeAspects?.wealth || 'Not available'}

<div style="page-break-after: always;"></div>

## ❤️ Love & Relationships
${detailedAnalysis.lifeAspects?.relationships || 'Not available'}

## 🏥 Health & Vitality
${detailedAnalysis.lifeAspects?.health || 'Not available'}

## 👨‍👩‍👧‍👦 Family & Children
${detailedAnalysis.lifeAspects?.family || 'Not available'}

## 🤝 Social Life
${detailedAnalysis.lifeAspects?.social || 'Not available'}

<div style="page-break-after: always;"></div>

## 🎨 Creativity & Expression
${detailedAnalysis.lifeAspects?.creativity || 'Not available'}

## 🔮 Spirituality & Wisdom
${detailedAnalysis.lifeAspects?.spirituality || 'Not available'}

## 💪 Willpower & Determination
${detailedAnalysis.lifeAspects?.willpower || 'Not available'}

## 🧘 Emotional Intelligence
${detailedAnalysis.lifeAspects?.emotionalIntelligence || 'Not available'}

<div style="page-break-after: always;"></div>

## 👑 Authority & Power
${detailedAnalysis.lifeAspects?.authority || 'Not available'}

## 🎯 Life Purpose
${detailedAnalysis.lifeAspects?.lifePurpose || 'Not available'}

## 🌅 Later Life Fortune
${detailedAnalysis.lifeAspects?.laterLifeFortune || 'Not available'}

<div style="page-break-after: always;"></div>

# Age Mapping & Timeline

${detailedAnalysis.ageMapping ? `
## Current Position
${detailedAnalysis.ageMapping.currentPosition}

## Future Outlook
${detailedAnalysis.ageMapping.futureOutlook}

## Life Periods

### Early Life (0-30)
${detailedAnalysis.ageMapping.lifePeriods?.earlyLife || 'Not available'}

### Middle Life (30-60)
${detailedAnalysis.ageMapping.lifePeriods?.middleLife || 'Not available'}

### Later Life (60+)
${detailedAnalysis.ageMapping.lifePeriods?.laterLife || 'Not available'}
` : 'Age mapping not available'}

<div style="page-break-after: always;"></div>

# Conclusion

This comprehensive face reading report combines ancient wisdom with modern AI technology to provide deep insights into your personality, potential, and life path. Remember that face reading is a tool for self-understanding and personal growth.

## How to Use This Reading

1. **Reflect on the insights** - Take time to consider how the analysis resonates with your experiences
2. **Identify patterns** - Look for recurring themes across different life aspects
3. **Set intentions** - Use the strengths and opportunities identified to guide your goals
4. **Embrace growth** - View challenges as opportunities for personal development

---

<div style="text-align: center; padding: 40px 0; color: #999;">
  <p style="font-size: 12px;">© 2025 Face Reading - AI-Powered Facial Analysis</p>
  <p style="font-size: 12px;">Combining ancient wisdom with modern AI technology</p>
</div>
`;

  return markdown;
}

function formatObjectAsMarkdown(obj: any): string {
  if (!obj) return 'Not available';
  
  return Object.entries(obj)
    .map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      
      if (Array.isArray(value)) {
        return `**${capitalizedLabel}:** ${value.join(', ')}`;
      }
      return `**${capitalizedLabel}:** ${value}`;
    })
    .join('\n\n');
}

