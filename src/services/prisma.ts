import { PrismaClient } from '../../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import config from '../utils/config.js'

const connectionString = config.databaseUrl;

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function saveProjectToDB({ user_id, name, files }: { user_id: string, name: string, files: Record<string, string> }) {
    const project = await prisma.project.create({
        data: {
            user_id,
            name
        }
    })
    console.log("files path : ", Object.keys(files));
    
    Object.entries(files).forEach(async ([file_path, file_content]) => {
            await prisma.project_file.create({
                    data: {
                        project_id: project.id,
                        file_path,
                        file_content
                    }
            })
    })

    return project;
}


async function getProjectFromDB(projectId: string) {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId
        },
        include:{
            project_files: true
        }
    })

    if(!project){
        throw new Error('Project not found');
    }
    
    console.log("Fetched project from DB: ", project);
    const files: Record<string, string> = {}
    project.project_files.forEach(({file_path, file_content}) => {
        files[file_path] = file_content;
    })

    return {
        project: {
            id: project.id,
            name: project.name,
            created_at: project.created_at,
            updated_at: project.updated_at,
            user_id: project.user_id
        },
        files
    };
}

// getProjectFromDB("");
export { prisma, saveProjectToDB, getProjectFromDB };