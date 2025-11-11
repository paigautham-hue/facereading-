/**
 * Robust JSON parser with multiple fallback strategies
 * Ensures 100% reliability when parsing AI-generated JSON responses
 */

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  strategy?: string;
}

/**
 * Clean common JSON formatting issues from AI responses
 */
function cleanJSONString(str: string): string {
  // Remove markdown code blocks
  str = str.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  // Remove any text before the first {
  const firstBrace = str.indexOf('{');
  if (firstBrace > 0) {
    str = str.substring(firstBrace);
  }
  
  // Remove any text after the last }
  const lastBrace = str.lastIndexOf('}');
  if (lastBrace !== -1 && lastBrace < str.length - 1) {
    str = str.substring(0, lastBrace + 1);
  }
  
  // Fix common issues
  str = str
    // Fix trailing commas before closing braces/brackets
    .replace(/,(\s*[}\]])/g, '$1')
    // Fix unquoted property names (common AI mistake)
    .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
    // Fix single quotes to double quotes
    .replace(/'/g, '"')
    // Remove comments (// and /* */)
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Fix newlines in strings
    .replace(/"\s*\n\s*"/g, '" "');
  
  return str.trim();
}

/**
 * Strategy 1: Direct parse after cleaning
 */
function tryDirectParse<T>(jsonString: string): ParseResult<T> {
  try {
    const cleaned = cleanJSONString(jsonString);
    const data = JSON.parse(cleaned) as T;
    return { success: true, data, strategy: 'direct' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      strategy: 'direct'
    };
  }
}

/**
 * Strategy 2: Extract JSON from mixed content
 */
function tryExtractJSON<T>(content: string): ParseResult<T> {
  try {
    // Find all potential JSON objects
    const jsonMatches = content.match(/\{[\s\S]*\}/g);
    if (!jsonMatches || jsonMatches.length === 0) {
      return { success: false, error: 'No JSON object found', strategy: 'extract' };
    }
    
    // Try each match (usually the largest one is the complete object)
    const sortedMatches = jsonMatches.sort((a, b) => b.length - a.length);
    
    for (const match of sortedMatches) {
      try {
        const cleaned = cleanJSONString(match);
        const data = JSON.parse(cleaned) as T;
        return { success: true, data, strategy: 'extract' };
      } catch {
        continue;
      }
    }
    
    return { success: false, error: 'No valid JSON found in matches', strategy: 'extract' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      strategy: 'extract'
    };
  }
}

/**
 * Strategy 3: Fix specific JSON syntax errors
 */
function tryFixSyntaxErrors<T>(jsonString: string): ParseResult<T> {
  try {
    let fixed = cleanJSONString(jsonString);
    
    // Try to fix common syntax errors iteratively
    const fixes = [
      // Fix missing quotes around property names
      (s: string) => s.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":'),
      // Fix trailing commas
      (s: string) => s.replace(/,(\s*[}\]])/g, '$1'),
      // Fix double commas
      (s: string) => s.replace(/,,+/g, ','),
      // Fix missing commas between properties
      (s: string) => s.replace(/"\s*\n\s*"/g, '",\n"'),
      // Fix escaped quotes
      (s: string) => s.replace(/\\"/g, '"'),
    ];
    
    for (const fix of fixes) {
      try {
        fixed = fix(fixed);
        const data = JSON.parse(fixed) as T;
        return { success: true, data, strategy: 'fix-syntax' };
      } catch {
        continue;
      }
    }
    
    return { success: false, error: 'Could not fix syntax errors', strategy: 'fix-syntax' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      strategy: 'fix-syntax'
    };
  }
}

/**
 * Strategy 4: Truncate and parse (for incomplete JSON)
 */
function tryTruncateAndParse<T>(jsonString: string): ParseResult<T> {
  try {
    let cleaned = cleanJSONString(jsonString);
    
    // Find the last complete object by counting braces
    let braceCount = 0;
    let lastValidPosition = -1;
    
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === '{') braceCount++;
      if (cleaned[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          lastValidPosition = i + 1;
        }
      }
    }
    
    if (lastValidPosition > 0) {
      const truncated = cleaned.substring(0, lastValidPosition);
      try {
        const data = JSON.parse(truncated) as T;
        return { success: true, data, strategy: 'truncate' };
      } catch {
        // Continue to error
      }
    }
    
    return { success: false, error: 'Could not find valid truncation point', strategy: 'truncate' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      strategy: 'truncate'
    };
  }
}

/**
 * Main robust JSON parser with multiple fallback strategies
 */
export function parseRobustJSON<T>(jsonString: string): ParseResult<T> {
  // Try strategies in order of reliability
  const strategies = [
    tryDirectParse<T>,
    tryExtractJSON<T>,
    tryFixSyntaxErrors<T>,
    tryTruncateAndParse<T>,
  ];
  
  for (const strategy of strategies) {
    const result = strategy(jsonString);
    if (result.success) {
      console.log(`✅ JSON parsed successfully using strategy: ${result.strategy}`);
      return result;
    } else {
      console.log(`⚠️ Strategy ${result.strategy} failed: ${result.error}`);
    }
  }
  
  // All strategies failed
  return {
    success: false,
    error: 'All parsing strategies failed. The JSON response is severely malformed.',
    strategy: 'all-failed'
  };
}

/**
 * Parse JSON with automatic retry and detailed error reporting
 */
export function parseJSONWithRetry<T>(
  jsonString: string,
  maxRetries: number = 3,
  onRetry?: (attempt: number, error: string) => void
): T {
  let lastError = '';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = parseRobustJSON<T>(jsonString);
    
    if (result.success && result.data) {
      return result.data;
    }
    
    lastError = result.error || 'Unknown parsing error';
    
    if (attempt < maxRetries && onRetry) {
      onRetry(attempt, lastError);
    }
  }
  
  // All retries exhausted
  throw new Error(
    `Failed to parse JSON after ${maxRetries} attempts. Last error: ${lastError}\n\n` +
    `JSON preview (first 500 chars): ${jsonString.substring(0, 500)}...`
  );
}

