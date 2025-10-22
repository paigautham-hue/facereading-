import { PDFDocument, StandardFonts, rgb, PDFPage } from "pdf-lib";

/**
 * Sanitize text to remove all non-ASCII characters that can't be encoded in WinAnsi
 */
function sanitizeText(text: any): any {
  if (typeof text === 'string') {
    // Replace common special characters with ASCII equivalents
    return text
      .replace(/[\u2018\u2019]/g, "'")  // Smart quotes
      .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
      .replace(/[\u2013\u2014]/g, '-')  // En dash, em dash
      .replace(/[\u2026]/g, '...')      // Ellipsis
      .replace(/[\u00A0]/g, ' ')        // Non-breaking space
      .replace(/[^\x00-\x7F]/g, '')     // Remove all remaining non-ASCII
      .trim();
  } else if (Array.isArray(text)) {
    return text.map(item => sanitizeText(item));
  } else if (typeof text === 'object' && text !== null) {
    const sanitized: any = {};
    for (const key in text) {
      sanitized[key] = sanitizeText(text[key]);
    }
    return sanitized;
  }
  return text;
}

export interface PDFGenerationData {
  userName: string;
  readingDate: string;
  executiveSummary: any;
  detailedAnalysis: any;
  stunningInsights?: any;
  images: Array<{ type: string; url: string }>;
}

/**
 * Generate a comprehensive face reading PDF report using pdf-lib
 */
