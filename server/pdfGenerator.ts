import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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
  const { userName, readingDate, executiveSummary, detailedAnalysis } = data;

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
  const lightGray = rgb(0.4, 0.4, 0.4);

  let currentPage = pdfDoc.addPage([595, 842]); // A4 size
  let yPosition = 750;

  // Helper function to add new page if needed
  const checkAndAddPage = (spaceNeeded: number) => {
    if (yPosition - spaceNeeded < 50) {
      currentPage = pdfDoc.addPage([595, 842]);
      yPosition = 750;
      return true;
    }
    return false;
  };

  // Helper function to draw wrapped text
  const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, font: any, color: any) => {
    const words = text.split(' ');
    let line = '';
    let lineY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && i > 0) {
        currentPage.drawText(line, { x, y: lineY, size: fontSize, font, color });
        line = words[i] + ' ';
        lineY -= fontSize + 5;
        
        if (lineY < 50) {
          currentPage = pdfDoc.addPage([595, 842]);
          lineY = 750;
        }
      } else {
        line = testLine;
      }
    }
    currentPage.drawText(line, { x, y: lineY, size: fontSize, font, color });
    return lineY - fontSize - 10;
  };

  // Cover Page
  currentPage.drawText('Your Face Reading', {
    x: 150,
    y: 600,
    size: 36,
    font: titleFont,
    color: goldColor,
  });

  currentPage.drawText('A Journey of Self-Discovery', {
    x: 180,
    y: 550,
    size: 20,
    font: headingFont,
    color: purpleColor,
  });

  currentPage.drawText(`Prepared for: ${userName}`, {
    x: 200,
    y: 450,
    size: 14,
    font: bodyFont,
    color: darkGray,
  });

  currentPage.drawText(readingDate, {
    x: 250,
    y: 420,
    size: 12,
    font: bodyFont,
    color: lightGray,
  });

  // New page for Executive Summary
  currentPage = pdfDoc.addPage([595, 842]);
  yPosition = 750;

  // Executive Summary Title
  currentPage.drawText('Executive Summary', {
    x: 50,
    y: yPosition,
    size: 28,
    font: titleFont,
    color: goldColor,
  });
  yPosition -= 50;

  // What I See First
  if (executiveSummary.whatISeeFirst && executiveSummary.whatISeeFirst.length > 0) {
    currentPage.drawText('What I See First', {
      x: 50,
      y: yPosition,
      size: 18,
      font: headingFont,
      color: purpleColor,
    });
    yPosition -= 30;

    for (const item of executiveSummary.whatISeeFirst) {
      checkAndAddPage(30);
      currentPage.drawText('• ' + item, {
        x: 70,
        y: yPosition,
        size: 11,
        font: bodyFont,
        color: darkGray,
      });
      yPosition -= 25;
    }
    yPosition -= 20;
  }

  // Face Shape & Element
  if (executiveSummary.faceShape) {
    checkAndAddPage(100);
    currentPage.drawText('Face Shape & Element', {
      x: 50,
      y: yPosition,
      size: 18,
      font: headingFont,
      color: purpleColor,
    });
    yPosition -= 30;

    currentPage.drawText(`Classification: ${executiveSummary.faceShape.classification}`, {
      x: 70,
      y: yPosition,
      size: 11,
      font: bodyFont,
      color: darkGray,
    });
    yPosition -= 25;

    currentPage.drawText(`Element: ${executiveSummary.faceShape.element}`, {
      x: 70,
      y: yPosition,
      size: 11,
      font: bodyFont,
      color: darkGray,
    });
    yPosition -= 30;

    if (executiveSummary.faceShape.interpretation) {
      yPosition = drawWrappedText(
        executiveSummary.faceShape.interpretation,
        70,
        yPosition,
        450,
        11,
        bodyFont,
        darkGray
      );
    }
    yPosition -= 20;
  }

  // Key Insights
  if (executiveSummary.keyInsights && executiveSummary.keyInsights.length > 0) {
    checkAndAddPage(50);
    currentPage.drawText('Key Insights', {
      x: 50,
      y: yPosition,
      size: 18,
      font: headingFont,
      color: purpleColor,
    });
    yPosition -= 30;

    for (let i = 0; i < executiveSummary.keyInsights.length; i++) {
      checkAndAddPage(60);
      currentPage.drawText(`Insight ${i + 1}`, {
        x: 70,
        y: yPosition,
        size: 13,
        font: headingFont,
        color: darkGray,
      });
      yPosition -= 25;

      yPosition = drawWrappedText(
        executiveSummary.keyInsights[i],
        70,
        yPosition,
        450,
        11,
        bodyFont,
        darkGray
      );
      yPosition -= 20;
    }
  }

  // Personality Snapshot
  if (executiveSummary.personalitySnapshot && executiveSummary.personalitySnapshot.length > 0) {
    currentPage = pdfDoc.addPage([595, 842]);
    yPosition = 750;

    currentPage.drawText('Personality Snapshot', {
      x: 50,
      y: yPosition,
      size: 24,
      font: titleFont,
      color: goldColor,
    });
    yPosition -= 50;

    for (const trait of executiveSummary.personalitySnapshot) {
      checkAndAddPage(80);
      currentPage.drawText(trait.trait, {
        x: 70,
        y: yPosition,
        size: 14,
        font: headingFont,
        color: purpleColor,
      });
      yPosition -= 25;

      currentPage.drawText(`Confidence: ${trait.confidence}%`, {
        x: 70,
        y: yPosition,
        size: 10,
        font: italicFont,
        color: lightGray,
      });
      yPosition -= 25;

      yPosition = drawWrappedText(
        trait.description,
        70,
        yPosition,
        450,
        11,
        bodyFont,
        darkGray
      );
      yPosition -= 25;
    }
  }

  // Life Aspects
  if (detailedAnalysis.lifeAspects) {
    currentPage = pdfDoc.addPage([595, 842]);
    yPosition = 750;

    currentPage.drawText('Life Aspects Analysis', {
      x: 50,
      y: yPosition,
      size: 24,
      font: titleFont,
      color: goldColor,
    });
    yPosition -= 50;

    const aspects = [
      { key: 'personality', title: 'Personality Traits' },
      { key: 'intellectual', title: 'Intellectual Capacity' },
      { key: 'career', title: 'Career & Success' },
      { key: 'wealth', title: 'Wealth & Finance' },
      { key: 'relationships', title: 'Love & Relationships' },
      { key: 'health', title: 'Health & Vitality' },
      { key: 'family', title: 'Family & Children' },
      { key: 'social', title: 'Social Life' },
      { key: 'creativity', title: 'Creativity & Expression' },
      { key: 'spirituality', title: 'Spirituality & Wisdom' },
      { key: 'willpower', title: 'Willpower & Determination' },
      { key: 'emotionalIntelligence', title: 'Emotional Intelligence' },
      { key: 'authority', title: 'Authority & Power' },
      { key: 'lifePurpose', title: 'Life Purpose' },
      { key: 'laterLifeFortune', title: 'Later Life Fortune' },
    ];

    for (const aspect of aspects) {
      const content = detailedAnalysis.lifeAspects[aspect.key];
      if (content && content !== 'Not available') {
        checkAndAddPage(80);
        
        currentPage.drawText(aspect.title, {
          x: 70,
          y: yPosition,
          size: 14,
          font: headingFont,
          color: purpleColor,
        });
        yPosition -= 25;

        yPosition = drawWrappedText(
          content,
          70,
          yPosition,
          450,
          10,
          bodyFont,
          darkGray
        );
        yPosition -= 25;
      }
    }
  }

  // Stunning Insights Section
  if (data.stunningInsights && data.stunningInsights.insights && data.stunningInsights.insights.length > 0) {
    currentPage = pdfDoc.addPage([595, 842]);
    yPosition = 750;

    currentPage.drawText('What Will Stun You', {
      x: 50,
      y: yPosition,
      size: 24,
      font: titleFont,
      color: goldColor,
    });
    yPosition -= 30;

    currentPage.drawText('About Your Reading', {
      x: 50,
      y: yPosition,
      size: 20,
      font: headingFont,
      color: purpleColor,
    });
    yPosition -= 40;

    const intro = `These deeply personal insights reveal surprising truths about you that others wouldn't know just by looking. Our AI has analyzed your facial features with ${data.stunningInsights.overallConfidence}% overall confidence.`;
    yPosition = drawWrappedText(intro, 70, yPosition, 450, 10, italicFont, lightGray);
    yPosition -= 30;

    for (const insight of data.stunningInsights.insights) {
      checkAndAddPage(150);

      // Insight title with category
      currentPage.drawText(insight.title, {
        x: 70,
        y: yPosition,
        size: 14,
        font: headingFont,
        color: insight.isSensitive ? rgb(1, 0.65, 0) : purpleColor,
      });
      yPosition -= 20;

      // Level and confidence
      currentPage.drawText(`${insight.level} | ${insight.confidence}% confidence`, {
        x: 70,
        y: yPosition,
        size: 9,
        font: italicFont,
        color: lightGray,
      });
      yPosition -= 5;

      // Sensitive content badge
      if (insight.isSensitive) {
        currentPage.drawText('[Sensitive Content]', {
          x: 70,
          y: yPosition,
          size: 8,
          font: bodyFont,
          color: rgb(1, 0.65, 0),
        });
        yPosition -= 20;
      } else {
        yPosition -= 15;
      }

      // Description
      yPosition = drawWrappedText(
        insight.description,
        70,
        yPosition,
        450,
        10,
        bodyFont,
        darkGray
      );
      yPosition -= 15;

      // Based on features
      if (insight.basedOn && insight.basedOn.length > 0) {
        currentPage.drawText('Based on: ' + insight.basedOn.join(', '), {
          x: 70,
          y: yPosition,
          size: 8,
          font: italicFont,
          color: lightGray,
        });
        yPosition -= 25;
      }
    }

    // Disclaimer
    checkAndAddPage(100);
    currentPage.drawText('Important Notice', {
      x: 70,
      y: yPosition,
      size: 12,
      font: headingFont,
      color: rgb(0.8, 0.2, 0.2),
    });
    yPosition -= 20;

    const disclaimer = `These insights are based on ancient face reading wisdom combined with modern AI analysis. They represent tendencies and possibilities, not absolute certainties. Your choices and actions shape your destiny. For medical, legal, or psychological concerns, please consult appropriate professionals.`;
    yPosition = drawWrappedText(disclaimer, 70, yPosition, 450, 9, italicFont, lightGray);
    yPosition -= 30;
  }

  // Final page - Conclusion
  currentPage = pdfDoc.addPage([595, 842]);
  yPosition = 750;

  currentPage.drawText('Conclusion', {
    x: 50,
    y: yPosition,
    size: 24,
    font: titleFont,
    color: goldColor,
  });
  yPosition -= 50;

  const conclusion = `This comprehensive face reading report combines ancient wisdom with modern AI technology to provide deep insights into your personality, potential, and life path. Remember that face reading is a tool for self-understanding and personal growth.`;

  yPosition = drawWrappedText(conclusion, 70, yPosition, 450, 11, bodyFont, darkGray);
  yPosition -= 40;

  currentPage.drawText('How to Use This Reading', {
    x: 70,
    y: yPosition,
    size: 16,
    font: headingFont,
    color: purpleColor,
  });
  yPosition -= 30;

  const tips = [
    'Reflect on the insights - Take time to consider how the analysis resonates with your experiences',
    'Identify patterns - Look for recurring themes across different life aspects',
    'Set intentions - Use the strengths and opportunities identified to guide your goals',
    'Embrace growth - View challenges as opportunities for personal development',
  ];

  for (const tip of tips) {
    yPosition = drawWrappedText(`• ${tip}`, 90, yPosition, 420, 10, bodyFont, darkGray);
    yPosition -= 15;
  }

  // Footer
  yPosition = 100;
  currentPage.drawText('© 2025 Face Reading - AI-Powered Facial Analysis', {
    x: 150,
    y: yPosition,
    size: 9,
    font: bodyFont,
    color: lightGray,
  });
  yPosition -= 15;
  currentPage.drawText('Combining ancient wisdom with modern AI technology', {
    x: 140,
    y: yPosition,
    size: 9,
    font: italicFont,
    color: lightGray,
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

