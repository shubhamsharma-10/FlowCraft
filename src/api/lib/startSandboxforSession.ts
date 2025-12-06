import runSandbox from "../../services/e2b.js";
import getRedisConnection from "../../services/redis.js"

const connection = getRedisConnection()
const startSandboxforSession = async(sessionId: string) => {
    const project = await connection.call('JSON.GET', `session:${sessionId}`);
    if(!project) {
        throw new Error('Project not found for the given session ID')
    }
    
    const parsedProject = JSON.parse(project as string).files;

    console.log("Parsed project in startSandboxforSession: ", parsedProject);
    await connection.call('JSON.SET', `status:${sessionId}`, '$', JSON.stringify({ status: "processing", logs: [] }));
    const hostUrl = await runSandbox({
        project: parsedProject,
        sessionId
    })

    await connection.call('JSON.SET', `status:${sessionId}`, "$.status", JSON.stringify("completed"));

    return hostUrl.host;
}

export default startSandboxforSession;