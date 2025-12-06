import { Router } from 'express';
import projectController from '../controllers/generate.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const projectRouter = Router();
projectRouter.use(authMiddleware);

// projectRouter.post('/new-project',  projectController.newProject)
projectRouter.post('/generate',  projectController.generateController)
projectRouter.post('/start-project',  projectController.startProject)
projectRouter.post('/save-project', projectController.saveProject)
projectRouter.get('/getProjectbyId/:project_id', projectController.getProjectbyId)
projectRouter.get('/getAllProjects', projectController.getAllProjects)
projectRouter.get('/job-status', (req, res) => res.status(200).json({ message: 'Job status endpoint' }));

export default projectRouter;