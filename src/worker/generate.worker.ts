import { Worker } from 'bullmq';
import getRedisConnection from '../services/redis.js';
import orchestrateProjectGeneration from '../ai/orchesterator.js';
import startSandboxforSession from './run.worker.js';

const connection = getRedisConnection();

const agentWorker = new Worker(
    'generateProject',
    async (job) => {
        const { prompt, userId, sessionId } = job.data;
        console.log(`Processing job for prompt: ${prompt} by user: ${userId} with session: ${sessionId}`);
        // Initialize the status document in Redis
        await connection.call('JSON.SET', `status:${sessionId}`, '$', JSON.stringify({ status: "processing", logs: [] }));
        // Generate the project plan using the AI module
        connection.call('JSON.ARRAPPEND', `status:${sessionId}`, '$.logs', JSON.stringify("Generating project plan..."));
        const project = await orchestrateProjectGeneration(prompt);
        console.log("Generate plan: ", project);


        const storeInRedis = await connection.call('JSON.SET', `session:${sessionId}`, '$', JSON.stringify(project))
        console.log("Stored in Redis: ", storeInRedis);

        const host = await startSandboxforSession(sessionId)
                
        return {
            prompt,
            sessionId,
            project,
            host
        }      
    },
    { connection }
)

agentWorker.on('completed', async (job) => {
    await connection.call('JSON.SET', `status:${job.data.sessionId}`, "$.status", JSON.stringify("completed"))
    console.log(`Job with id ${job.id} has been completed`);
    console.log(`Job result ${job.returnvalue}`);
})

// agentWorker.on('running')

agentWorker.on('failed', async (job, err) => {
    await connection.call('JSON.SET', `status:${job?.data.sessionId}`, "$.status", JSON.stringify("failed"))
    console.error(`Job with id ${job?.id} has failed with error: ${err.message}`);
})
