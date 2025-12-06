import runSandbox from "../services/e2b.js";
import getRedisConnection from "../services/redis.js"

const connection = getRedisConnection()

const startSandboxforSession = async(sessionId: string) => {
    const project = await connection.call('JSON.GET', `session:${sessionId}`);
    if(!project) {
        throw new Error('Project not found for the given session ID')
    }
    
    const parsedProject = JSON.parse(project as string);

    console.log("Parsed project in startSandboxforSession: ", parsedProject);

    const hostUrl = await runSandbox({
        project: parsedProject.files,
        sessionId
    })

    return hostUrl.host;
}

export default startSandboxforSession;