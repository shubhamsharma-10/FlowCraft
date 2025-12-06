import Groq from "groq-sdk";
import config from "../../utils/config.js";
import normaliserPrompt from "../prompt/normaliser.prompt.js";

const groq = new Groq({ apiKey: config.groqApiKey });

export default async function normaliserAgent(plan: any) {
    
  console.log("Prompt received in normaliserAgent: ", plan);
  const chatCompletion = await getGroqChatCompletion(plan);
  // Print the completion returned by the LLM.
//   console.log(chatCompletion.choices[0]?.message?.content || "");

  const content = chatCompletion.choices[0]?.message?.content || "{}";
  
  // Remove markdown code fences if present
  const jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  return JSON.parse(jsonString);
}

async function getGroqChatCompletion(plan: any) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: normaliserPrompt
      },
      {
        role: "user",
        content: `Normalise the following project plan into a standardised format: ${JSON.stringify(plan)}`,
      }
    ],
    model: "openai/gpt-oss-20b",
  });
}

