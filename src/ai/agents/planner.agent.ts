import Groq from "groq-sdk";
import config from "../../utils/config.js";
import planningPrompt from "../prompt/planner.prompt.js";

const groq = new Groq({ apiKey: config.groqApiKey });

export default async function plannerAgent(prompt: string) {
    
  console.log("Prompt received in plannerAgent: ", prompt);
  const chatCompletion = await getGroqChatCompletion(prompt);
  // Print the completion returned by the LLM.
 const content = chatCompletion.choices[0]?.message?.content || "";

  const jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  return JSON.parse(jsonString);
}

async function getGroqChatCompletion(prompt?: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: planningPrompt
      },
      {
        role: "user",
        content: prompt || "Build a todo app",
      }
    ],
    model: "openai/gpt-oss-20b",
  });
}

