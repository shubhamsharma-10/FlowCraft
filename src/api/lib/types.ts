import { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user_id?: string;
        }
    }
}

export interface UserJwtPayload extends JwtPayload {
    id: string;
}