/**
 * Advanced PDF Generator
 * 
 * Generates 20-25 page PDF reports with 3 enhanced sections:
 * - Detailed Mole/Mark Analysis
 * - Compatibility Analysis
 * - Decade-by-Decade Timeline
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Sanitize text to remove all non-ASCII characters that can't be encoded in WinAnsi
 */
function sanitizeText(text: any): any {
  if (typeof text === 'string') {
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

export interface AdvancedPDFData {
  name: string;
  gender: string;
  dateOfBirth?: string;
  createdAt: string;
  executiveSummary: any;
  detailedAnalysis: any;
  stunningInsights: any;
  moleAnalysis: any;
  compatibilityAnalysis: any;
  decadeTimeline: any;
}

/**
 * Generate enhanced PDF report with 3 additional sections
 */
export async function generateAdvancedPDF(data: AdvancedPDFData): Promise<Buffer> {
  const sanitizedData = sanitizeText(data);
  const { name, gender, dateOfBirth, createdAt, executiveSummary, detailedAnalysis, stunningInsights, moleAnalysis, compatibilityAnalysis, decadeTimeline } = sanitizedData;

  const pdfDoc = await PDFDocument.create();
  
  // Embed fonts
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const headingFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Colors
  const orangeColor = rgb(1, 0.55, 0);
  const purpleColor = rgb(0.58, 0.44, 0.86);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.5, 0.5, 0.5);

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
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\u2026]/g, '...')
      .replace(/[\u00A0]/g, ' ')
      .replace(/[^\x00-\x7F]/g, '')
      .trim();
  };

  // Helper function to safely draw text
  const safeDrawText = (text: string, options: any) => {
    const sanitized = sanitizeForPDF(text);
    if (sanitized) {
      currentPage.drawText(sanitized, options);
    }
  };

  // Helper function to draw wrapped text
  const drawWrappedText = (text: string, x: number, maxWidth: number, fontSize: number, font: any, color: any) => {
    const sanitized = sanitizeForPDF(text);
    const words = sanitized.split(' ');
    let line = '';
    
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      
      if (width > maxWidth && line) {
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

  // Helper to draw section header
  const drawSectionHeader = (title: string, color: any = orangeColor) => {
    checkAndAddPage(40);
    yPosition -= 10;
    safeDrawText(title, {
      x: 50,
      y: yPosition,
      size: 18,
      font: headingFont,
      color,
    });
    yPosition -= 30;
  };

  // Helper to draw subsection
  const drawSubsection = (title: string, content: string) => {
    checkAndAddPage(30);
    safeDrawText(title, {
      x: 50,
      y: yPosition,
      size: 12,
      font: headingFont,
      color: darkGray,
    });
    yPosition -= 20;
    
    if (content) {
      drawWrappedText(content, 50, 495, 10, bodyFont, darkGray);
      yPosition -= 10;
    }
  };

  // COVER PAGE
  safeDrawText('ADVANCED FACE READING REPORT', {
    x: 100,
    y: 700,
    size: 24,
    font: titleFont,
    color: orangeColor,
  });

  safeDrawText(`Name: ${name}`, {
    x: 100,
    y: 650,
    size: 14,
    font: bodyFont,
    color: darkGray,
  });

  safeDrawText(`Gender: ${gender}`, {
    x: 100,
    y: 630,
    size: 14,
    font: bodyFont,
    color: darkGray,
  });

  if (dateOfBirth) {
    safeDrawText(`Date of Birth: ${dateOfBirth}`, {
      x: 100,
      y: 610,
      size: 14,
      font: bodyFont,
      color: darkGray,
    });
  }

  safeDrawText(`Report Date: ${createdAt}`, {
    x: 100,
    y: 590,
    size: 14,
    font: bodyFont,
    color: darkGray,
  });

  // New page for content
  currentPage = pdfDoc.addPage([595, 842]);
  yPosition = 770;

  // EXECUTIVE SUMMARY
  drawSectionHeader('EXECUTIVE SUMMARY');
  if (executiveSummary) {
    Object.entries(executiveSummary).forEach(([key, value]: [string, any]) => {
      const title = key.replace(/([A-Z])/g, ' $1').trim();
      drawSubsection(title.toUpperCase(), String(value));
    });
  }

  // DETAILED ANALYSIS
  drawSectionHeader('DETAILED ANALYSIS');
  if (detailedAnalysis) {
    Object.entries(detailedAnalysis).forEach(([key, value]: [string, any]) => {
      const title = key.replace(/([A-Z])/g, ' $1').trim();
      if (typeof value === 'object' && !Array.isArray(value)) {
        drawSubsection(title.toUpperCase(), '');
        Object.entries(value).forEach(([subKey, subValue]: [string, any]) => {
          const subTitle = subKey.replace(/([A-Z])/g, ' $1').trim();
          drawWrappedText(`${subTitle}: ${String(subValue)}`, 70, 475, 10, bodyFont, lightGray);
          yPosition -= 5;
        });
      } else {
        drawSubsection(title.toUpperCase(), String(value));
      }
    });
  }

  // STUNNING INSIGHTS
  drawSectionHeader('STUNNING INSIGHTS', purpleColor);
  if (stunningInsights && Array.isArray(stunningInsights)) {
    stunningInsights.forEach((insight: any, index: number) => {
      checkAndAddPage(30);
      safeDrawText(`${index + 1}. ${insight.category || 'Insight'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: headingFont,
        color: purpleColor,
      });
      yPosition -= 20;
      
      if (insight.prediction) {
        drawWrappedText(insight.prediction, 70, 475, 10, bodyFont, darkGray);
      }
      if (insight.guidance) {
        drawWrappedText(`Guidance: ${insight.guidance}`, 70, 475, 10, bodyFont, lightGray);
      }
      yPosition -= 10;
    });
  }

  // ENHANCED SECTION 1: MOLE ANALYSIS
  drawSectionHeader('DETAILED MOLE & MARK ANALYSIS', orangeColor);
  if (moleAnalysis) {
    if (moleAnalysis.overview) {
      drawSubsection('Overview', moleAnalysis.overview);
    }
    
    if (moleAnalysis.marks && Array.isArray(moleAnalysis.marks)) {
      moleAnalysis.marks.forEach((mark: any, index: number) => {
        checkAndAddPage(50);
        safeDrawText(`Mark ${index + 1}: ${mark.location || 'Unknown'}`, {
          x: 50,
          y: yPosition,
          size: 11,
          font: headingFont,
          color: mark.significance === 'lucky' ? rgb(0, 0.6, 0) : rgb(0.8, 0, 0),
        });
        yPosition -= 18;
        
        if (mark.zone) {
          drawWrappedText(`Zone: ${mark.zone}`, 70, 475, 9, bodyFont, lightGray);
        }
        if (mark.significance) {
          drawWrappedText(`Significance: ${mark.significance}`, 70, 475, 9, bodyFont, darkGray);
        }
        if (mark.lifeAspect) {
          drawWrappedText(`Affects: ${mark.lifeAspect}`, 70, 475, 9, bodyFont, darkGray);
        }
        if (mark.interpretation) {
          drawWrappedText(`Interpretation: ${mark.interpretation}`, 70, 475, 9, bodyFont, darkGray);
        }
        if (mark.remedy) {
          drawWrappedText(`Remedy: ${mark.remedy}`, 70, 475, 9, bodyFont, lightGray);
        }
        yPosition -= 10;
      });
    }
  }

  // ENHANCED SECTION 2: COMPATIBILITY ANALYSIS
  drawSectionHeader('COMPATIBILITY ANALYSIS', purpleColor);
  if (compatibilityAnalysis) {
    if (compatibilityAnalysis.romantic) {
      drawSubsection('ROMANTIC COMPATIBILITY', '');
      if (compatibilityAnalysis.romantic.bestMatches) {
        drawWrappedText(`Best Matches: ${compatibilityAnalysis.romantic.bestMatches}`, 70, 475, 10, bodyFont, rgb(0, 0.6, 0));
      }
      if (compatibilityAnalysis.romantic.challenges) {
        drawWrappedText(`Challenges: ${compatibilityAnalysis.romantic.challenges}`, 70, 475, 10, bodyFont, rgb(0.8, 0, 0));
      }
      if (compatibilityAnalysis.romantic.advice) {
        drawWrappedText(`Advice: ${compatibilityAnalysis.romantic.advice}`, 70, 475, 10, bodyFont, darkGray);
      }
      yPosition -= 10;
    }
    
    if (compatibilityAnalysis.business) {
      drawSubsection('BUSINESS COMPATIBILITY', '');
      if (compatibilityAnalysis.business.idealPartners) {
        drawWrappedText(`Ideal Partners: ${compatibilityAnalysis.business.idealPartners}`, 70, 475, 10, bodyFont, rgb(0, 0.6, 0));
      }
      if (compatibilityAnalysis.business.warnings) {
        drawWrappedText(`Warnings: ${compatibilityAnalysis.business.warnings}`, 70, 475, 10, bodyFont, rgb(0.8, 0, 0));
      }
      if (compatibilityAnalysis.business.recommendations) {
        drawWrappedText(`Recommendations: ${compatibilityAnalysis.business.recommendations}`, 70, 475, 10, bodyFont, darkGray);
      }
      yPosition -= 10;
    }
    
    if (compatibilityAnalysis.friendship) {
      drawSubsection('FRIENDSHIP COMPATIBILITY', '');
      if (compatibilityAnalysis.friendship.naturalAllies) {
        drawWrappedText(`Natural Allies: ${compatibilityAnalysis.friendship.naturalAllies}`, 70, 475, 10, bodyFont, rgb(0, 0.6, 0));
      }
      if (compatibilityAnalysis.friendship.potentialConflicts) {
        drawWrappedText(`Potential Conflicts: ${compatibilityAnalysis.friendship.potentialConflicts}`, 70, 475, 10, bodyFont, rgb(0.8, 0, 0));
      }
      if (compatibilityAnalysis.friendship.tips) {
        drawWrappedText(`Tips: ${compatibilityAnalysis.friendship.tips}`, 70, 475, 10, bodyFont, darkGray);
      }
      yPosition -= 10;
    }
  }

  // ENHANCED SECTION 3: DECADE TIMELINE
  drawSectionHeader('DECADE-BY-DECADE LIFE TIMELINE', orangeColor);
  if (decadeTimeline) {
    if (decadeTimeline.overview) {
      drawSubsection('Overview', decadeTimeline.overview);
    }
    
    if (decadeTimeline.periods && Array.isArray(decadeTimeline.periods)) {
      decadeTimeline.periods.forEach((period: any) => {
        checkAndAddPage(50);
        safeDrawText(`${period.ageRange || 'Unknown Period'}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: headingFont,
          color: orangeColor,
        });
        yPosition -= 18;
        
        if (period.theme) {
          drawWrappedText(`Theme: ${period.theme}`, 70, 475, 10, bodyFont, darkGray);
        }
        if (period.opportunities) {
          drawWrappedText(`Opportunities: ${period.opportunities}`, 70, 475, 10, bodyFont, rgb(0, 0.6, 0));
        }
        if (period.challenges) {
          drawWrappedText(`Challenges: ${period.challenges}`, 70, 475, 10, bodyFont, rgb(0.8, 0, 0));
        }
        if (period.advice) {
          drawWrappedText(`Advice: ${period.advice}`, 70, 475, 10, bodyFont, lightGray);
        }
        yPosition -= 10;
      });
    }
    
    if (decadeTimeline.criticalAges && Array.isArray(decadeTimeline.criticalAges)) {
      drawSubsection('CRITICAL AGES', '');
      decadeTimeline.criticalAges.forEach((age: any) => {
        checkAndAddPage(30);
        safeDrawText(`Age ${age.age || 'Unknown'}`, {
          x: 70,
          y: yPosition,
          size: 11,
          font: headingFont,
          color: purpleColor,
        });
        yPosition -= 16;
        
        if (age.significance) {
          drawWrappedText(age.significance, 90, 455, 9, bodyFont, darkGray);
        }
        yPosition -= 8;
      });
    }
  }

  // CONCLUSION PAGE
  currentPage = pdfDoc.addPage([595, 842]);
  yPosition = 770;
  
  safeDrawText('CONCLUSION', {
    x: 50,
    y: yPosition,
    size: 18,
    font: headingFont,
    color: orangeColor,
  });
  yPosition -= 40;

  drawWrappedText(
    'This advanced face reading report provides comprehensive insights into your personality, life path, and destiny. Use this knowledge wisely to navigate your journey with greater awareness and purpose.',
    50,
    495,
    11,
    bodyFont,
    darkGray
  );

  yPosition -= 30;
  drawWrappedText(
    'Remember: Face reading is a guide, not a fixed destiny. Your choices and actions shape your future.',
    50,
    495,
    10,
    bodyFont,
    lightGray
  );

  // Generate PDF buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

