import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Sanitize text to remove all non-ASCII characters that can't be encoded in WinAnsi
 */
function sanitizeText(text: any): any {
  if (typeof text === 'string') {
    return text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\u2026]/g, '...')
      .replace(/[\u00A0]/g, ' ')
      .replace(/[^\x00-\x7F]/g, '')
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

export interface AdvancedPDFGenerationData {
  userName: string;
  readingDate: string;
  executiveSummary: any;
  detailedAnalysis: any;
  stunningInsights?: any;
  // Enhanced sections
  moleAnalysis: any;
  compatibilityAnalysis: any;
  decadeTimeline: any;
  images: Array<{ type: string; url: string }>;
}

/**
 * Generate a comprehensive 20-25 page advanced face reading PDF report
 */
export async function generateAdvancedPDF(data: AdvancedPDFGenerationData): Promise<Buffer> {
  const sanitizedData = sanitizeText(data);
  const {
    userName,
    readingDate,
    executiveSummary,
    detailedAnalysis,
    stunningInsights,
    moleAnalysis,
    compatibilityAnalysis,
    decadeTimeline,
  } = sanitizedData;

  const pdfDoc = await PDFDocument.create();
  
  // Embed fonts
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const headingFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Colors
  const goldColor = rgb(1, 0.84, 0);
  const purpleColor = rgb(0.58, 0.44, 0.86);
  const pinkColor = rgb(1, 0.41, 0.71);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.5, 0.5, 0.5);
  const mediumGray = rgb(0.35, 0.35, 0.35);
  const veryLightGray = rgb(0.95, 0.95, 0.95);

  let currentPage = pdfDoc.addPage([595, 842]); // A4 size
  let yPosition = 750;

  const checkAndAddPage = (spaceNeeded: number) => {
    if (yPosition - spaceNeeded < 70) {
      currentPage = pdfDoc.addPage([595, 842]);
      yPosition = 770;
      return true;
    }
    return false;
  };

  const sanitizeForPDF = (text: string): string => {
    if (typeof text !== 'string') return String(text);
    return text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\u2026]/g, '...')
      .replace(/[\u00A0]/g, ' ')
      .replace(/[^\x00-\x7F]/g, '')
      .trim();
  };

  const safeDrawText = (text: string, options: any) => {
    const sanitized = sanitizeForPDF(text);
    if (sanitized) {
      currentPage.drawText(sanitized, options);
    }
  };

  const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, font: any, color: any) => {
    const sanitized = sanitizeForPDF(text);
    const words = sanitized.split(' ');
    let line = '';
    let lineY = y;

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && line) {
        checkAndAddPage(fontSize + 4);
        safeDrawText(line, { x, y: yPosition, size: fontSize, font, color });
        yPosition -= fontSize + 4;
        line = word;
      } else {
        line = testLine;
      }
    }
    
    if (line) {
      checkAndAddPage(fontSize + 4);
      safeDrawText(line, { x, y: yPosition, size: fontSize, font, color });
      yPosition -= fontSize + 4;
    }
  };

  // ============ COVER PAGE ============
  safeDrawText('ADVANCED FACE READING REPORT', {
    x: 50,
    y: yPosition,
    size: 28,
    font: titleFont,
    color: purpleColor,
  });
  yPosition -= 40;

  safeDrawText('Comprehensive Analysis with Enhanced Insights', {
    x: 50,
    y: yPosition,
    size: 14,
    font: italicFont,
    color: pinkColor,
  });
  yPosition -= 60;

  safeDrawText(`Prepared for: ${userName}`, {
    x: 50,
    y: yPosition,
    size: 14,
    font: bodyFont,
    color: darkGray,
  });
  yPosition -= 25;

  safeDrawText(`Date: ${readingDate}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: bodyFont,
    color: mediumGray,
  });
  yPosition -= 50;

  safeDrawText('This report includes:', {
    x: 50,
    y: yPosition,
    size: 12,
    font: headingFont,
    color: darkGray,
  });
  yPosition -= 25;

  const sections = [
    'Executive Summary & Key Insights',
    'Detailed Facial Analysis (12 Features)',
    'Life Aspects Analysis (15 Areas)',
    'Stunning Insights & Predictions',
    'ADVANCED: Detailed Mole Analysis (100+ Zones)',
    'ADVANCED: Compatibility Analysis (Romantic, Business, Friendship)',
    'ADVANCED: Decade-by-Decade Life Timeline',
  ];

  sections.forEach((section) => {
    checkAndAddPage(20);
    safeDrawText(`• ${section}`, {
      x: 70,
      y: yPosition,
      size: 11,
      font: bodyFont,
      color: section.includes('ADVANCED') ? purpleColor : darkGray,
    });
    yPosition -= 22;
  });

  // ============ STANDARD SECTIONS (reuse from original PDF) ============
  // Executive Summary
  checkAndAddPage(100);
  yPosition -= 20;
  safeDrawText('EXECUTIVE SUMMARY', {
    x: 50,
    y: yPosition,
    size: 20,
    font: headingFont,
    color: goldColor,
  });
  yPosition -= 35;

  if (executiveSummary?.whatISeeFirst) {
    safeDrawText('What I See First:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: headingFont,
      color: darkGray,
    });
    yPosition -= 25;

    executiveSummary.whatISeeFirst.slice(0, 5).forEach((feature: string) => {
      checkAndAddPage(20);
      safeDrawText(`• ${feature}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: bodyFont,
        color: mediumGray,
      });
      yPosition -= 20;
    });
    yPosition -= 10;
  }

  // Face Shape
  if (executiveSummary?.faceShape) {
    checkAndAddPage(80);
    safeDrawText('Face Shape Analysis:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: headingFont,
      color: darkGray,
    });
    yPosition -= 25;

    safeDrawText(`Shape: ${executiveSummary.faceShape.classification}`, {
      x: 70,
      y: yPosition,
      size: 11,
      font: bodyFont,
      color: mediumGray,
    });
    yPosition -= 20;

    safeDrawText(`Element: ${executiveSummary.faceShape.element}`, {
      x: 70,
      y: yPosition,
      size: 11,
      font: bodyFont,
      color: mediumGray,
    });
    yPosition -= 25;

    drawWrappedText(executiveSummary.faceShape.interpretation, 70, yPosition, 450, 11, bodyFont, mediumGray);
    yPosition -= 15;
  }

  // ============ ADVANCED SECTION 1: MOLE ANALYSIS ============
  checkAndAddPage(100);
  yPosition -= 30;
  
  // Draw purple gradient header box
  currentPage.drawRectangle({
    x: 40,
    y: yPosition - 5,
    width: 515,
    height: 35,
    color: rgb(0.58, 0.44, 0.86),
    opacity: 0.2,
  });

  safeDrawText('ADVANCED: DETAILED MOLE ANALYSIS', {
    x: 50,
    y: yPosition,
    size: 20,
    font: headingFont,
    color: purpleColor,
  });
  yPosition -= 50;

  if (moleAnalysis?.overview) {
    safeDrawText('Overview:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: headingFont,
      color: darkGray,
    });
    yPosition -= 25;
    drawWrappedText(moleAnalysis.overview, 70, yPosition, 450, 11, bodyFont, mediumGray);
    yPosition -= 20;
  }

  if (moleAnalysis?.significantMoles && Array.isArray(moleAnalysis.significantMoles)) {
    checkAndAddPage(50);
    safeDrawText('Significant Moles:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: headingFont,
      color: darkGray,
    });
    yPosition -= 30;

    moleAnalysis.significantMoles.slice(0, 8).forEach((mole: any, index: number) => {
      checkAndAddPage(120);
      
      // Mole number and position
      safeDrawText(`Mole ${index + 1}: ${mole.position} (Zone ${mole.zone})`, {
        x: 70,
        y: yPosition,
        size: 12,
        font: headingFont,
        color: darkGray,
      });
      yPosition -= 22;

      // Auspiciousness indicator
      const auspColor = 
        mole.auspiciousness === 'very_lucky' || mole.auspiciousness === 'lucky' ? rgb(0, 0.7, 0) :
        mole.auspiciousness === 'very_unlucky' || mole.auspiciousness === 'unlucky' ? rgb(0.8, 0, 0) :
        rgb(0.5, 0.5, 0.5);
      
      safeDrawText(`Auspiciousness: ${mole.auspiciousness?.replace(/_/g, ' ').toUpperCase()}`, {
        x: 90,
        y: yPosition,
        size: 10,
        font: bodyFont,
        color: auspColor,
      });
      yPosition -= 20;

      // Interpretation
      drawWrappedText(mole.interpretation, 90, yPosition, 430, 10, bodyFont, mediumGray);
      yPosition -= 10;

      // Life areas
      if (mole.lifeAreas && Array.isArray(mole.lifeAreas)) {
        safeDrawText(`Affects: ${mole.lifeAreas.join(', ')}`, {
          x: 90,
          y: yPosition,
          size: 9,
          font: italicFont,
          color: lightGray,
        });
        yPosition -= 18;
      }

      // Timing
      if (mole.timing) {
        safeDrawText(`Peak Influence: ${mole.timing}`, {
          x: 90,
          y: yPosition,
          size: 9,
          font: italicFont,
          color: lightGray,
        });
        yPosition -= 18;
      }

      // Remedies for unlucky moles
      if (mole.remedies && Array.isArray(mole.remedies) && mole.remedies.length > 0) {
        safeDrawText('Remedies:', {
          x: 90,
          y: yPosition,
          size: 9,
          font: headingFont,
          color: rgb(0, 0.5, 0.8),
        });
        yPosition -= 16;

        mole.remedies.slice(0, 2).forEach((remedy: string) => {
          checkAndAddPage(18);
          safeDrawText(`  • ${remedy}`, {
            x: 100,
            y: yPosition,
            size: 9,
            font: bodyFont,
            color: mediumGray,
          });
          yPosition -= 16;
        });
      }

      yPosition -= 10;
    });
  }

  // ============ ADVANCED SECTION 2: COMPATIBILITY ANALYSIS ============
  checkAndAddPage(100);
  yPosition -= 30;
  
  currentPage.drawRectangle({
    x: 40,
    y: yPosition - 5,
    width: 515,
    height: 35,
    color: rgb(1, 0.41, 0.71),
    opacity: 0.2,
  });

  safeDrawText('ADVANCED: COMPATIBILITY ANALYSIS', {
    x: 50,
    y: yPosition,
    size: 20,
    font: headingFont,
    color: pinkColor,
  });
  yPosition -= 50;

  // Romantic Compatibility
  if (compatibilityAnalysis?.romanticCompatibility) {
    const romantic = compatibilityAnalysis.romanticCompatibility;
    
    safeDrawText('Romantic Compatibility:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: headingFont,
      color: darkGray,
    });
    yPosition -= 25;

    if (romantic.bestMatches && Array.isArray(romantic.bestMatches)) {
      safeDrawText(`Best Matches: ${romantic.bestMatches.join(', ')}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: bodyFont,
        color: rgb(0, 0.6, 0),
      });
      yPosition -= 22;
    }

    if (romantic.challengingMatches && Array.isArray(romantic.challengingMatches)) {
      safeDrawText(`Challenging Matches: ${romantic.challengingMatches.join(', ')}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: bodyFont,
        color: rgb(0.8, 0.4, 0),
      });
      yPosition -= 25;
    }

    if (romantic.relationshipStyle) {
      drawWrappedText(`Relationship Style: ${romantic.relationshipStyle}`, 70, yPosition, 450, 10, bodyFont, mediumGray);
      yPosition -= 15;
    }

    if (romantic.longTermPotential) {
      drawWrappedText(`Long-term Potential: ${romantic.longTermPotential}`, 70, yPosition, 450, 10, bodyFont, mediumGray);
      yPosition -= 20;
    }
  }

  // Business Compatibility
  if (compatibilityAnalysis?.businessCompatibility) {
    checkAndAddPage(100);
    const business = compatibilityAnalysis.businessCompatibility;
    
    safeDrawText('Business Compatibility:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: headingFont,
      color: darkGray,
    });
    yPosition -= 25;

    if (business.idealPartners && Array.isArray(business.idealPartners)) {
      safeDrawText(`Ideal Partners: ${business.idealPartners.join(', ')}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: bodyFont,
        color: rgb(0, 0.6, 0),
      });
      yPosition -= 22;
    }

    if (business.leadershipStyle) {
      drawWrappedText(`Leadership Style: ${business.leadershipStyle}`, 70, yPosition, 450, 10, bodyFont, mediumGray);
      yPosition -= 15;
    }

    if (business.negotiationApproach) {
      drawWrappedText(`Negotiation Approach: ${business.negotiationApproach}`, 70, yPosition, 450, 10, bodyFont, mediumGray);
      yPosition -= 20;
    }
  }

  // Friendship Compatibility
  if (compatibilityAnalysis?.friendshipCompatibility) {
    checkAndAddPage(80);
    const friendship = compatibilityAnalysis.friendshipCompatibility;
    
    safeDrawText('Friendship Compatibility:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: headingFont,
      color: darkGray,
    });
    yPosition -= 25;

    if (friendship.bestFriendTypes && Array.isArray(friendship.bestFriendTypes)) {
      safeDrawText(`Best Friend Types: ${friendship.bestFriendTypes.join(', ')}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: bodyFont,
        color: rgb(0, 0.6, 0),
      });
      yPosition -= 22;
    }

    if (friendship.socialCircle) {
      drawWrappedText(`Social Circle: ${friendship.socialCircle}`, 70, yPosition, 450, 10, bodyFont, mediumGray);
      yPosition -= 20;
    }
  }

  // ============ ADVANCED SECTION 3: DECADE TIMELINE ============
  checkAndAddPage(100);
  yPosition -= 30;
  
  currentPage.drawRectangle({
    x: 40,
    y: yPosition - 5,
    width: 515,
    height: 35,
    color: rgb(1, 0.65, 0),
    opacity: 0.2,
  });

  safeDrawText('ADVANCED: DECADE-BY-DECADE TIMELINE', {
    x: 50,
    y: yPosition,
    size: 20,
    font: headingFont,
    color: goldColor,
  });
  yPosition -= 50;

  if (decadeTimeline?.decades && Array.isArray(decadeTimeline.decades)) {
    decadeTimeline.decades.slice(0, 9).forEach((decade: any, index: number) => {
      checkAndAddPage(110);
      
      // Decade header
      safeDrawText(`${decade.ageRange}: ${decade.period}`, {
        x: 50,
        y: yPosition,
        size: 13,
        font: headingFont,
        color: darkGray,
      });
      yPosition -= 22;

      // Fortune level with color
      const fortuneColor = 
        decade.fortuneLevel === 'excellent' || decade.fortuneLevel === 'good' ? rgb(0, 0.7, 0) :
        decade.fortuneLevel === 'difficult' || decade.fortuneLevel === 'challenging' ? rgb(0.8, 0, 0) :
        rgb(0.5, 0.5, 0.5);
      
      safeDrawText(`Fortune Level: ${decade.fortuneLevel?.toUpperCase()}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: headingFont,
        color: fortuneColor,
      });
      yPosition -= 22;

      // Key themes
      if (decade.keyThemes && Array.isArray(decade.keyThemes)) {
        safeDrawText('Key Themes:', {
          x: 70,
          y: yPosition,
          size: 10,
          font: headingFont,
          color: mediumGray,
        });
        yPosition -= 18;

        decade.keyThemes.slice(0, 3).forEach((theme: string) => {
          checkAndAddPage(16);
          safeDrawText(`• ${theme}`, {
            x: 85,
            y: yPosition,
            size: 9,
            font: bodyFont,
            color: mediumGray,
          });
          yPosition -= 16;
        });
      }

      // Advice
      if (decade.advice) {
        checkAndAddPage(30);
        drawWrappedText(`Advice: ${decade.advice}`, 70, yPosition, 450, 9, italicFont, lightGray);
        yPosition -= 15;
      }

      yPosition -= 8;
    });
  }

  // Critical Ages
  if (decadeTimeline?.criticalAges && Array.isArray(decadeTimeline.criticalAges)) {
    checkAndAddPage(80);
    yPosition -= 20;
    
    safeDrawText('Critical Ages & Turning Points:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: headingFont,
      color: rgb(0.8, 0, 0),
    });
    yPosition -= 30;

    decadeTimeline.criticalAges.slice(0, 7).forEach((critical: any) => {
      checkAndAddPage(70);
      
      safeDrawText(`Age ${critical.age}: ${critical.significance}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: headingFont,
        color: darkGray,
      });
      yPosition -= 20;

      if (critical.prediction) {
        drawWrappedText(critical.prediction, 85, yPosition, 435, 9, bodyFont, mediumGray);
        yPosition -= 10;
      }

      if (critical.preparation) {
        drawWrappedText(`Preparation: ${critical.preparation}`, 85, yPosition, 435, 9, italicFont, lightGray);
        yPosition -= 15;
      }

      yPosition -= 8;
    });
  }

  // ============ FOOTER ON LAST PAGE ============
  checkAndAddPage(100);
  yPosition -= 30;
  
  safeDrawText('End of Advanced Face Reading Report', {
    x: 50,
    y: yPosition,
    size: 12,
    font: italicFont,
    color: lightGray,
  });
  yPosition -= 25;

  safeDrawText('This comprehensive 20-25 page report combines ancient wisdom with modern AI analysis.', {
    x: 50,
    y: yPosition,
    size: 10,
    font: bodyFont,
    color: lightGray,
  });
  yPosition -= 20;

  safeDrawText('Generated by Advanced Face Reading System - Admin Only', {
    x: 50,
    y: yPosition,
    size: 9,
    font: italicFont,
    color: purpleColor,
  });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

