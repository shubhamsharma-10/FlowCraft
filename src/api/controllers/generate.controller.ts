import { saveProjectToDB, getProjectFromDB, prisma } from '../../services/prisma.js';
import startSandboxforSession from '../lib/startSandboxforSession.js';
import getRedisConnection from '../../services/redis.js';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Queue } from 'bullmq';

const connection = getRedisConnection();
const generateProject = new Queue('generateProject', { connection });

const projectController = {
    generateController: async (req: Request, res: Response) => {
        const { prompt } = req.body;
        if (!prompt) {
            res.status(400).json({
                message: 'Prompt is required'
            })
        }
        const userId = req.user_id;
        const sessionId = uuidv4();
        console.log("User ID: ", userId, " Session ID: ", sessionId);

        // Queue project generation job
        const job = await generateProject.add('generate', { prompt, userId, sessionId });
        await connection.call('JSON.SET', `status:${sessionId}`, '$', JSON.stringify({
            status: 'queued',
            logs: []
        }))
        console.log('Added to the queue ', job);
        return res.status(200).json({
            success: true,
            message: `Generated content for prompt: ${prompt}`,
            id: job.id,
            sessionId,
            userId
        });
    },

    startProject: async (req: Request, res: Response) => {
        try {
            const { sessionId } = req.body;
            console.log("Starting project for session ID: ", sessionId);
            // const project = await connection.call('JSON.GET', `session:${sessionId}`);
            // if (!project) {
            //     return res.status(404).json({
            //         message: 'Project not found for the given session ID'
            //     })
            // }
            // const parsedProject = JSON.parse(project as string);
            // console.log("Parsed project: ", parsedProject);
            // const result = await runSandbox({ project: parsedProject.files });

            const hostUrl = await startSandboxforSession(sessionId)
            return res.status(200).json({
                message: 'Project started successfully',
                host: hostUrl
            })
        } catch (error) {
            console.error("Error in startProject: ", error);
            return res.status(500).json({
                message: 'Internal server error'
            })
        }
    },

    saveProject: async (req: Request, res: Response) => {
        const { userId, name, sessionId } = req.body;
        try {
         
            const projectFiles = await connection.call('JSON.GET', `session:${sessionId}`);
            console.log("files: ", projectFiles);
            
            if (!projectFiles) {
                return res.status(404).json({
                    message: 'No project files found for the given session ID'
                })
            }
            const parsedFiles = JSON.parse(projectFiles as string).files;
            const newProject = await saveProjectToDB({
                user_id: userId,
                name,
                files: parsedFiles
            })

            return res.status(201).json({
                success: true,
                message: 'Project saved successfully',
                project: newProject
            })
            
        } catch (error) {
            console.error("Error in saving project: ", error);
            return res.status(500).json({
                message: 'Internal server error'
            })
        }
    },

    getProjectbyId: async(req: Request, res: Response) => {
        const { project_id } = req.params;
        const userId = req.user_id; // From auth middleware
        
        try {
            // Fetch project and verify ownership in one query
            // const project = await prisma.project.findUnique({
            //     where: { id: project_id! },
            //     include: { project_files: true }
            // });

            // if (!project) {
            //     return res.status(404).json({
            //         success: false,
            //         message: 'Project not found'
            //     });
            // }

            const { project, files } = await getProjectFromDB(project_id!);

            // Verify project belongs to the authenticated user
            if (project.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: This project does not belong to you'
                });
            }

            // Project verified, proceed with starting it
            const sessionId = uuidv4();
            const storeInRedis = await connection.call('JSON.SET', `session:${sessionId}`, '$', JSON.stringify({ files }));
            console.log("Stored in Redis: ", storeInRedis);
            
            const hostUrl = await startSandboxforSession(sessionId);
            return res.status(200).json({
                success: true,
                message: 'Project started successfully',
                metadata: project,
                files, 
                host: hostUrl
            });
        } catch (error) {
            console.error("Error in restarting project: ", error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    getAllProjects: async(req: Request, res: Response) => {
        const user_id = req.user_id!
        try {
            console.log("Fetching projects for user ID: ", user_id);
            const projects = await prisma.project.findMany({
                where: {
                    user_id
                }
            })

            res.status(200).json({
                success: true,
                message: 'Projects retrieved successfully',
                projects
            })
        } catch (error) {
            console.error("Error in getting all projects: ", error);
            res.status(500).json({
                message: 'Internal server error'
            })
        }
    },

    jobStatusController: async (req: Request, res: Response) => {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                message: 'Job ID is required'
            })
        }

        const job = await generateProject.getJob(id as string);
        if (!job) {
            return res.status(404).json({
                message: 'Job not found'
            })
        }

        const state = await job.getState();
        const progress = job.progress;

        res.status(200).json({
            message: 'Job status retrieved successfully',
            id: job.id,
            state,
            progress,
            result: job.returnvalue
        })
    }
}

export default projectController;