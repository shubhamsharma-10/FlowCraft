import dotenv from 'dotenv' 
import constant from './constant.js'

dotenv.config()

const config = {
    serverPort: constant.SERVER_PORT,
    redisHost: constant.REDIS_HOST,
    redisPort: constant.REDIS_PORT,
    saltRounds: constant.SALT_ROUNDS,
    jwtSecret: process.env.JWT_SECRET_KEY,
    groqApiKey: process.env.GROQ_API_KEY || '',
    openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
    e2bApiKey: process.env.E2B_API_KEY || '',
    databaseUrl: process.env.DATABASE_URL || '',
}

export default config