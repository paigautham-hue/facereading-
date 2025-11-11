import { parseRobustJSON, parseJSONWithRetry } from "./server/jsonParser";

console.log("🧪 Testing JSON Parser with Edge Cases\n");
console.log("=".repeat(80));

// Test cases with various malformed JSON that AI might return
const testCases = [
  {
    name: "Valid JSON",
    input: '{"name": "John", "age": 30}',
    shouldSucceed: true
  },
  {
    name: "JSON with markdown code blocks",
    input: '```json\n{"name": "John", "age": 30}\n```',
    shouldSucceed: true
  },
  {
    name: "JSON with text before and after",
    input: 'Here is the analysis:\n{"name": "John", "age": 30}\nHope this helps!',
    shouldSucceed: true
  },
  {
    name: "JSON with trailing comma",
    input: '{"name": "John", "age": 30,}',
    shouldSucceed: true
  },
  {
    name: "JSON with single quotes",
    input: "{'name': 'John', 'age': 30}",
    shouldSucceed: true
  },
  {
    name: "JSON with unquoted keys",
    input: '{name: "John", age: 30}',
    shouldSucceed: true
  },
  {
    name: "JSON with comments",
    input: '{\n  "name": "John", // First name\n  "age": 30 /* Years old */\n}',
    shouldSucceed: true
  },
  {
    name: "Nested JSON with markdown",
    input: '```json\n{\n  "person": {\n    "name": "John",\n    "details": {\n      "age": 30,\n      "city": "NYC"\n    }\n  }\n}\n```',
    shouldSucceed: true
  },
  {
    name: "JSON with escaped quotes",
    input: '{"message": "He said \\"hello\\""}',
    shouldSucceed: true
  },
  {
    name: "Incomplete JSON (truncated)",
    input: '{"name": "John", "age": 30, "address": {"city": "NYC"',
    shouldSucceed: false
  },
  {
    name: "Real-world AI response with explanation",
    input: `Based on the facial analysis, here is the reading:

\`\`\`json
{
  "executiveSummary": {
    "faceShape": {
      "classification": "Oval",
      "element": "Water",
      "interpretation": "Balanced and harmonious"
    },
    "personalitySnapshot": [
      {
        "trait": "Empathetic",
        "confidence": 85,
        "description": "Shows strong emotional intelligence"
      }
    ]
  }
}
\`\`\`

This analysis is based on traditional face reading principles.`,
    shouldSucceed: true
  },
  {
    name: "JSON with newlines in strings",
    input: '{"description": "This is a\nmulti-line\nstring"}',
    shouldSucceed: true
  },
  {
    name: "Complex nested structure from actual face reading",
    input: `{
  "executiveSummary": {
    "whatISeeFirst": ["Strong jawline", "Bright eyes"],
    "faceShape": {
      "classification": "Square",
      "element": "Earth",
      "interpretation": "Practical and grounded"
    },
    "personalitySnapshot": [
      {
        "trait": "Leadership",
        "confidence": 90,
        "description": "Natural leader with strong presence"
      },
      {
        "trait": "Determination",
        "confidence": 85,
        "description": "Persistent and goal-oriented"
      }
    ],
    "lifeStrengths": [
      "Career success through hard work",
      "Strong family values",
      "Financial stability"
    ]
  }
}`,
    shouldSucceed: true
  }
];

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  console.log(`\n📝 Test: ${testCase.name}`);
  console.log("-".repeat(80));
  console.log(`Input preview: ${testCase.input.substring(0, 100)}${testCase.input.length > 100 ? '...' : ''}`);
  
  const result = parseRobustJSON(testCase.input);
  
  if (result.success === testCase.shouldSucceed) {
    console.log(`✅ PASSED - Strategy used: ${result.strategy}`);
    if (result.data) {
      console.log(`   Parsed data keys: ${Object.keys(result.data).join(', ')}`);
    }
    passed++;
  } else {
    console.log(`❌ FAILED - Expected ${testCase.shouldSucceed ? 'success' : 'failure'}, got ${result.success ? 'success' : 'failure'}`);
    console.log(`   Error: ${result.error}`);
    failed++;
  }
}

console.log("\n" + "=".repeat(80));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

if (failed === 0) {
  console.log("🎉 All tests passed! JSON parser is bulletproof.");
} else {
  console.log("⚠️ Some tests failed. JSON parser needs improvement.");
}

// Test the retry mechanism
console.log("\n\n🔄 Testing Retry Mechanism");
console.log("=".repeat(80));

try {
  const data = parseJSONWithRetry<any>(
    '```json\n{"status": "success", "confidence": 95}\n```',
    3,
    (attempt, error) => {
      console.log(`Retry attempt ${attempt}: ${error}`);
    }
  );
  console.log("✅ Retry mechanism works!");
  console.log("   Parsed data:", JSON.stringify(data, null, 2));
} catch (error) {
  console.log("❌ Retry mechanism failed:", error);
}

console.log("\n🎉 JSON Parser Testing Complete!\n");