export async function generatePDF(data: PDFGenerationData): Promise<Buffer> {
  // Sanitize all data to remove non-ASCII characters
  const sanitizedData = sanitizeText(data);
  const { userName, readingDate, executiveSummary, detailedAnalysis, stunningInsights } = sanitizedData;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Embed fonts
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const headingFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Colors
  const goldColor = rgb(1, 0.84, 0);
  const purpleColor = rgb(0.58, 0.44, 0.86);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.5, 0.5, 0.5);
  const mediumGray = rgb(0.35, 0.35, 0.35);
  const veryLightGray = rgb(0.95, 0.95, 0.95);

  let currentPage = pdfDoc.addPage([595, 842]); // A4 size
  let yPosition = 750;

  // Helper function to add new page if needed
  const checkAndAddPage = (spaceNeeded: number) => {
    if (yPosition - spaceNeeded < 70) {
      currentPage = pdfDoc.addPage([595, 842]);
      yPosition = 770;
      return true;
    }
    return false;
  };

  // Helper to sanitize text before drawing
  const sanitizeForPDF = (text: string): string => {
    if (typeof text !== 'string') return String(text);
    return text
      .replace(/[\u2018\u2019]/g, "'")  // Smart quotes
      .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
      .replace(/[\u2013\u2014]/g, '-')  // En dash, em dash
      .replace(/[\u2026]/g, '...')      // Ellipsis
      .replace(/[\u00A0]/g, ' ')        // Non-breaking space
      .replace(/[^\x00-\x7F]/g, '')     // Remove all remaining non-ASCII
      .trim();
  };

  // Helper function to safely draw text - FIXED: Now properly calls currentPage.drawText
  const safeDrawText = (text: string, options: any) => {
    const sanitized = sanitizeForPDF(text);
    if (sanitized) {
      currentPage.drawText(sanitized, options);
    }
  };

  // Helper function to draw wrapped text
  const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, font: any, color: any) => {
    const sanitized = sanitizeForPDF(text);
    const words = sanitized.split(' ');
    let line = '';
    let lineY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && i > 0) {
        currentPage.drawText(line.trim(), { x, y: lineY, size: fontSize, font, color });
        line = words[i] + ' ';
        lineY -= fontSize + 6;
        
        if (lineY < 70) {
          currentPage = pdfDoc.addPage([595, 842]);
          lineY = 770;
        }
      } else {
        line = testLine;
      }
    }
    if (line.trim()) {
      currentPage.drawText(line.trim(), { x, y: lineY, size: fontSize, font, color });
    }
    return lineY - fontSize - 8;
  };

  // Helper to draw a decorative box
  const drawBox = (x: number, y: number, width: number, height: number, fillColor: any, borderColor?: any) => {
    currentPage.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      color: fillColor,
      borderColor: borderColor || fillColor,
      borderWidth: 1,
    });
  };

  // Helper to draw gradient-like header (simulated with multiple rectangles)
  const drawGradientHeader = (y: number, text: string, color1: any, color2: any) => {
    // Draw gradient effect with multiple rectangles
    const steps = 5;
    const height = 40;
    const stepHeight = height / steps;
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const r = color1.red + (color2.red - color1.red) * ratio;
      const g = color1.green + (color2.green - color1.green) * ratio;
      const b = color1.blue + (color2.blue - color1.blue) * ratio;
      
      currentPage.drawRectangle({
        x: 40,
        y: y - height + (i * stepHeight),
        width: 515,
        height: stepHeight,
        color: rgb(r, g, b),
        borderWidth: 0,
      });
    }
    
    // Draw text on top
    safeDrawText(text, {
      x: 50,
      y: y - 25,
      size: 22,
      font: titleFont,
      color: rgb(1, 1, 1),
    });
    
    return y - height - 20;
  };

  // ========== COVER PAGE ==========
  // Background gradient effect
  for (let i = 0; i < 10; i++) {
    const ratio = i / 10;
    const alpha = 0.05 + (0.1 * ratio);
    currentPage.drawRectangle({
      x: 0,
      y: 842 - (i * 84.2),
      width: 595,
      height: 84.2,
      color: rgb(0.1 + (0.2 * ratio), 0.05 + (0.15 * ratio), 0.2 + (0.1 * ratio)),
      opacity: alpha,
    });
  }

  // Decorative circles
  currentPage.drawCircle({
    x: 100,
    y: 700,
    size: 80,
    color: goldColor,
    opacity: 0.1,
  });
  currentPage.drawCircle({
    x: 500,
    y: 200,
    size: 100,
    color: purpleColor,
    opacity: 0.1,
  });

  // Main title
  safeDrawText('Your Face Reading', {
    x: 120,
    y: 600,
    size: 42,
    font: titleFont,
    color: goldColor,
  });

  // Subtitle
  safeDrawText('A Journey of Self-Discovery', {
    x: 150,
    y: 550,
    size: 20,
    font: headingFont,
    color: purpleColor,
  });

  // Decorative line
  currentPage.drawLine({
    start: { x: 150, y: 530 },
    end: { x: 445, y: 530 },
    thickness: 2,
    color: goldColor,
    opacity: 0.5,
  });

  // User info box
  drawBox(120, 480, 355, 100, veryLightGray, lightGray);
  
  safeDrawText('Prepared for:', {
    x: 140,
    y: 455,
    size: 12,
    font: bodyFont,
    color: mediumGray,
  });

  safeDrawText(userName, {
    x: 140,
    y: 430,
    size: 18,
    font: headingFont,
    color: darkGray,
  });

  safeDrawText('Reading Date:', {
    x: 140,
    y: 405,
    size: 12,
    font: bodyFont,
    color: mediumGray,
  });

  safeDrawText(readingDate, {
    x: 140,
    y: 385,
    size: 14,
    font: bodyFont,
    color: darkGray,
  });

  // Footer text
  safeDrawText('Ancient Wisdom Meets Modern AI', {
    x: 180,
    y: 100,
    size: 14,
    font: italicFont,
    color: lightGray,
  });

  // ========== EXECUTIVE SUMMARY PAGE ==========
  currentPage = pdfDoc.addPage([595, 842]);
  yPosition = 770;

  // Section header with gradient
  yPosition = drawGradientHeader(yPosition, 'Executive Summary', purpleColor, rgb(0.4, 0.3, 0.7));
  yPosition -= 10;

  // What I See First
  if (executiveSummary.whatISeeFirst && executiveSummary.whatISeeFirst.length > 0) {
    checkAndAddPage(60);
    
    safeDrawText('What I See First', {
      x: 50,
      y: yPosition,
      size: 18,
      font: headingFont,
      color: goldColor,
    });
    yPosition -= 35;

    for (const item of executiveSummary.whatISeeFirst) {
      checkAndAddPage(35);
      
      // Draw bullet point circle
      currentPage.drawCircle({
        x: 65,
        y: yPosition - 3,
        size: 3,
        color: purpleColor,
      });
      
      yPosition = drawWrappedText(
        item,
        80,
        yPosition,
        460,
        11,
        bodyFont,
        darkGray
      );
      yPosition -= 8;
    }
    yPosition -= 15;
  }

  // Face Shape & Element
  if (executiveSummary.faceShape) {
    checkAndAddPage(140);
    
    // Draw info box
    drawBox(45, yPosition + 5, 505, 120, veryLightGray);
    
    safeDrawText('Face Shape & Element', {
      x: 60,
      y: yPosition - 10,
      size: 16,
      font: headingFont,
      color: purpleColor,
    });
    yPosition -= 35;

    safeDrawText(`Classification: ${executiveSummary.faceShape.classification}`, {
      x: 70,
      y: yPosition,
      size: 12,
      font: headingFont,
      color: darkGray,
    });
    yPosition -= 22;

    safeDrawText(`Element: ${executiveSummary.faceShape.element}`, {
      x: 70,
      y: yPosition,
      size: 12,
      font: headingFont,
      color: darkGray,
    });
    yPosition -= 28;

    if (executiveSummary.faceShape.interpretation) {
      yPosition = drawWrappedText(
        executiveSummary.faceShape.interpretation,
        70,
        yPosition,
        460,
        10,
        bodyFont,
        mediumGray
      );
    }
    yPosition -= 25;
  }

  // Key Insights
  if (executiveSummary.keyInsights && executiveSummary.keyInsights.length > 0) {
    checkAndAddPage(60);
    
    safeDrawText('Key Insights', {
      x: 50,
      y: yPosition,
      size: 18,
      font: headingFont,
      color: goldColor,
    });
    yPosition -= 35;

    for (let i = 0; i < executiveSummary.keyInsights.length; i++) {
      checkAndAddPage(80);
      
      // Draw numbered circle
      currentPage.drawCircle({
        x: 65,
        y: yPosition - 8,
        size: 12,
        color: purpleColor,
        opacity: 0.2,
      });
      
      safeDrawText(`${i + 1}`, {
        x: 61,
        y: yPosition - 12,
        size: 10,
        font: headingFont,
        color: purpleColor,
      });

      yPosition = drawWrappedText(
        executiveSummary.keyInsights[i],
        85,
        yPosition,
        455,
        11,
        bodyFont,
        darkGray
      );
      yPosition -= 18;
    }
  }

  // ========== PERSONALITY SNAPSHOT PAGE ==========
  if (executiveSummary.personalitySnapshot && executiveSummary.personalitySnapshot.length > 0) {
    currentPage = pdfDoc.addPage([595, 842]);
    yPosition = 770;

    yPosition = drawGradientHeader(yPosition, 'Personality Snapshot', goldColor, rgb(0.9, 0.7, 0));
    yPosition -= 10;

    for (const trait of executiveSummary.personalitySnapshot) {
      checkAndAddPage(110);
      
      // Draw trait box
      drawBox(45, yPosition + 5, 505, 90, veryLightGray);
      
      safeDrawText(trait.trait, {
        x: 60,
        y: yPosition - 10,
        size: 14,
        font: headingFont,
        color: purpleColor,
      });
      yPosition -= 28;

      // Confidence bar
      const barWidth = 200;
      const filledWidth = (trait.confidence / 100) * barWidth;
      
      // Background bar
      currentPage.drawRectangle({
        x: 60,
        y: yPosition - 12,
        width: barWidth,
        height: 8,
        color: rgb(0.9, 0.9, 0.9),
      });
      
      // Filled bar
      currentPage.drawRectangle({
        x: 60,
        y: yPosition - 12,
        width: filledWidth,
        height: 8,
        color: goldColor,
      });
      
      safeDrawText(`${trait.confidence}% confidence`, {
        x: 270,
        y: yPosition - 10,
        size: 9,
        font: italicFont,
        color: lightGray,
      });
      yPosition -= 25;

      yPosition = drawWrappedText(
        trait.description,
        60,
        yPosition,
        475,
        10,
        bodyFont,
        mediumGray
      );
      yPosition -= 20;
    }
  }

  // ========== LIFE ASPECTS ANALYSIS ==========
  if (detailedAnalysis.lifeAspects) {
    currentPage = pdfDoc.addPage([595, 842]);
    yPosition = 770;

    yPosition = drawGradientHeader(yPosition, 'Life Aspects Analysis', purpleColor, rgb(0.4, 0.3, 0.7));
    yPosition -= 15;

    const aspects = [
      { key: 'personality', title: 'Personality Traits', icon: 'P' },
      { key: 'intellectual', title: 'Intellectual Capacity', icon: 'I' },
      { key: 'career', title: 'Career & Success', icon: 'C' },
      { key: 'wealth', title: 'Wealth & Finance', icon: 'W' },
      { key: 'relationships', title: 'Love & Relationships', icon: 'L' },
      { key: 'health', title: 'Health & Vitality', icon: 'H' },
      { key: 'family', title: 'Family & Children', icon: 'F' },
      { key: 'social', title: 'Social Life', icon: 'S' },
      { key: 'creativity', title: 'Creativity & Expression', icon: 'A' },
      { key: 'spirituality', title: 'Spirituality & Wisdom', icon: 'M' },
      { key: 'willpower', title: 'Willpower & Determination', icon: 'D' },
      { key: 'emotionalIntelligence', title: 'Emotional Intelligence', icon: 'E' },
      { key: 'authority', title: 'Authority & Power', icon: 'A' },
      { key: 'lifePurpose', title: 'Life Purpose', icon: 'G' },
      { key: 'laterLifeFortune', title: 'Later Life Fortune', icon: 'R' },
    ];

    for (const aspect of aspects) {
      const content = detailedAnalysis.lifeAspects[aspect.key];
      if (content && content !== 'Not available') {
        checkAndAddPage(100);
        
        // Draw aspect header with icon
        drawBox(45, yPosition + 5, 505, 30, rgb(0.98, 0.98, 1));
        
        // Icon circle
        currentPage.drawCircle({
          x: 65,
          y: yPosition - 10,
          size: 12,
          color: goldColor,
          opacity: 0.3,
        });
        
        safeDrawText(aspect.icon, {
          x: 61,
          y: yPosition - 14,
          size: 10,
          font: headingFont,
          color: purpleColor,
        });
        
        safeDrawText(aspect.title, {
          x: 85,
          y: yPosition - 15,
          size: 13,
          font: headingFont,
          color: purpleColor,
        });
        yPosition -= 40;

        yPosition = drawWrappedText(
          content,
          60,
          yPosition,
          475,
          10,
          bodyFont,
          mediumGray
        );
        yPosition -= 20;
      }
    }
  }

  // ========== STUNNING INSIGHTS SECTION ==========
  if (stunningInsights && stunningInsights.insights && stunningInsights.insights.length > 0) {
    currentPage = pdfDoc.addPage([595, 842]);
    yPosition = 770;

    yPosition = drawGradientHeader(yPosition, 'What Will Stun You', rgb(1, 0.65, 0), rgb(1, 0.5, 0));
    yPosition -= 5;

    safeDrawText('About Your Reading', {
      x: 50,
      y: yPosition,
      size: 16,
      font: headingFont,
      color: purpleColor,
    });
    yPosition -= 35;

    const intro = `These deeply personal insights reveal surprising truths about you that others wouldn't know just by looking. Our AI has analyzed your facial features with ${stunningInsights.overallConfidence}% overall confidence.`;
    yPosition = drawWrappedText(intro, 60, yPosition, 475, 10, italicFont, mediumGray);
    yPosition -= 25;

    for (const insight of stunningInsights.insights) {
      checkAndAddPage(160);

      // Draw insight box
      const boxColor = insight.isSensitive ? rgb(1, 0.95, 0.9) : veryLightGray;
      drawBox(45, yPosition + 5, 505, 130, boxColor, insight.isSensitive ? rgb(1, 0.65, 0) : lightGray);

      // Insight title
      safeDrawText(insight.title, {
        x: 60,
        y: yPosition - 10,
        size: 13,
        font: headingFont,
        color: insight.isSensitive ? rgb(1, 0.5, 0) : purpleColor,
      });
      yPosition -= 25;

      // Level and confidence
      safeDrawText(`${insight.level} | ${insight.confidence}% confidence`, {
        x: 60,
        y: yPosition,
        size: 9,
        font: italicFont,
        color: lightGray,
      });
      yPosition -= 5;

      // Sensitive badge
      if (insight.isSensitive) {
        currentPage.drawRectangle({
          x: 60,
          y: yPosition - 12,
          width: 100,
          height: 14,
          color: rgb(1, 0.65, 0),
          opacity: 0.2,
        });
        safeDrawText('[Sensitive Content]', {
          x: 65,
          y: yPosition - 9,
          size: 8,
          font: headingFont,
          color: rgb(1, 0.5, 0),
        });
        yPosition -= 22;
      } else {
        yPosition -= 15;
      }

      // Description
      yPosition = drawWrappedText(
        insight.description,
        60,
        yPosition,
        475,
        10,
        bodyFont,
        mediumGray
      );
      yPosition -= 15;

      // Based on features
      if (insight.basedOn && insight.basedOn.length > 0) {
        safeDrawText('Based on: ' + insight.basedOn.join(', '), {
          x: 60,
          y: yPosition,
          size: 8,
          font: italicFont,
          color: lightGray,
        });
        yPosition -= 25;
      }
    }

    // Disclaimer box
    checkAndAddPage(110);
    drawBox(45, yPosition + 5, 505, 90, rgb(1, 0.95, 0.95), rgb(0.8, 0.2, 0.2));
    
    safeDrawText('Important Notice', {
      x: 60,
      y: yPosition - 10,
      size: 12,
      font: headingFont,
      color: rgb(0.8, 0.2, 0.2),
    });
    yPosition -= 28;

    const disclaimer = `These insights are based on ancient face reading wisdom combined with modern AI analysis. They represent tendencies and possibilities, not absolute certainties. Your choices and actions shape your destiny. For medical, legal, or psychological concerns, please consult appropriate professionals.`;
    yPosition = drawWrappedText(disclaimer, 60, yPosition, 475, 9, italicFont, mediumGray);
    yPosition -= 30;
  }

  // ========== CONCLUSION PAGE ==========
  currentPage = pdfDoc.addPage([595, 842]);
  yPosition = 770;

  yPosition = drawGradientHeader(yPosition, 'Conclusion', goldColor, rgb(0.9, 0.7, 0));
  yPosition -= 15;

  const conclusion = `This comprehensive face reading report combines ancient wisdom with modern AI technology to provide deep insights into your personality, potential, and life path. Remember that face reading is a tool for self-understanding and personal growth.`;

  yPosition = drawWrappedText(conclusion, 60, yPosition, 475, 11, bodyFont, darkGray);
  yPosition -= 35;

  safeDrawText('How to Use This Reading', {
    x: 60,
    y: yPosition,
    size: 16,
    font: headingFont,
    color: purpleColor,
  });
  yPosition -= 35;

  const tips = [
    'Reflect on the insights - Take time to consider how the analysis resonates with your experiences',
    'Identify patterns - Look for recurring themes across different life aspects',
    'Set intentions - Use the strengths and opportunities identified to guide your goals',
    'Embrace growth - View challenges as opportunities for personal development',
    'Share mindfully - These insights are deeply personal; share them thoughtfully',
  ];

  for (const tip of tips) {
    checkAndAddPage(45);
    
    // Draw bullet
    currentPage.drawCircle({
      x: 75,
      y: yPosition - 3,
      size: 3,
      color: goldColor,
    });
    
    yPosition = drawWrappedText(tip, 90, yPosition, 455, 10, bodyFont, mediumGray);
    yPosition -= 15;
  }

  // Personal message box
  yPosition -= 20;
  checkAndAddPage(120);
  drawBox(45, yPosition + 5, 505, 100, rgb(0.98, 0.98, 1), purpleColor);
  
  safeDrawText('A Personal Message', {
    x: 60,
    y: yPosition - 10,
    size: 14,
    font: headingFont,
    color: purpleColor,
  });
  yPosition -= 30;

  const personalMessage = `${userName}, your face tells a unique story of who you are and who you can become. Use these insights as a compass, not a constraint. Your future is shaped by your choices, determination, and the love you bring to the world. May this reading illuminate your path to greater self-awareness and fulfillment.`;
  yPosition = drawWrappedText(personalMessage, 60, yPosition, 475, 10, italicFont, mediumGray);

  // Footer
  yPosition = 80;
  currentPage.drawLine({
    start: { x: 50, y: yPosition + 10 },
    end: { x: 545, y: yPosition + 10 },
    thickness: 1,
    color: lightGray,
    opacity: 0.5,
  });
  
  safeDrawText('(c) 2025 Face Reading - AI-Powered Facial Analysis', {
    x: 150,
    y: yPosition - 10,
    size: 9,
    font: bodyFont,
    color: lightGray,
  });
  yPosition -= 18;
  safeDrawText('Combining ancient wisdom with modern AI technology', {
    x: 145,
    y: yPosition,
    size: 9,
    font: italicFont,
    color: lightGray,
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

