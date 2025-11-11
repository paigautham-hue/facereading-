/**
 * Safe JSON parser for database fields
 * Returns null if parsing fails instead of throwing
 */

export function safeJSONParse<T>(jsonString: string | null | undefined, fallback: T | null = null): T | null {
  if (!jsonString) {
    return fallback;
  }
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse JSON from database:', error);
    console.error('JSON string:', jsonString.substring(0, 200));
    return fallback;
  }
}

