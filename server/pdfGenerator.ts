import { marked } from "marked";
import puppeteer from "puppeteer";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

export interface PDFGenerationData {
  userName: string;
  readingDate: string;
  executiveSummary: any;
  detailedAnalysis: any;
  images: Array<{ type: string; url: string }>;
}

/**
 * Generate a comprehensive face reading PDF report using Puppeteer
 */
export async function generatePDF(data: PDFGenerationData): Promise<Buffer> {
  const markdown = generateReadingMarkdown(data);
  const html = await marked(markdown);
  
  const styledHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Georgia', serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #FFD700;
      font-size: 36px;
      text-align: center;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    h2 {
      color: #9370DB;
      font-size: 28px;
      margin-top: 30px;
      margin-bottom: 15px;
      page-break-after: avoid;
    }
    h3 {
      color: #666;
      font-size: 20px;
      margin-top: 20px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    p {
      margin-bottom: 15px;
      text-align: justify;
    }
    strong {
      color: #000;
    }
    .page-break {
      page-break-after: always;
    }
    .cover {
      text-align: center;
      padding: 100px 0;
      page-break-after: always;
    }
    .cover h1 {
      font-size: 48px;
      margin-bottom: 20px;
    }
    .cover h2 {
      font-size: 24px;
      color: #9370DB;
      margin-bottom: 40px;
    }
    .cover p {
      font-size: 18px;
      color: #666;
    }
    ul {
      margin-bottom: 15px;
      padding-left: 30px;
    }
    li {
      margin-bottom: 8px;
    }
    .footer {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
  `;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm',
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function generateReadingMarkdown(data: PDFGenerationData): string {
  const {
    userName,
    readingDate,
    executiveSummary,
    detailedAnalysis,
  } = data;

  const markdown = `
<div class="cover">
  <h1>✨ Your Face Reading</h1>
  <h2>A Journey of Self-Discovery</h2>
  <p><strong>Prepared for:</strong> ${userName}</p>
  <p>${readingDate}</p>
</div>

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

<div class="page-break"></div>

# Personality Snapshot

Your core character traits with confidence analysis:

${executiveSummary.personalitySnapshot?.map((trait: any) => `
## ${trait.trait}
**Confidence:** ${trait.confidence}%

${trait.description}
`).join('\n')}

<div class="page-break"></div>

# Life Strengths

Your natural talents and abilities:

${executiveSummary.lifeStrengths?.map((strength: string) => `- ⭐ ${strength}`).join('\n')}

<div class="page-break"></div>

# Detailed Facial Analysis

## Facial Measurements

${formatObjectAsMarkdown(detailedAnalysis.facialMeasurements)}

## Feature Analysis

${formatObjectAsMarkdown(detailedAnalysis.featureAnalysis)}

## Special Markers

${formatObjectAsMarkdown(detailedAnalysis.specialMarkers)}

<div class="page-break"></div>

# Life Aspects Analysis

## 🧠 Personality Traits
${detailedAnalysis.lifeAspects?.personality || 'Not available'}

## 📚 Intellectual Capacity
${detailedAnalysis.lifeAspects?.intellectual || 'Not available'}

## 💼 Career & Success
${detailedAnalysis.lifeAspects?.career || 'Not available'}

## 💰 Wealth & Finance
${detailedAnalysis.lifeAspects?.wealth || 'Not available'}

<div class="page-break"></div>

## ❤️ Love & Relationships
${detailedAnalysis.lifeAspects?.relationships || 'Not available'}

## 🏥 Health & Vitality
${detailedAnalysis.lifeAspects?.health || 'Not available'}

## 👨‍👩‍👧‍👦 Family & Children
${detailedAnalysis.lifeAspects?.family || 'Not available'}

## 🤝 Social Life
${detailedAnalysis.lifeAspects?.social || 'Not available'}

<div class="page-break"></div>

## 🎨 Creativity & Expression
${detailedAnalysis.lifeAspects?.creativity || 'Not available'}

## 🔮 Spirituality & Wisdom
${detailedAnalysis.lifeAspects?.spirituality || 'Not available'}

## 💪 Willpower & Determination
${detailedAnalysis.lifeAspects?.willpower || 'Not available'}

## 🧘 Emotional Intelligence
${detailedAnalysis.lifeAspects?.emotionalIntelligence || 'Not available'}

<div class="page-break"></div>

## 👑 Authority & Power
${detailedAnalysis.lifeAspects?.authority || 'Not available'}

## 🎯 Life Purpose
${detailedAnalysis.lifeAspects?.lifePurpose || 'Not available'}

## 🌅 Later Life Fortune
${detailedAnalysis.lifeAspects?.laterLifeFortune || 'Not available'}

<div class="page-break"></div>

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

<div class="page-break"></div>

# Conclusion

This comprehensive face reading report combines ancient wisdom with modern AI technology to provide deep insights into your personality, potential, and life path. Remember that face reading is a tool for self-understanding and personal growth.

## How to Use This Reading

1. **Reflect on the insights** - Take time to consider how the analysis resonates with your experiences
2. **Identify patterns** - Look for recurring themes across different life aspects
3. **Set intentions** - Use the strengths and opportunities identified to guide your goals
4. **Embrace growth** - View challenges as opportunities for personal development

<div class="footer">
  <p>© 2025 Face Reading - AI-Powered Facial Analysis</p>
  <p>Combining ancient wisdom with modern AI technology</p>
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

