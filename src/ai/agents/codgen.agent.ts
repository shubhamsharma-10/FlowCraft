import Groq from "groq-sdk";
import config from "../../utils/config.js";
import codegenPrompt from "../prompt/codegen.prompt.js";

const groq = new Groq({ apiKey: config.groqApiKey });

export default async function codegenAgent(normalisedPlan: any) {
    
  console.log("Prompt received in codegenAgent: ", normalisedPlan);
  const chatCompletion = await getGroqChatCompletion(normalisedPlan);
  // Print the completion returned by the LLM.
//   console.log(chatCompletion.choices[0]?.message?.content || "");

  const content = chatCompletion.choices[0]?.message?.content || "";
// Remove markdown code fences if present
  const jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonString);
}

async function getGroqChatCompletion(normalisedPlan: any) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: codegenPrompt
      },
      {
        role: "user",
        content: `Generate React + Vite code from the following normalized plan: ${JSON.stringify(normalisedPlan)}`,
      }
    ],
    model: "openai/gpt-oss-20b",
  });
}

