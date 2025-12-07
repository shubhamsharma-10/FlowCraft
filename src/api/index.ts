import express, { Request, Response } from 'express';
import authRouter from './routes/auth.route.js';
import projectRouter from './routes/generate.route.js';
import config from '../utils/config.js';
import cors from 'cors';

const app = express()
const PORT = config.serverPort;

app.use(cors());
app.use(express.json())
app.use('/api/auth', authRouter);
app.use('/api/project', projectRouter)

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'API is working'
    })
})

app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`);
})