import codegenAgent from "./agents/codgen.agent.js";
import normaliserAgent from "./agents/normaliser.agent.js";
import plannerAgent from "./agents/planner.agent.js";

export default async function orchestrateProjectGeneration(prompt: string) {
    try {
        const projectPlan = await plannerAgent(prompt);
        // await connection.call('JSON.SET', `session:{sessionId}`, )
        console.log("Project Plan: ", projectPlan);
        const normalisePlan = await normaliserAgent(projectPlan);
        console.log("Normalised Plan: ", normalisePlan);

        const codeGeneration = await codegenAgent(normalisePlan);
        console.log("Code Generation: ", codeGeneration);


        return codeGeneration;
    } catch (error) {
        console.error("Error in orchestrateProjectGeneration:", error);
    }
}