import { Sandbox } from '@e2b/code-interpreter'
import baseTemplate from './baseTemplate.js'
import config from '../utils/config.js';
import getRedisConnection from './redis.js';

const connection = getRedisConnection();

export default async function runSandbox({ project, sessionId }: { project: Record<string, string>, sessionId: string }) {
   try {
        await connection.call('JSON.ARRAPPEND', `status:${sessionId}`, "$.logs", JSON.stringify("Starting sandbox..."));
        const sbx = await Sandbox.create({ apiKey: config.e2bApiKey })    
        console.log("Project: ", project);
        const finalProject = { ...baseTemplate, ...project}
    
        await connection.call('JSON.ARRAPPEND', `status:${sessionId}`, "$.logs", JSON.stringify("Writing files to sandbox..."));
        await Promise.all(
            Object.entries(finalProject).map(([key, value]) => 
            sbx.files.write(`/home/user${key}`, value)
            )
        );


        // connection.call('JSON.SET', `status:${sessionId}`, "$.status", "Writing files to sandbox completed");
        await connection.call('JSON.ARRAPPEND', `status:${sessionId}`, "$.logs", JSON.stringify("Installing dependencies..."));
        
        console.log("Installing dependencies...");
        const installProcess = await sbx.commands.run('npm install', {
            cwd: '/home/user',
            onStdout: async (data) => {
            await connection.call('JSON.ARRAPPEND', `status:${sessionId}`, "$.logs", JSON.stringify(data));
            console.log(data)
            },
            onStderr: async (data) => {
            await connection.call('JSON.ARRAPPEND', `status:${sessionId}`, "$.logs", JSON.stringify(data));
            console.error(data)
            }
        });
    
        console.log("Installation completed with exit code: ", installProcess.exitCode);
        await connection.call('JSON.ARRAPPEND', `status:${sessionId}`, "$.logs", JSON.stringify(`Installation completed with exit code: ${installProcess.exitCode}`));
        console.log("Starting dev server...");
        await connection.call('JSON.ARRAPPEND', `status:${sessionId}`, "$.logs", JSON.stringify(`Starting dev server...`));
        
        await sbx.commands.run('npm run dev', {
            background: true,
            cwd: '/home/user',
            onStdout: async (data) => {
            await connection.call('JSON.ARRAPPEND', `status:${sessionId}`, "$.logs", JSON.stringify(data));
            console.log(data)
            },
            onStderr: async (data) => {
            await connection.call('JSON.ARRAPPEND', `status:${sessionId}`, "$.logs", JSON.stringify(data));
            console.error(data)
            }
        });
        
        const host = sbx.getHost(5173)
        await connection.call('JSON.ARRAPPEND', `status:${sessionId}`, "$.logs", JSON.stringify(`Dev server is running at: ${host}`));
        console.log(`Dev server is running at: ${host}`);
        return { host };
   } catch (error) {
        console.error("Error in runSandbox: ", error);
        throw error;
   }
}
