import { invokeLLM } from "./server/_core/llm";
import { invokeLLMWithModel } from "./server/_core/llmDirect";

async function testLLMPrompts() {
  console.log("🧪 Testing LLM Prompts for Face Reading\n");
  console.log("=" .repeat(80));

  // Test 1: Standard invokeLLM with JSON response format
  console.log("\n📝 Test 1: Standard invokeLLM with forced JSON mode");
  console.log("-".repeat(80));
  
  try {
    const response1 = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant designed to output JSON."
        },
        {
          role: "user",
          content: "Generate a sample face reading analysis with the following structure: { \"faceShape\": \"oval\", \"confidence\": 85, \"traits\": [\"intelligent\", \"creative\"] }"
        }
      ],
      response_format: { type: "json_object" }
    });

    console.log("✅ Model used:", response1.model);
    console.log("✅ Response:", response1.choices[0].message.content);
    
    // Try to parse the JSON
    const parsed1 = JSON.parse(response1.choices[0].message.content as string);
    console.log("✅ JSON parsing successful!");
    console.log("✅ Parsed data:", JSON.stringify(parsed1, null, 2));
  } catch (error) {
    console.error("❌ Test 1 failed:", error);
  }

  // Test 2: Gemini 2.0 Flash Exp (current vision model)
  console.log("\n\n📝 Test 2: Gemini 2.0 Flash Exp with JSON response");
  console.log("-".repeat(80));
  
  try {
    const response2 = await invokeLLMWithModel("gemini-2.0-flash-exp", {
      messages: [
        {
          role: "system",
          content: "You are a face reading expert. Return ONLY valid JSON."
        },
        {
          role: "user",
          content: "Analyze a hypothetical face with round shape, wide-set eyes, full lips. Return JSON with: { \"analysis\": { \"faceShape\": string, \"personality\": string[], \"confidence\": number } }"
        }
      ],
      response_format: { type: "json_object" }
    });

    console.log("✅ Model used:", response2.model);
    console.log("✅ Response:", response2.choices[0].message.content);
    
    const parsed2 = JSON.parse(response2.choices[0].message.content as string);
    console.log("✅ JSON parsing successful!");
    console.log("✅ Parsed data:", JSON.stringify(parsed2, null, 2));
  } catch (error) {
    console.error("❌ Test 2 failed:", error);
  }

  // Test 3: GPT-4o (current reading model)
  console.log("\n\n📝 Test 3: GPT-4o with JSON response");
  console.log("-".repeat(80));
  
  try {
    const response3 = await invokeLLMWithModel("gpt-4o", {
      messages: [
        {
          role: "system",
          content: "You are a face reading expert. Return ONLY valid JSON."
        },
        {
          role: "user",
          content: "Create a face reading for someone with square face, strong jawline, deep-set eyes. Return JSON: { \"reading\": { \"element\": string, \"traits\": string[], \"lifeAspects\": { \"career\": string, \"relationships\": string } } }"
        }
      ],
      response_format: { type: "json_object" }
    });

    console.log("✅ Model used:", response3.model);
    console.log("✅ Response:", response3.choices[0].message.content);
    
    const parsed3 = JSON.parse(response3.choices[0].message.content as string);
    console.log("✅ JSON parsing successful!");
    console.log("✅ Parsed data:", JSON.stringify(parsed3, null, 2));
  } catch (error) {
    console.error("❌ Test 3 failed:", error);
  }

  // Test 4: Grok 2 (current cross-validation model)
  console.log("\n\n📝 Test 4: Grok 2 with JSON response");
  console.log("-".repeat(80));
  
  try {
    const response4 = await invokeLLMWithModel("grok-2-1212", {
      messages: [
        {
          role: "system",
          content: "You are a face reading expert. Return ONLY valid JSON."
        },
        {
          role: "user",
          content: "Validate this face reading and return JSON: { \"validation\": { \"accuracy\": number, \"confidence\": number, \"notes\": string } }"
        }
      ],
      response_format: { type: "json_object" }
    });

    console.log("✅ Model used:", response4.model);
    console.log("✅ Response:", response4.choices[0].message.content);
    
    const parsed4 = JSON.parse(response4.choices[0].message.content as string);
    console.log("✅ JSON parsing successful!");
    console.log("✅ Parsed data:", JSON.stringify(parsed4, null, 2));
  } catch (error) {
    console.error("❌ Test 4 failed:", error);
  }

  // Test 5: Test latest models availability
  console.log("\n\n📝 Test 5: Testing Latest Models Availability");
  console.log("-".repeat(80));
  
  const modelsToTest = [
    "gemini-2.5-pro",
    "gemini-2.5-flash", 
    "gpt-4-turbo",
    "gpt-4o-mini",
    "claude-3-5-sonnet-20241022",
    "grok-2-latest"
  ];

  for (const model of modelsToTest) {
    try {
      console.log(`\nTesting ${model}...`);
      const response = await invokeLLMWithModel(model, {
        messages: [
          {
            role: "user",
            content: "Say 'Hello' in JSON format: { \"message\": \"Hello\" }"
          }
        ],
        response_format: { type: "json_object" }
      });
      console.log(`✅ ${model} is available! Model returned:`, response.model);
    } catch (error: any) {
      console.log(`❌ ${model} failed:`, error.message);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("🎉 LLM Prompt Testing Complete!");
}

testLLMPrompts().catch(console.error);

